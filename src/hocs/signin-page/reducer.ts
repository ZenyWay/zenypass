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
  omit,
  pick,
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
  Editing = 'EDITING',
  InvalidEmail = 'INVALID_EMAIL',
  InvalidPassword = 'INVALID_PASSWORD',
  Unautorized = 'UNAUTHORIZED',
  SigningIn = 'SIGNING_IN'
}

export enum RetryFsm {
  Idle = 'IDLE',
  Retry = 'RETRY',
  Alert = 'ALERT'
}

const mapPayloadIntoEmail = into('email')(mapPayload())
const mapPayloadIntoPassword = into('password')(mapPayload())
const clearPassword = propCursor('password')(always(''))

const signinFsm: AutomataSpec<SigninFsm> = {
  [SigninFsm.Editing]: {
    INVALID_EMAIL: SigninFsm.InvalidEmail,
    INVALID_PASSWORD: SigninFsm.InvalidPassword,
    VALID_PASSWORD: SigninFsm.SigningIn
  },
  [SigninFsm.InvalidEmail]: {
    SUBMIT: SigninFsm.Editing
  },
  [SigninFsm.InvalidPassword]: {
    SUBMIT: SigninFsm.Editing
  },
  [SigninFsm.Unautorized]: {
    SUBMIT: SigninFsm.Editing
  },
  [SigninFsm.SigningIn]: {
    ERROR: [SigninFsm.Editing, clearPassword],
    UNAUTHORIZED: [SigninFsm.Unautorized, clearPassword],
    NOT_FOUND: [SigninFsm.Unautorized, clearPassword],
    SIGNED_IN: [SigninFsm.Editing, clearPassword]
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
  createAutomataReducer(signinFsm, SigninFsm.Editing),
  createAutomataReducer(retryFsm, RetryFsm.Idle, { key: 'retry' }),
  forType('CHANGE_PASSWORD_INPUT')(mapPayloadIntoPassword),
  forType('CHANGE_EMAIL_INPUT')(mapPayloadIntoEmail),
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

const isEmailChange = (previous = '', email) => email !== previous
const validateEmail = email =>
  (isInvalidEmail(email) ? invalidEmail : validEmail)()
const validatePassword = password =>
  (!password ? invalidPassword : validPassword)()

export default withEventGuards({
  PROPS: ({ email = '' }, state: any) =>
    isEmailChange(state && state.email, email) && changeEmailProp(email),
  SUBMIT: (_, { email }) => validateEmail(email),
  VALID_EMAIL: (_, { password }) => validatePassword(password)
})(reducer)
