/**
 * @license
 *
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
import { propCursor } from 'basic-cursors'
import compose from 'basic-compose'
import { forType, keepIfEqual, update } from 'utils'

const automata = {
  enabled: {
    COPIED: 'disabled'
  },
  disabled: {
    EXPIRED: 'enabled'
  }
}

const inProps = propCursor('props')

export default compose.into(0)(
  createAutomataReducer(automata, 'enabled'),
  forType('PROPS')(inProps(keepIfEqual()(update)))
)
