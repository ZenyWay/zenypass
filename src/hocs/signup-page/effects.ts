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

import { ValidityFsm } from './reducer'
import zenypass from 'zenypass-service'
import { StandardAction, createActionFactory } from 'basic-fsa-factories'
import { stateOnEvent, ERROR_STATUS } from 'utils'
import {
  filter,
  map,
  switchMap
  // tap
} from 'rxjs/operators'
import { Observable } from 'rxjs'
// const log = label => console.log.bind(console, label)

const invalidPassword = createActionFactory<void>('INVALID_PASSWORD')
const validPassword = createActionFactory<void>('VALID_PASSWORD')
const signedUp = createActionFactory<void>('SIGNED_UP')
const error = createActionFactory<any>('ERROR')

export function validatePasswordOnChangePassword (
  event$: Observable<StandardAction<any>>
) {
  return event$.pipe(
    filter(({ type }) => type === 'CHANGE_PASSWORD'),
    map(({ payload }) => (payload ? validPassword : invalidPassword)(payload))
  )
}

export function serviceSignupOnSubmitFromSignupSubmitting (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  return stateOnEvent(({ type }) => type === 'SUBMIT')(event$, state$).pipe(
    filter<any>(({ state }) => state === 'signup:submitting'),
    switchMap(({ props, password }) =>
      zenypass
        .then(({ signup }) => signup(props.email, password))
        .then(() => signedUp())
        .catch(err => error(err))
    )
  )
}
