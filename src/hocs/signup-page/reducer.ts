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
  isInvalidEmail,
  forType,
  mapPayload,
  mergePayload,
  not,
  omit,
  pick,
  withEventGuards
} from 'utils'

export interface SignupPageHocProps {
  email?: string
  onAuthorize?: () => void
  onEmailChange?: (email?: string) => void
  onError?: (error?: any) => void
  onSignedUp?: () => void
  onSignin?: () => void
}

export type SignupPageError =
  | 'email'
  | 'password'
  | 'confirm'
  | 'submit'
  | 'offline'

export enum SignupFsm {
  Editing = 'EDITING',
  InvalidEmail = 'INVALID_EMAIL',
  InvalidPassword = 'INVALID_PASSWORD',
  InvalidConfirm = 'INVALID_CONFIRM',
  Conflict = 'CONFLICT',
  Offline = 'OFFLINE',
  Consents = 'CONSENTS',
  Submittable = 'SUBMITTABLE',
  SigningUp = 'SIGNING_UP'
}

const MIN_PASSWORD_LENGTH = 4
const mapPayloadIntoEmail = into('email')(mapPayload())
const mapPayloadIntoPassword = into('password')(mapPayload())
const clearPassword = propCursor('password')(always(''))
const mapPayloadIntoConfirm = into('confirm')(mapPayload())
const clearConfirm = propCursor('confirm')(always(''))
const toggleNews = propCursor('news')(not())

const automata: AutomataSpec<SignupFsm> = {
  [SignupFsm.Editing]: {
    INVALID_EMAIL: SignupFsm.InvalidEmail,
    INVALID_PASSWORD: [SignupFsm.InvalidPassword, clearPassword],
    INVALID_CONFIRM: [SignupFsm.InvalidConfirm, clearConfirm],
    VALID_CONFIRM: SignupFsm.Consents
  },
  [SignupFsm.InvalidEmail]: {
    SUBMIT: SignupFsm.Editing
  },
  [SignupFsm.InvalidPassword]: {
    SUBMIT: SignupFsm.Editing
  },
  [SignupFsm.InvalidConfirm]: {
    SUBMIT: SignupFsm.Editing
  },
  [SignupFsm.Conflict]: {
    SUBMIT: SignupFsm.Editing
  },
  [SignupFsm.Offline]: {
    SUBMIT: SignupFsm.Editing
  },
  [SignupFsm.Consents]: {
    TOGGLE_NEWS: toggleNews,
    TOGGLE_TERMS: SignupFsm.Submittable,
    CANCEL: [SignupFsm.Editing, clearConfirm]
  },
  [SignupFsm.Submittable]: {
    TOGGLE_NEWS: toggleNews,
    TOGGLE_TERMS: SignupFsm.Consents,
    CANCEL: [SignupFsm.Editing, clearConfirm],
    SUBMIT: SignupFsm.SigningUp
  },
  [SignupFsm.SigningUp]: {
    CONFLICT: [SignupFsm.Conflict, clearPassword, clearConfirm],
    GATEWAY_TIMEOUT: [SignupFsm.Offline, clearPassword, clearConfirm],
    ERROR: [SignupFsm.Editing, clearPassword, clearConfirm],
    SIGNED_UP: [SignupFsm.Editing, clearPassword, clearConfirm]
  }
}

const SELECTED_PROPS: (keyof SignupPageHocProps)[] = [
  'onAuthorize',
  'onEmailChange',
  'onError',
  'onSignedUp',
  'onSignin'
]

const reducer = compose.into(0)(
  createAutomataReducer(automata, SignupFsm.Editing),
  forType('INVALID_CONFIRM')(clearConfirm),
  forType('INVALID_PASSWORD')(clearPassword),
  forType('CHANGE_CONFIRM_INPUT')(mapPayloadIntoConfirm),
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
const invalidConfirm = createActionFactory('INVALID_CONFIRM')
const validConfirm = createActionFactory('VALID_CONFIRM')

const isEmailChange = (previous = '', email) => email !== previous
const isInvalidPassword = password =>
  !password || password.length < MIN_PASSWORD_LENGTH
const isInvalidConfirm = (password, confirm) =>
  !password || confirm !== password
const validateEmail = email =>
  (isInvalidEmail(email) ? invalidEmail : validEmail)()
const validatePassword = password =>
  (isInvalidPassword(password) ? invalidPassword : validPassword)()
const validateConfirm = (password, confirm) =>
  (isInvalidConfirm(password, confirm) ? invalidConfirm : validConfirm)()

export default withEventGuards({
  PROPS: ({ email }, state: any) =>
    isEmailChange(state && state.email, email) && changeEmailProp(email),
  SUBMIT: (_, { email }) => validateEmail(email),
  VALID_EMAIL: (_, { password }) => validatePassword(password),
  VALID_PASSWORD: (_, { password, confirm }) =>
    validateConfirm(password, confirm)
})(reducer)
