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
import { propCursor, into } from 'basic-cursors'
import compose from 'basic-compose'
import { always, forType, mapPayload } from 'utils'

const inProps = propCursor('props')
const intoToken = into('token')
const intoError = into('error')
const mapPayloadIntoError = intoError(mapPayload())

export type AutomataState = 'init' | 'authenticating' | 'authorizing'

const automata: AutomataSpec<AutomataState> = {
  init: {
    CLICK: ['authenticating', intoError(always(''))]
  },
  authenticating: {
    CANCEL: ['init',mapPayloadIntoError],
    AUTHENTICATED: 'authorizing'
  },
  authorizing: {
    SERVER_TOKEN: intoToken(mapPayload()),
    SERVER_DONE: ['init', intoToken(always(void 0))],
    SERVER_ERROR: ['init', mapPayloadIntoError],
    UNAUTHORIZED: 'authenticating'
  }
}

export default compose.into(0)(
  createAutomataReducer(automata, 'init'),
  forType('PROPS')(inProps(mapPayload()))
)
