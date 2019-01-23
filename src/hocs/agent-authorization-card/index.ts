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
import { getTokenOnAuthenticated } from './effects'
// import { authorize } from 'zenypass-service'
import componentFromEvents, {
  ComponentConstructor,
  Rest,
  SFC,
  connect,
  redux
} from 'component-from-events'
import { createActionDispatchers } from 'basic-fsa-factories'
// import { tap } from 'rxjs/operators'

export type AgentAuthorizationCardProps<
  P extends AgentAuthorizationCardSFCProps
> = Rest<P, AgentAuthorizationCardSFCProps>

export interface AgentAuthorizationCardSFCProps
  extends AgentAuthorizationCardSFCHandlerProps {
  authenticate?: boolean
  pending?: boolean
  error?: string
  token?: string
}

export interface AgentAuthorizationCardSFCHandlerProps {
  onCancel?: () => void
  onClick?: (event: MouseEvent) => void
  onAuthenticated?: (sessionId: string) => void
}

interface AgentAuthorizationCardState {
  props: { [prop: string]: unknown }
  state: AutomataState
  token?: string
  error?: string
}

function mapStateToProps ({
  props,
  state,
  token,
  error
}: AgentAuthorizationCardState): Rest<
  AgentAuthorizationCardSFCProps,
  AgentAuthorizationCardSFCHandlerProps
> {
  return {
    ...props,
    error,
    pending: state === 'authorizing',
    authenticate: state === 'authenticating',
    token: state === 'authorizing' ? token : ''
  }
}

const mapDispatchToProps: (
  dispatch: (event: any) => void
) => AgentAuthorizationCardSFCHandlerProps = createActionDispatchers({
  onClick: 'CLICK',
  onCancel: 'CANCEL',
  onAuthenticated: 'AUTHENTICATED'
})

export function agentAuthorizationCard<
  P extends AgentAuthorizationCardSFCProps
> (
  AgentAuthorizationCard: SFC<P>
): ComponentConstructor<AgentAuthorizationCardProps<P>> {
  return componentFromEvents<AgentAuthorizationCardProps<P>, P>(
    AgentAuthorizationCard,
    // () => tap(console.log.bind(console,'controlled-authorization-card:event:')),
    redux(reducer /*, getTokenOnAuthenticated({ authorize }) */),
    // () => tap(console.log.bind(console,'controlled-authorization-card:state:')),
    connect<AgentAuthorizationCardState, AgentAuthorizationCardSFCProps>(
      mapStateToProps,
      mapDispatchToProps
    )
    // () => tap(console.log.bind(console,'controlled-authorization-card:view-props:'))
  )
}
