/**
 * Copyright 2018 ZenyWay S.A.S., Stephane M. Catala
 * @author Stephane M. Catala
 * @license Apache Version 2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * Limitations under the License.
 */
//
import formatRecordEntry from './formaters'
import { errorsFromRecord, isValidRecordEntry } from './validators'
import { ZenypassRecord } from 'zenypass-service'
import createAutomataReducer, { AutomataSpec } from 'automata-reducer'
import { createActionFactory } from 'basic-fsa-factories'
import { propCursor, into } from 'basic-cursors'
import compose from 'basic-compose'
import {
  Reducer,
  alt,
  always,
  forType,
  mapPayload,
  mergePayload,
  pluck,
  not,
  withEventGuards
} from 'utils'

export enum RecordFsmState {
  PendingRecord = 'PENDING_RECORD',
  Thumbnail = 'THUMBNAIL',
  ReadonlyConcealed = 'READONLY_CONCEALED',
  ReadonlyCleartext = 'READONLY_CLEARTEXT',
  EditConcealed = 'EDIT_CONCEALED',
  EditCleartext = 'EDIT_CLEARTEXT',
  PendingCleartext = 'PENDING_CLEARTEXT',
  PendingEdit = 'PENDING_EDIT',
  PendingConfirmCancel = 'PENDING_CONFIRM_CANCEL',
  PendingConfirmDelete = 'PENDING_CONFIRM_DELETE',
  PendingSave = 'PENDING_SAVE',
  PendingDelete = 'PENDING_DELETE'
}

const inChanges = prop =>
  compose<Reducer<any>>(
    propCursor('changes'),
    propCursor(prop)
  )
const clearPassword = inChanges('password')(always(void 0))
const clearChanges = into('changes')(always(void 0))
const clearErrors = into('errors')(always(void 0))
const mergePayloadIntoChanges = compose<Reducer<any>>(
  propCursor('changes'),
  mergePayload
)
const mergePayloadIntoErrors = <I, O>(project?: (val: I) => O) =>
  propCursor('errors')(
    compose(
      updateErrors,
      mapPayload(project)
    )
  )
const toggleUnrestricted = inChanges('unrestricted')(not())
const toggleRecordDeleted = inChanges('_deleted')(not())
const mapPayloadToPassword = inChanges('password')(mapPayload(alt('')))
const mapPayloadRevToRev = into('rev')(mapPayload(pluck('_rev')))
const mapPayloadToError = into('error')(mapPayload())
const reset = [clearChanges, clearPassword, clearErrors]

const RecordFsmStateEdit = {
  RECORD_PENDING: [RecordFsmState.PendingRecord, ...reset],
  RECORD_READY: [RecordFsmState.Thumbnail, ...reset],
  VALID_CHANGE: [
    mergePayloadIntoChanges(pluck('change')),
    mergePayloadIntoErrors(pluck('error'))
  ],
  INVALID_CHANGE: [
    mergePayloadIntoChanges(pluck('change')),
    mergePayloadIntoErrors(pluck('error'))
  ],
  TOGGLE_CHECKBOX: toggleUnrestricted,
  TOGGLE_EXPANDED: RecordFsmState.PendingConfirmCancel,
  UPDATE_RECORD_REQUESTED: RecordFsmState.PendingSave,
  DELETE_RECORD_REQUESTED: RecordFsmState.PendingConfirmDelete
}

