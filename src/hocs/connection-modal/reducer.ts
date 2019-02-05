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
import createAutomataReducer, { Reducer, AutomataSpec } from 'automata-reducer'
import { propCursor, into } from 'basic-cursors'
import compose from 'basic-compose'
import { always, mapPayload, not } from 'utils'

const mapPayloadIntoWindowref = into('windowref')(mapPayload())
const clearWindowRef = into('windowref')(always(void 0))

export enum ConnectionFsmState {
  CopyAny = 'COPY_ANY',
  CopyingAny = 'COPYING_ANY',
  CopyPassword = 'COPY_PASSWORD',
  CopyingPassword = 'COPYING_PASSWORD',
  CopyUsername = 'COPY_USERNAME',
  CopyingUsername = 'COPYING_USERNAME',
  Cancelling = 'CANCELLING',
  Closing = 'CLOSING'
}

export enum ClipboardFsmState {
  Pristine = 'PRISTINE',
  Dirty = 'DIRTY'
}

const connectionFsm: AutomataSpec<ConnectionFsmState> = {
  [ConnectionFsmState.CopyAny]: {
    CANCEL: ConnectionFsmState.Cancelling,
    NO_USERNAME: ConnectionFsmState.CopyPassword,
    CLICK_COPY: ConnectionFsmState.CopyingAny
  },
  [ConnectionFsmState.CopyingAny]: {
    USERNAME_COPIED: ConnectionFsmState.CopyPassword,
    PASSWORD_COPIED: ConnectionFsmState.CopyUsername
  },
  [ConnectionFsmState.CopyPassword]: {
    WINDOW_OPEN_RESOLVED: mapPayloadIntoWindowref,
    CANCEL: ConnectionFsmState.Cancelling,
    CLICK_COPY: ConnectionFsmState.CopyingPassword
  },
  [ConnectionFsmState.CopyingPassword]: {
    USERNAME_COPIED: ConnectionFsmState.CopyPassword,
    PASSWORD_COPIED: ConnectionFsmState.Closing
  },
  [ConnectionFsmState.CopyUsername]: {
    WINDOW_OPEN_RESOLVED: mapPayloadIntoWindowref,
    CANCEL: ConnectionFsmState.Cancelling,
    CLICK_COPY: ConnectionFsmState.CopyingUsername
  },
  [ConnectionFsmState.CopyingUsername]: {
    PASSWORD_COPIED: ConnectionFsmState.CopyUsername,
    USERNAME_COPIED: ConnectionFsmState.Closing
  },
  [ConnectionFsmState.Cancelling]: {
    CLOSE: ConnectionFsmState.CopyAny
  },
  [ConnectionFsmState.Closing]: {
    CLOSE: ConnectionFsmState.CopyAny
  }
}

const clipboardFsm: AutomataSpec<ClipboardFsmState> = {
  [ClipboardFsmState.Pristine]: {
    PASSWORD_COPIED: ClipboardFsmState.Dirty
  },
  [ClipboardFsmState.Dirty]: {
    USERNAME_COPIED: ClipboardFsmState.Pristine,
    CLOSE: ClipboardFsmState.Pristine
  }
}

const common = {
  WINDOW_OPEN_REJECTED: compose.into(0)(
    clearWindowRef,
    into('manual')(always(true))
  ),
  TOGGLE_MANUAL: propCursor('manual')(not()),
  TOGGLE_CLEARTEXT: propCursor('cleartext')(not()),
  CLOSE: compose.into(0)(
    clearWindowRef,
    into('manual')(always(false)),
    into('cleartext')(always(false))
  ),
  PROPS: into('props')(mapPayload())
}

export default compose.into(0)(
  createAutomataReducer(connectionFsm, ConnectionFsmState.CopyAny),
  createAutomataReducer(clipboardFsm, ClipboardFsmState.Pristine, {
    key: 'clipboard'
  }),
  createReducers(common)
)

function createReducers<S> (reducers: { [event: string]: Reducer<S, any> }) {
  return function (state: S, event) {
    const reducer = reducers[event.type]
    return reducer ? reducer(state, event) : state
  }
}
