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
  exclude,
  forType,
  mapPayload,
  mergePayload,
  select
} from 'utils'

export interface SignupPageHocProps {
  email?: string
  onTogglePage?: () => void
  onEmailChange?: (email?: string) => void
  onError?: (error?: any) => void
}

export enum ValidityFsm {
  Invalid = 'INVALID',
  InvalidEmail = 'INVALID_EMAIL',
  InvalidPassword = 'INVALID_PASSWORD',
  Valid = 'VALID',
  Confirmed = 'CONFIRMED'
}

export enum SignupFsm {
  Idle = 'IDLE',
  Consents = 'CONSENTS',
  Consented = 'CONSENTED',
  Pending = 'PENDING',
  Error = 'ERROR'
}

const mapPayloadIntoPassword = into('password')(mapPayload())
const clearPassword = propCursor('password')(always(''))
const mapPayloadIntoConfirm = into('confirm')(mapPayload())
const clearConfirm = propCursor('confirm')(always(''))

const SIGNUP_FSM_VALID_OR_ERROR = {
  INVALID_EMAIL_PROPS: [ValidityFsm.InvalidEmail, clearConfirm],
  INVALID_PASSWORD: [ValidityFsm.InvalidPassword, clearConfirm],
  VALID_EMAIL_PROPS: clearConfirm,
  VALID_PASSWORD: clearConfirm,
  VALID_CONFIRM: ValidityFsm.Confirmed
}

const validityFsm: AutomataSpec<ValidityFsm> = {
  [ValidityFsm.Invalid]: {
    VALID_EMAIL_PROPS: ValidityFsm.InvalidPassword,
    VALID_PASSWORD: ValidityFsm.InvalidEmail
  },
  [ValidityFsm.InvalidEmail]: {
    INVALID_PASSWORD: ValidityFsm.Invalid,
    VALID_EMAIL_PROPS: ValidityFsm.Valid
  },
  [ValidityFsm.InvalidPassword]: {
    INVALID_EMAIL_PROPS: ValidityFsm.Invalid,
    VALID_PASSWORD: ValidityFsm.Valid
  },
  [ValidityFsm.Valid]: SIGNUP_FSM_VALID_OR_ERROR,
  [ValidityFsm.Confirmed]: {
    INVALID_EMAIL_PROPS: [ValidityFsm.InvalidEmail, clearConfirm],
    INVALID_PASSWORD: [ValidityFsm.InvalidPassword, clearConfirm],
    INVALID_CONFIRM: ValidityFsm.Valid,
    VALID_EMAIL_PROPS: [ValidityFsm.Valid, clearConfirm],
    VALID_PASSWORD: [ValidityFsm.Valid, clearConfirm],
    ERROR: [ValidityFsm.Valid, clearConfirm],
    SIGNED_UP: [ValidityFsm.InvalidPassword, clearPassword, clearConfirm]
  }
}

const signupFsm: AutomataSpec<SignupFsm> = {
  [SignupFsm.Idle]: {
    SUBMIT: SignupFsm.Consents
  },
  [SignupFsm.Consents]: {
    TOGGLE_CONSENT: SignupFsm.Consented
  },
  [SignupFsm.Consented]: {
    TOGGLE_CONSENT: SignupFsm.Consents,
    SUBMIT: SignupFsm.Pending
  },
  [SignupFsm.Pending]: {
    ERROR: [SignupFsm.Error, clearConfirm],
    SIGNED_UP: SignupFsm.Idle
  },
  [SignupFsm.Error]: {
    SUBMIT: SignupFsm.Consents
  }
}

const SELECTED_PROPS: (keyof SignupPageHocProps)[] = [
  'email',
  'onTogglePage',
  'onEmailChange',
  'onError'
]

const mergeSelectedPropsAndMapRestIntoAttrs = compose.into(0)(
  mergePayload(select(SELECTED_PROPS)),
  into('attrs')(mapPayload(exclude(SELECTED_PROPS)))
)

export const reducer = compose.into(0)(
  createAutomataReducer(validityFsm, ValidityFsm.Invalid, { key: 'valid' }),
  createAutomataReducer(signupFsm, SignupFsm.Idle, { key: 'signup' }),
  forType('INVALID_PASSWORD')(mapPayloadIntoPassword),
  forType('VALID_PASSWORD')(mapPayloadIntoPassword),
  forType('INPUT_REF')(propCursor('inputs')(mergePayload())),
  forType('INVALID_EMAIL_PROPS')(mergeSelectedPropsAndMapRestIntoAttrs),
  forType('VALID_EMAIL_PROPS')(mergeSelectedPropsAndMapRestIntoAttrs)
)
