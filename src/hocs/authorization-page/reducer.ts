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

import { isPureModhex } from 'zenypass-modhex'
import createAutomataReducer, { AutomataSpec } from 'automata-reducer'
import { createActionFactory } from 'basic-fsa-factories'
import { into, propCursor } from 'basic-cursors'
import compose from 'basic-compose'
import {
  always,
  isInvalidEmail,
  forType,
  mapEvents,
  mapPayload,
  mergePayload,
  omit,
  pick,
  mapEventOn
} from 'utils'

const TOKEN_LENGTH = 12

export interface AuthorizationPageHocProps {
  email?: string
  onSignedUp?: () => void
  onSignin?: () => void
  onSignup?: () => void
  onEmailChange?: (email?: string) => void
  onError?: (error?: any) => void
}

export enum ValidityFsm {
  Invalid = 'INVALID',
  InvalidEmail = 'INVALID_EMAIL',
  InvalidPassword = 'INVALID_PASSWORD',
  InvalidToken = 'INVALID_TOKEN',
  Submittable = 'SUBMITTABLE'
}

export enum AuthorizationFsm {
  Idle = 'IDLE',
  Pending = 'PENDING',
  Error = 'ERROR'
}

const isInvalidPassword = ({ password }) => !password
const isInvalidToken = ({ token }) =>
  !token || token.length !== TOKEN_LENGTH || !isPureModhex(token)
const isEmailChange = (state, { payload }) =>
  (payload && payload.email) !== (state && state.email)
const mapPayloadIntoPassword = into('password')(mapPayload())
const clearPassword = propCursor('password')(always(''))
const mapPayloadIntoToken = into('token')(mapPayload())
const clearToken = propCursor('token')(always(''))

const validityFsm: AutomataSpec<ValidityFsm> = {
  [ValidityFsm.Invalid]: {
    VALID_EMAIL: ValidityFsm.InvalidPassword,
    VALID_PASSWORD: ValidityFsm.InvalidEmail
  },
  [ValidityFsm.InvalidEmail]: {
    INVALID_PASSWORD: ValidityFsm.Invalid,
    VALID_EMAIL: ValidityFsm.InvalidToken
  },
  [ValidityFsm.InvalidPassword]: {
    INVALID_EMAIL: [ValidityFsm.Invalid, clearToken],
    VALID_EMAIL: clearPassword,
    clearConfirm: clearToken,
    VALID_PASSWORD: ValidityFsm.InvalidToken
  },
  [ValidityFsm.InvalidToken]: {
    INVALID_EMAIL: [ValidityFsm.InvalidEmail, clearToken],
    INVALID_PASSWORD: ValidityFsm.InvalidPassword,
    VALID_EMAIL: clearToken,
    VALID_TOKEN: ValidityFsm.Submittable
  },
  [ValidityFsm.Submittable]: {
    INVALID_EMAIL: [ValidityFsm.InvalidEmail, clearToken],
    INVALID_PASSWORD: ValidityFsm.InvalidPassword,
    INVALID_TOKEN: ValidityFsm.InvalidToken,
    VALID_EMAIL: [ValidityFsm.InvalidToken, clearToken],
    VALID_PASSWORD: ValidityFsm.InvalidToken,
    ERROR: [ValidityFsm.InvalidToken, clearToken],
    SIGNED_UP: [ValidityFsm.InvalidPassword, clearPassword, clearToken]
  }
}

const authorizationFsm: AutomataSpec<AuthorizationFsm> = {
  [AuthorizationFsm.Idle]: {
    ERROR: AuthorizationFsm.Error,
    SIGNING_UP: AuthorizationFsm.Pending
  },
  [AuthorizationFsm.Pending]: {
    ERROR: AuthorizationFsm.Error,
    SIGNED_UP: AuthorizationFsm.Idle
  },
  [AuthorizationFsm.Error]: {
    SIGNING_UP: AuthorizationFsm.Pending
  }
}

const SELECTED_PROPS: (keyof AuthorizationPageHocProps)[] = [
  'email',
  'onSignedUp',
  'onSignin',
  'onSignup',
  'onEmailChange',
  'onError'
]

export const reducer = compose.into(0)(
  compose(
    createAutomataReducer(validityFsm, ValidityFsm.Invalid, { key: 'valid' }),
    mapEvents({
      CHANGE_TOKEN: [isInvalidToken, 'INVALID_TOKEN', 'VALID_TOKEN'],
      CHANGE_PASSWORD: [
        isInvalidPassword,
        'INVALID_PASSWORD',
        'VALID_PASSWORD'
      ],
      PROPS: [
        ({ email }) => isInvalidEmail(email),
        'INVALID_EMAIL',
        'VALID_EMAIL'
      ]
    })
  ),
  createAutomataReducer(authorizationFsm, AuthorizationFsm.Idle, {
    key: 'authorization'
  }),
  forType('CHANGE_PASSWORD')(
    compose.into(0)(clearToken, mapPayloadIntoPassword)
  ),
  forType('CHANGE_TOKEN')(mapPayloadIntoToken),
  forType('INPUT_REF')(propCursor('inputs')(mergePayload())),
  forType('PROPS')(
    compose.into(0)(
      mergePayload(pick(SELECTED_PROPS)),
      into('attrs')(mapPayload(omit(SELECTED_PROPS))),
      compose(
        forType('CHANGE_EMAIL')(clearToken),
        mapEventOn(isEmailChange)('CHANGE_EMAIL')
      )
    )
  )
)
