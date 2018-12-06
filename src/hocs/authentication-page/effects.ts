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
  event$: Observable<StandardAction<any>>
) {
  const email$ = selectChange('email')(event$)
  const [invalid$, valid$] = partition(isInvalidEmail)(email$)
  return merge(
    invalid$.pipe(map(() => invalidEmail())),
    valid$.pipe(map(() => validEmail()))
  )
}

export function validatePasswordOnPasswordChange (
  event$: Observable<StandardAction<any>>
) {
  const password$ = selectChange('password')(event$)
  const [invalid$, valid$] = partition(isInvalidPassword)(password$)
  return merge(
    invalid$.pipe(map(() => invalidPassword())),
    valid$.pipe(map(() => validPassword()))
  )
}

export function validConfirmOnValidPasswordWhenSignin (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  return event$.pipe(
    filter(({ type }) => type === 'VALID_PASSWORD'),
    withLatestFrom(state$),
    pluck('1', 'props', 'signup'),
    filter(not(Boolean)),
    map(() => validConfirm())
  )
}

export function validateConfirmOnConfirmChange (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  const confirm$ = event$.pipe(
    filter(isChange('confirm')),
    withLatestFrom(state$),
    pluck<any,{ password: string, confirm: string }>('1', 'changes')
  )
  const [invalid$, valid$] = partition(isInvalidConfirm)(confirm$)
  return merge(
    invalid$.pipe(map(() => invalidConfirm())),
    valid$.pipe(map(() => validConfirm()))
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

const MIN_PASSWORD_LENGTH = 4
function isInvalidPassword (password: string): boolean {
  return password.length < MIN_PASSWORD_LENGTH
}

function isInvalidConfirm (
  { password, confirm }: { password: string, confirm: string }
) {
  return password !== confirm
}

type ChangeFields = 'email' | 'password' | 'confirm'

function selectChange (field: ChangeFields) {
  return function (event$: Observable<StandardAction<any>>) {
    return event$.pipe(
      filter(isChange(field)),
      pluck<any,string>('payload', field)
    )
  }
}

function isChange (field: ChangeFields) {
  return function ({ type, payload }: StandardAction<any>) {
    return (type === 'CHANGE') && (field in payload)
  }
}

function signinOrSignup (signup: boolean, credentials: Credentials) {
  return (signup ? zenypass.signup : zenypass.signin)(credentials).pipe(
    map(() => success()),
    startWith(pending()),
    catchError(err => observable(error(err)))
  )
}
