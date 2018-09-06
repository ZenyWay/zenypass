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
import { always, forType, mapPayload, not, pluck } from 'utils'

const clearWindowRef = into('windowref')(always(void 0))
const mapPayloadIntoError = into('error')(mapPayload(not(pluck('success'))))
const clearError = into('error')(always(void 0))

const automata = {
  clean: {
    USERNAME_COPIED: 'dirty',
    PASSWORD_COPIED: 'contaminated'
  },
  dirty: {
    CANCEL: 'clean',
    PASSWORD_COPIED: 'contaminated'
  },
  contaminated: {
    CANCEL: 'decontaminating',
    USERNAME_COPIED: 'clean'
  },
  decontaminating: {
    CANCEL: 'clean',
    CLIPBOARD_CLEARED: 'clean'
  }
}

const common = {
  'WINDOW_OPENED': into('windowref')(mapPayload()),
  'USERNAME_COPIED': clearError,
  'PASSWORD_COPIED': clearError,
  'COPY_ERROR': mapPayloadIntoError,
  'TOGGLE_MANUAL': propCursor('manual')(not()),
  'TOGGLE_CLEARTEXT': propCursor('cleartext')(not()),
  'CANCEL': compose.into(0)(clearWindowRef, clearError),
  'PROPS': into('props')(mapPayload())
}

export default compose.into(0)(
  createAutomataReducer(automata, 'clean'),
  function (state, event) {
    const reducer = common[event.type]
    return reducer ? reducer(state, event) : state
  }
)
