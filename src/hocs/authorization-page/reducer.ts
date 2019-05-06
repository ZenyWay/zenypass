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
  stringifyError,
  withEventGuards
} from 'utils'

const TOKEN_LENGTH = 12

export interface AuthorizationPageHocProps {
  email?: string
  onAuthorized?: () => void
  onSignedIn?: (session?: string) => void
  onSignin?: () => void
  onSignup?: () => void
  onEmailChange?: (email?: string) => void
  onError?: (error?: any) => void
}

export type AuthorizationPageError =
  | 'email'
  | 'password'
  | 'token'
  | 'submit'
  | 'offline'

export enum AuthorizationFsm {
  Editing = 'EDITING',
  InvalidEmail = 'INVALID_EMAIL',
  InvalidPassword = 'INVALID_PASSWORD',
  InvalidToken = 'INVALID_TOKEN',
  Offline = 'OFFLINE',
  Forbidden = 'FORBIDDEN',
  SigningIn = 'SIGNIN_IN',
  Authorizing = 'AUTHORIZING'
}

const mapPayloadIntoEmail = into('email')(mapPayload())
const mapPayloadIntoPassword = into('password')(mapPayload())
const clearPassword = propCursor('password')(always(''))
const mapPayloadIntoToken = into('token')(mapPayload())
const clearToken = propCursor('token')(always(''))

const automata: AutomataSpec<AuthorizationFsm> = {
  [AuthorizationFsm.Editing]: {
    INVALID_EMAIL: AuthorizationFsm.InvalidEmail,
    INVALID_PASSWORD: [AuthorizationFsm.InvalidPassword, clearPassword],
    INVALID_TOKEN: [AuthorizationFsm.InvalidToken, clearToken],
    VALID_TOKEN: AuthorizationFsm.SigningIn
  },
  [AuthorizationFsm.InvalidEmail]: {
    SUBMIT: AuthorizationFsm.Editing
  },
  [AuthorizationFsm.InvalidPassword]: {
    SUBMIT: AuthorizationFsm.Editing
  },
  [AuthorizationFsm.InvalidToken]: {
    SUBMIT: AuthorizationFsm.Editing
  },
  [AuthorizationFsm.Offline]: {
    SUBMIT: AuthorizationFsm.Editing
  },
  [AuthorizationFsm.Forbidden]: {
    SUBMIT: AuthorizationFsm.Editing
  },
  [AuthorizationFsm.SigningIn]: {
    NOT_FOUND: AuthorizationFsm.Authorizing,
    UNAUTHORIZED: AuthorizationFsm.Authorizing, // TODO when service signin fixed
    ERROR: [AuthorizationFsm.Editing, clearPassword, clearToken],
    SIGNED_IN: [AuthorizationFsm.Editing, clearPassword, clearToken]
  },
  [AuthorizationFsm.Authorizing]: {
    GATEWAY_TIMEOUT: [AuthorizationFsm.Offline, clearPassword, clearToken],
    FORBIDDEN: [AuthorizationFsm.Forbidden, clearPassword, clearToken],
    ERROR: [AuthorizationFsm.Editing, clearPassword, clearToken],
    AUTHORIZED: [AuthorizationFsm.Editing, clearPassword, clearToken]
  }
}

const SELECTED_PROPS: (keyof AuthorizationPageHocProps)[] = [
  'onAuthorized',
  'onSignedIn',
  'onSignin',
  'onSignup',
  'onEmailChange',
  'onError'
]

const reducer = compose.into(0)(
  createAutomataReducer(automata, AuthorizationFsm.Editing),
  forType('INVALID_PASSWORD')(clearPassword),
  forType('CHANGE_TOKEN_INPUT')(mapPayloadIntoToken),
  forType('CHANGE_PASSWORD_INPUT')(mapPayloadIntoPassword),
  forType('CHANGE_EMAIL_PROP')(mapPayloadIntoEmail),
  forType('CHANGE_EMAIL_INPUT')(mapPayloadIntoEmail),
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
const invalidToken = createActionFactory('INVALID_TOKEN')
const validToken = createActionFactory('VALID_TOKEN')

const isEmailChange = (previous = '', email) => email !== previous
const isInvalidToken = token =>
  !token || token.length !== TOKEN_LENGTH || !isPureModhex(token)
const validateEmail = email =>
  (isInvalidEmail(email) ? invalidEmail : validEmail)()
const validatePassword = password =>
  (!password ? invalidPassword : validPassword)()
const validateToken = token =>
  (isInvalidToken(token) ? invalidToken : validToken)()

export default withEventGuards({
  PROPS: ({ email }, state: any) =>
    isEmailChange(state && state.email, email) && changeEmailProp(email),
  SUBMIT: (_, { email }) => validateEmail(email),
  VALID_EMAIL: (_, { password }) => validatePassword(password),
  VALID_PASSWORD: (_, { token }) => validateToken(token)
})(reducer)
