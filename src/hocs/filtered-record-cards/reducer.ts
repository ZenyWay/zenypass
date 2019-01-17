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

import getFilterList from './filter'
import createAutomataReducer, { AutomataSpec } from 'automata-reducer'
import { into } from 'basic-cursors'
import { always, forType, mapPayload } from 'utils'
import compose from 'basic-compose'

export type AutomataState = 'disabled' | 'enabled'

const clearFilter = into('filter')(always())
const updateFilter = into('filter')(({ props, tokens }) =>
  getFilterList(tokens, props.records)
)
const clearTokens = into('tokens')(always())
const mapPayloadIntoTokens = into('tokens')(mapPayload())

const automata: AutomataSpec<AutomataState> = {
  disabled: {
    TOGGLE_FILTER: ['enabled', updateFilter]
  },
  enabled: {
    UPDATE: updateFilter,
    TOKENS: [updateFilter, mapPayloadIntoTokens],
    CLEAR: [updateFilter, clearTokens],
    TOGGLE_FILTER: ['disabled', clearFilter, clearTokens]
  }
}

export default compose.into(0)(
  createAutomataReducer(automata, 'disabled'),
  forType('SEARCH_FIELD_REF')(into('searchField')(mapPayload())),
  forType('PROPS')(into('props')(mapPayload()))
)
