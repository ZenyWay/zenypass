/**
 * @license
 * Copyright 2018 Stephane M. Catala
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
import { forType, keepIfEqual, mapPayload, pluck } from 'utils'

const inProps = propCursor('props')
const intoValue = into('value')

const automata = {
  valid: {
    PROPS: intoValue(mapPayload(pluck('value'))),
    INVALID_CHANGE: 'invalid'
  },
  invalid: {
    VALID_CHANGE: 'valid'
  }
}

export default compose.into(0)(
  createAutomataReducer(automata, 'valid'),
  forType('VALID_CHANGE')(intoValue(mapPayload())),
  forType('CHANGE')(intoValue(mapPayload())),
  forType('PROPS')(inProps(keepIfEqual()(mapPayload())))
)
