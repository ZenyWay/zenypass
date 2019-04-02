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
import reducer, { AgentAuthorizationsHocProps } from './reducer'
import { injectAgentsFromService } from './effects'
import componentFromEvents, {
  ComponentConstructor,
  Rest,
  SFC,
  connect,
  redux
} from 'component-from-events'
import {
  createActionDispatchers,
  createActionFactory
} from 'basic-fsa-factories'
import { callHandlerOnEvent, tapOnEvent } from 'utils'
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
}

export interface AgentAuthorizationsSFCHandlerProps {
  onAuthenticationRequest?: (res$: Observer<string>) => void
  onAuthorization?: (pending?: boolean) => void
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
  agents?: IndexedAgentEntry[]
}

function mapStateToProps ({
  attrs,
  agents,
  session,
  onAuthenticationRequest,
  onError
}: AgentAuthorizationsState): AgentAuthorizationsSFCProps {
  return { ...attrs, agents, session, onAuthenticationRequest, onError }
}

const authorizing = createActionFactory('AUTHORIZING')
const notAuthorizing = createActionFactory('NOT_AUTHORIZING')

export function agentAuthorizations<P extends AgentAuthorizationsSFCProps> (
  AgentAuthorizationsPage: SFC<P>
): ComponentConstructor<AgentAuthorizationsProps<P>> {
  return componentFromEvents<AgentAuthorizationsProps<P>, P>(
    AgentAuthorizationsPage,
    () => tap(log('agent-authorizations:event:')),
    redux(
      reducer,
      injectAgentsFromService,
      // work-around for Safari scrolling to bottom when starting authorization
      tapOnEvent('AUTHORIZING', () => window.scrollTo(0, 0)),
      callHandlerOnEvent('ERROR', 'onError')
    ),
    () => tap(log('agent-authorizations:state:')),
    connect<AgentAuthorizationsState, AgentAuthorizationsSFCProps>(
      mapStateToProps,
      createActionDispatchers({
        onAuthorization: pending => (pending ? authorizing : notAuthorizing)()
      })
    ),
    () => tap(log('agent-authorizations:props:'))
  )
}
