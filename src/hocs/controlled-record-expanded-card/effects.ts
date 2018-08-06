/**
 * Copyright 2018 ZenyWay S.A.S., Stephane M. Catala
 * @author Stephane M. Catala
 * @author Clement Bonet
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
import {
  filter,
  map,
  pluck,
  switchMap,
  tap,
  withLatestFrom
} from 'rxjs/operators'
import { from } from 'rxjs'
import { serviceRequestOnEventFromState } from '../../utils/service-request'

const log = (label: string) => console.log.bind(console, label)

const restricted = ({ props }) => !props.record.unrestricted

export const requestCleartextOnToggleCleartextFromPublic =
  serviceRequestOnEventFromState({
    state: 'pending:private',
    event: {
      requested: 'TOGGLE_CLEARTEXT',
      resolved: 'CLEARTEXT_RESOLVED',
      rejected: 'CLEARTEXT_REJECTED'
    },
    request: getPassword,
    restricted
  })

export const requestEditOnEditFromPublic =
  serviceRequestOnEventFromState({
    state: 'pending:edit',
    event: 'EDIT',
    request: getPassword,
    restricted
  })

export const requestSaveOnSaveFromEdit =
  serviceRequestOnEventFromState({
    state: 'pending:save',
    event: 'SAVE',
    request: putRecord
  })

export const requestSaveOnToggleFromEdit =
  serviceRequestOnEventFromState({
    state: 'pending:save',
    event: 'TOGGLE',
    request: putRecord
  })

export const requestDeleteOnDeleteFromEdit =
  serviceRequestOnEventFromState({
    state: 'pending:delete',
    event: 'DELETE',
    request: deleteRecord
  })

export const requestPasswordToLogin =
  serviceRequestOnEventFromState({
    state: 'pending:login:public',
    event: 'LOGIN',
    request: getPassword,
    restricted
  })

function getPassword ({ getRecord }) {
  return function ({ props, sessionId }) {
    return from(getRecord(sessionId, props.record)).pipe(pluck('password'))
  }
}

function putRecord ({ putRecord }) {
  return function ({ props, record, sessionId, password }) {
    return from(putRecord(sessionId, { ...(record || props.record), password }))
  }
}

function deleteRecord ({ deleteRecord }) {
  return function ({ props, sessionId, password }) {
    return from(deleteRecord(sessionId, props.record))
  }
}

export function requestToggleExpandFromEdit (event$, state$) {
  return event$.pipe(
    filter(isOfType('TOGGLE_RESOLVED')),
    withLatestFrom(state$),
    pluck('1','props'),
    filter(({ onToggleExpand }) => onToggleExpand),
    tap(({ onToggleExpand }) => onToggleExpand())
  )
}

export function requestToggleExpandFromPublic (event$, state$) {
  return event$.pipe(
    filter(isOfType('TOGGLE_REQUESTED')),
    withLatestFrom(state$),
    pluck('1'),
    filter(({ state }) => state === 'public'),
    pluck('props'),
    filter(({ onToggleExpand }) => onToggleExpand),
    tap(({ onToggleExpand }) => onToggleExpand())
  )
}

function isOfType (type) {
  return function (event) {
    return event.type === type
  }
}

function equalsState (v) {
  return function (val) {
    return v === val.state
  }
}
