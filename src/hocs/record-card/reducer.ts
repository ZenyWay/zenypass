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
//
import createAutomataReducer, { AutomataSpec } from 'automata-reducer'
import { propCursor, into } from 'basic-cursors'
import compose from 'basic-compose'
import { always, forType, mapPayload, not } from 'utils'

export type RecordAutomataState =
  | 'public'
  | 'pending:cleartext'
  | 'pending:edit'
  | 'cleartext'
  | 'edit'
  | 'pending:cancel'
  | 'pending:save'
  | 'pending:delete'

const clearPassword = into('password')(always(void 0))
const clearChanges = into('changes')(always(void 0))
const toggleRecordDeleted = propCursor('changes')(propCursor('_deleted')(not()))
const mapPayloadToPassword = into('password')(mapPayload())
const mapPayloadToError = into('error')(mapPayload())
const toggleExpanded = propCursor('expanded')(not())
const clearExpanded = into('expanded')(always(false))
const toggleCleartext = propCursor('cleartext')(not())
const cancelCleartext = into('cleartext')(always(false))
const reset = [clearExpanded, clearChanges, clearPassword, cancelCleartext]

function updateRecord(record, { payload }) {
  return { ...record, ...payload }
}

const recordAutomata: AutomataSpec<RecordAutomataState> = {
  public: {
    TOGGLE_EXPANDED: toggleExpanded,
    TOGGLE_CLEARTEXT: 'pending:cleartext',
    EDIT_RECORD_REQUESTED: 'pending:edit',
    EDIT_RECORD: ['edit', toggleExpanded]
  },
  'pending:cleartext': {
    CLEARTEXT_REJECTED: ['public', mapPayloadToError],
    CLEARTEXT_RESOLVED: ['cleartext', toggleCleartext, mapPayloadToPassword]
  },
  'pending:edit': {
    CLEARTEXT_REJECTED: ['public', mapPayloadToError],
    CLEARTEXT_RESOLVED: ['edit', mapPayloadToPassword]
  },
  cleartext: {
    TOGGLE_CLEARTEXT: ['public', clearPassword, cancelCleartext],
    TOGGLE_EXPANDED: ['public', ...reset],
    EDIT_RECORD_REQUESTED: 'edit'
  },
  edit: {
    CHANGE: propCursor('changes')(updateRecord),
    TOGGLE_CLEARTEXT: toggleCleartext,
    TOGGLE_EXPANDED: 'pending:cancel',
    UPDATE_RECORD_REQUESTED: 'pending:save',
    DELETE_RECORD_REQUESTED: ['pending:delete', toggleRecordDeleted]
  },
  'pending:cancel': {
    EDIT_RECORD_REQUESTED: 'edit',
    TOGGLE_EXPANDED: ['public', ...reset]
  },
  'pending:save': {
    UPDATE_RECORD_REJECTED: ['edit', mapPayloadToError],
    UPDATE_RECORD_RESOLVED: ['public', ...reset]
  },
  'pending:delete': {
    DELETE_RECORD_REJECTED: ['edit', toggleRecordDeleted, mapPayloadToError],
    DELETE_RECORD_RESOLVED: ['public', ...reset]
  }
}

export type ConnectAutomataState = 'idle' | 'pending:connect' | 'connect'
const connectAutomata: AutomataSpec<ConnectAutomataState> = {
  idle: {
    TOGGLE_CONNECT: 'pending:connect'
  },
  'pending:connect': {
    CLEARTEXT_REJECTED: ['idle', mapPayloadToError],
    CLEARTEXT_RESOLVED: ['connect', toggleCleartext, mapPayloadToPassword]
  },
  connect: {
    TOGGLE_CONNECT: ['idle', cancelCleartext, clearPassword]
  }
}

export default compose.into(0)(
  createAutomataReducer(recordAutomata, 'public'),
  createAutomataReducer(connectAutomata, 'idle', 'connect'),
  forType('PROPS')(into('props')(mapPayload()))
)
