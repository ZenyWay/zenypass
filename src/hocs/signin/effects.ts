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

import { zenypass, Credentials } from 'services'
import { StandardAction, createActionFactory } from 'basic-fsa-factories'
import { ERROR_STATUS, isInvalidEmail } from 'utils'
import {
  ignoreElements,
  filter,
  map,
  partition,
  pluck,
  tap,
  withLatestFrom,
  catchError,
  startWith,
  switchMap
} from 'rxjs/operators'
import { Observable, of as observable, merge } from 'rxjs'
// const log = label => console.log.bind(console, label)

const invalidEmail = createActionFactory('INVALID_EMAIL')
const validEmail = createActionFactory('VALID_EMAIL')
const authenticating = createActionFactory('AUTHENTICATING')
const authenticated = createActionFactory('AUTHENTICATED')
const unauthorized = createActionFactory('UNAUTHORIZED')
const error = createActionFactory('ERROR')

export function focusEmailInputOnMount (
  event$: Observable<StandardAction<any>>
) {
  return event$.pipe(
    filter(({ type, payload }) => (type === 'INPUT_REF') && !!payload.email),
    tap(({ payload }) => payload.email.focus()),
    ignoreElements()
  )
}

export function validateEmailOnEmailChange (
  event$: Observable<StandardAction<any>>
) {
  const email$ = event$.pipe(
    filter(({ type, payload }) => (type === 'CHANGE') && ('email' in payload)),
    pluck<any,string>('payload', 'email')
  )
  const [invalid$, valid$] = partition(isInvalidEmail)(email$)
  return merge(
    invalid$.pipe(map(invalidEmail)),
    valid$.pipe(map(validEmail))
  )
}

export function focusPasswordInputOnValidEmailAndNoPassword (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  return event$.pipe(
    filter(({ type }) => type === 'VALID_EMAIL'),
    withLatestFrom(state$),
    pluck('1'),
    filter<any>(({ changes }) => !changes || !changes.password),
    tap(({ inputs }) => inputs.password.focus()),
    ignoreElements(),
    catchError((err, $) => $.pipe(startWith(error(err))))
  )
}

export function signinOnSubmit (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  return event$.pipe(
    filter(({ type }) => type === 'SUBMIT'),
    withLatestFrom(state$),
    pluck('1'),
    filter(
      ({ state, changes }) => state === 'valid' && changes && changes.password
    ),
    switchMap(
      ({ changes }) => signin({
        username: changes.email,
        passphrase: changes.password
      })
    )
  )
}

function signin (credentials: Credentials) {
  return zenypass.signin(credentials).pipe(
    map(authenticated),
    startWith(authenticating()),
    catchError(err => observable(unauthorizedOrError(err)))
  )
}

function unauthorizedOrError (err: any) {
  return err && err.status !== ERROR_STATUS.UNAUTHORIZED
  ? error(err)
  : unauthorized(err.status)
}
