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
import { zenypass } from 'services'
import { createActionFactory } from 'basic-fsa-factories'
import {
  catchError,
  distinctUntilKeyChanged,
  filter,
  map,
  startWith,
  switchMap
} from 'rxjs/operators'
import { Observable, of as observable } from 'rxjs'

const log = (label: string) => console.log.bind(console, label)

const authenticationResolved = createActionFactory('AUTHENTICATION_RESOLVED')
const authenticationRejected = createActionFactory('AUTHENTICATION_REJECTED')

export function authenticateOnTransitionToAuthenticating (
  _: any,
  state$: Observable<{ state: string, value: string }>
) {
  return state$.pipe(
    distinctUntilKeyChanged('state'),
    filter<any>(({ state }) => state === 'authenticating'),
    switchMap(({ value, session }) => zenypass.getService(session).unlock(value)),
    map((session: string) => authenticationResolved(session)),
    catchError(
      (err: any, caught$: Observable<any>) => caught$.pipe(
        startWith(authenticationRejected(err))
      )
    )
  )
}
