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

import createAutomataReducer, { AutomataSpec } from 'automata-reducer'
import { into, propCursor } from 'basic-cursors'
import compose from 'basic-compose'
import {
  always,
  isInvalidEmail,
  forType,
  mapPayload,
  mergePayload,
  not,
  omit,
  pick,
  stringifyError,
  withEventGuards
} from 'utils'
import { createActionFactory } from 'basic-fsa-factories'

export interface SigninPageHocProps {
  email?: string
  onAuthorize?: () => void
  onEmailChange?: (email?: string) => void
  onError?: (error?: any) => void
  onSignedIn?: (session?: string) => void
  onSignup?: () => void
}

export type SigninPageError = 'email' | 'password' | 'submit'

export enum SigninFsm {
  Pristine = 'PRISTINE',
  PristineEmail = 'PRISTINE_EMAIL', // valid password
  PristinePassword = 'PRISTINE_PASSWORD', // valid email
  PristineEmailInvalidPassword = 'PRISTINE_EMAIL_INVALID_PASSWORD',
  PristinePasswordInvalidEmail = 'PRISTINE_PASSWORD_INVALID_EMAIL',
  Invalid = 'INVALID',
  InvalidEmail = 'INVALID_EMAIL', // valid password
  InvalidPassword = 'INVALID_PASSWORD', // valid email
  Submittable = 'SUBMITTABLE',
  SigningIn = 'SIGNING_IN'
}

export enum RetryFsm {
  Idle = 'IDLE',
  Retry = 'RETRY',
  Alert = 'ALERT'
}

const isEmailChange = (previous = '', email) => email !== previous

const stringifyErrorPayloadIntoError = into('error')(mapPayload(stringifyError))
const mapIntoError = (error?: SigninPageError) =>
  into('error')(mapPayload(always(error)))
const clearError = mapIntoError(void 0)
const mapPayloadIntoEmail = into('email')(mapPayload())
const mapPayloadIntoPassword = into('password')(mapPayload())
const clearPassword = propCursor('password')(always(''))

const signinFsm: AutomataSpec<SigninFsm> = {
  [SigninFsm.Pristine]: {
    SUBMIT: SigninFsm.PristinePasswordInvalidEmail,
    INVALID_EMAIL: SigninFsm.PristinePasswordInvalidEmail,
    INVALID_PASSWORD: [SigninFsm.PristineEmailInvalidPassword, clearPassword],
    VALID_EMAIL: SigninFsm.PristinePassword,
    VALID_PASSWORD: SigninFsm.PristineEmail
  },
  [SigninFsm.PristinePasswordInvalidEmail]: {
    INVALID_PASSWORD: SigninFsm.Invalid,
    VALID_EMAIL: SigninFsm.PristinePassword,
    VALID_PASSWORD: SigninFsm.InvalidEmail
  },
  [SigninFsm.PristineEmailInvalidPassword]: {
    INVALID_EMAIL: SigninFsm.Invalid,
    INVALID_PASSWORD: clearPassword,
    VALID_EMAIL: SigninFsm.InvalidPassword,
    VALID_PASSWORD: SigninFsm.Submittable
  },
  [SigninFsm.PristineEmail]: {
    SUBMIT: SigninFsm.InvalidEmail,
    INVALID_EMAIL: SigninFsm.InvalidEmail,
    INVALID_PASSWORD: [SigninFsm.PristineEmailInvalidPassword, clearPassword],
    VALID_EMAIL: SigninFsm.Submittable
  },
  [SigninFsm.PristinePassword]: {
    CHANGE_EMAIL_PROP: clearError,
    CHANGE_PASSWORD_INPUT: clearError,
    SUBMIT: SigninFsm.InvalidPassword,
    INVALID_EMAIL: SigninFsm.PristinePasswordInvalidEmail,
    INVALID_PASSWORD: [SigninFsm.InvalidPassword, clearPassword],
    VALID_PASSWORD: SigninFsm.Submittable
  },
  [SigninFsm.Invalid]: {
    VALID_EMAIL: [SigninFsm.InvalidPassword, clearPassword],
    VALID_PASSWORD: SigninFsm.InvalidEmail
  },
  [SigninFsm.InvalidEmail]: {
    INVALID_PASSWORD: SigninFsm.Invalid,
    VALID_EMAIL: SigninFsm.Submittable
  },
  [SigninFsm.InvalidPassword]: {
    INVALID_EMAIL: SigninFsm.Invalid,
    INVALID_PASSWORD: clearPassword,
    VALID_PASSWORD: SigninFsm.Submittable
  },
  [SigninFsm.Submittable]: {
    INVALID_EMAIL: SigninFsm.InvalidEmail,
    INVALID_PASSWORD: SigninFsm.InvalidPassword,
    VALID_EMAIL: SigninFsm.InvalidPassword,
    SUBMIT: SigninFsm.SigningIn
  },
  [SigninFsm.SigningIn]: {
    ERROR: [
      SigninFsm.PristinePassword,
      clearPassword,
      stringifyErrorPayloadIntoError
    ],
    UNAUTHORIZED: [
      SigninFsm.PristinePassword,
      clearPassword,
      mapIntoError('submit')
    ],
    NOT_FOUND: [
      SigninFsm.PristinePassword,
      clearPassword,
      mapIntoError('submit')
    ],
    SIGNED_IN: [SigninFsm.PristinePassword, clearPassword]
  }
}

const retryFsm: AutomataSpec<RetryFsm> = {
  [RetryFsm.Idle]: {
    UNAUTHORIZED: RetryFsm.Retry,
    NOT_FOUND: RetryFsm.Retry
  },
  [RetryFsm.Retry]: {
    SIGNED_IN: RetryFsm.Idle,
    ERROR: RetryFsm.Idle,
    UNAUTHORIZED: RetryFsm.Alert,
    NOT_FOUND: RetryFsm.Alert
  },
  [RetryFsm.Alert]: {
    SUBMIT: RetryFsm.Retry,
    CANCEL: RetryFsm.Idle
  }
}

const SELECTED_PROPS: (keyof SigninPageHocProps)[] = [
  'onAuthorize',
  'onEmailChange',
  'onError',
  'onSignedIn',
  'onSignup'
]

const reducer = compose.into(0)(
  createAutomataReducer(signinFsm, SigninFsm.Pristine),
  createAutomataReducer(retryFsm, RetryFsm.Idle, { key: 'retry' }),
  forType('CHANGE_PASSWORD_INPUT')(mapPayloadIntoPassword),
  forType('CHANGE_EMAIL_PROP')(mapPayloadIntoEmail),
  forType('INPUT_REF')(propCursor('inputs')(mergePayload())),
  forType('PROPS')(
    compose.into(0)(
      mergePayload(pick(SELECTED_PROPS)),
      into('attrs')(mapPayload(omit(SELECTED_PROPS)))
    )
  )
)

const changeEmailProp = createActionFactory('CHANGE_EMAIL_PROP')
const invalidEmail = createActionFactory('INVALID_EMAIL')
const validEmail = createActionFactory('VALID_EMAIL')
const invalidPassword = createActionFactory('INVALID_PASSWORD')
const validPassword = createActionFactory('VALID_PASSWORD')

export default withEventGuards({
  PROPS: ({ email = '' }, state: any) =>
    isEmailChange(state && state.email, email) && changeEmailProp(email),
  CHANGE_EMAIL_PROP: email =>
    (isInvalidEmail(email) ? invalidEmail : validEmail)(),
  CHANGE_PASSWORD_INPUT: password =>
    (!password ? invalidPassword : validPassword)()
})(reducer)
