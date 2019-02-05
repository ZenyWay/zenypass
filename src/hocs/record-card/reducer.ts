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
import createAutomataReducer, { AutomataSpec } from 'automata-reducer'
import { propCursor, into } from 'basic-cursors'
import compose from 'basic-compose'
import { always, forType, mapPayload, mergePayload, pluck, not } from 'utils'

export enum RecordFsmState {
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

const clearPassword = into('password')(always(void 0))
const clearChanges = into('changes')(always(void 0))
const clearErrors = into('errors')(always(void 0))
const mergePayloadIntoChanges = <I, O>(project?: (val: I) => O) =>
  propCursor('changes')(mergePayload(project))
const mergePayloadIntoErrors = <I, O>(project?: (val: I) => O) =>
  propCursor('errors')(mergePayload(project))
const toggleUnrestricted = propCursor('changes')(
  propCursor('unrestricted')(not())
)
const toggleRecordDeleted = propCursor('changes')(propCursor('_deleted')(not()))
const mapPayloadToPassword = into('password')(mapPayload())
const mapPayloadToError = into('error')(mapPayload())
const reset = [clearChanges, clearPassword, clearErrors]

const recordAutomata: AutomataSpec<RecordFsmState> = {
  [RecordFsmState.Thumbnail]: {
    TOGGLE_EXPANDED: RecordFsmState.ReadonlyConcealed,
    INVALID_RECORD: [RecordFsmState.EditCleartext, mergePayloadIntoErrors()]
  },
  [RecordFsmState.ReadonlyConcealed]: {
    TOGGLE_EXPANDED: RecordFsmState.Thumbnail,
    TOGGLE_CLEARTEXT: RecordFsmState.PendingCleartext,
    EDIT_RECORD_REQUESTED: RecordFsmState.PendingEdit
  },
  [RecordFsmState.ReadonlyCleartext]: {
    TOGGLE_EXPANDED: [RecordFsmState.Thumbnail, clearPassword],
    TOGGLE_CLEARTEXT: [RecordFsmState.ReadonlyConcealed, clearPassword],
    EDIT_RECORD_REQUESTED: RecordFsmState.EditCleartext
  },
  [RecordFsmState.EditConcealed]: {
    VALID_CHANGE: [
      mergePayloadIntoChanges(pluck('change')),
      mergePayloadIntoErrors(pluck('error'))
    ],
    INVALID_CHANGE: [
      mergePayloadIntoChanges(pluck('change')),
      mergePayloadIntoErrors(pluck('error'))
    ],
    VALID_RECORD: clearErrors,
    TOGGLE_CHECKBOX: toggleUnrestricted,
    TOGGLE_CLEARTEXT: RecordFsmState.EditCleartext,
    TOGGLE_EXPANDED: RecordFsmState.PendingConfirmCancel,
    UPDATE_RECORD_REQUESTED: RecordFsmState.PendingSave,
    DELETE_RECORD_REQUESTED: RecordFsmState.PendingConfirmDelete
  },
  [RecordFsmState.EditCleartext]: {
    VALID_CHANGE: [
      mergePayloadIntoChanges(pluck('change')),
      mergePayloadIntoErrors(pluck('error'))
    ],
    INVALID_CHANGE: [
      mergePayloadIntoChanges(pluck('change')),
      mergePayloadIntoErrors(pluck('error'))
    ],
    VALID_RECORD: clearErrors,
    TOGGLE_CHECKBOX: toggleUnrestricted,
    TOGGLE_CLEARTEXT: RecordFsmState.EditConcealed,
    TOGGLE_EXPANDED: RecordFsmState.PendingConfirmCancel,
    UPDATE_RECORD_REQUESTED: RecordFsmState.PendingSave,
    DELETE_RECORD_REQUESTED: RecordFsmState.PendingConfirmDelete
  },
  [RecordFsmState.PendingCleartext]: {
    CLEARTEXT_REJECTED: [RecordFsmState.ReadonlyConcealed, mapPayloadToError],
    CLEARTEXT_RESOLVED: [RecordFsmState.ReadonlyCleartext, mapPayloadToPassword]
  },
  [RecordFsmState.PendingEdit]: {
    CLEARTEXT_REJECTED: [RecordFsmState.ReadonlyConcealed, mapPayloadToError],
    CLEARTEXT_RESOLVED: [RecordFsmState.EditConcealed, mapPayloadToPassword]
  },
  [RecordFsmState.PendingConfirmCancel]: {
    EDIT_RECORD_REQUESTED: RecordFsmState.EditConcealed,
    TOGGLE_EXPANDED: [RecordFsmState.Thumbnail, ...reset]
  },
  [RecordFsmState.PendingConfirmDelete]: {
    EDIT_RECORD_REQUESTED: RecordFsmState.EditConcealed,
    DELETE_RECORD_REQUESTED: [RecordFsmState.PendingDelete, toggleRecordDeleted]
  },
  [RecordFsmState.PendingSave]: {
    UPDATE_RECORD_REJECTED: [RecordFsmState.EditConcealed, mapPayloadToError],
    UPDATE_RECORD_RESOLVED: [RecordFsmState.Thumbnail, ...reset]
  },
  [RecordFsmState.PendingDelete]: {
    DELETE_RECORD_REJECTED: [
      RecordFsmState.EditConcealed,
      toggleRecordDeleted,
      mapPayloadToError
    ],
    DELETE_RECORD_RESOLVED: [RecordFsmState.Thumbnail, ...reset]
  }
}

/**
 * restriction: connect may only be triggered from locked record state,
 * i.e. `thumbnail` or `readonly:concealed`
 */
export type ConnectAutomataState = 'locked' | 'connect' | 'pending:connect'
export enum ConnectFsmState {
  Idle = 'IDLE',
  Connecting = 'CONNECTING',
  PendingConnect = 'PENDING_CONNECT',
  PendingClearClipboard = 'PENDING_CLEAR_CLIPBOARD'
}

const connectAutomata: AutomataSpec<ConnectFsmState> = {
  [ConnectFsmState.Idle]: {
    CONNECT_REQUEST: ConnectFsmState.PendingConnect
  },
  [ConnectFsmState.Connecting]: {
    CLEAN_CONNECT_CANCEL: [ConnectFsmState.Idle, clearPassword],
    CLEAN_CONNECT_CLOSE: [ConnectFsmState.Idle, clearPassword],
    DIRTY_CONNECT_CLOSE: [ConnectFsmState.PendingClearClipboard, clearPassword],
    CLIPBOARD_CLEARED: [ConnectFsmState.Idle, clearPassword],
    CLIPBOARD_COPY_ERROR: [ConnectFsmState.PendingClearClipboard, clearPassword]
  },
  [ConnectFsmState.PendingConnect]: {
    CLEARTEXT_REJECTED: [ConnectFsmState.Idle, mapPayloadToError],
    CLEARTEXT_RESOLVED: [ConnectFsmState.Connecting, mapPayloadToPassword]
  },
  [ConnectFsmState.PendingClearClipboard]: {
    CLIPBOARD_CLEARED: ConnectFsmState.Idle,
    CLIPBOARD_COPY_ERROR: ConnectFsmState.Idle // TODO
  }
}

export default compose.into(0)(
  createAutomataReducer(recordAutomata, RecordFsmState.Thumbnail),
  createAutomataReducer(connectAutomata, ConnectFsmState.Idle, 'connect'),
  forType('PROPS')(into('props')(mapPayload()))
)