const recordAutomata: AutomataSpec<RecordFsmState> = {
  [RecordFsmState.PendingRecord]: {
    RECORD_READY: RecordFsmState.Thumbnail
  },
  [RecordFsmState.Thumbnail]: {
    RECORD_PENDING: RecordFsmState.PendingRecord,
    RECORD_READY: mapPayloadRevToRev,
    TOGGLE_EXPANDED: RecordFsmState.ReadonlyConcealed,
    INVALID_RECORD: [
      RecordFsmState.EditCleartext,
      into('changes')(into('username')(pluck('0', 'props', 'session'))),
      propCursor('password')(alt('')),
      mergePayloadIntoErrors()
    ]
  },
  [RecordFsmState.ReadonlyConcealed]: {
    RECORD_PENDING: RecordFsmState.PendingRecord,
    RECORD_READY: RecordFsmState.Thumbnail,
    TOGGLE_EXPANDED: RecordFsmState.Thumbnail,
    TOGGLE_CLEARTEXT: RecordFsmState.PendingCleartext,
    EDIT_RECORD_REQUESTED: RecordFsmState.PendingEdit
  },
  [RecordFsmState.ReadonlyCleartext]: {
    RECORD_PENDING: [RecordFsmState.PendingRecord, clearPassword],
    RECORD_READY: [RecordFsmState.Thumbnail, clearPassword],
    TOGGLE_EXPANDED: [RecordFsmState.Thumbnail, clearPassword],
    TOGGLE_CLEARTEXT: [RecordFsmState.ReadonlyConcealed, clearPassword],
    EDIT_RECORD_REQUESTED: RecordFsmState.EditCleartext
  },
  [RecordFsmState.EditConcealed]: {
    ...RecordFsmStateEdit,
    TOGGLE_CLEARTEXT: RecordFsmState.EditCleartext
  },
  [RecordFsmState.EditCleartext]: {
    ...RecordFsmStateEdit,
    TOGGLE_CLEARTEXT: RecordFsmState.EditConcealed
  },
  [RecordFsmState.PendingCleartext]: {
    RECORD_PENDING: RecordFsmState.PendingRecord,
    RECORD_READY: RecordFsmState.Thumbnail,
    CLEARTEXT_REJECTED: [RecordFsmState.ReadonlyConcealed, mapPayloadToError],
    CLEARTEXT_RESOLVED: [RecordFsmState.ReadonlyCleartext, mapPayloadToPassword]
  },
  [RecordFsmState.PendingEdit]: {
    RECORD_PENDING: RecordFsmState.PendingRecord,
    RECORD_READY: RecordFsmState.Thumbnail,
    CLEARTEXT_REJECTED: [RecordFsmState.ReadonlyConcealed, mapPayloadToError],
    CLEARTEXT_RESOLVED: [RecordFsmState.EditConcealed, mapPayloadToPassword]
  },
  [RecordFsmState.PendingConfirmCancel]: {
    RECORD_PENDING: [RecordFsmState.PendingRecord, ...reset],
    RECORD_READY: [RecordFsmState.Thumbnail, ...reset],
    EDIT_RECORD_REQUESTED: RecordFsmState.EditConcealed,
    TOGGLE_EXPANDED: [RecordFsmState.Thumbnail, ...reset]
  },
  [RecordFsmState.PendingConfirmDelete]: {
    RECORD_PENDING: [RecordFsmState.PendingRecord, ...reset],
    RECORD_READY: [RecordFsmState.Thumbnail, ...reset],
    EDIT_RECORD_REQUESTED: RecordFsmState.EditConcealed,
    DELETE_RECORD_REQUESTED: [RecordFsmState.PendingDelete, toggleRecordDeleted]
  },
  [RecordFsmState.PendingSave]: {
    RECORD_PENDING: [RecordFsmState.PendingRecord, ...reset],
    RECORD_READY: [RecordFsmState.Thumbnail, ...reset],
    UPDATE_RECORD_REJECTED: [RecordFsmState.EditConcealed, mapPayloadToError],
    UPDATE_RECORD_RESOLVED: [RecordFsmState.Thumbnail, ...reset]
  },
  [RecordFsmState.PendingDelete]: {
    RECORD_PENDING: [RecordFsmState.PendingRecord, ...reset],
    RECORD_READY: [RecordFsmState.Thumbnail, ...reset],
    DELETE_RECORD_REJECTED: [
      RecordFsmState.EditConcealed,
      toggleRecordDeleted,
      mapPayloadToError
    ],
    DELETE_RECORD_RESOLVED: [RecordFsmState.Thumbnail, ...reset]
  }
}

const reducer = compose.into(0)(
  createAutomataReducer(recordAutomata, RecordFsmState.PendingRecord),
  forType('RECORD_PENDING')(mapPayloadRevToRev),
  forType('RECORD_READY')(mapPayloadRevToRev)
)

const recordPending = createActionFactory('RECORD_PENDING')
const recordReady = createActionFactory('RECORD_READY')
const validChange = createActionFactory('VALID_CHANGE')
const invalidChange = createActionFactory('INVALID_CHANGE')
const invalidRecord = createActionFactory('INVALID_RECORD')
const validateRecord = errors => errors && invalidRecord(errors)

export default withEventGuards({
  RECORD_READY: record => validateRecord(errorsFromRecord(record)),
  PROPS: ({ pending, record }, { state, rev } = {} as any) =>
    pending
      ? recordPending(record)
      : (state === RecordFsmState.PendingRecord || record._rev !== rev) &&
        recordReady(record),
  CHANGE: ([key, value]) =>
    isValidRecordEntry(key, value)
      ? validChange(toChangeError(key, formatRecordEntry(key, value)))
      : invalidChange(toChangeError(key, value, true))
})(reducer)

type Errors = { [id in keyof ZenypassRecord]: boolean }

/**
 * @return a reducer that only returns a new `errors` object
 * when the updates projected from the payload effectively do change its content.
 * the returned `errors` object only includes props that are `true` if any,
 * is `undefined` otherwise.
 */
function updateErrors (errors: Partial<Errors>, updates = {}) {
  const _errors = errors || {}
  let updated = false
  const result = {}
  for (const id in updates) {
    const update = updates[id]
    if (!_errors[id] !== !update) {
      if (!updated) {
        Object.assign(result, errors) // lazy
        updated = true
      }
      if (!update) {
        delete result[id]
      } else {
        result[id] = true
      }
    }
  }
  return !updated ? errors : Object.keys(result).length ? result : void 0
}

function toChangeError (key: string, value: any, error?: boolean) {
  return { change: { [key]: value }, error: { [key]: !!error } }
}
