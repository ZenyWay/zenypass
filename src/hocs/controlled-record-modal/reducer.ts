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
import { ControlledRecordModalProps, Record } from './'
import createAutomataReducer from 'automata-reducer'
import { propCursor, into } from 'basic-cursors'
import compose from 'basic-compose'
import { always, forType, mapPayload } from 'utils'

const inProps = propCursor('props')
const clearWindow = into('windowref')(always(void 0))
// const intoError = into('error')
// const mapPayloadIntoError = intoError(mapPayload())

const automata = {
  firstStep: {
    COPY: 'secondStep',
    WINDOW_OPENED: ['secondStep', into('windowref')(mapPayload())],
    WINDOW_REOPENED: clearWindow
  },
  secondStep: {
    CANCEL: ['firstStep', clearWindow],
    COPY: 'firstStep'
  }
}

export default compose.into(0)(
  createAutomataReducer(automata, 'firstStep'),
  forType('PROPS')(inProps(mapPayload(copyProps)))
)

function copyProps (props: ControlledRecordModalProps) {
  return { ...props, record: copyRecord(props.record) }
}

export function copyRecord (record: Record) {
  return { ...record, keywords: record.keywords.slice() }
}
