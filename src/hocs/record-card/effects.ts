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
import { RecordFsmState, ConnectFsmState } from './reducer'
import { errorsFromRecord, isValidRecordEntry } from './validators'
import formatRecordEntry from './formaters'
import zenypass, { PouchDoc, ZenypassRecord } from 'zenypass-service'
import { createActionFactory, StandardAction } from 'basic-fsa-factories'
import { Observable, of as observableOf, merge } from 'rxjs'
import {
  catchError,
  concatMap,
  delayWhen,
  delay,
  distinctUntilKeyChanged,
  filter,
  map,
  pluck,
  switchMap,
  // tap,
  withLatestFrom
} from 'rxjs/operators'
import {
  ERROR_STATUS,
  createPrivilegedRequest,
  hasEntry,
  hasHandlerProp,
  toProjection
} from 'utils'
import copyToClipboard from 'clipboard-copy'
import createL10ns from 'basic-l10n'
// const log = (label: string) => console.log.bind(console, label)

const CLEARTEXT_TIMEOUT = 60 * 1000 // ms
const CLIPBOARD_CLEARED = 'Clipboard cleared by ZenyPass'
const l10ns = createL10ns({
  fr: {
    [CLIPBOARD_CLEARED]: 'Presse-papier effacé par ZenyPass'
  },
  en: {
    [CLIPBOARD_CLEARED]: CLIPBOARD_CLEARED
  }
})

const clipboardCleared = createActionFactory('CLIPBOARD_CLEARED')
const clipboardCopyError = createActionFactory('CLIPBOARD_COPY_ERROR')
const validChange = createActionFactory('VALID_CHANGE')
const invalidChange = createActionFactory('INVALID_CHANGE')
const validRecord = createActionFactory('VALID_RECORD')
const invalidRecord = createActionFactory('INVALID_RECORD')
const toggleCleartext = createActionFactory('TOGGLE_CLEARTEXT')
const cleartextResolved = createActionFactory('CLEARTEXT_RESOLVED')
const cleartextRejected = createActionFactory('CLEARTEXT_REJECTED')
const updateRecordResolved = createActionFactory('UPDATE_RECORD_RESOLVED')
const updateRecordRejected = createActionFactory('UPDATE_RECORD_REJECTED')
const deleteRecordResolved = createActionFactory('DELETE_RECORD_RESOLVED')
const deleteRecordRejected = createActionFactory('DELETE_RECORD_REJECTED')
const error = createActionFactory('ERROR')

export function timeoutCleartextOnReadonlyCleartext (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  return event$.pipe(
    filter(({ type }) => type === 'CLEARTEXT_RESOLVED'),
    withLatestFrom(state$),
    pluck('1'),
    filter(({ state }) => state === RecordFsmState.ReadonlyCleartext),
    switchMap(() =>
      observableOf(toggleCleartext()).pipe(delay(CLEARTEXT_TIMEOUT))
    )
  )
}

export function clearClipboardOnDirtyConnectCancelOrClearClipboard (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  return event$.pipe(
    filter(
      ({ type }) =>
        type === 'CLEAR_CLIPBOARD' || type === 'DIRTY_CONNECT_CANCEL'
    ),
    withLatestFrom(state$),
    concatMap(([_, { props: { locale } }]) =>
      copyToClipboard(l10ns[locale](CLIPBOARD_CLEARED))
    ),
    map(() => clipboardCleared()),
    catchError(() => observableOf(clipboardCopyError()))
  )
}

export function validateRecordOnThumbnail (_: any, state$: Observable<any>) {
  return state$.pipe(
    distinctUntilKeyChanged('state'),
    filter(({ state }) => state === RecordFsmState.Thumbnail),
    pluck('props', 'record'),
    map(errorsFromRecord),
    filter(Boolean),
    map(errors => invalidRecord(errors))
  )
}

export function validateChangeOnChange (
  event$: Observable<StandardAction<any>>
) {
  return event$.pipe(
    filter(({ type }) => type === 'CHANGE'),
    pluck('payload'),
    map(([key, value]) =>
      isValidRecordEntry(key, value)
        ? validChange(toChangeError(key, formatRecordEntry(key, value)))
        : invalidChange(toChangeError(key, value, true))
    )
  )
}

function toChangeError (key: string, value: any, error?: boolean) {
  return { change: { [key]: value }, error: { [key]: !!error } }
}

export function validateRecordOnValidChange (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  return event$.pipe(
    filter(({ type }) => type === 'VALID_CHANGE'),
    withLatestFrom(state$),
    pluck('1', 'errors'),
    filter(errors => !Object.keys(errors).some(key => errors[key])),
    map(() => validRecord())
  )
}

const updateRecord = createPrivilegedRequest(
  (username: string, record: ZenypassRecord) =>
    zenypass.then(({ getService }) =>
      getService(username).records.putRecord(record)
    )
)

export function saveRecordOnPendingSaveOrDeleteRecord (
  _: any,
  state$: Observable<any>
) {
  return state$.pipe(
    distinctUntilKeyChanged('state'),
    filter(
      ({ state }) =>
        state === RecordFsmState.PendingSave ||
        state === RecordFsmState.PendingDelete
    ),
    filter<any>(hasHandlerProp('onAuthenticationRequest')),
    switchMap(
      ({
        props: { onAuthenticationRequest, session, record },
        password,
        changes = {}
      }) =>
        updateRecord(toProjection(onAuthenticationRequest), session, true, {
          ...record,
          password,
          ...changes
        }).pipe(
          delayWhen(recordInProps),
          map(changes._deleted ? deleteRecordResolved : updateRecordResolved),
          catchError((error: any) =>
            observableOf(
              (changes._deleted ? deleteRecordRejected : updateRecordRejected)(
                error
              )
            )
          )
        )
    ),
    catchError(err => observableOf(error(err)))
  )

  function recordInProps (record: ZenypassRecord): Observable<ZenypassRecord> {
    return state$.pipe(
      pluck<any, ZenypassRecord>('props', 'record'),
      filter(({ _id, _rev }) => _id === record._id && _rev === record._rev)
    )
  }
}

const cleartext = createPrivilegedRequest((username: string, ref: PouchDoc) =>
  zenypass.then(({ getService }) => getService(username).records.getRecord(ref))
)

export function cleartextOnPendingCleartextOrConnect (
  _: any,
  state$: Observable<any>
) {
  const cleartext$ = state$.pipe(
    distinctUntilKeyChanged('state'),
    filter(hasEntry('state', RecordFsmState.PendingCleartext))
  )
  const edit$ = state$.pipe(
    distinctUntilKeyChanged('state'),
    filter(hasEntry('state', RecordFsmState.PendingEdit))
  )
  const connect$ = state$.pipe(
    distinctUntilKeyChanged('connect'),
    filter(hasEntry('connect', ConnectFsmState.PendingConnect))
  )
  return merge(cleartext$, edit$, connect$).pipe(
    filter<any>(hasHandlerProp('onAuthenticationRequest')),
    switchMap(({ props: { onAuthenticationRequest, session, record } }) =>
      cleartext(
        toProjection(onAuthenticationRequest),
        session,
        record.unrestricted,
        record
      ).pipe(
        map(({ password }: ZenypassRecord) => cleartextResolved(password)),
        catchError((err: any) =>
          observableOf(
            err && err.status !== ERROR_STATUS.CLIENT_CLOSED_REQUEST
              ? error(err)
              : cleartextRejected()
          )
        )
      )
    ),
    catchError(err => observableOf(error(err)))
  )
}
