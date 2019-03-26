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
  catchError,
  delay,
  filter,
  map,
  startWith,
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

const authorizing = createActionFactory<void>('AUTHORIZING')
const authorized = createActionFactory<void>('AUTHORIZED')
const error = createActionFactory<any>('ERROR')

export function serviceAuthorizeOnSubmitFromSubmittable (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  return stateOnEvent(({ type }) => type === 'SUBMIT')(event$, state$).pipe(
    filter<any>(({ valid }) => valid === ValidityFsm.Submittable),
    switchMap(({ email, password, token }) =>
      zenypass$.pipe(
        switchMap(({ requestAccess }) => requestAccess(email, password, token)),
        delay(DELAY_AFTER_SUCCESSFUL_AUTHORIZATION),
        map(() => authorized(email)),
        catchError(err => observableOf(error(err))),
        startWith(authorizing())
      )
    )
  )
}
