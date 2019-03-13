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
import { stateOnEvent } from 'utils'
import {
  catchError,
  filter,
  map,
  startWith,
  switchMap
  // tap
} from 'rxjs/operators'
import { Observable, from as observableFrom, of as observableOf } from 'rxjs'
// const log = label => console.log.bind(console, label)

const zenypass$ = observableFrom(zenypass)

const signingUp = createActionFactory<void>('SIGNING_UP')
const signedUp = createActionFactory<void>('SIGNED_UP')
const error = createActionFactory<any>('ERROR')

export function serviceSignupOnSubmitFromConfirmed (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  return stateOnEvent(({ type }) => type === 'SUBMIT')(event$, state$).pipe(
    filter<any>(({ valid }) => valid === ValidityFsm.Confirmed),
    switchMap(({ email, password }) =>
      zenypass$.pipe(
        switchMap(({ signup }) => signup(email, password)),
        map(() => signedUp(email)),
        catchError(err => observableOf(error(err))),
        startWith(signingUp())
      )
    )
  )
}
