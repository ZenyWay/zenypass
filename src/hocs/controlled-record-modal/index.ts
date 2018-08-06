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
import reducer, { copyRecord } from './reducer'
import { callOnCancel, callOnCopyUsername, openWindowOnWebsite, reopenWindowOnCopyFromSecondStep } from './effects'
import componentFromEvents, { redux, connect, SFC, ComponentClass } from '../../component-from-events'
import { createActionDispatchers } from 'basic-fsa-factories'

export interface ControlledRecordModalProps {
  record: Record
  [prop: string]: any
}

export interface Record {
  id: string
  name: string
  url: string
  username: string
  keywords: string[]
  comments: string
  login: boolean
}

function mapStateToProps ({ props, state }) {
  return {
    ...props,
    record: copyRecord(props.record),
    step: state === 'firstStep' ? 1 : 2
  }
}

const mapDispatchToProps = createActionDispatchers({
  onCancel: 'CANCEL',
  onCopy: 'COPY',
  onWebsite: 'WEBSITE'
})

export default function<P>(
  RecordModal: SFC<any> // TODO
): ComponentClass<ControlledRecordModalProps> {
  const ControlledRecordModal = componentFromEvents<ControlledRecordModalProps,P>(
    RecordModal,
    // () => tap(console.log.bind(console,'controlled-record-modal:event:')),
    redux(reducer, callOnCancel, callOnCopyUsername, openWindowOnWebsite, reopenWindowOnCopyFromSecondStep),
    // () => tap(console.log.bind(console,'controlled-record-modal:state:')),
    connect(mapStateToProps, mapDispatchToProps)
    // () => tap(console.log.bind(console,'controlled-record-modal:view-props:'))
  )

  return ControlledRecordModal
}
