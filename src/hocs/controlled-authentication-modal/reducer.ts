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
import { forType, mapPayload, pluck } from '../../utils'
import compose from 'basic-compose'

const inProps = propCursor('props')
const intoValue = into('value')
const intoError = into('error')
const mapPayloadIntoError = intoError(mapPayload())
const mapPayloadIntoValue = intoValue(mapPayload())

const automata = {
  pristine: {
    PROPS: intoValue(mapPayload(pluck('value'))),
    CHANGE: ['dirty', mapPayloadIntoValue],
    SUBMIT: 'error'
  },
  dirty: {
    CANCEL: 'pristine',
    CHANGE: mapPayloadIntoValue,
    SUBMIT: 'authenticating'
  },
  error: {
    CANCEL: 'pristine',
    CHANGE: mapPayloadIntoValue,
    SUBMIT: 'authenticating'
  },
  authenticating: {
    UNAUTHORIZED: 'error',
    CANCEL: 'pristine',
    AUTHENTICATION_DONE: 'pristine',
    SERVER_ERROR: ['pristine', mapPayloadIntoError]
  }
}

export default compose.into(0)(
  createAutomataReducer(automata, 'pristine'),
  forType('PROPS')(inProps(mapPayload()))
)
