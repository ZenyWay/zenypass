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
import { getAgentsOnAuthenticated } from './effects'
import { /* getAuthorizations$, */ AuthorizationDoc } from 'zenypass-service'
import componentFromEvents, {
  ComponentConstructor,
  Rest,
  SFC,
  connect,
  redux
} from 'component-from-events'
import { values } from 'utils'
import { createActionDispatchers } from 'basic-fsa-factories'
// import { tap } from 'rxjs/operators'

export type AgentAuthorizationsPageProps<
  P extends AgentAuthorizationsPageSFCProps
> = Rest<P, AgentAuthorizationsPageSFCProps>

export interface AgentAuthorizationsPageSFCProps
  extends AgentAuthorizationsPageSFCHandlerProps {
  agents?: AuthorizedAgentInfo[]
  error?: string
  authenticate?: boolean
}

export interface AgentAuthorizationsPageSFCHandlerProps {
  onCancel?: (err?: any) => void
  onAuthenticated?: (sessionId: string) => void
}

export interface AuthorizedAgentInfo {
  _id: string
  agent?: string
  date?: Date
}

interface AgentAuthorizationsPageState {
  props: AgentAuthorizationsPageProps<AgentAuthorizationsPageSFCProps>
  state: AutomataState
  authorizations?: { [_id: string]: AuthorizationDoc }
  error?: string
}

function mapStateToProps ({
  props,
  authorizations,
  state,
  error
}: AgentAuthorizationsPageState): Rest<
  AgentAuthorizationsPageSFCProps,
  AgentAuthorizationsPageSFCHandlerProps
> {
  const agents = values(authorizations).map(authorization => ({
    agent: authorization.identifier,
    date: new Date(authorization.certified),
    _id: `${authorization._id}/${authorization._rev}`
  }))

  return {
    ...props,
    agents,
    authenticate: state === 'authenticating',
    error
  }
}

const mapDispatchToProps: (
  dispatch: (event: any) => void
) => AgentAuthorizationsPageSFCHandlerProps = createActionDispatchers({
  onCancel: 'CANCEL',
  onAuthenticated: 'AUTHENTICATED'
})

export function agentAuthorizationsPage<
  P extends AgentAuthorizationsPageSFCProps
> (
  AgentAuthorizationsPage: SFC<P>
): ComponentConstructor<AgentAuthorizationsPageProps<P>> {
  return componentFromEvents<AgentAuthorizationsPageProps<P>, P>(
    AgentAuthorizationsPage,
    // () => tap(console.log.bind(console,'controlled-authorization-page-event:')),
    redux(reducer /*, getAgentsOnAuthenticated({ getAuthorizations$ }) */),
    // () => tap(console.log.bind(console,'controlled-authorization-page-state:')),
    connect<AgentAuthorizationsPageState, AgentAuthorizationsPageSFCProps>(
      mapStateToProps,
      mapDispatchToProps
    )
    // () => tap(console.log.bind(console,'controlled-authorization-page-props:'))
  )
}
