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
import { always, forType, mapPayload, mergePayload, not } from 'utils'

/**
 * AutomataState is a colon-separated list of tokens:
 * * first token is the current page type: 'signin', 'signup', or 'authorize',
 * * second token is either one of 'input', 'error', 'submitting':
 *   * 'input' for the currently required input, specified by the third token,
 *   * 'error' for an error on the currently required input,
 * also specified by the third token,
 *   * 'submitting' during a service call. there are no other following words.
 * * third word (if present) describes which input is currently required (input)
 * or incorrect (error), i.e. 'email', 'password', 'confirm', 'token',
 * 'consents', 'terms', or 'submit'.
 * * fourth word (if present) is either 'retry' or 'pending':
 *   * 'retry' indicates that the previous signin attempt has failed,
 *   * 'pending' disables all inputs
 */
export type AutomataState =
  | 'signin:input:email:pending'
  | 'signin:input:email'
  | 'signin:error:email:pending'
  | 'signin:error:email'
  | 'signin:input:password:pending'
  | 'signin:input:password'
  | 'signin:input:password:retry'
  | 'signin:error:password'
  | 'signin:error:password:retry'
  | 'signin:input:submit'
  | 'signin:input:submit:retry'
  | 'signin:error:submit'
  | 'signin:error:submit:retry'
  | 'signin:submitting'
  | 'signin:submitting:retry'
  | 'authorize:error:password'
  | 'authorize:input:token:pending'
  | 'authorize:input:token'
  | 'authorize:error:token'
  | 'authorize:input:submit'
  | 'authorize:error:submit'
  | 'authorize:submitting'
  | 'signup:input:email'
  | 'signup:error:email'
  | 'signup:input:password'
  | 'signup:error:password'
  | 'signup:input:confirm'
  | 'signup:error:confirm'
  | 'signup:input:consents'
  | 'signup:input:terms'
  | 'signup:input:submit'
  | 'signup:error:submit'
  | 'signup:submitting'

const setCreated = into('created')(always(true))
const clearCreated = into('created')(always())
const toggleNews = propCursor('news')(not())
const clearNews = into('news')(always())
const clearPassword = propCursor('password')(always(''))
const clearConfirm = propCursor('confirm')(always(''))
const clearToken = propCursor('token')(always(''))
const clearPasswords = mergePayload(
  always({ password: '', confirm: '', token: '' })
)

/**
 * only change page type on SIGNUP, SIGNIN, or AUTHORIZE
 */
