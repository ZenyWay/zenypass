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
import { createPrivilegedRequest, toProjection, isFunction } from 'utils'
import {
  catchError,
  distinctUntilKeyChanged,
  filter,
  map,
  pluck,
  startWith,
  switchMap,
  withLatestFrom
} from 'rxjs/operators'
import { Observable, from as observableFrom, of as observableOf } from 'rxjs'

// const log = (label: string) => console.log.bind(console, label)

const createRecordRequested = createActionFactory<void>(
  'CREATE_RECORD_REQUESTED'
)
const createRecordResolved = createActionFactory<ZenypassRecord>(
  'CREATE_RECORD_RESOLVED'
)
const createRecordRejected = createActionFactory<any>('CREATE_RECORD_REJECTED')
const updateRecords = createActionFactory('UPDATE_RECORDS')
const error = createActionFactory('ERROR')

export function createRecordOnSelectNewRecordMenuItem (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  return event$.pipe(
    filter(({ type }) => type === 'SELECT_MENU_ITEM'),
    filter(({ payload }) => payload.dataset.id === 'new-entry'),
    withLatestFrom(state$),
    pluck('1', 'props'),
    switchMap(({ onAuthenticationRequest, session: username }) =>
      createRecord$(
        toProjection(onAuthenticationRequest),
        username,
        true // unrestricted
      ).pipe(
        map(createRecordResolved),
        catchError(err => observableOf(createRecordRejected(err))),
        startWith(createRecordRequested())
      )
    ),
    catchError(err => observableOf(error(err)))
  )
}

const createRecord$ = createPrivilegedRequest<ZenypassRecord>(
  (username: string) =>
    observableFrom(
      zenypass.then(({ getService }) =>
        getService(username).records.newRecord()
      )
    )
)

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
        map(updateRecords),
        catchError(err => observableOf(error(err)))
      )
    ),
    catchError(err => observableOf(error(err)))
  )
}
