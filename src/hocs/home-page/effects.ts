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
import zenypass, { ZenypassRecord } from 'zenypass-service'
import { createActionFactory, StandardAction } from 'basic-fsa-factories'
import {
  createPrivilegedRequest,
  toProjection,
  isFunction,
  hasEntry
} from 'utils'
import {
  catchError,
  distinctUntilKeyChanged,
  filter,
  map,
  pluck,
  switchMap,
  tap,
  withLatestFrom
} from 'rxjs/operators'
import { Observable, from as observableFrom, of as observableOf } from 'rxjs'

// const log = (label: string) => console.log.bind(console, label)

export interface IndexedRecordEntry {
  _id: string
  record?: Partial<ZenypassRecord>
}

const createRecordResolved = createActionFactory<any>('CREATE_RECORD_RESOLVED')
const createRecordRejected = createActionFactory<any>('CREATE_RECORD_REJECTED')
const updateRecords = createActionFactory('UPDATE_RECORDS')
const error = createActionFactory('ERROR')

const createRecord$ = createPrivilegedRequest<ZenypassRecord>(
  (username: string) =>
    observableFrom(
      zenypass.then(({ getService }) =>
        getService(username).records.newRecord()
      )
    )
)

export function createRecordAndScrollToTopOnCreateRecordRequested (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  return event$.pipe(
    filter(({ type }) => type === 'CREATE_RECORD_REQUESTED'),
    withLatestFrom(state$),
    pluck('1', 'props'),
    switchMap(({ onAuthenticationRequest, session: username }) =>
      createRecord$(
        toProjection(onAuthenticationRequest),
        username,
        true // unrestricted
      ).pipe(
        switchMap((record: ZenypassRecord) =>
          event$.pipe(
            filter(
              ({ type, payload }) =>
                type === 'UPDATE_RECORDS' && includesRecord(payload, record)
            )
          )
        ),
        map(() => createRecordResolved()),
        tap(() => window.scrollTo(0, 0)),
        catchError(err => observableOf(createRecordRejected(err)))
      )
    ),
    catchError(err => observableOf(error(err)))
  )
}

function includesRecord (
  records: IndexedRecordEntry[],
  record: ZenypassRecord
) {
  for (const entry of records) {
    if (entry._id === record._id) {
      return true
    }
  }
  return false
}

const getRecords$ = createPrivilegedRequest((username: string) =>
  observableFrom(zenypass.then(({ getService }) => getService(username))).pipe(
    switchMap(({ records }) => records.records$)
  )
)

export function injectRecordsFromService (_: any, state$: Observable<any>) {
  return state$.pipe(
    pluck<any, any>('props'),
    distinctUntilKeyChanged('onAuthenticationRequest'),
    filter(({ onAuthenticationRequest }) =>
      isFunction(onAuthenticationRequest)
    ),
    switchMap(({ onAuthenticationRequest, session: username }) =>
      getRecords$(
        toProjection(onAuthenticationRequest),
        username,
        true // unrestricted
      ).pipe(
        map((records: IndexedMap<ZenypassRecord>) =>
          updateRecords(toIndexedRecordsArray(records))
        ),
        catchError(err => observableOf(error(err)))
      )
    ),
    catchError(err => observableOf(error(err)))
  )
}

type IndexedMap<T> = { [key: string]: T }

function toIndexedRecordsArray (
  records: IndexedMap<ZenypassRecord>
): IndexedRecordEntry[] {
  const _ids = Object.keys(records)
  let i = _ids.length
  const result = new Array(i) as IndexedRecordEntry[]
  while (i--) {
    const _id = _ids[i]
    const record = records[_id]
    result[i] = { _id, record }
  }
  return result
}