const automata: AutomataSpec<AutomataState> = {
  'signin:input:email:pending': {
    SIGNIN: 'signin:input:email'
  },
  'signin:input:email': {
    SIGNUP: 'signup:input:email',
    SUBMIT: 'signin:error:email',
    INVALID_EMAIL: 'signin:error:email',
    VALID_EMAIL: 'signin:input:password'
  },
  'signin:error:email:pending': {
    SIGNIN: 'signin:error:email'
  },
  'signin:error:email': {
    SIGNUP: 'signup:error:email',
    VALID_EMAIL: 'signin:input:password'
  },
  'signin:input:password:pending': {
    SIGNIN: 'signin:input:password'
  },
  'signin:input:password': {
    SIGNUP: 'signup:input:password',
    SUBMIT: 'signin:error:password',
    INVALID_EMAIL: 'signin:error:email',
    INVALID_PASSWORD: 'signin:error:password',
    VALID_PASSWORD: 'signin:input:submit'
  },
  'signin:input:password:retry': {
    SIGNUP: 'signup:input:password',
    SUBMIT: 'signin:error:password',
    INVALID_EMAIL: 'signin:error:email',
    INVALID_PASSWORD: 'signin:error:password:retry',
    VALID_PASSWORD: 'signin:input:submit:retry'
  },
  'signin:error:password': {
    SIGNUP: ['signup:input:password', clearPassword],
    INVALID_EMAIL: ['signin:error:email', clearPassword],
    VALID_EMAIL: ['signin:input:password', clearPassword],
    VALID_PASSWORD: 'signin:input:submit'
  },
  'signin:error:password:retry': {
    SIGNUP: ['signup:input:password', clearPassword],
    INVALID_EMAIL: ['signin:error:email', clearPassword],
    VALID_EMAIL: ['signin:input:password', clearPassword],
    VALID_PASSWORD: 'signin:input:submit:retry'
  },
  'signin:input:submit': {
    SIGNUP: ['signup:input:password', clearPassword],
    INVALID_EMAIL: ['signin:error:email', clearPassword],
    INVALID_PASSWORD: 'signin:error:password',
    VALID_EMAIL: ['signin:input:password', clearPassword],
    SUBMIT: 'signin:submitting'
  },
  'signin:input:submit:retry': {
    SIGNUP: ['signup:input:password', clearPassword],
    INVALID_EMAIL: ['signin:error:email', clearPassword],
    INVALID_PASSWORD: 'signin:error:password:retry',
    VALID_EMAIL: ['signin:input:password', clearPassword],
    SUBMIT: 'signin:submitting:retry'
  },
  'signin:error:submit': {
    SIGNUP: ['signup:input:password', clearPassword],
    INVALID_EMAIL: ['signin:error:email', clearPassword],
    INVALID_PASSWORD: 'signin:error:password:retry',
    VALID_EMAIL: ['signin:input:password', clearPassword],
    VALID_PASSWORD: 'signin:input:submit:retry'
  },
  'signin:error:submit:retry': {
    SUBMIT: 'authorize:input:token:pending',
    CANCEL: ['signin:input:password:retry', clearPassword]
  },
  'signin:submitting': {
    ERROR: ['signin:input:password', clearPassword],
    UNAUTHORIZED: ['signin:error:submit', clearPassword],
    AUTHENTICATED: ['signin:input:password', clearPassword, clearCreated]
  },
  'signin:submitting:retry': {
    ERROR: ['signin:input:password', clearPassword],
    UNAUTHORIZED: 'signin:error:submit:retry',
    AUTHENTICATED: ['signin:input:password', clearPassword, clearCreated]
  },
  'authorize:error:password': {
    SIGNUP: ['signup:input:password', clearPassword],
    INVALID_EMAIL: ['signin:error:email:pending', clearPassword],
    VALID_EMAIL: ['signin:input:email:pending', clearPassword],
    VALID_PASSWORD: 'authorize:input:token'
  },
  'authorize:input:token:pending': {
    AUTHORIZE: 'authorize:input:token'
  },
  'authorize:input:token': {
    SIGNUP: ['signup:input:password', clearPassword],
    INVALID_EMAIL: ['signin:error:email:pending', clearPassword],
    INVALID_PASSWORD: 'authorize:error:password',
    INVALID_TOKEN: 'authorize:error:token',
    VALID_EMAIL: ['signin:input:email:pending', clearPassword],
    VALID_TOKEN: 'authorize:input:submit'
  },
  'authorize:error:token': {
    SIGNUP: ['signup:input:password', clearPasswords],
    INVALID_EMAIL: ['signin:error:email:pending', clearPasswords],
    INVALID_PASSWORD: ['authorize:error:password', clearToken],
    VALID_EMAIL: ['signin:input:email:pending', clearPasswords],
    VALID_PASSWORD: ['authorize:input:token', clearToken],
    VALID_TOKEN: 'authorize:input:submit'
  },
  'authorize:input:submit': {
    SIGNUP: ['signup:input:password', clearPasswords],
    INVALID_EMAIL: ['signin:error:email:pending', clearPasswords],
    INVALID_PASSWORD: ['authorize:error:password', clearToken],
    VALID_EMAIL: ['signin:input:email:pending', clearPasswords],
    VALID_PASSWORD: clearToken,
    SUBMIT: 'authorize:submitting'
  },
  'authorize:error:submit': {
    SIGNUP: ['signup:input:password', clearPassword],
    INVALID_EMAIL: ['signin:error:email:pending', clearPassword],
    INVALID_PASSWORD: 'authorize:error:password',
    VALID_EMAIL: ['signin:input:email:pending', clearPassword],
    VALID_PASSWORD: 'authorize:input:token',
    VALID_TOKEN: 'authorize:input:submit'
  },
  'authorize:submitting': {
    ERROR: ['signin:input:password:pending', clearPasswords],
    REQUEST_TIMEOUT: ['authorize:error:submit', clearConfirm],
    SIGNIN: ['signin:input:password', clearPasswords]
  },
  'signup:input:email': {
    SIGNIN: 'signin:input:email',
    SUBMIT: 'signup:error:email',
    INVALID_EMAIL: 'signup:error:email',
    VALID_EMAIL: 'signup:input:password'
  },
  'signup:error:email': {
    SIGNIN: 'signin:error:email',
    VALID_EMAIL: 'signup:input:password'
  },
  'signup:input:password': {
    SIGNIN: 'signin:input:password',
    SUBMIT: 'signup:error:password',
    INVALID_EMAIL: 'signup:error:email',
    INVALID_PASSWORD: 'signup:error:password',
    VALID_PASSWORD: 'signup:input:confirm'
  },
  'signup:error:password': {
    SIGNIN: ['signin:input:password', clearPassword],
    INVALID_EMAIL: ['signup:error:email', clearPassword],
    VALID_EMAIL: ['signup:input:password', clearPassword],
    VALID_PASSWORD: 'signup:input:confirm'
  },
  'signup:input:confirm': {
    SIGNIN: ['signin:input:password', clearPassword],
    INVALID_EMAIL: ['signup:error:email', clearPassword],
    INVALID_PASSWORD: 'signup:error:password',
    INVALID_CONFIRM: 'signup:error:confirm',
    VALID_EMAIL: ['signup:input:password', clearPassword],
    VALID_CONFIRM: 'signup:input:consents'
  },
  'signup:error:confirm': {
    SIGNIN: ['signin:input:password', clearPasswords],
    INVALID_EMAIL: ['signup:error:email', clearPasswords],
    INVALID_PASSWORD: ['signup:error:password', clearConfirm],
    VALID_EMAIL: ['signup:input:password', clearPasswords],
    VALID_PASSWORD: ['signup:input:confirm', clearConfirm],
    VALID_CONFIRM: 'signup:input:consents'
  },
  'signup:input:consents': {
    SIGNIN: ['signin:input:password', clearPasswords],
    INVALID_EMAIL: ['signup:error:email', clearPasswords],
    INVALID_PASSWORD: ['signup:error:password', clearConfirm],
    INVALID_CONFIRM: 'signup:error:confirm',
    VALID_EMAIL: ['signup:input:password', clearPasswords],
    VALID_PASSWORD: ['signup:input:confirm', clearConfirm],
    SUBMIT: ['signup:input:terms', clearNews]
  },
  'signup:input:terms': {
    CANCEL: ['signup:input:password', clearPasswords],
    TOGGLE_NEWS: toggleNews,
    TOGGLE_TERMS: 'signup:input:submit'
  },
  'signup:input:submit': {
    CANCEL: ['signup:input:password', clearPasswords],
    TOGGLE_NEWS: toggleNews,
    TOGGLE_TERMS: 'signup:input:terms',
    SUBMIT: 'signup:submitting'
  },
  'signup:error:submit': {
    SIGNIN: ['signin:input:password', clearPassword],
    INVALID_EMAIL: ['signup:error:email', clearPassword],
    INVALID_PASSWORD: 'signup:error:password',
    VALID_EMAIL: ['signup:input:password', clearPassword],
    VALID_PASSWORD: 'signup:input:confirm',
    VALID_TOKEN: 'signup:input:consents'
  },
  'signup:submitting': {
    ERROR: ['signin:input:password:pending', clearPasswords],
    REQUEST_TIMEOUT: ['signup:error:submit', clearConfirm],
    SIGNIN: ['signin:input:password', clearPasswords, setCreated]
  }
}

export const reducer = compose.into(0)(
  createAutomataReducer(automata, 'signin:input:email'),
  forType('CHANGE_TOKEN')(into('token')(mapPayload())),
  forType('CHANGE_CONFIRM')(into('confirm')(mapPayload())),
  forType('CHANGE_PASSWORD')(into('password')(mapPayload())),
  forType('INPUT_REF')(propCursor('inputs')(mergePayload())),
  forType('PROPS')(into('props')(mapPayload()))
)
