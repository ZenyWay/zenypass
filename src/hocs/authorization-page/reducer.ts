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
  Pristine = 'PRISTINE',
  PristineEmail = 'PRISTINE_EMAIL', // valid password
  PristinePassword = 'PRISTINE_PASSWORD', // valid email
  PristineEmailInvalidPassword = 'PRISTINE_EMAIL_INVALID_PASSWORD',
  PristinePasswordInvalidEmail = 'PRISTINE_PASSWORD_INVALID_EMAIL',
  Invalid = 'INVALID',
  InvalidEmail = 'INVALID_EMAIL', // valid password
  InvalidPassword = 'INVALID_PASSWORD', // valid email
  PendingToken = 'PENDING_TOKEN',
  InvalidToken = 'INVALID_TOKEN',
  Submittable = 'SUBMITTABLE',
  SigningIn = 'SIGNIN_IN',
  Authorizing = 'AUTHORIZING'
}

const isInvalidToken = token =>
  !token || token.length !== TOKEN_LENGTH || !isPureModhex(token)
const isEmailChange = (previous = '', email) => email !== previous

const stringifyErrorPayloadIntoError = into('error')(mapPayload(stringifyError))
const mapIntoError = (error?: AuthorizationPageError) =>
  into('error')(mapPayload(always(error)))
const clearError = mapIntoError(void 0)
const mapPayloadIntoEmail = into('email')(mapPayload())
const mapPayloadIntoPassword = into('password')(mapPayload())
const clearPassword = propCursor('password')(always(''))
const mapPayloadIntoToken = into('token')(mapPayload())
const clearToken = propCursor('token')(always(''))

