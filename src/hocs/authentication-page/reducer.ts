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
import { always, forType, mapPayload, mergePayload, StandardAction } from 'utils'

export type AutomataState =
  | 'email' // only email enabled
  | 'password' // all enabled except confirm (signup only)
  | 'confirm' // all enabled
  | 'valid' // all enabled
  | 'consents' // all disabled
  | 'pending' // all disabled

const DEFAULT_CONSENTS = { terms: false, news: false }

const resetConsents = mergePayload(always(DEFAULT_CONSENTS))
const mapPayloadIntoPassword = into('password')(mapPayload())
const mapPayloadIntoConfirm = into('confirm')(mapPayload())
const clearPassword = propCursor('password')(always(''))
const clearConfirm = propCursor('confirm')(always(''))
const clearPasswords = mergePayload(always({ password: '', confirm: '' }))
const setEmailError = setError('email')
const setPasswordError = setError('password')
const setConfirmError = setError('confirm')
const setUnauthorizedError = setError('unauthorized')
const clearError = setError()

const automata: AutomataSpec<AutomataState> = {
  email: {
    SIGNIN: setEmailError,
    INVALID_EMAIL: setEmailError,
    VALID_EMAIL: ['password', clearError]
  },
  password: {
    TOGGLE_SIGNUP: [clearPassword, clearError],
    CHANGE_PASSWORD: mapPayloadIntoPassword,
    SIGNIN: setPasswordError,
    INVALID_EMAIL: ['email', clearPassword, setEmailError],
    INVALID_PASSWORD: setPasswordError,
    VALID_EMAIL: [clearPassword, clearError],
    VALID_SIGNUP_PASSWORD: ['confirm', clearError],
    VALID_SIGNIN_PASSWORD: ['valid', clearError]
  },
  confirm: { // password confirm or authorization token
    TOGGLE_SIGNUP: ['password', clearPassword, clearError],
    CHANGE_PASSWORD: mapPayloadIntoPassword,
    CHANGE_CONFIRM: mapPayloadIntoConfirm,
    SIGNUP: setConfirmError,
    INVALID_EMAIL: ['email', clearPasswords, setEmailError],
    INVALID_PASSWORD: ['password', clearConfirm, setPasswordError],
    INVALID_CONFIRM: [clearConfirm, setConfirmError],
    VALID_EMAIL: ['password', clearPasswords, clearError],
    VALID_SIGNUP_PASSWORD: [clearConfirm, clearError],
    VALID_CONFIRM: ['valid', clearError]
  },
  valid: {
    TOGGLE_SIGNUP: ['password', clearPasswords],
    CHANGE_PASSWORD: mapPayloadIntoPassword,
    CHANGE_CONFIRM: mapPayloadIntoConfirm,
    INVALID_EMAIL: ['email', clearPasswords, setEmailError],
    INVALID_PASSWORD: ['password', clearConfirm, setPasswordError],
    INVALID_CONFIRM: [clearConfirm, setConfirmError],
    VALID_EMAIL: ['password', clearPasswords],
    PENDING: 'pending',
    SIGNUP: ['consents', resetConsents]
  },
  consents: {
    CANCEL_CONSENTS: ['confirm', clearConfirm],
    TOGGLE_CONSENT: toggleConsent,
    PENDING: 'pending'
  },
  pending: { // service call
    ERROR: ['email', clearPasswords, resetConsents],
    UNAUTHORIZED: ['password', clearPasswords, setUnauthorizedError],
    AUTHENTICATED: ['password', clearPasswords, into('created')(always())],
    TOGGLE_SIGNUP: [
      'password',
      clearPasswords,
      resetConsents,
      into('created')(always(true))
    ]
  }
}

function toggleConsent (consents, { payload }: StandardAction<string>) {
  return {
    ...consents,
    [payload]: !(consents && consents[payload])
  }
}

function setError (error?: 'email' | 'password' | 'confirm' | 'unauthorized') {
  return into('error')(always(error))
}

export const reducer = compose.into(0)(
  createAutomataReducer(automata, 'email'),
  forType('INPUT_REF')(propCursor('inputs')(mergePayload())),
  forType('PROPS')(into('props')(mapPayload()))
)
