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
import { AuthenticationFsmState } from './reducer'
import { getService } from 'zenypass-service'
import { createActionFactory, StandardAction } from 'basic-fsa-factories'
import { ERROR_STATUS } from 'utils'
import {
  catchError,
  distinctUntilKeyChanged,
  filter,
  switchMap
  //tap
} from 'rxjs/operators'
import { Observable, of as observableOf } from 'rxjs'

// const log = (label: string) => console.log.bind(console, label)

const authenticated = createActionFactory('AUTHENTICATED')
const unauthorized = createActionFactory('UNAUTHORIZED')
const error = createActionFactory<any>('ERROR')

export function authenticateOnAuthenticating (
  _: any,
  state$: Observable<{
    state: AuthenticationFsmState
    passphrase: string
    session: string
  }>
) {
  return state$.pipe(
    distinctUntilKeyChanged('state'),
    filter(({ state }) => state === AuthenticationFsmState.Authenticating),
    switchMap(authenticate),
    catchError(err => observableOf(error(err)))
  )
}

function authenticate ({ passphrase, session }): Promise<StandardAction<any>> {
  return getService(session)
    .then(service => service.unlock(passphrase))
    .then(authenticated)
    .catch(err =>
      err && err.status === ERROR_STATUS.UNAUTHORIZED
        ? unauthorized(err)
        : error(err)
    )
}
