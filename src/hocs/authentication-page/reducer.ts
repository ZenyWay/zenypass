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
  'credentials'
  | 'email'
  | 'password'
  | 'confirm'
  | 'valid'
  | 'pending'

const clearPassword = propCursor('changes')(propCursor('password')(always()))
const clearConfirm = propCursor('changes')(propCursor('confirm')(always()))
const clearPasswords = compose.into(0)(clearPassword, clearConfirm)
const setError = error => propCursor('errors')(propCursor(error)(always(true)))
const clearError = error => propCursor('errors')(propCursor(error)(always()))
const clearErrors = propCursor('errors')(always())

const automata: AutomataSpec<AutomataState> = {
  credentials: { // neither email nor password are valid
    INVALID_EMAIL: setError('email'),
    VALID_EMAIL: ['password', clearError('email')]
  },
  email: { // password is valid, email is not
    TOGGLE_SIGNUP: ['credentials', clearPassword],
    INVALID_PASSWORD: ['credentials', setError('password')],
    INVALID_EMAIL: ['credentials', clearPassword, setError('email')],
    VALID_EMAIL: ['confirm', clearError('email')]
  },
  password: { // email is valid, password is not
    TOGGLE_SIGNUP: [clearPassword, clearError('password')],
    INVALID_EMAIL: [
      'credentials', clearPassword, clearError('password'), setError('email')
    ],
    INVALID_PASSWORD: setError('password'),
    VALID_PASSWORD: ['confirm', clearError('password')]
  },
  confirm: { // both email and password are valid
    TOGGLE_SIGNUP: ['password', clearPasswords, clearError('confirm')],
    INVALID_EMAIL: [
      'credentials', clearPasswords, clearError('confirm'), setError('email')
    ],
    INVALID_PASSWORD: ['password', clearConfirm, setError('password')],
    INVALID_CONFIRM: ['confirm', clearConfirm, setError('confirm')],
    VALID_CONFIRM: ['valid', clearError('confirm')]
  },
  valid: { // all inputs are valid
    TOGGLE_SIGNUP: ['password', clearPasswords],
    INVALID_EMAIL: ['email', clearConfirm, setError('email')],
    INVALID_PASSWORD: ['password', clearConfirm, setError('password')],
    INVALID_CONFIRM: ['confirm', clearConfirm, setError('confirm')],
    SUBMIT: clearError('service'),
    PENDING: 'pending'
  },
  pending: { // service call on submit
    ERROR: ['password', clearPasswords, setError('service')],
    SUCCESS: ['password', clearPasswords, clearErrors]
  }
}

export const reducer = compose.into(0)(
  createAutomataReducer(automata, 'credentials'),
  forType('TOGGLE_SIGNUP')(clearError('service')),
  forType('CHANGE')(propCursor('changes')(mergePayload())),
  forType('INPUT_REF')(propCursor('inputs')(mergePayload())),
  forType('PROPS')(into('props')(mapPayload()))
)
