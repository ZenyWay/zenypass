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
import reducer, {
  AgentAuthorizationFsm,
  AgentAuthorizationHocProps
} from './reducer'
import {
  authorizeOnPendingAuthorization,
  generateTokenOnPendingToken
} from './effects'
import { modhex } from '../serialized-input/serializers'
import componentFromEvents, {
  ComponentConstructor,
  Rest,
  SFC,
  connect,
  logger,
  redux
} from 'component-from-events'
import { createActionDispatchers } from 'basic-fsa-factories'
import { callHandlerOnEvent } from 'utils'
const log = logger('agent-authorization')

export type AgentAuthorizationProps<
  P extends AgentAuthorizationSFCProps
> = AgentAuthorizationHocProps & Rest<P, AgentAuthorizationSFCProps>

export interface AgentAuthorizationSFCProps
  extends AgentAuthorizationSFCHandlerProps {
  pending?: boolean
  error?: string
  token?: string
}

export interface AgentAuthorizationSFCHandlerProps {
  onClick?: (event: MouseEvent) => void
}

interface AgentAuthorizationState extends AgentAuthorizationHocProps {
  attrs: { [prop: string]: unknown }
  state: AgentAuthorizationFsm
  token?: string
  error?: string
}

function mapStateToProps ({
  attrs,
  state,
  token,
  error
}: AgentAuthorizationState): Rest<
  AgentAuthorizationSFCProps,
  AgentAuthorizationSFCHandlerProps
> {
  return {
    ...attrs,
    error,
    pending: state === AgentAuthorizationFsm.Authorizing,
    token: token && modhex.stringify(token)
  }
}

const mapDispatchToProps: (
  dispatch: (event: any) => void
) => AgentAuthorizationSFCHandlerProps = createActionDispatchers({
  onClick: 'CLICK',
  onAuthenticated: 'AUTHENTICATED'
})

export function agentAuthorization<P extends AgentAuthorizationSFCProps> (
  AgentAuthorizationCard: SFC<P>
): ComponentConstructor<AgentAuthorizationProps<P>> {
  return componentFromEvents<AgentAuthorizationProps<P>, P>(
    AgentAuthorizationCard,
    log('event'),
    redux(
      reducer,
      generateTokenOnPendingToken,
      authorizeOnPendingAuthorization,
      callHandlerOnEvent('ERROR', 'onError')
    ),
    log('state'),
    connect<AgentAuthorizationState, AgentAuthorizationSFCProps>(
      mapStateToProps,
      mapDispatchToProps
    ),
    log('view-props')
  )
}
