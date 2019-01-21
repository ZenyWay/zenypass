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
import zenypass, { PouchDoc, ZenypassRecord } from 'zenypass-service'
import { createActionFactory, StandardAction } from 'basic-fsa-factories'
import { Observable, of as observableOf, merge } from 'rxjs'
import {
  catchError,
  delayWhen,
  distinctUntilKeyChanged,
  filter,
  map,
  pluck,
  switchMap
} from 'rxjs/operators'
import {
  ERROR_STATUS,
  createPrivilegedRequest,
  hasEntry,
  hasHandlerProp,
  toProjection
} from 'utils'
import { any } from 'bluebird'
// const log = (label: string) => console.log.bind(console, label)

const editRecord = createActionFactory('EDIT_RECORD')
const cleartextResolved = createActionFactory('CLEARTEXT_RESOLVED')
const cleartextRejected = createActionFactory('CLEARTEXT_REJECTED')
const updateRecordResolved = createActionFactory('UPDATE_RECORD_RESOLVED')
const updateRecordRejected = createActionFactory('UPDATE_RECORD_REJECTED')
const deleteRecordResolved = createActionFactory('DELETE_RECORD_RESOLVED')
const deleteRecordRejected = createActionFactory('DELETE_RECORD_REJECTED')
const error = createActionFactory('ERROR')

export function editRecordOnPublicAndNoRecordName(
  _: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  return state$.pipe(
    distinctUntilKeyChanged('state'),
    filter(({ props, state }) => state === 'public' && !props.record.name),
    map(() => editRecord())
  )
}

const updateRecord = createPrivilegedRequest(
  (username: string, record: ZenypassRecord) =>
    zenypass.then(({ getService }) =>
      getService(username).records.putRecord(record)
    )
)

export function updateRecordOnPendingUpdateRecord(
  _: any,
  state$: Observable<any>
) {
  return state$.pipe(
    distinctUntilKeyChanged('state'),
    filter(hasEntry('state', 'pending:save')),
    filter<any>(hasHandlerProp('onAuthenticationRequest')),
    switchMap(
      ({
        props: { onAuthenticationRequest, session, record },
        password,
        changes
      }) =>
        updateRecord(
          toProjection(onAuthenticationRequest),
          session,
          true, // unrestricted
          { ...record, password, ...changes }
        ).pipe(
          delayWhen(recordInProps),
          map(updateRecordResolved),
          catchError((error: any) => observableOf(updateRecordRejected(error)))
        )
    ),
    catchError(err => observableOf(error(err)))
  )

  function recordInProps(record: ZenypassRecord): Observable<ZenypassRecord> {
    return state$.pipe(
      pluck<any, ZenypassRecord>('props', 'record'),
      filter(({ _id, _rev }) => _id === record._id && _rev === record._rev)
    )
  }
}

const cleartext = createPrivilegedRequest((username: string, ref: PouchDoc) =>
  zenypass.then(({ getService }) => getService(username).records.getRecord(ref))
)

export function cleartextOnPendingCleartextOrConnect(
  _: any,
  state$: Observable<any>
) {
  const cleartext$ = state$.pipe(
    distinctUntilKeyChanged('state'),
    filter(hasEntry('state', 'pending:cleartext'))
  )
  const edit$ = state$.pipe(
    distinctUntilKeyChanged('state'),
    filter(hasEntry('state', 'pending:edit'))
  )
  const connect$ = state$.pipe(
    distinctUntilKeyChanged('connect'),
    filter(hasEntry('connect', 'pending:connect'))
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
