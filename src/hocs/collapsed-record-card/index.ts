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
import reducer, { AutomataState } from './reducer'
import { requestPasswordOnConnect } from './effects'
import componentFromEvents, {
  ComponentClass,
  Rest,
  SFC,
  connect,
  redux
} from 'component-from-events'
import { createActionDispatchers } from 'basic-fsa-factories'
import { putRecord, deleteRecord, getRecord } from 'services'
import { tap } from 'rxjs/operators'

export type CollapsedRecordCardProps<P extends CollapsedRecordCardSFCProps> =
Rest<P, CollapsedRecordCardSFCProps>

export interface CollapsedRecordCardSFCProps
extends CollapsedRecordCardSFCHandlerProps {
  record: { password?: string }
  pending?: boolean,
  authenticate?: boolean,
  connect?: boolean
}

export interface CollapsedRecordCardSFCHandlerProps {
  onAuthenticated?: (sessionID: string) => void
  onCancel?: () => void
  onConnect?: (event: MouseEvent) => void
  onToggleExpand?: (event: MouseEvent) => void,
}

interface CollapsedRecordCardState {
  props: CollapsedRecordCardProps<CollapsedRecordCardSFCProps> & { record: object }
  state: AutomataState
  password: string
}

function mapStateToProps (
  {
    props,
    state,
    password
  }: CollapsedRecordCardState
): Rest<CollapsedRecordCardSFCProps, CollapsedRecordCardSFCHandlerProps> {

  return {
    ...props,
    record: { ...props.record, password },
    authenticate: state === 'authenticating',
    connect: state === 'connecting',
    pending: state === 'pending'
  }
}

const mapDispatchToProps:
(dispatch: (event: any) => void) => CollapsedRecordCardSFCHandlerProps =
createActionDispatchers({
  onAuthenticated: 'AUTHENTICATION_RESOLVED',
  onCancel: 'CANCEL',
  onConnect: 'CONNECT_REQUESTED'
})

const services = { getRecord, putRecord, deleteRecord }

export function collapsedRecordCard <P extends CollapsedRecordCardSFCProps> (
  CollapsedRecordCard: SFC<P>
): ComponentClass<CollapsedRecordCardProps<P>> {
  return componentFromEvents<CollapsedRecordCardProps<P>,P>(
    CollapsedRecordCard,
    () => tap(console.log.bind(console,'collapsed-record-card:event:')),
    redux(reducer, requestPasswordOnConnect(services)),
    () => tap(console.log.bind(console,'collapsed-record-card:state:')),
    connect<CollapsedRecordCardState,CollapsedRecordCardSFCProps>(
      mapStateToProps,
      mapDispatchToProps
    ),
    () => tap(console.log.bind(console,'collapsed-record-card:view-props:'))
  )
}
