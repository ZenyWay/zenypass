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
import { KVMap, getRecords$, ZenypassRecord } from 'services'
import { createActionFactory, StandardAction } from 'basic-fsa-factories'
import {
  createPrivilegedRequest,
  hasEntry,
  hasHandlerProp,
  toProjection,
  shallowEqual,
  isFunction
} from 'utils'
import {
  catchError,
  delay,
  distinctUntilChanged,
  ignoreElements,
  filter,
  first,
  last,
  map,
  mapTo,
  merge,
  pluck,
  share,
  switchMap,
  startWith,
  takeUntil,
  tap,
  withLatestFrom,
  distinctUntilKeyChanged
} from 'rxjs/operators'
import { Observable, of as observable } from 'rxjs'

// const log = (label: string) => console.log.bind(console, label)

const createRecordRequested = createActionFactory('CREATE_RECORD_REQUESTED')
const createRecordResolved = createActionFactory('CREATE_RECORD_RESOLVED')
const createRecordRejected = createActionFactory('CREATE_RECORD_REJECTED')

export function createRecordOnSelectNewRecordMenuItem (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  return event$.pipe(
    filter(({ type }) => type === 'SELECT_MENU_ITEM'),
    pluck('payload', 'dataset', 'id'),
    filter(id => id === 'new-entry'),
    switchMap(createRecord)
  )
}

function createRecord (): Observable<StandardAction<any>> {
  return observable(createRecordResolved()).pipe(
    delay(1500), // TODO
    startWith(createRecordRequested())
  )
}

const updateRecords = createActionFactory('UPDATE_RECORDS')
const error = createActionFactory('ERROR')

const getRecordsUpdates = createPrivilegedRequest(
  getRecords$,
  updateRecords,
  error
)

export function injectRecordsFromService (
  _: any,
  state$: Observable<any>
) {
  return state$.pipe(
    pluck<any, any>('props'),
    distinctUntilKeyChanged('onAuthenticationRequest'),
    filter(({ onAuthenticationRequest }) => isFunction(onAuthenticationRequest)),
    switchMap(({ onAuthenticationRequest, session }) => getRecordsUpdates(
      toProjection(onAuthenticationRequest),
      session
    ))
  )
}
