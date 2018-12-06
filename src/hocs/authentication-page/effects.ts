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
import { isInvalidEmail, not } from 'utils'
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

const invalidEmail = createActionFactory<void>('INVALID_EMAIL')
const validEmail = createActionFactory<void>('VALID_EMAIL')
const invalidPassword = createActionFactory<void>('INVALID_PASSWORD')
const validPassword = createActionFactory<void>('VALID_PASSWORD')
const invalidConfirm = createActionFactory<void>('INVALID_CONFIRM')
const validConfirm = createActionFactory<void>('VALID_CONFIRM')
const pending = createActionFactory<void>('PENDING')
const success = createActionFactory<void>('SUCCESS')
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
    return event$.pipe(
      filter(event => event.type === type),
      withLatestFrom(state$),
      pluck<any,HTMLElement>('1', 'inputs', input),
      tap(input => input && input.focus()),
      ignoreElements()
    )
  }
}

export function validateEmailOnEmailChange (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  return stateAfterInputChange('email')(event$, state$).pipe(
    validateInput(hasValidEmail, validEmail, invalidEmail)
  )
}

export function validatePasswordOnPasswordChange (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  const [signup$, signin$] =
    partition(isSignup)(stateAfterInputChange('password')(event$, state$))

  return merge(
    signup$.pipe(
      validateInput(hasValidSignupPassword, validPassword, invalidPassword)
    ),
    signin$.pipe(
      validateInput(hasValidSigninPassword, validPassword, invalidPassword)
    )
  )
}

export function validConfirmOnValidPasswordWhenSignin (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  return event$.pipe(
    filter(({ type }) => type === 'VALID_PASSWORD'),
    withLatestFrom(state$),
    pluck('1'),
    filter(not(isSignup)),
    map(() => validConfirm())
  )
}

export function validateConfirmOnConfirmChange (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  return stateAfterInputChange('confirm')(event$, state$).pipe(
    validateInput(hasValidConfirm, validConfirm, invalidConfirm)
  )
}

export function signinOrSignupOnSubmit (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  return event$.pipe(
    filter(({ type }) => type === 'SUBMIT'),
    withLatestFrom(state$),
    pluck('1'),
    filter<any>(({ state }) => state === 'valid'),
    switchMap(
      ({ props, changes }) => signinOrSignup(props.signup, {
        username: changes.email,
        passphrase: changes.password
      })
    )
  )
}

function isSignup ({ props } = {} as any) {
  return props && !!props.signup
}

function hasValidEmail ({ email } = {} as { email?: string }) {
  return email && !isInvalidEmail(email)
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

type InputChanges = { [input in InputField]: string }
type InputField = 'email' | 'password' | 'confirm'

function stateAfterInputChange (input: InputField) {
  return function (
    event$: Observable<StandardAction<any>>,
    state$: Observable<any>
  ) {
    return event$.pipe(
      filter(isChange(input)),
      withLatestFrom(state$),
      pluck<any,any>('1')
    )
  }
}

function isChange (input: InputField) {
  return function ({ type, payload }: StandardAction<any>) {
    return (type === 'CHANGE') && (input in payload)
  }
}

function validateInput (
  hasValidInput: (inputs?: InputChanges) => boolean,
  validInputAction: () => StandardAction<void>,
  invalidInputAction: () => StandardAction<void>
) {
  return function (state$: Observable<any>) {
    const inputs$ = pluck<any,InputChanges>('changes')(state$)
    const [valid$, invalid$] = partition(hasValidInput)(inputs$)
    return merge(
      valid$.pipe(map(() => validInputAction())),
      invalid$.pipe(map(() => invalidInputAction()))
    )
  }
}

function signinOrSignup (signup: boolean, credentials: Credentials) {
  return (signup ? zenypass.signup : zenypass.signin)(credentials).pipe(
    map(session => success(session)),
    startWith(pending()),
    catchError(err => observable(error(err)))
  )
}
