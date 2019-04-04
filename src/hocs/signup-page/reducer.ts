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
  stringifyError,
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

export type SignupPageError = 'email' | 'password' | 'confirm' | 'submit'

export enum SignupFsm {
  Pristine = 'PRISTINE',
  PristineEmail = 'PRISTINE_EMAIL', // valid password
  PristinePassword = 'PRISTINE_PASSWORD', // valid email
  PristineEmailInvalidPassword = 'PRISTINE_EMAIL_INVALID_PASSWORD',
  PristinePasswordInvalidEmail = 'PRISTINE_PASSWORD_INVALID_EMAIL',
  Invalid = 'INVALID',
  InvalidEmail = 'INVALID_EMAIL', // valid password
  InvalidPassword = 'INVALID_PASSWORD', // valid email
  PendingConfirm = 'PENDING_CONFIRM',
  InvalidConfirm = 'INVALID_CONFIRM',
  Confirmed = 'CONFIRMED',
  Consents = 'CONSENTS',
  Submittable = 'SUBMITTABLE',
  SigningUp = 'SIGNING_UP'
}

const MIN_PASSWORD_LENGTH = 4
const isInvalidPassword = password =>
  !password || password.length < MIN_PASSWORD_LENGTH
const isInvalidConfirm = (password, confirm) =>
  !password || confirm !== password
const isEmailChange = (previous = '', email) => email !== previous

const stringifyErrorPayloadIntoError = into('error')(mapPayload(stringifyError))
const mapIntoError = (error?: SignupPageError) =>
  into('error')(mapPayload(always(error)))
const clearError = mapIntoError(void 0)
const mapPayloadIntoEmail = into('email')(mapPayload())
const mapPayloadIntoPassword = into('password')(mapPayload())
const clearPassword = propCursor('password')(always(''))
const mapPayloadIntoConfirm = into('confirm')(mapPayload())
const clearConfirm = propCursor('confirm')(always(''))
const toggleNews = propCursor('news')(not())

