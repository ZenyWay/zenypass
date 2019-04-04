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

import { AuthorizationFsm } from './reducer'
import zenypass from 'zenypass-service'
import { createActionFactory } from 'basic-fsa-factories'
import { ERROR_STATUS } from 'utils'
import {
  catchError,
  delay,
  filter,
  map,
  switchMap
  // tap
} from 'rxjs/operators'
import { Observable, from as observableFrom, of as observableOf } from 'rxjs'
// const log = label => console.log.bind(console, label)

const zenypass$ = observableFrom(zenypass)

/**
 * temporary partial work-around for avoiding signin on new agent
 * before authorization is finished and synced.
 */
const DELAY_AFTER_SUCCESSFUL_AUTHORIZATION = 5000 // ms

const authorized = createActionFactory<void>('AUTHORIZED')
const signedIn = createActionFactory<void>('SIGNED_IN')
const unauthorized = createActionFactory<void>('UNAUTHORIZED')
const notFound = createActionFactory<any>('NOT_FOUND')
const error = createActionFactory<any>('ERROR')

const SIGNIN_ERRORS = {
  [ERROR_STATUS.UNAUTHORIZED]: unauthorized,
  [ERROR_STATUS.NOT_FOUND]: notFound
}

export function serviceSigninOnSigningIn (_: any, state$: Observable<any>) {
  return state$.pipe(
    filter<any>(({ state }) => state === AuthorizationFsm.SigningIn),
    switchMap(({ email, password }) =>
      zenypass$.pipe(
        switchMap(({ signin }) => signin(email, password)),
        map(() => signedIn(email)),
        catchError(err =>
          observableOf(((err && SIGNIN_ERRORS[err.status]) || error)(err))
        )
      )
    )
  )
}

export function serviceAuthorizeOnAuthorizing (
  _: any,
  state$: Observable<any>
) {
  return state$.pipe(
    filter<any>(({ state }) => state === AuthorizationFsm.Authorizing),
    switchMap(({ email, password, token }) =>
      zenypass$.pipe(
        switchMap(({ requestAccess }) => requestAccess(email, password, token)),
        delay(DELAY_AFTER_SUCCESSFUL_AUTHORIZATION),
        map(() => authorized(email)),
        catchError(err =>
          observableOf(
            err && err.status !== ERROR_STATUS.UNAUTHORIZED
              ? error(err)
              : unauthorized()
          )
        )
      )
    )
  )
}
