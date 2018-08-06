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
import { requestPassword } from './effects'
import componentFromEvents, { redux, connect, SFC, ComponentClass } from '../../component-from-events'
import { createActionDispatchers } from 'basic-fsa-factories'
import { putRecord, deleteRecord, getRecord } from '../../../stubs/stubs_service'
import { tap } from 'rxjs/operators'

export interface ControlledRecordCollapsedCardProps {
  [prop: string]: any
}

function mapStateToProps ({ props, state, password, auth }) {

  return {
    ...props,
    pending: auth === 'authenticating',
    authenticate: auth === 'authenticating',
    login: state === 'login',
    password
  }
}

const mapDispatchToProps = createActionDispatchers({
  onLogin: 'LOGIN_REQUESTED',
  onAuthenticationCancel: 'AUTHENTICATION_REJECTED',
  onCancel: 'CANCEL',
  onAuthenticated: 'AUTHENTICATION_RESOLVED',
  onCopyDone: 'COPY_DONE'
})

const services = { getRecord, putRecord, deleteRecord }

export default function<P>(
  RecordCollapsedCard: SFC<P>
): ComponentClass<ControlledRecordCollapsedCardProps> {
  const ControlledRecordCollapsedCard = componentFromEvents<ControlledRecordCollapsedCardProps,P>(
    RecordCollapsedCard,
    // () => tap(console.log.bind(console,'controlled-record-collapsed-card:event:')),
    redux(reducer, requestPassword(services)),
    // () => tap(console.log.bind(console,'controlled-record-collapsed-card:state:')),
    connect(mapStateToProps, mapDispatchToProps)
    // () => tap(console.log.bind(console,'controlled-record-collapsed-card:view-props:'))
  )

  return ControlledRecordCollapsedCard
}
