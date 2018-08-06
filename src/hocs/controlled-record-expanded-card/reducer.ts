/**
 * Copyright 2018 ZenyWay S.A.S., Stephane M. Catala
 * @author Stephane M. Catala
 * @author Clement Bonet
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
//
import createAutomataReducer, { AutomataSpec } from 'automata-reducer'
import cursor, { propCursor, into } from 'basic-cursors'
import compose from 'basic-compose'
import { always, forType, mapPayload, not, pluck } from 'utils'
import { createAuthenticationReducer } from '../controlled-authentication-modal/reducer'

const CONCEALED_PASSWORD = '*****'
const concealPassword = into('password')(always(CONCEALED_PASSWORD))
const pristine = into('record')(always(void 0))
const mapPayloadToPassword = into('password')(mapPayload())
const mapPayloadToError = into('error')(mapPayload())
const toggleCleartext = propCursor('cleartext')(not())
const cancelCleartext = into('cleartext')(always(false))

const mainAutomata = {
  'public': {
    TOGGLE_CLEARTEXT: 'pending:private',
    EDIT_REQUESTED: 'pending:edit',
    LOGIN_REQUESTED: 'pending:login:public'
  },
  'pending:private': {
    AUTHENTICATION_REJECTED: 'public',
    CLEARTEXT_REJECTED: ['public', mapPayloadToError],
    CLEARTEXT_RESOLVED: ['private', toggleCleartext, mapPayloadToPassword]
  },
  'private': {
    TOGGLE_CLEARTEXT: ['public', toggleCleartext, concealPassword],
    EDIT_REQUESTED: 'edit'
  },
  'pending:edit': {
    AUTHENTICATION_REJECTED: 'public',
    EDIT_REJECTED: ['public', mapPayloadToError],
    EDIT_RESOLVED: ['edit', mapPayloadToPassword]
  },
  'edit': {
    TOGGLE_CLEARTEXT: toggleCleartext,
    EDIT_CANCELED: ['public', concealPassword],
    CHANGE: propCursor('record')((record, { payload }) => ({ ...record, ...payload })),
    SAVE_REQUESTED: 'pending:save',
    DELETE_REQUESTED: 'pending:delete',
    TOGGLE_REQUESTED: ['pending:save', into('pendingToggle')(always(true))],
    CANCEL_EDIT: ['public', concealPassword, pristine]
  },
  'pending:save' : {
    AUTHENTICATION_REJECTED: 'edit',
    SAVE_REJECTED: ['edit', mapPayloadToError],
    SAVE_RESOLVED: ['public', pristine,concealPassword, cancelCleartext],
    TOGGLE_REJECTED: ['edit', mapPayloadToError],
    TOGGLE_RESOLVED: ['public',
      pristine,
      concealPassword,
      cancelCleartext,
      into('pendingToggle')(always(false))]
  },
  'pending:delete': {
    AUTHENTICATION_REJECTED: 'edit',
    DELETE_REJECTED: ['edit', mapPayloadToError],
    DELETE_RESOLVED: ['public', pristine, concealPassword,cancelCleartext]
  },
  'pending:login:public': {
    AUTHENTICATION_REJECTED: 'public',
    LOGIN_REJECTED: ['public', mapPayloadToError],
    LOGIN_RESOLVED: ['loginModal:public', mapPayloadToPassword]
  },
  'loginModal:public': {
    CANCEL: ['public', mapPayloadToError],
    COPY_DONE: ['public', concealPassword]
  }
}

export default compose.into(0)(
  createAutomataReducer(mainAutomata, 'public'),
  createAuthenticationReducer(),
  forType('PROPS')(into('props')(mapPayload()))
)
