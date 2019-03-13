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
import { createActionFactory } from 'basic-fsa-factories'
import { into, propCursor } from 'basic-cursors'
import compose from 'basic-compose'
import {
  always,
  exclude,
  isInvalidEmail,
  forType,
  mapEvents,
  mapPayload,
  mergePayload,
  select
} from 'utils'

export interface SigninPageHocProps {
  email?: string
  onAuthenticated?: (session?: string) => void
  onEmailChange?: (email?: string) => void
  onError?: (error?: any) => void
  onTogglePage?: () => void
}

export enum ValidityFsm {
  Invalid = 'INVALID',
  InvalidEmail = 'INVALID_EMAIL',
  InvalidPassword = 'INVALID_PASSWORD',
  Valid = 'VALID'
}

export enum SigninFsm {
  Idle = 'IDLE',
  Pending = 'PENDING',
  Error = 'ERROR',
  PendingRetry = 'PENDING_RETRY',
  Alert = 'ALERT',
  Retry = 'RETRY'
}

const invalidEmail = createActionFactory<void>('INVALID_EMAIL')
const validEmail = createActionFactory<void>('VALID_EMAIL')
const invalidPassword = createActionFactory<void>('INVALID_PASSWORD')
const validPassword = createActionFactory<void>('VALID_PASSWORD')
const mapPayloadIntoPassword = into('password')(mapPayload())
const clearPassword = propCursor('password')(always(''))

/**
 * only change page type on SIGNUP, SIGNIN, or AUTHORIZE
 */
const validityFsm: AutomataSpec<ValidityFsm> = {
  [ValidityFsm.Invalid]: {
    VALID_EMAIL: ValidityFsm.InvalidPassword,
    VALID_PASSWORD: ValidityFsm.InvalidEmail
  },
  [ValidityFsm.InvalidEmail]: {
    INVALID_PASSWORD: ValidityFsm.Invalid,
    VALID_EMAIL: ValidityFsm.Valid
  },
  [ValidityFsm.InvalidPassword]: {
    INVALID_EMAIL: ValidityFsm.Invalid,
    VALID_PASSWORD: ValidityFsm.Valid
  },
  [ValidityFsm.Valid]: {
    INVALID_EMAIL: ValidityFsm.InvalidEmail,
    INVALID_PASSWORD: ValidityFsm.InvalidPassword,
    ERROR: [ValidityFsm.InvalidPassword, clearPassword],
    UNAUTHORIZED: [ValidityFsm.InvalidPassword, clearPassword],
    AUTHENTICATED: [ValidityFsm.InvalidPassword, clearPassword]
  }
}

const signinFsm: AutomataSpec<SigninFsm> = {
  [SigninFsm.Idle]: {
    AUTHENTICATING: SigninFsm.Pending
  },
  [SigninFsm.Pending]: {
    ERROR: SigninFsm.Idle,
    UNAUTHORIZED: SigninFsm.Error,
    AUTHENTICATED: SigninFsm.Idle
  },
  [SigninFsm.Error]: {
    AUTHENTICATING: SigninFsm.PendingRetry
  },
  [SigninFsm.PendingRetry]: {
    ERROR: SigninFsm.Idle,
    UNAUTHORIZED: SigninFsm.Alert,
    AUTHENTICATED: SigninFsm.Idle
  },
  [SigninFsm.Alert]: {
    CANCEL: SigninFsm.Retry
  },
  [SigninFsm.Retry]: {
    AUTHENTICATING: SigninFsm.PendingRetry
  }
}

const SELECTED_PROPS: (keyof SigninPageHocProps)[] = [
  'email',
  'onAuthenticated',
  'onEmailChange',
  'onError',
  'onTogglePage'
]

export const reducer = compose.into(0)(
  compose(
    createAutomataReducer(validityFsm, ValidityFsm.Invalid, { key: 'valid' }),
    mapEvents({
      CHANGE_PASSWORD: ({ password }) =>
        (password ? validPassword : invalidPassword)(),
      PROPS: ({ email }) =>
        (isInvalidEmail(email) ? invalidEmail : validEmail)()
    })
  ),
  createAutomataReducer(signinFsm, SigninFsm.Idle, { key: 'signin' }),
  forType('CHANGE_PASSWORD')(mapPayloadIntoPassword),
  forType('INPUT_REF')(propCursor('inputs')(mergePayload())),
  forType('PROPS')(
    compose.into(0)(
      mergePayload(select(SELECTED_PROPS)),
      into('attrs')(mapPayload(exclude(SELECTED_PROPS)))
    )
  )
)