const automata: AutomataSpec<SignupFsm> = {
  [SignupFsm.Pristine]: {
    SUBMIT: SignupFsm.PristinePasswordInvalidEmail,
    INVALID_EMAIL: SignupFsm.PristinePasswordInvalidEmail,
    INVALID_PASSWORD: [SignupFsm.PristineEmailInvalidPassword, clearPassword],
    VALID_EMAIL: SignupFsm.PristinePassword,
    VALID_PASSWORD: SignupFsm.PristineEmail
  },
  [SignupFsm.PristinePasswordInvalidEmail]: {
    INVALID_PASSWORD: SignupFsm.Invalid,
    VALID_EMAIL: SignupFsm.PristinePassword,
    VALID_PASSWORD: SignupFsm.InvalidEmail
  },
  [SignupFsm.PristineEmailInvalidPassword]: {
    INVALID_EMAIL: SignupFsm.Invalid,
    INVALID_PASSWORD: clearPassword,
    VALID_EMAIL: SignupFsm.InvalidPassword,
    VALID_PASSWORD: SignupFsm.PendingConfirm
  },
  [SignupFsm.PristineEmail]: {
    SUBMIT: SignupFsm.InvalidEmail,
    INVALID_EMAIL: SignupFsm.InvalidEmail,
    INVALID_PASSWORD: [SignupFsm.PristineEmailInvalidPassword, clearPassword],
    VALID_EMAIL: SignupFsm.PendingConfirm
  },
  [SignupFsm.PristinePassword]: {
    CHANGE_EMAIL_PROP: clearError,
    CHANGE_PASSWORD_INPUT: clearError,
    SUBMIT: SignupFsm.InvalidPassword,
    INVALID_EMAIL: SignupFsm.PristinePasswordInvalidEmail,
    INVALID_PASSWORD: [SignupFsm.InvalidPassword, clearPassword],
    VALID_PASSWORD: SignupFsm.PendingConfirm
  },
  [SignupFsm.Invalid]: {
    VALID_EMAIL: [SignupFsm.InvalidPassword, clearPassword],
    VALID_PASSWORD: SignupFsm.InvalidEmail
  },
  [SignupFsm.InvalidEmail]: {
    INVALID_PASSWORD: SignupFsm.Invalid,
    VALID_EMAIL: SignupFsm.PendingConfirm
  },
  [SignupFsm.InvalidPassword]: {
    INVALID_EMAIL: SignupFsm.Invalid,
    INVALID_PASSWORD: clearPassword,
    VALID_PASSWORD: SignupFsm.PendingConfirm
  },
  [SignupFsm.PendingConfirm]: {
    SUBMIT: SignupFsm.InvalidConfirm,
    INVALID_EMAIL: SignupFsm.InvalidEmail,
    INVALID_PASSWORD: [SignupFsm.InvalidPassword, clearPassword],
    INVALID_CONFIRM: SignupFsm.InvalidConfirm,
    VALID_CONFIRM: SignupFsm.Confirmed
  },
  [SignupFsm.InvalidConfirm]: {
    INVALID_EMAIL: SignupFsm.InvalidEmail,
    INVALID_PASSWORD: [SignupFsm.InvalidPassword, clearPassword],
    VALID_CONFIRM: SignupFsm.Confirmed
  },
  [SignupFsm.Confirmed]: {
    INVALID_EMAIL: SignupFsm.InvalidEmail,
    INVALID_PASSWORD: [SignupFsm.InvalidPassword, clearPassword],
    INVALID_CONFIRM: SignupFsm.InvalidConfirm,
    VALID_EMAIL: SignupFsm.InvalidConfirm,
    VALID_PASSWORD: SignupFsm.InvalidConfirm,
    SUBMIT: SignupFsm.Consents
  },
  [SignupFsm.Consents]: {
    TOGGLE_NEWS: toggleNews,
    TOGGLE_TERMS: SignupFsm.Submittable,
    CANCEL: [SignupFsm.PendingConfirm, clearConfirm]
  },
  [SignupFsm.Submittable]: {
    TOGGLE_NEWS: toggleNews,
    TOGGLE_TERMS: SignupFsm.Consents,
    CANCEL: [SignupFsm.PendingConfirm, clearConfirm],
    SUBMIT: SignupFsm.SigningUp
  },
  [SignupFsm.SigningUp]: {
    UNAUTHORIZED: [
      SignupFsm.PristinePassword,
      clearPassword,
      clearConfirm,
      mapIntoError('submit')
    ],
    ERROR: [
      SignupFsm.PristinePassword,
      clearPassword,
      clearConfirm,
      stringifyErrorPayloadIntoError
    ],
    SIGNED_UP: [SignupFsm.InvalidPassword, clearPassword, clearConfirm]
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
  createAutomataReducer(automata, SignupFsm.Pristine),
  forType('INVALID_CONFIRM')(clearConfirm),
  forType('CHANGE_CONFIRM_INPUT')(mapPayloadIntoConfirm),
  forType('CHANGE_PASSWORD_INPUT')(
    compose.into(0)(clearConfirm, mapPayloadIntoPassword)
  ),
  forType('CHANGE_EMAIL_PROP')(
    compose.into(0)(clearConfirm, mapPayloadIntoEmail)
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
const invalidConfirm = createActionFactory('INVALID_CONFIRM')
const validConfirm = createActionFactory('VALID_CONFIRM')

export default withEventGuards({
  PROPS: ({ email }, state: any) =>
    isEmailChange(state && state.email, email) && changeEmailProp(email),
  CHANGE_EMAIL_PROP: email =>
    (isInvalidEmail(email) ? invalidEmail : validEmail)(),
  CHANGE_PASSWORD_INPUT: password =>
    (isInvalidPassword(password) ? invalidPassword : validPassword)(),
  CHANGE_CONFIRM_INPUT: (confirm, state: any) =>
    (isInvalidConfirm(state && state.password, confirm)
      ? invalidConfirm
      : validConfirm)()
})(reducer)
