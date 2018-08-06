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
import reducer from './reducer'
// import { getTokenOnClickFromInit } from './effects'
import componentFromEvents, { redux, connect, SFC, ComponentClass } from '../../component-from-events'
import { createActionDispatchers } from 'basic-fsa-factories'
import { tap } from 'rxjs/operators'

export interface ControlledAuthorizationProps { // A renommer
  [prop: string]: any
}

function mapStateToProps ({ props, state }) {

  return {
    ...props,
    expanded: state === 'expanded'
  }
}

const mapDispatchToProps = createActionDispatchers({
  onToggleExpand: 'EXPAND'
})

export default function<P>(
  RecordCard
): ComponentClass<ControlledAuthorizationProps> {
  const Record = componentFromEvents<ControlledAuthorizationProps,P>(
    RecordCard,
    // () => tap(console.log.bind(console,'controlled-record-card:event:')),
    redux(reducer),
    // () => tap(console.log.bind(console,'controlled-record-card:state:')),
    connect(mapStateToProps, mapDispatchToProps)
    // () => tap(console.log.bind(console,'controlled-record-card:view-props:'))
  )

  return Record
}
