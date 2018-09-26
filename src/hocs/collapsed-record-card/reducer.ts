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
import { into } from 'basic-cursors'
import compose from 'basic-compose'
import { always, forType, mapPayload } from 'utils'

export type AutomataState = 'idle' | 'authenticating' | 'pending' | 'connecting'

const mapPayloadIntoSessionId = into('sid')(mapPayload())
const clearSessionId = into('sid')(always(void 0))
const mapPayloadToPassword = into('password')(mapPayload())
const clearPassword = into('password')(always(void 0))
const mapPayloadIntoError = into('error')(mapPayload())
const clearError = into('error')(always(void 0))

const automata: AutomataSpec<AutomataState> = {
  idle: {
    CONNECT_REQUESTED: ['pending', clearError]
  },
  pending: {
    AUTHENTICATION_REQUESTED: 'authenticating',
    CONNECT_RESOLVED: ['connecting', clearSessionId, mapPayloadToPassword],
    CONNECT_REJECTED: ['idle', clearSessionId, mapPayloadIntoError]
  },
  authenticating: {
    CANCEL: ['idle', mapPayloadIntoError],
    AUTHENTICATION_REJECTED: ['idle', mapPayloadIntoError],
    AUTHENTICATION_RESOLVED: ['pending', mapPayloadIntoSessionId]
  },
  connecting: {
    CANCEL: ['idle', clearPassword, mapPayloadIntoError]
  }
}

export default compose.into(0)(
  createAutomataReducer(automata, 'idle'),
  forType('PROPS')(into('props')(mapPayload()))
)
