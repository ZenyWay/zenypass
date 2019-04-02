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
  AgentAuthorizationsFsm,
  AgentAuthorizationsHocProps
} from './reducer'
import { debounceOnAgent, injectAgentsFromService } from './effects'
import componentFromEvents, {
  ComponentConstructor,
  Rest,
  SFC,
  connect,
  redux
} from 'component-from-events'
import { createActionDispatchers } from 'basic-fsa-factories'
import { callHandlerOnEvent } from 'utils'
import { tap } from 'rxjs/operators'
import { Observer } from 'rxjs'
const log = label => console.log.bind(console, label)

export type AgentAuthorizationsProps<
  P extends AgentAuthorizationsSFCProps
> = AgentAuthorizationsHocProps & Rest<P, AgentAuthorizationsSFCProps>

export interface AgentAuthorizationsSFCProps
  extends AgentAuthorizationsSFCHandlerProps {
  agents?: IndexedAgentEntry[]
  session?: string
  init?: boolean
}

export interface AgentAuthorizationsSFCHandlerProps {
  onAuthenticationRequest?: (res$: Observer<string>) => void
  onError?: (error: any) => void
}

export interface IndexedAgentEntry {
  _id: string
  agent: AuthorizedAgentInfo
}

export interface AuthorizedAgentInfo {
  _id: string
  identifier?: string
  certified?: number
}

interface AgentAuthorizationsState extends AgentAuthorizationsHocProps {
  attrs: AgentAuthorizationsProps<AgentAuthorizationsSFCProps>
  state: AgentAuthorizationsFsm
  agents?: IndexedAgentEntry[]
}

function mapStateToProps ({
  attrs,
  state,
  agents,
  session,
  onAuthenticationRequest,
  onError
}: AgentAuthorizationsState): AgentAuthorizationsSFCProps {
  const init = state === AgentAuthorizationsFsm.Init
  return { ...attrs, agents, init, session, onAuthenticationRequest, onError }
}

export function agentAuthorizations<P extends AgentAuthorizationsSFCProps> (
  AgentAuthorizationsPage: SFC<P>
): ComponentConstructor<AgentAuthorizationsProps<P>> {
  return componentFromEvents<AgentAuthorizationsProps<P>, P>(
    AgentAuthorizationsPage,
    () => tap(log('agent-authorizations:event:')),
    redux(
      reducer,
      injectAgentsFromService,
      debounceOnAgent,
      callHandlerOnEvent('ERROR', 'onError')
    ),
    () => tap(log('agent-authorizations:state:')),
    connect<AgentAuthorizationsState, AgentAuthorizationsSFCProps>(
      mapStateToProps,
      createActionDispatchers({
        /* no handlers */
      })
    ),
    () => tap(log('agent-authorizations:props:'))
  )
}
