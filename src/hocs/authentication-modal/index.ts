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
import { authenticateOnSubmit, callOnCancel } from './effects'
import componentFromEvents, {
  ComponentClass,
  Rest,
  SFC,
  connect,
  redux
} from 'component-from-events'
import { authenticate } from 'services'
import { preventDefault } from 'utils'
import { createActionDispatchers } from 'basic-fsa-factories'
// import { tap } from 'rxjs/operators'

export type AuthenticationModalProps<P extends AuthenticationModalSFCProps> =
  AuthenticationModalControllerProps & Rest<P, AuthenticationModalSFCProps>

export interface AuthenticationModalControllerProps {
  value?: string
  onCancel?: (err?: any) => void
  onAuthenticated?: (sessionId: string) => void
}

export interface AuthenticationModalSFCProps extends AuthenticationModalSFCHandlerProps {
  value?: string
  error?: boolean,
  pending?: boolean,
}

export interface AuthenticationModalSFCHandlerProps {
  onChange?: (value: string) => void,
  onCancel?: (event: Event) => void,
  onSubmit?: (event: Event) => void
}

interface AuthenticationModalState {
  props: AuthenticationModalControllerProps & { [prop: string]: unknown }
  state: AutomataState
  value: string
}

function mapStateToProps (
  { props, value, state }: AuthenticationModalState
): Rest<AuthenticationModalSFCProps, AuthenticationModalSFCHandlerProps> {
  const { onCancel, onAuthenticated, ...attrs } = props
  return {
    ...attrs,
    value: state === 'pristine' ? props.value : value,
    pending: state === 'authenticating',
    error: state === 'error'
  }
}

const mapDispatchToProps:
(dispatch: (event: any) => void) => AuthenticationModalSFCHandlerProps =
createActionDispatchers({
  onChange: 'CHANGE',
  onCancel: 'CANCEL',
  onSubmit: ['SUBMIT', preventDefault]
})

export function authenticationModal <P extends AuthenticationModalSFCProps> (
  Modal: SFC<P>
): ComponentClass<AuthenticationModalProps<P>> {
  return componentFromEvents<AuthenticationModalProps<P>, P>(
    Modal,
    // () => tap(console.log.bind(console, 'controlled-authentication-modal:event:')),
    redux(reducer, authenticateOnSubmit({ authenticate }), callOnCancel),
    // () => tap(console.log.bind(console, 'controlled-authentication-modal:state:')),
    connect<AuthenticationModalState, AuthenticationModalSFCProps>(
      mapStateToProps,
      mapDispatchToProps
    )
    // () => tap(console.log.bind(console, 'controlled-authentication-modal:view-props:'))
  )
}
