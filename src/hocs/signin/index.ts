/**
 * Copyright 2018 ZenyWay S.A.S., Stephane M. Catala
 * @author Stephane M. Catala
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

import { reducer, AutomataState } from './reducer'
import {
  focusEmailInputOnMount,
  focusPasswordInputOnValidEmailAndNoPassword,
  signinOnSubmit,
  validateEmailOnEmailChange
} from './effects'
import componentFromEvents, {
  ComponentClass,
  Rest,
  SFC,
  connect,
  redux
} from 'component-from-events'
import {
  createActionDispatchers,
  createActionFactories,
  createActionFactory
} from 'basic-fsa-factories'
import {
  callHandlerOnEvent,
  newStatusError,
  preventDefault,
  shallowEqual
} from 'utils'
import { tap, distinctUntilChanged } from 'rxjs/operators'
const log = label => console.log.bind(console, label)

export type SigninProps<P extends SigninSFCProps> =
  SigninHocProps & Rest<P, SigninSFCProps>

export interface SigninHocProps {
  onAuthenticated?: (sessionId: string) => void
}

export interface SigninSFCProps
extends SigninSFCHandlerProps {
  state?: AutomataState
  emails?: DropdownItemSpec[]
  valid?: boolean
  email?: string
  password?: string
  confirm?: string
  cleartext?: boolean
  error?: boolean
}

export interface DropdownItemSpec {
  label?: string
  icon?: string[] | string
  [key: string]: unknown
}

export interface SigninSFCHandlerProps {
  onChange?: (value: string, target: HTMLElement) => void
  onSelectEmail?: (item?: HTMLElement) => void
  onSubmit?: (event: Event) => void
  onToggleFocus?: (event: Event) => void
  onEmailInputRef?: (target: HTMLElement) => void
  onPasswordInputRef?: (target: HTMLElement) => void
  onConfirmInputRef?: (target: HTMLElement) => void
}

interface SigninState {
  props: SigninProps<SigninSFCProps>
  state: AutomataState
  changes?: { [key in SigninInputs]: string }
  inputs?: { [key in SigninInputs]: HTMLElement }
  error?: string
}

type SigninInputs = 'email' | 'password' | 'confirm'

function mapStateToProps (
  { props, state, changes, error }: SigninState
): Rest<SigninSFCProps, SigninSFCHandlerProps> {
  return { ...props, ...changes, valid: state !== 'invalid', error: !!error }
}

const TOGGLE_FOCUS_ACTIONS = createActionFactories({
  email: 'TOGGLE_EMAIL_FOCUS',
  password: 'TOGGLE_PASSWORD_FOCUS'
})
const error = createActionFactory('ERROR')

const mapDispatchToProps:
(dispatch: (event: any) => void) => SigninSFCHandlerProps =
createActionDispatchers({
  onChange: [
    'CHANGE',
    (value: string, input: HTMLElement) => ({ [input.dataset.id]: value })
  ],
  onSelectEmail: 'SELECT_EMAIL',
  onSubmit: ['SUBMIT', preventDefault],
  onToggleFocus ({ currentTarget: input }: { currentTarget: HTMLElement }) {
    const action = input && TOGGLE_FOCUS_ACTIONS[input.dataset.id]
    return action ? action(input) : error(newStatusError())
  },
  onEmailInputRef: ['INPUT_REF', input => ({ email: input })],
  onPasswordInputRef: ['INPUT_REF', input => ({ password: input })],
  onConfirmInputRef: ['INPUT_REF', input => ({ confirm: input })]
})

export function signin <P extends SigninSFCProps> (
  SigninSFC: SFC<P>
): ComponentClass<SigninProps<P>> {
  return componentFromEvents<SigninProps<P>, P>(
    SigninSFC,
    () => tap(log('signin:event:')),
    redux(
      reducer,
      validateEmailOnEmailChange,
      focusEmailInputOnMount,
      focusPasswordInputOnValidEmailAndNoPassword,
      signinOnSubmit,
      callHandlerOnEvent('onAuthenticated', 'AUTHENTICATED')
    ),
    () => tap(log('signin:state:')),
    connect<SigninState, SigninSFCProps>(
      mapStateToProps,
      mapDispatchToProps
    ),
    () => distinctUntilChanged(shallowEqual),
    () => tap(log('signin:view-props:'))
  )
}
