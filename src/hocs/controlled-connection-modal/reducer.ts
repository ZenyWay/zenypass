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
import createAutomataReducer from 'automata-reducer'
import { propCursor, into } from 'basic-cursors'
import compose from 'basic-compose'
import { always, mapPayload, not, pluck } from 'utils'
import { Reducer } from '../../component-from-events'

const mapPayloadIntoWindowref = into('windowref')(mapPayload())
const clearWindowRef = into('windowref')(always(void 0))
const mapPayloadIntoError = into('error')(mapPayload(not(pluck('success'))))
const clearError = into('error')(always(void 0))

export type AutomataState =
'copy-any' | 'copy-password' | 'copy-username' | 'clear-clipboard'
| 'clearing-clipboard' | 'cancelling'

const automata = {
  'copy-any': {
    CANCEL: 'cancelling',
    USERNAME_COPIED: 'copy-password',
    PASSWORD_COPIED: 'copy-username'
  },
  'copy-password': {
    WINDOW_OPEN_RESOLVED: mapPayloadIntoWindowref,
    CANCEL: 'cancelling',
    PASSWORD_COPIED: 'clear-clipboard'
  },
  'copy-username': {
    WINDOW_OPEN_RESOLVED: mapPayloadIntoWindowref,
    CANCEL: 'clearing-clipboard',
    USERNAME_COPIED: 'cancelling'
  },
  'clear-clipboard': {
    CANCEL: 'clearing-clipboard'
  },
  'clearing-clipboard': {
    CANCEL: 'cancelling',
    CLIPBOARD_CLEARED: 'cancelling'
  },
  'cancelling': {
    CANCELLED: 'copy-any'
  }
}

const common = {
  'WINDOW_OPEN_REJECTED': into('manual')(always(true)),
  'USERNAME_COPIED': clearError,
  'PASSWORD_COPIED': clearError,
  'COPY_ERROR': mapPayloadIntoError,
  'TOGGLE_MANUAL': propCursor('manual')(not()),
  'TOGGLE_CLEARTEXT': propCursor('cleartext')(not()),
  'CANCEL': clearError,
  'CANCELLED': compose.into(0)(clearWindowRef, into('manual')(always(false))),
  'PROPS': into('props')(mapPayload())
}

export default compose.into(0)(
  createAutomataReducer(automata, 'copy-any'),
  createReducers(common)
)

function createReducers <S> (reducers: { [event: string]: Reducer<S,any> }) {
  return function (state: S, event) {
    const reducer = reducers[event.type]
    return reducer ? reducer(state, event) : state
  }
}
