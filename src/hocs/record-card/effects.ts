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
import {
  createPrivilegedRequest,
  PouchDoc,
  ZenypassRecord
} from 'zenypass-service'
import { createActionFactory, StandardAction } from 'basic-fsa-factories'
import { EMPTY, Observable, of as observableOf, merge } from 'rxjs'
import {
  catchError,
  concatMap,
  delayWhen,
  delay,
  distinctUntilKeyChanged,
  filter,
  ignoreElements,
  map,
  pluck,
  switchMap,
  tap,
  withLatestFrom
} from 'rxjs/operators'
import { ERROR_STATUS, hasHandlerProp, toProjection } from 'utils'
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
const toggleCleartext = createActionFactory('TOGGLE_CLEARTEXT')
const cleartextResolved = createActionFactory('CLEARTEXT_RESOLVED')
const cleartextRejected = createActionFactory('CLEARTEXT_REJECTED')
const updateRecordResolved = createActionFactory('UPDATE_RECORD_RESOLVED')
const updateRecordRejected = createActionFactory('UPDATE_RECORD_REJECTED')
const deleteRecordResolved = createActionFactory('DELETE_RECORD_RESOLVED')
const deleteRecordRejected = createActionFactory('DELETE_RECORD_REJECTED')
const error = createActionFactory('ERROR')

export function timeoutCleartextOnReadonlyCleartext (
  _: any,
  state$: Observable<any>
) {
  return state$.pipe(
    distinctUntilKeyChanged('state'),
    switchMap(({ state }) =>
      state === RecordFsmState.ReadonlyCleartext
        ? observableOf(toggleCleartext()).pipe(delay(CLEARTEXT_TIMEOUT))
        : EMPTY
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

export function openBookmarkAndCopyUsernameOnConnectRequestWhenBookmark (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  return event$.pipe(
    filter(({ type }) => type === 'CONNECT_REQUEST'),
    withLatestFrom(state$),
    pluck('1', 'props', 'record'),
    filter(({ url, password }) => url && password === ''),
    tap(({ url, username }) => copyUsernameAndOpenWindow(url, username)),
    ignoreElements()
  )
}

function copyUsernameAndOpenWindow (href: string, username?: string) {
  const copied = username ? copyToClipboard(username) : Promise.resolve()
  return copied.then(openWindow).catch(openWindow)

  function openWindow (): void {
    const ref = window.open(href, '_blank')
    // mitigate reverse tab-nabbing (https://www.owasp.org/index.php/Reverse_Tabnabbing)
    ref.opener = null
  }
}

const updateRecord = createPrivilegedRequest(
  ({ records }, record: ZenypassRecord) => records.putRecord(record)
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
        changes = {},
        password,
        csprp
      }) =>
        updateRecord(toProjection(onAuthenticationRequest), session, true, {
          ...record,
          password,
          ...changes,
          csprp:
            csprp && csprp === changes.password
              ? Date.now() // effect
              : !('password' in changes) || changes.password === password
              ? record.csprp
              : void 0
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

const cleartext = createPrivilegedRequest(({ records }, ref: PouchDoc) =>
  records.getRecord(ref)
)

export function cleartextOnPendingCleartextOrConnect (
  _: any,
  state$: Observable<any>
) {
  const cleartextOrEdit$ = state$.pipe(
    distinctUntilKeyChanged('state'),
    filter(
      ({ state }) =>
        state === RecordFsmState.PendingCleartext ||
        state === RecordFsmState.PendingEdit
    )
  )
  const connect$ = state$.pipe(
    distinctUntilKeyChanged('connect'),
    filter(({ connect }) => connect === ConnectFsmState.PendingConnect)
  )
  return merge(cleartextOrEdit$, connect$).pipe(
    switchMap(
      ({ props: { onAuthenticationRequest, session, record, unrestricted } }) =>
        cleartext(
          toProjection(onAuthenticationRequest),
          session,
          unrestricted || record.unrestricted,
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
