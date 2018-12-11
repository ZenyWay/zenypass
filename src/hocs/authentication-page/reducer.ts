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
import { always, forType, mapPayload, mergePayload } from 'utils'

export type AutomataState =
  | 'email' | 'error_email' // only email enabled
  | 'password' | 'error_password' | 'unauthorized' // all enabled except confirm (signup only)
  | 'confirm' | 'error_confirm' // all enabled
  | 'valid' // all enabled
  | 'consents' // all disabled
  | 'pending' // all disabled

const DEFAULT_CONSENTS = { terms: false, news: false }

const resetConsents = propCursor('changes')(mergePayload(always(DEFAULT_CONSENTS)))
const clearPassword = propCursor('changes')(propCursor('password')(always()))
const clearConfirm = propCursor('changes')(propCursor('confirm')(always()))
const clearPasswords = compose.into(0)(clearPassword, clearConfirm)

const automata: AutomataSpec<AutomataState> = {
  email: {
    SIGNIN: 'error_email',
    INVALID_EMAIL: 'error_email',
    VALID_EMAIL: 'password'
  },
  error_email: {
    VALID_EMAIL: 'password'
  },
  password: {
    SIGNIN: 'error_password',
    INVALID_EMAIL: 'error_email',
    INVALID_PASSWORD: 'error_password',
    VALID_SIGNUP_PASSWORD: 'confirm',
    VALID_SIGNIN_PASSWORD: 'valid'
  },
  error_password: {
    TOGGLE_SIGNUP: ['password', clearPassword],
    INVALID_EMAIL: ['error_email', clearPassword],
    VALID_EMAIL: ['password', clearPassword],
    VALID_SIGNUP_PASSWORD: 'confirm',
    VALID_SIGNIN_PASSWORD: 'valid'
  },
  unauthorized: {
    TOGGLE_SIGNUP: 'password',
    SIGNIN: 'error_password',
    INVALID_EMAIL: 'error_email',
    VALID_EMAIL: 'password',
    VALID_SIGNIN_PASSWORD: 'valid'
  },
  confirm: {
    TOGGLE_SIGNUP: ['password', clearPassword],
    SIGNUP: 'error_confirm',
    INVALID_EMAIL: ['error_email', clearPassword],
    INVALID_PASSWORD: 'error_password',
    INVALID_CONFIRM: 'error_confirm',
    VALID_EMAIL: ['password', clearPassword],
    VALID_SIGNUP_PASSWORD: ['confirm', clearConfirm],
    VALID_CONFIRM: 'valid'
  },
  error_confirm: {
    TOGGLE_SIGNUP: ['password', clearPasswords],
    INVALID_EMAIL: ['error_email', clearPasswords],
    INVALID_PASSWORD: ['error_password', clearConfirm],
    VALID_EMAIL: ['password', clearPasswords],
    VALID_SIGNUP_PASSWORD: ['confirm', clearConfirm],
    VALID_CONFIRM: 'valid'
  },
  valid: {
    TOGGLE_SIGNUP: ['password', clearPasswords],
    INVALID_EMAIL: ['error_email', clearPasswords],
    INVALID_PASSWORD: ['error_password', clearConfirm],
    INVALID_CONFIRM: 'error_confirm',
    VALID_EMAIL: ['password', clearPasswords],
    PENDING: 'pending',
    SIGNUP: ['consents', resetConsents]
  },
  consents: {
    CANCEL_CONSENTS: ['password', clearPasswords],
    PENDING: ['pending', resetConsents]
  },
  pending: { // service call on submit
    ERROR: ['email', propCursor('changes')(always())],
    UNAUTHORIZED: ['unauthorized', clearPasswords],
    SIGNED_IN: ['password', clearPasswords],
    SIGNED_UP: ['password', clearPasswords]
  }
}

export const reducer = compose.into(0)(
  createAutomataReducer(automata, 'email'),
  forType('CHANGE')(propCursor('changes')(mergePayload())),
  forType('INPUT_REF')(propCursor('inputs')(mergePayload())),
  forType('PROPS')(into('props')(mapPayload()))
)
