/**
 * @license
 * Copyright 2018 Stephane M. Catala
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
import { authenticateOnSubmit, callOnCancel } from './effects'
import componentFromEvents, {
  Children,
  Component,
  ComponentClass,
  ComponentFromStreamConstructor,
  SFC,
  connect,
  redux
} from '../../component-from-events'
import { preventDefault } from 'utils'
import { authenticate } from '../../../stubs/stubs_service'
import { tap } from 'rxjs/operators'
import { createActionDispatchers } from 'basic-fsa-factories'

export {
  Children,
  Component,
  ComponentFromStreamConstructor,
  SFC
}

export interface ControlledAuthenticationModalProps {
  open?: boolean
  value?: string
  onCancel?: (err?: any) => void
  onAuthenticated?: (sessionId: string) => void
  [prop: string]: any
}

interface ControlledAuthenticationModalState {
  props: ControlledAuthenticationModalProps
  state: 'pristine' | 'dirty' | 'error' | 'authenticating'
  value?: string
}

function mapStateToProps (
  { props, value, state }: ControlledAuthenticationModalState
): Partial<ControlledAuthenticationModalProps> {
  return {
    ...props,
    value: state === 'pristine' ? props.value : value,
    pending: state === 'authenticating',
    error: state === 'error'
  }
}

const mapDispatchToProps = createActionDispatchers({
  onChange: 'CHANGE',
  onCancel: 'CANCEL',
  onSubmit: ['SUBMIT', preventDefault]
})

export interface AuthenticationModalProps {
  open?: boolean
  value: string
  error: boolean,
  pending: boolean,
  onChange: (value: string) => void,
  onCancel: () => void,
  onSubmit: (event: Event) => void
}

export default function <P extends AuthenticationModalProps>(
  Modal: SFC<P>
): ComponentClass<
  ControlledAuthenticationModalProps & { [K in Exclude<keyof P, 'onInput'>]: P[K] }
> {
  const ControlledInput = componentFromEvents<
  ControlledAuthenticationModalProps & { [K in Exclude<keyof P, 'onInput'>]: P[K] },
  P
>(
  Modal,
  // () => tap(console.log.bind(console, 'controlled-authentication-modal:event:')),
  redux(reducer, authenticateOnSubmit({ authenticate }), callOnCancel),
  // () => tap(console.log.bind(console, 'controlled-authentication-modal:state:')),
  connect(mapStateToProps, mapDispatchToProps)
  // () => tap(console.log.bind(console, 'controlled-authentication-modal:view-props:'))
)

  return ControlledInput
}
