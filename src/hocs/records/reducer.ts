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
import { always, forType, inIndexedListEntry, mapPayload, not } from 'utils'
import { createAuthenticationReducer } from '../authentication-modal/reducer'

export type RecordAutomataState =
'public' | 'pending:cleartext' | 'pending:edit'
| 'cleartext'
| 'edit' | 'pending:save' | 'pending:delete'

const clearRecord = into('record')(always(void 0))
const mapPayloadToRecord = into('record')(mapPayload())
const mapPayloadToError = into('error')(mapPayload())
const toggleCleartext = propCursor('cleartext')(not())
const cancelCleartext = into('cleartext')(always(false))
function updateRecord (record, { payload }) {
  return { ...record, ...payload }
}

const recordAutomata: AutomataSpec<RecordAutomataState,any> = {
  'public': {
    TOGGLE_CLEARTEXT: 'pending:cleartext',
    EDIT_RECORD_REQUESTED: 'pending:edit'
  },
  'pending:cleartext': {
    AUTHENTICATION_REJECTED: 'public',
    CLEARTEXT_REJECTED: ['public', mapPayloadToError],
    CLEARTEXT_RESOLVED: ['cleartext', toggleCleartext, mapPayloadToRecord]
  },
  'pending:edit': {
    AUTHENTICATION_REJECTED: 'public',
    EDIT_REJECTED: ['public', mapPayloadToError],
    EDIT_RESOLVED: ['edit', mapPayloadToRecord]
  },
  'cleartext': {
    TOGGLE_CLEARTEXT: ['public', toggleCleartext],
    EDIT_REQUESTED: 'edit'
  },
  'edit': {
    TOGGLE_CLEARTEXT: toggleCleartext,
    EDIT_CANCELED: ['public', clearRecord],
    CHANGE: propCursor('record')(updateRecord),
    SAVE_REQUESTED: 'pending:save',
    DELETE_REQUESTED: 'pending:delete'
  },
  'pending:save' : {
    AUTHENTICATION_REJECTED: 'edit',
    SAVE_REJECTED: ['edit', mapPayloadToError],
    SAVE_RESOLVED: ['public', clearRecord, cancelCleartext]
  },
  'pending:delete': {
    AUTHENTICATION_REJECTED: 'edit',
    DELETE_REJECTED: ['edit', mapPayloadToError],
    DELETE_RESOLVED: ['public', clearRecord, cancelCleartext]
  }
}

export default compose.into(0)(
  createAutomataReducer(recordAutomata, 'public', {
    operator: compose.into(0)(inIndexedListEntry, propCursor('records'))
  }),
  // createAuthenticationReducer(),
  forType('RECORDS')(into('records')(mapPayload())),
  forType('PROPS')(into('props')(mapPayload()))
)