const automata: AutomataSpec<AuthorizationFsm> = {
  [AuthorizationFsm.Pristine]: {
    SUBMIT: AuthorizationFsm.PristinePasswordInvalidEmail,
    INVALID_EMAIL: AuthorizationFsm.PristinePasswordInvalidEmail,
    INVALID_PASSWORD: [
      AuthorizationFsm.PristineEmailInvalidPassword,
      clearPassword
    ],
    VALID_EMAIL: AuthorizationFsm.PristinePassword,
    VALID_PASSWORD: AuthorizationFsm.PristineEmail
  },
  [AuthorizationFsm.PristinePasswordInvalidEmail]: {
    INVALID_PASSWORD: AuthorizationFsm.Invalid,
    VALID_EMAIL: AuthorizationFsm.PristinePassword,
    VALID_PASSWORD: AuthorizationFsm.InvalidEmail
  },
  [AuthorizationFsm.PristineEmailInvalidPassword]: {
    INVALID_EMAIL: AuthorizationFsm.Invalid,
    INVALID_PASSWORD: clearPassword,
    VALID_EMAIL: AuthorizationFsm.InvalidPassword,
    VALID_PASSWORD: AuthorizationFsm.PendingToken
  },
  [AuthorizationFsm.PristineEmail]: {
    SUBMIT: AuthorizationFsm.InvalidEmail,
    INVALID_EMAIL: AuthorizationFsm.InvalidEmail,
    INVALID_PASSWORD: [
      AuthorizationFsm.PristineEmailInvalidPassword,
      clearPassword
    ],
    VALID_EMAIL: AuthorizationFsm.PendingToken
  },
  [AuthorizationFsm.PristinePassword]: {
    CHANGE_EMAIL_PROP: clearError,
    CHANGE_PASSWORD_INPUT: clearError,
    SUBMIT: AuthorizationFsm.InvalidPassword,
    INVALID_EMAIL: AuthorizationFsm.PristinePasswordInvalidEmail,
    INVALID_PASSWORD: [AuthorizationFsm.InvalidPassword, clearPassword],
    VALID_PASSWORD: AuthorizationFsm.PendingToken
  },
  [AuthorizationFsm.Invalid]: {
    VALID_EMAIL: [AuthorizationFsm.InvalidPassword, clearPassword],
    VALID_PASSWORD: AuthorizationFsm.InvalidEmail
  },
  [AuthorizationFsm.InvalidEmail]: {
    INVALID_PASSWORD: AuthorizationFsm.Invalid,
    VALID_EMAIL: AuthorizationFsm.PendingToken
  },
  [AuthorizationFsm.InvalidPassword]: {
    INVALID_EMAIL: AuthorizationFsm.Invalid,
    INVALID_PASSWORD: clearPassword,
    VALID_PASSWORD: AuthorizationFsm.PendingToken
  },
  [AuthorizationFsm.PendingToken]: {
    SUBMIT: AuthorizationFsm.InvalidToken,
    INVALID_EMAIL: AuthorizationFsm.InvalidEmail,
    INVALID_PASSWORD: [AuthorizationFsm.InvalidPassword, clearPassword],
    INVALID_TOKEN: AuthorizationFsm.InvalidToken,
    VALID_TOKEN: AuthorizationFsm.Submittable
  },
  [AuthorizationFsm.InvalidToken]: {
    INVALID_EMAIL: AuthorizationFsm.InvalidEmail,
    INVALID_PASSWORD: [AuthorizationFsm.InvalidPassword, clearPassword],
    VALID_TOKEN: AuthorizationFsm.Submittable
  },
  [AuthorizationFsm.Submittable]: {
    INVALID_EMAIL: AuthorizationFsm.InvalidEmail,
    INVALID_PASSWORD: [AuthorizationFsm.InvalidPassword, clearPassword],
    INVALID_TOKEN: AuthorizationFsm.InvalidToken,
    VALID_EMAIL: AuthorizationFsm.InvalidToken,
    VALID_PASSWORD: AuthorizationFsm.InvalidToken,
    SUBMIT: AuthorizationFsm.SigningIn
  },
  [AuthorizationFsm.SigningIn]: {
    NOT_FOUND: AuthorizationFsm.Authorizing,
    UNAUTHORIZED: AuthorizationFsm.Authorizing, // TODO when service signin fixed
    ERROR: [
      AuthorizationFsm.PristinePassword,
      clearPassword,
      clearToken,
      stringifyErrorPayloadIntoError
    ],
    SIGNED_IN: [AuthorizationFsm.PristinePassword, clearPassword, clearToken]
  },
  [AuthorizationFsm.Authorizing]: {
    GATEWAY_TIMEOUT: [
      AuthorizationFsm.PristinePassword,
      clearPassword,
      clearToken,
      mapIntoError('offline')
    ],
    FORBIDDEN: [
      AuthorizationFsm.PristinePassword,
      clearPassword,
      clearToken,
      mapIntoError('submit')
    ],
    ERROR: [
      AuthorizationFsm.PristinePassword,
      clearPassword,
      clearToken,
      stringifyErrorPayloadIntoError
    ],
    AUTHORIZED: [AuthorizationFsm.PristinePassword, clearPassword, clearToken]
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
  createAutomataReducer(automata, AuthorizationFsm.Pristine),
  forType('CHANGE_TOKEN_INPUT')(mapPayloadIntoToken),
  forType('CHANGE_PASSWORD_INPUT')(
    compose.into(0)(clearToken, mapPayloadIntoPassword)
  ),
  forType('CHANGE_EMAIL_PROP')(
    compose.into(0)(clearToken, mapPayloadIntoEmail)
  ),
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

export default withEventGuards({
  PROPS: ({ email }, state: any) =>
    isEmailChange(state && state.email, email) && changeEmailProp(email),
  CHANGE_EMAIL_PROP: email =>
    (isInvalidEmail(email) ? invalidEmail : validEmail)(),
  CHANGE_PASSWORD_INPUT: password =>
    (!password ? invalidPassword : validPassword)(),
  CHANGE_TOKEN_INPUT: token =>
    (isInvalidToken(token) ? invalidToken : validToken)()
})(reducer)
