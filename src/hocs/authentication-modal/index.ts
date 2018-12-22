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
import { authenticateOnTransitionToAuthenticating } from './effects'
import componentFromEvents, {
  ComponentConstructor,
  Rest,
  SFC,
  connect,
  redux
} from 'component-from-events'
import { callHandlerOnEvent, preventDefault } from 'utils'
import { createActionDispatchers } from 'basic-fsa-factories'
// import { tap } from 'rxjs/operators'
// const log = label => console.log.bind(console, label)

export type AuthenticationModalProps<P extends AuthenticationModalSFCProps> =
  AuthenticationModalHocProps & Rest<P, AuthenticationModalSFCProps>

export interface AuthenticationModalHocProps {
  authenticate?: boolean
  session?: string
  onCancelled?: () => void
  onAuthenticated?: (sessionId: string) => void
}

export interface AuthenticationModalSFCProps extends AuthenticationModalSFCHandlerProps {
  open?: boolean
  value?: string
  error?: boolean
  pending?: boolean,
}

export interface AuthenticationModalSFCHandlerProps {
  onChange?: (value: string) => void,
  onCancel?: (event: Event) => void,
  onSubmit?: (event: Event) => void
}

interface AuthenticationModalState {
  props: AuthenticationModalHocProps & { [prop: string]: unknown }
  state: AutomataState
  session?: string
  value?: string
  error?: string
}

function mapStateToProps (
  { props, value, error, state }: AuthenticationModalState
): Rest<AuthenticationModalSFCProps, AuthenticationModalSFCHandlerProps> {
  const { authenticate: open, onCancelled, onAuthenticated, ...attrs } = props
  return {
    ...attrs,
    open,
    value,
    error: !!error,
    pending: state === 'authenticating'
  }
}

const mapDispatchToProps:
(dispatch: (event: any) => void) => AuthenticationModalSFCHandlerProps =
createActionDispatchers({
  onChange: 'CHANGE',
  onCancel: 'CANCEL',
  onSubmit: ['AUTHENTICATION_REQUESTED', preventDefault]
})

export function authenticationModal <P extends AuthenticationModalSFCProps> (
  Modal: SFC<P>
): ComponentConstructor<AuthenticationModalProps<P>> {
  return componentFromEvents<AuthenticationModalProps<P>, P>(
    Modal,
    // () => tap(log('authentication-modal:event:')),
    redux(
      reducer,
      authenticateOnTransitionToAuthenticating,
      callHandlerOnEvent('CANCEL', ['props', 'onCancelled']),
      callHandlerOnEvent('AUTHENTICATION_RESOLVED', ['props', 'onAuthenticated'])
    ),
    // () => tap(log('authentication-modal:state:')),
    connect<AuthenticationModalState, AuthenticationModalSFCProps>(
      mapStateToProps,
      mapDispatchToProps
    )
    // () => tap(log('authentication-modal:view-props:'))
  )
}
