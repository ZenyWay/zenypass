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
import { getAuthorizations$, AuthorizationDoc } from '../../../stubs/stubs_service'
import componentFromEvents, { redux, connect, SFC, ComponentClass } from '../../component-from-events'
import { createActionDispatchers } from 'basic-fsa-factories'
import { tap } from 'rxjs/operators'
import { getAgentsOnAuthenticated } from './effects'

export interface ControlledAuthorizationPageProps {
  [prop: string]: any
}

export interface AuthorizationPageProps {
  agents?: AuthorizedAgentInfo[]
  error?: string
  authenticate?: boolean
  onCancel?: (err?: any) => void
  onAuthenticated?: (sessionId: string) => void
}

export interface AuthorizedAgentInfo {
  key: string
  agent: string
  date: Date
}

interface AuthorizationPageState {
  props: Partial<ControlledAuthorizationPageProps>
  state: 'default' | 'authenticating'
  authorizations?: AuthorizationDoc[]
  error?: string
}

const values = obj => Object.keys(obj || {}).map(key => obj[key])

function mapStateToProps ({ props, authorizations, state, error }: AuthorizationPageState) {
  const agents = values(authorizations).map(authorization => ({
    'agent': authorization.identifier,
    'date': new Date(authorization.certified),
    'key': `${authorization._id}/${authorization._rev}`
  } as AuthorizedAgentInfo))

  return {
    ...props,
    agents,
    authenticate: state === 'authenticating',
    error
  }
}

const mapDispatchToProps = createActionDispatchers({
  onCancel: 'CANCEL',
  onAuthenticated: 'AUTHENTICATED'
})

export default function <P extends AuthorizationPageProps>(
  AuthorizationPage: SFC<P>
): any {
  const ControlledAuthorizationPage = componentFromEvents(
    AuthorizationPage,
    // () => tap(console.log.bind(console,'controlled-authorization-page-event:')),
    redux(reducer, getAgentsOnAuthenticated({ getAuthorizations$ })),
    // () => tap(console.log.bind(console,'controlled-authorization-page-state:')),
    connect(mapStateToProps, mapDispatchToProps)
    // () => tap(console.log.bind(console,'controlled-authorization-page-props:'))
  )

  return ControlledAuthorizationPage
}
