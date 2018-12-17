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

import { zenypass } from 'services'
import { StandardAction, createActionFactory } from 'basic-fsa-factories'
import {
  isInvalidEmail,
  hasEntry,
  not,
  stateOnEvent,
  ERROR_STATUS
} from 'utils'
import {
  catchError,
  distinctUntilChanged,
  filter,
  ignoreElements,
  map,
  partition,
  pluck,
  skipWhile,
  startWith,
  switchMap,
  tap
} from 'rxjs/operators'
import { Observable, of as observable, merge } from 'rxjs'
// const log = label => console.log.bind(console, label)

const toggleSignupRequest = createActionFactory<void>('TOGGLE_SIGNUP_REQUEST')
const toggleSignup = createActionFactory<void>('TOGGLE_SIGNUP')
const invalidEmail = createActionFactory<void>('INVALID_EMAIL')
const validEmail = createActionFactory<void>('VALID_EMAIL')
const invalidPassword = createActionFactory<void>('INVALID_PASSWORD')
const validSignupPassword = createActionFactory<void>('VALID_SIGNUP_PASSWORD')
const validSigninPassword = createActionFactory<void>('VALID_SIGNIN_PASSWORD')
const invalidConfirm = createActionFactory<void>('INVALID_CONFIRM')
const validConfirm = createActionFactory<void>('VALID_CONFIRM')
const pending = createActionFactory<void>('PENDING')
const authenticated = createActionFactory<void>('AUTHENTICATED')
const unauthorized = createActionFactory<void>('UNAUTHORIZED')
const error = createActionFactory<any>('ERROR')

export function focusEmailInputOnMount (
  event$: Observable<StandardAction<any>>
) {
  return event$.pipe(
    filter(({ type, payload }) => (type === 'INPUT_REF') && !!payload.email),
    tap(({ payload }) => payload.email.focus()),
    ignoreElements()
  )
}

export function focusInputOnEvent (type: string, input: string) {
  return function focusPasswordInputOnValidEmail (
    event$: Observable<StandardAction<any>>,
    state$: Observable<any>
  ) {
    return stateOnEvent(hasEntry('type', type))(event$, state$).pipe(
      pluck<any,HTMLElement>('inputs', input),
      tap(input => input && input.focus()),
      ignoreElements()
    )
  }
}

export function toggleSignupOnSignupPropChange (
  _: any,
  state$: Observable<any>
) {
  return state$.pipe(
    pluck('props', 'signup'),
    skipWhile(signup => !signup), // ignore initial signin = automata init
    distinctUntilChanged(),
    map(() => toggleSignup())
  )
}

export function validateEmailOnEmailPropChange (_: any, state$: Observable<any>) {
  return state$.pipe(
    pluck('props', 'email'),
    skipWhile(email => !email), // ignore initial undefined (if any)
    distinctUntilChanged(),
    validateInput(not(isInvalidEmail), validEmail, invalidEmail)
  )
}

export function validatePasswordOnChangePassword (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  const stateOnChangePassword$ =
    stateOnEvent(hasEntry('type', 'CHANGE_PASSWORD'))(event$, state$)
  const [signup$, signin$] = partition(isSignup)(stateOnChangePassword$)

  return merge(
    signup$.pipe(
      validateInput(hasValidSignupPassword, validSignupPassword, invalidPassword)
    ),
    signin$.pipe(
      validateInput(hasValidSigninPassword, validSigninPassword, invalidPassword)
    )
  )
}

export function validateConfirmOnChangeConfirm (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  return stateOnEvent(hasEntry('type', 'CHANGE_CONFIRM'))(event$, state$).pipe(
    validateInput(hasValidConfirm, validConfirm, invalidConfirm)
  )
}

export function serviceSigninOnSigninFromValid (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  return stateOnEvent(({ type }) => type === 'SIGNIN')(event$, state$).pipe(
    filter<any>(({ state }) => state === 'valid'),
    switchMap(
      ({ props, password }) => zenypass.signin({
        username: props.email,
        passphrase: password
      }).pipe(
        map(session => authenticated(session)),
        startWith(pending()),
        catchError(err => observable(unauthorizedOrError(err)))
      )
    )
  )
}

export function serviceSignupOnSignupFromConsentsWhenAccepted (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  return stateOnEvent(({ type }) => type === 'SIGNUP')(event$, state$).pipe(
    filter<any>(({ state, terms }) => (state === 'consents') && !!terms),
    switchMap(
      ({ props, password }) => zenypass.signup({
        username: props.email,
        passphrase: password
      }).pipe(
        map(() => toggleSignupRequest()),
        startWith(pending()),
        catchError(err => observable(error(err)))
      )
    )
  )
}

function isSignup ({ props } = {} as any) {
  return props && !!props.signup
}

const MIN_PASSWORD_LENGTH = 4
function hasValidSignupPassword ({ password } = {} as { password?: string }) {
  return password && password.length >= MIN_PASSWORD_LENGTH
}

function hasValidSigninPassword ({ password } = {} as { password?: string }) {
  return password && password.length > 0
}

function hasValidConfirm (
  { password, confirm } = {} as { password?: string, confirm?: string }
) {
  return confirm && confirm === password
}

function validateInput <I extends {} = {}> (
  hasValidInput: (inputs?: I) => boolean,
  validInputAction: () => StandardAction<void>,
  invalidInputAction: () => StandardAction<void>
) {
  return function (inputs$: Observable<I>) {
    const [valid$, invalid$] = partition(hasValidInput)(inputs$)
    return merge(
      valid$.pipe(map(() => validInputAction())),
      invalid$.pipe(map(() => invalidInputAction()))
    )
  }
}

function unauthorizedOrError (err: any) {
  return err && err.status !== ERROR_STATUS.UNAUTHORIZED
  ? error(err)
  : unauthorized()
}
