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
  filter,
  map,
  startWith,
  switchMap
  // tap
} from 'rxjs/operators'
import { Observable, from as observableFrom, of as observableOf } from 'rxjs'
// const log = label => console.log.bind(console, label)

const zenypass$ = observableFrom(zenypass)

const signingIn = createActionFactory<void>('SIGNING_IN')
const signedIn = createActionFactory<void>('SIGNED_IN')
const unauthorized = createActionFactory<void>('UNAUTHORIZED')
const notFound = createActionFactory<void>('NOT_FOUND')
const error = createActionFactory<any>('ERROR')

export function serviceSigninOnSubmitFromValid (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  return stateOnEvent(({ type }) => type === 'SUBMIT')(event$, state$).pipe(
    filter(({ valid }) => valid === ValidityFsm.Submittable),
    switchMap(({ email, password }) =>
      zenypass$.pipe(
        switchMap(({ signin }) => signin(email, password)),
        map(() => signedIn(email)),
        catchError(err => observableOf(unauthorizedNotFoundOrError(err))),
        startWith(signingIn())
      )
    )
  )
}

function unauthorizedNotFoundOrError (err: any) {
  return err && err.status !== ERROR_STATUS.UNAUTHORIZED
    ? err && err.status !== ERROR_STATUS.NOT_FOUND
      ? error(err)
      : notFound()
    : unauthorized()
}
