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
  AuthenticationFsmState,
  AuthenticationModalHocProps
} from './reducer'
import { authenticateOnAuthenticating } from './effects'
import componentFromEvents, {
  ComponentConstructor,
  Rest,
  SFC,
  connect,
  redux
} from 'component-from-events'
import { createActionDispatchers } from 'basic-fsa-factories'
import compose from 'basic-compose'
import {
  callHandlerOnEvent,
  focus,
  pluck,
  preventDefault,
  tapOnEvent
} from 'utils'
// import { tap } from 'rxjs/operators'
// const log = label => console.log.bind(console, label)

export type AuthenticationModalProps<
  P extends AuthenticationModalSFCProps
> = AuthenticationModalHocProps & Rest<P, AuthenticationModalSFCProps>

export interface AuthenticationModalSFCProps
  extends AuthenticationModalSFCHandlerProps {
  open?: boolean
  value?: string
  error?: boolean
  pending?: boolean
}

export interface AuthenticationModalSFCHandlerProps {
  onChange?: (value: string) => void
  onCancel?: (event: Event) => void
  onInputRef?: (target: HTMLElement) => void
  onSubmit?: (event: Event) => void
}

interface AuthenticationModalState extends AuthenticationModalHocProps {
  attrs: Partial<
    Pick<
      AuthenticationModalProps<AuthenticationModalSFCProps>,
      Exclude<
        keyof AuthenticationModalProps<AuthenticationModalSFCProps>,
        'onError' | 'onAuthenticated' | 'onCancelled' | 'session'
      >
    >
  >
  state: AuthenticationFsmState
  value?: string
  error?: string
  input?: HTMLElement
}

function mapStateToProps ({
  attrs,
  authenticate: open,
  value,
  error,
  state
}: AuthenticationModalState): Rest<
  AuthenticationModalSFCProps,
  AuthenticationModalSFCHandlerProps
> {
  return {
    ...attrs,
    open,
    value,
    error: !!error,
    pending: state === AuthenticationFsmState.Authenticating
  }
}

const mapDispatchToProps: (
  dispatch: (event: any) => void
) => AuthenticationModalSFCHandlerProps = createActionDispatchers({
  onChange: 'CHANGE',
  onCancel: 'CANCEL',
  onInputRef: 'INPUT_REF',
  onSubmit: ['SUBMIT', preventDefault]
})

export function authenticationModal<P extends AuthenticationModalSFCProps> (
  Modal: SFC<P>
): ComponentConstructor<AuthenticationModalProps<P>> {
  return componentFromEvents<AuthenticationModalProps<P>, P>(
    Modal,
    // () => tap(log('authentication-modal:event:')),
    redux(
      reducer,
      authenticateOnAuthenticating,
      callHandlerOnEvent('ERROR', 'onError'),
      callHandlerOnEvent('CANCEL', 'onCancelled'),
      callHandlerOnEvent('AUTHENTICATED', 'onAuthenticated'),
      tapOnEvent('UNAUTHORIZED', compose.into(0)(focus, pluck('1', 'input')))
    ),
    // () => tap(log('authentication-modal:state:')),
    connect<AuthenticationModalState, AuthenticationModalSFCProps>(
      mapStateToProps,
      mapDispatchToProps
    )
    // () => tap(log('authentication-modal:view-props:'))
  )
}
