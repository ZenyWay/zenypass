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

import zenypass from 'zenypass-service'
import {
  StandardAction,
  createActionFactory,
  createActionFactories
} from 'basic-fsa-factories'
import {
  isInvalidEmail,
  isFunction,
  hasEntry,
  pluck as select,
  stateOnEvent,
  ERROR_STATUS
} from 'utils'
import {
  distinctUntilChanged,
  distinctUntilKeyChanged,
  filter,
  ignoreElements,
  map,
  pluck,
  skipWhile,
  switchMap,
  tap
} from 'rxjs/operators'
import { Observable } from 'rxjs'
// const log = label => console.log.bind(console, label)

export enum AuthenticationPageType {
  Signin = 'signin',
  Signup = 'signup',
  Authorize = 'authorize'
}

const changePageType = createActionFactories({
  [AuthenticationPageType.Signin]: 'SIGNIN',
  [AuthenticationPageType.Signup]: 'SIGNUP',
  [AuthenticationPageType.Authorize]: 'AUTHORIZE'
})

const invalidEmail = createActionFactory<void>('INVALID_EMAIL')
const validEmail = createActionFactory<void>('VALID_EMAIL')
const invalidPassword = createActionFactory<void>('INVALID_PASSWORD')
const validPassword = createActionFactory<void>('VALID_PASSWORD')
const invalidConfirm = createActionFactory<void>('INVALID_CONFIRM')
const validConfirm = createActionFactory<void>('VALID_CONFIRM')
const togglePageType = createActionFactory<void>('TOGGLE_PAGE_TYPE')
const authenticated = createActionFactory<void>('AUTHENTICATED')
const unauthorized = createActionFactory<void>('UNAUTHORIZED')
const error = createActionFactory<any>('ERROR')

export function focusEmailInputOnMount (
  event$: Observable<StandardAction<any>>
) {
  return event$.pipe(
    filter(({ type, payload }) => type === 'INPUT_REF' && !!payload.email),
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
      pluck<any, HTMLElement>('inputs', input),
      tap(input => input && input.focus()),
      ignoreElements()
    )
  }
}

export function callAuthenticationPageTypeHandlerOnStatePagePending (
  _: any,
  state$: Observable<any>
) {
  return state$.pipe(
    distinctUntilKeyChanged('state'),
    map(({ props, state }) => ({
      handler: props.onAuthenticationPageType,
      state: state.split(':')
    })),
    distinctUntilChanged(
      (a, b) => a[0] === b[0] && a[3] === b[3], // compare type and option
      select('state')
    ),
    filter(
      ({ handler, state }) => state[3] === 'pending' && isFunction(handler)
    ),
    tap(({ handler, state }) =>
      Promise.resolve().then(() => handler(state[0]))
    ),
    ignoreElements()
  )
}

export function signupOrSigninOrAuthorizeOnTypePropChange (
  _: any,
  state$: Observable<any>
) {
  return state$.pipe(
    pluck<any, AuthenticationPageType>('props', 'type'),
    distinctUntilChanged(),
    map((type = AuthenticationPageType.Signin) => changePageType[type]())
  )
}

export function validateEmailOnEmailPropChange (
  _: any,
  state$: Observable<any>
) {
  return state$.pipe(
    pluck<any, string>('props', 'email'),
    skipWhile(email => !email), // ignore initial undefined, if any
    distinctUntilChanged(),
    map(email => (isInvalidEmail(email) ? invalidEmail() : validEmail()))
  )
}

export function validatePasswordOnChangePassword (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  return stateOnEvent(hasEntry('type', 'CHANGE_PASSWORD'))(event$, state$).pipe(
    map(state =>
      hasValidPassword(state) ? validPassword() : invalidPassword()
    )
  )
}

export function validateConfirmOnChangeConfirm (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  return stateOnEvent(hasEntry('type', 'CHANGE_CONFIRM'))(event$, state$).pipe(
    map(state => (hasValidConfirm(state) ? validConfirm() : invalidConfirm()))
  )
}

export function serviceSigninOnSubmitFromSigninSubmitting (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  return stateOnEvent(({ type }) => type === 'SUBMIT')(event$, state$).pipe(
    filter<any>(({ state }) => /^signin:submitting/.test(state)),
    switchMap(({ props: { email }, password }) =>
      zenypass
        .then(({ signin }) => signin(email, password))
        .then(() => authenticated(email))
        .catch(err => unauthorizedOrError(err))
    )
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
        .then(() => togglePageType())
        .catch(err => error(err))
    )
  )
}

const MIN_SIGNUP_PASSWORD_LENGTH = 4
const MIN_SIGNIN_PASSWORD_LENGTH = 1
function hasValidPassword (state: { props?: any; password?: string } = {}) {
  const min = isSignup(state)
    ? MIN_SIGNUP_PASSWORD_LENGTH
    : MIN_SIGNIN_PASSWORD_LENGTH
  const { password } = state
  return password && password.length >= min
}

function isSignup ({ props } = {} as any) {
  return props && props.type === AuthenticationPageType.Signup
}

function hasValidConfirm (
  { password, confirm } = {} as { password?: string; confirm?: string }
) {
  return confirm && confirm === password
}

function unauthorizedOrError (err: any) {
  return err && err.status !== ERROR_STATUS.UNAUTHORIZED
    ? error(err)
    : unauthorized()
}
