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
import { createPrivilegedRequest, toProjection } from 'utils'
import {
  catchError,
  distinctUntilKeyChanged,
  map,
  switchMap
} from 'rxjs/operators'
import { Observable, from as observableFrom, of as observableOf } from 'rxjs'

const agent = createActionFactory('AGENT')
const error = createActionFactory('ERROR')

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
    switchMap(({ onAuthenticationRequest, session, locale }) =>
      getAgent$(
        toProjection(onAuthenticationRequest),
        session,
        true // unrestricted
      ).pipe(
        map(doc => agent(doc)),
        catchError(err => observableOf(error(err)))
      )
    ),
    catchError(err => observableOf(error(err)))
  )
}
