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

import { SignupFsm } from './reducer'
import zenypass from 'zenypass-service'
import { createActionFactory, createActionFactories } from 'basic-fsa-factories'
import { ERROR_STATUS } from 'utils'
import { catchError, filter, map, switchMap } from 'rxjs/operators'
import { Observable, from as observableFrom, of as observableOf } from 'rxjs'

const zenypass$ = observableFrom(zenypass)

const signedUp = createActionFactory<void>('SIGNED_UP')
const error = createActionFactory<any>('ERROR')

const SIGNUP_ERRORS = createActionFactories({
  [ERROR_STATUS.CONFLICT]: 'CONFLICT',
  [ERROR_STATUS.GATEWAY_TIMEOUT]: 'GATEWAY_TIMEOUT'
})

export function serviceSignupOnSigningUp (_: any, state$: Observable<any>) {
  return state$.pipe(
    filter<any>(({ state }) => state === SignupFsm.SigningUp),
    switchMap(({ email, password, news, attrs: { locale } }) =>
      zenypass$.pipe(
        switchMap(({ signup }) =>
          signup(email, password, {
            locale,
            newsletter: news
          })
        ),
        map(() => signedUp(email)),
        catchError(err =>
          observableOf(((err && SIGNUP_ERRORS[err.status]) || error)(err))
        )
      )
    )
  )
}
