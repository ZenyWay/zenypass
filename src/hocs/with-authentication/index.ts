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
import { plugResponse } from './effects'
import componentFromEvents, {
  ComponentClass,
  Rest,
  SFC,
  connect,
  redux
} from 'component-from-events'
import { createActionDispatchers } from 'basic-fsa-factories'
import { Observer } from 'rxjs'
import { tap } from 'rxjs/operators'

export type AuthenticationProviderProps<P extends AuthenticationProviderSFCProps> =
  Rest<P, AuthenticationProviderSFCProps>

export interface AuthenticationProviderSFCProps extends AuthenticationProviderSFCHandlerProps {
  authenticate?: boolean
}

export interface AuthenticationProviderSFCHandlerProps {
  onAuthenticationRequest?: (res$: Observer<string>) => void
  onAuthenticationResolved?: () => void
  onAuthenticationRejected?: () => void
}

interface AuthenticationProviderState {
  props: { [prop: string]: unknown }
  authenticate
}

function mapStateToProps (
  { props, authenticate }: AuthenticationProviderState
): Rest<AuthenticationProviderSFCProps, AuthenticationProviderSFCHandlerProps> {
  return { ...props, authenticate }
}

const mapDispatchToProps:
(dispatch: (event: any) => void) => AuthenticationProviderSFCHandlerProps =
createActionDispatchers({
  onAuthenticationRequest: 'AUTHENTICATION_REQUESTED',
  onAuthenticationRejected: 'AUTHENTICATION_REJECTED',
  onAuthenticationResolved: 'AUTHENTICATION_RESOLVED'
})

export function withAuthentication <P extends AuthenticationProviderSFCProps> (
  AuthenticationProviderSFC: SFC<P>
): ComponentClass<AuthenticationProviderProps<P>> {
  return componentFromEvents<AuthenticationProviderProps<P>, P>(
    AuthenticationProviderSFC,
    () => tap(console.log.bind(console, 'authentication-provider:event:')),
    redux(
      reducer,
      plugResponse
    ),
    () => tap(console.log.bind(console, 'authentication-provider:state:')),
    connect<AuthenticationProviderState, AuthenticationProviderSFCProps>(
      mapStateToProps,
      mapDispatchToProps
    ),
    () => tap(console.log.bind(console, 'authentication-provider:view-props:'))
  )
}
