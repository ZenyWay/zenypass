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

export enum ValidityFsm {
  Invalid = 'INVALID',
  InvalidEmail = 'INVALID_EMAIL',
  EmptyPassword = 'EMPTY_PASSWORD',
  Submittable = 'SUBMITTABLE'
}

export enum SigninFsm {
  Idle = 'IDLE',
  Pending = 'PENDING',
  Error = 'ERROR',
  PendingRetry = 'PENDING_RETRY',
  Alert = 'ALERT',
  RetryError = 'RETRY_ERROR'
}

const mapPayloadIntoPassword = into('password')(mapPayload())
const clearPassword = propCursor('password')(always(''))

const validityFsm: AutomataSpec<ValidityFsm> = {
  [ValidityFsm.Invalid]: {
    VALID_EMAIL: ValidityFsm.EmptyPassword,
    VALID_PASSWORD: ValidityFsm.InvalidEmail
  },
  [ValidityFsm.InvalidEmail]: {
    INVALID_PASSWORD: ValidityFsm.Invalid,
    VALID_EMAIL: ValidityFsm.Submittable
  },
  [ValidityFsm.EmptyPassword]: {
    INVALID_EMAIL: ValidityFsm.Invalid,
    VALID_PASSWORD: ValidityFsm.Submittable
  },
  [ValidityFsm.Submittable]: {
    INVALID_EMAIL: ValidityFsm.InvalidEmail,
    INVALID_PASSWORD: ValidityFsm.EmptyPassword,
    ERROR: [ValidityFsm.EmptyPassword, clearPassword],
    UNAUTHORIZED: [ValidityFsm.EmptyPassword, clearPassword],
    NOT_FOUND: [ValidityFsm.EmptyPassword, clearPassword],
    AUTHENTICATED: [ValidityFsm.EmptyPassword, clearPassword]
  }
}

const signinFsm: AutomataSpec<SigninFsm> = {
  [SigninFsm.Idle]: {
    SIGNING_IN: SigninFsm.Pending
  },
  [SigninFsm.Pending]: {
    ERROR: SigninFsm.Idle,
    UNAUTHORIZED: SigninFsm.Error,
    NOT_FOUND: SigninFsm.Error,
    SIGNED_IN: SigninFsm.Idle
  },
  [SigninFsm.Error]: {
    SIGNING_IN: SigninFsm.PendingRetry
  },
  [SigninFsm.PendingRetry]: {
    ERROR: SigninFsm.Idle,
    UNAUTHORIZED: SigninFsm.Alert,
    NOT_FOUND: SigninFsm.Alert,
    SIGNED_IN: SigninFsm.Idle
  },
  [SigninFsm.Alert]: {
    CANCEL: SigninFsm.RetryError,
    AUTHORIZE: SigninFsm.Idle
  },
  [SigninFsm.RetryError]: {
    SIGNING_IN: SigninFsm.PendingRetry
  }
}

const SELECTED_PROPS: (keyof SigninPageHocProps)[] = [
  'email',
  'onAuthorize',
  'onEmailChange',
  'onError',
  'onSignedIn',
  'onSignup'
]

const reducer = compose.into(0)(
  createAutomataReducer(validityFsm, ValidityFsm.Invalid, { key: 'valid' }),
  createAutomataReducer(signinFsm, SigninFsm.Idle, { key: 'signin' }),
  forType('CHANGE_PASSWORD')(mapPayloadIntoPassword),
  forType('INPUT_REF')(propCursor('inputs')(mergePayload())),
  forType('PROPS')(
    compose.into(0)(
      mergePayload(pick(SELECTED_PROPS)),
      into('attrs')(mapPayload(omit(SELECTED_PROPS)))
    )
  )
)

const invalidEmail = createActionFactory('INVALID_EMAIL')
const validEmail = createActionFactory('VALID_EMAIL')
const invalidPassword = createActionFactory('INVALID_PASSWORD')
const validPassword = createActionFactory('VALID_PASSWORD')

export default withEventGuards({
  PROPS: ({ email }) => (isInvalidEmail(email) ? invalidEmail : validEmail)(),
  CHANGE_PASSWORD: password => (!password ? invalidPassword : validPassword)()
})(reducer)
