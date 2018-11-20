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
import DEFAULT_FORMATTERS from './formatters'
import { propCursor, into } from 'basic-cursors'
import compose from 'basic-compose'
import { forType, mapPayload, pluck } from 'utils'

const inProps = propCursor('props')
const intoValue = into('value')

export default compose.into(0)(
  forType('CHANGE')(
    compose.into(0)(
      formatIfDefined,
      intoValue(mapPayload(pluck('value')))
    )
  ),
  forType('PROPS')(
    compose.into(0)(
      intoValue(mapPayload(pluck('value'))),
      inProps(mapPayload())
    )
  )
)

function formatIfDefined (state) {
  const { props, value, error } = state
  const format = props.format || DEFAULT_FORMATTERS[props.type]
  const update = format ? format(value) : { value }
  return update.value !== value || update.error !== error
    ? { ...state, value: update.value, error: update.error }
    : state
}
