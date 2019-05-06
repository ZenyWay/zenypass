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
/** @jsx createElement */
//
import { getService, AuthorizationDoc } from 'zenypass-service'
import { createActionFactory, StandardAction } from 'basic-fsa-factories'
import { createPrivilegedRequest, toProjection, ERROR_STATUS } from 'utils'
import {
  catchError,
  debounceTime,
  distinctUntilKeyChanged,
  filter,
  map,
  switchMap
} from 'rxjs/operators'
import { Observable, from as observableFrom, of as observableOf } from 'rxjs'

const DEBOUNCE_TIME_ON_AGENT = 1500 // ms

const agent = createActionFactory('AGENT')
const debounce = createActionFactory('DEBOUNCE')
const close = createActionFactory('CLOSE')
const error = createActionFactory('ERROR')

const closeOnClientClosedRequestOrError = err =>
  (err && err.status !== ERROR_STATUS.CLIENT_CLOSED_REQUEST ? error : close)(
    err
  )

const getAgent$ = createPrivilegedRequest<AuthorizationDoc>(
  (username: string) =>
    observableFrom(getService(username)).pipe(
      switchMap(service => service.getAgentInfo$())
    )
)

export function injectAgentsFromService (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  return state$.pipe(
    distinctUntilKeyChanged('session'),
    switchMap(({ onAuthenticationRequest, session }) =>
      getAgent$(
        toProjection(onAuthenticationRequest),
        session,
        true // unrestricted
      ).pipe(
        map(doc => agent(doc)),
        catchError(err => observableOf(closeOnClientClosedRequestOrError(err)))
      )
    ),
    catchError(err => observableOf(error(err)))
  )
}

export function debounceOnAgent (event$: Observable<StandardAction<any>>) {
  return event$.pipe(
    filter(({ type }) => type === 'AGENT'),
    debounceTime(DEBOUNCE_TIME_ON_AGENT),
    map(() => debounce())
  )
}
