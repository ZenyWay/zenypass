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
import { getTokenOnClickFromInit } from './effects'
import { authorize } from '../../../stubs/stubs_service'
import componentFromEvents, { redux, connect, SFC, ComponentClass } from '../../component-from-events'
import { createActionDispatchers } from 'basic-fsa-factories'
import { tap } from 'rxjs/operators'

export interface ControlledAuthorizationProps {
  [prop: string]: any
}

type AuthorizationState = 'init' | 'authenticating' | 'auth_request' | 'authorizing'

interface ControlledAuthorizationState {
  props: ControlledAuthorizationProps,
  state: AuthorizationState
  token?: string,
  error?: string,
}

function mapStateToProps ({ props, state, token, error }: ControlledAuthorizationState) {
  return {
    ...props,
    error,
    pending: state === 'authorizing',
    authenticate: state === 'authenticating',
    token: state === 'authorizing' ? token : ''
  }
}

const mapDispatchToProps = createActionDispatchers({
  onClick: 'CLICK',
  onCancel: 'CANCEL',
  onAuthenticated: 'AUTHENTICATED'
})

export interface AuthorizationCardProps {
  authenticate?: boolean,
  pending?: boolean,
  error?: string,
  token?: string,
  onCancel: (err?: any) => void,
  onClick: () => void,
  onAuthenticated: (event: Event) => void
}

export default function<P extends AuthorizationCardProps>(
  AccessAuthorization: SFC<P>
): ComponentClass<ControlledAuthorizationProps> {
  const Access = componentFromEvents<ControlledAuthorizationProps,P>(
    AccessAuthorization,
    // () => tap(console.log.bind(console,'controlled-authorization-card:event:')),
    redux(reducer, getTokenOnClickFromInit({ authorize })),
    // () => tap(console.log.bind(console,'controlled-authorization-card:state:')),
    connect(mapStateToProps, mapDispatchToProps)
    // () => tap(console.log.bind(console,'controlled-authorization-card:view-props:'))
  )

  return Access
}
