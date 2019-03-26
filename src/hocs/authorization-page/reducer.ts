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
  mapPayload,
  mergePayload,
  omit,
  pick,
  withEventGuards
} from 'utils'

const TOKEN_LENGTH = 12

export interface AuthorizationPageHocProps {
  email?: string
  onAuthorized?: () => void
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

const isInvalidToken = token =>
  !token || token.length !== TOKEN_LENGTH || !isPureModhex(token)
const isEmailChange = (email, previous) =>
  email !== (previous && previous.email)

const mapPayloadIntoEmail = into('email')(mapPayload())
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
    AUTHORIZING: AuthorizationFsm.Pending
  },
  [AuthorizationFsm.Pending]: {
    ERROR: AuthorizationFsm.Error,
    AUTHORIZED: AuthorizationFsm.Idle
  },
  [AuthorizationFsm.Error]: {
    AUTHORIZING: AuthorizationFsm.Pending
  }
}

const SELECTED_PROPS: (keyof AuthorizationPageHocProps)[] = [
  'onAuthorized',
  'onSignin',
  'onSignup',
  'onEmailChange',
  'onError'
]

const reducer = compose.into(0)(
  createAutomataReducer(validityFsm, ValidityFsm.Invalid, { key: 'valid' }),
  createAutomataReducer(authorizationFsm, AuthorizationFsm.Idle, {
    key: 'authorization'
  }),
  forType('CHANGE_TOKEN')(mapPayloadIntoToken),
  forType('CHANGE_PASSWORD')(
    compose.into(0)(clearToken, mapPayloadIntoPassword)
  ),
  forType('CHANGE_EMAIL')(compose.into(0)(clearToken, mapPayloadIntoEmail)),
  forType('INPUT_REF')(propCursor('inputs')(mergePayload())),
  forType('PROPS')(
    compose.into(0)(
      mergePayload(pick(SELECTED_PROPS)),
      into('attrs')(mapPayload(omit(SELECTED_PROPS)))
    )
  )
)

const changeEmail = createActionFactory('CHANGE_EMAIL')
const invalidEmail = createActionFactory('INVALID_EMAIL')
const validEmail = createActionFactory('VALID_EMAIL')
const invalidPassword = createActionFactory('INVALID_PASSWORD')
const validPassword = createActionFactory('VALID_PASSWORD')
const invalidToken = createActionFactory('INVALID_TOKEN')
const validToken = createActionFactory('VALID_TOKEN')

export default withEventGuards({
  PROPS: ({ email }, state: any) =>
    isEmailChange(email, state) && changeEmail(email),
  CHANGE_EMAIL: email => (isInvalidEmail(email) ? invalidEmail : validEmail)(),
  CHANGE_PASSWORD: password => (!password ? invalidPassword : validPassword)(),
  CHANGE_TOKEN: token => (isInvalidToken(token) ? invalidToken : validToken)()
})(reducer)
