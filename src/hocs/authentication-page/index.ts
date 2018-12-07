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
  focusInputOnEvent,
  signinOrSignupOnSubmit,
  validateEmailOnEmailChange,
  validatePasswordOnPasswordChange,
  validateConfirmOnConfirmChange
} from './effects'
import componentFromEvents, {
  ComponentClass,
  Rest,
  SFC,
  connect,
  redux
} from 'component-from-events'
import { createActionDispatchers } from 'basic-fsa-factories'
import { callHandlerOnEvent, preventDefault, shallowEqual } from 'utils'
import { tap, distinctUntilChanged } from 'rxjs/operators'
const log = label => console.log.bind(console, label)

export type AuthenticationPageProps<P extends AuthenticationPageSFCProps> =
  AuthenticationPageHocProps & Rest<P, AuthenticationPageSFCProps>

export interface AuthenticationPageHocProps {
  signup?: boolean
  onToggleSignup?: (event: Event) => void
  onSuccess?: (...args: any[]) => void
  onError?: (error?: any) => void
}

export interface AuthenticationPageSFCProps
extends AuthenticationPageSFCHandlerProps {
  signup?: boolean
  emails?: DropdownItemSpec[]
  email?: InputProps
  password?: InputProps
  confirm?: InputProps
  cleartext?: boolean
  submittable?: boolean
  pending?: boolean
  error?: boolean
}

export interface InputProps {
  value?: string
  error?: boolean
  enabled?: boolean
}

export interface DropdownItemSpec {
  label?: string
  icon?: string[] | string
  [key: string]: unknown
}

export interface AuthenticationPageSFCHandlerProps {
  onChange?: (value: string, target: HTMLElement) => void
  onSelectEmail?: (item?: HTMLElement) => void
  onSubmit?: (event: Event) => void
  onToggleSignup?: (event: Event) => void
  onEmailInputRef?: (target: HTMLElement) => void
  onPasswordInputRef?: (target: HTMLElement) => void
  onConfirmInputRef?: (target: HTMLElement) => void
}

interface AuthenticationPageState {
  props: AuthenticationPageProps<AuthenticationPageSFCProps>
  state: AutomataState
  changes?: { [key in AuthenticationPageInputs]: string }
  inputs?: { [key in AuthenticationPageInputs]: HTMLElement }
}

type AuthenticationPageInputs = 'email' | 'password' | 'confirm'

type InputSpec = { [key in keyof InputProps]: boolean }

const INPUT_SPECS: { [k: string]: Partial<InputSpec> } = {
  DISABLED: { enabled: false, error: false },
  ENABLED: { enabled: true, error: false },
  INVALID: { enabled: true, error: true }
}

const STATE_TO_EMAIL_SPEC: { [state in Partial<AutomataState>]: InputSpec } = {
  email: INPUT_SPECS.ENABLED,
  error_email: INPUT_SPECS.INVALID,
  password: INPUT_SPECS.ENABLED,
  error_password: INPUT_SPECS.ENABLED,
  unauthorized: INPUT_SPECS.ENABLED,
  confirm: INPUT_SPECS.ENABLED,
  error_confirm: INPUT_SPECS.ENABLED,
  valid: INPUT_SPECS.ENABLED,
  pending: INPUT_SPECS.DISABLED
}

const STATE_TO_PASSWORD_SPEC: { [state in Partial<AutomataState>]: InputSpec } = {
  email: INPUT_SPECS.DISABLED,
  error_email: INPUT_SPECS.DISABLED,
  password: INPUT_SPECS.ENABLED,
  error_password: INPUT_SPECS.INVALID,
  unauthorized: INPUT_SPECS.ENABLED,
  confirm: INPUT_SPECS.ENABLED,
  error_confirm: INPUT_SPECS.ENABLED,
  valid: INPUT_SPECS.ENABLED,
  pending: INPUT_SPECS.DISABLED
}

const STATE_TO_CONFIRM_SPEC: { [state in Partial<AutomataState>]: InputSpec } = {
  email: INPUT_SPECS.DISABLED,
  error_email: INPUT_SPECS.DISABLED,
  password: INPUT_SPECS.DISABLED,
  error_password: INPUT_SPECS.DISABLED,
  unauthorized: INPUT_SPECS.DISABLED,
  confirm: INPUT_SPECS.ENABLED,
  error_confirm: INPUT_SPECS.INVALID,
  valid: INPUT_SPECS.ENABLED,
  pending: INPUT_SPECS.DISABLED
}

function mapStateToProps (
  { props, state, changes }: AuthenticationPageState
): Rest<AuthenticationPageSFCProps, AuthenticationPageSFCHandlerProps> {
  const { onSuccess, onError, ...attrs } =
    props as AuthenticationPageProps<AuthenticationPageSFCProps> &
      Rest<AuthenticationPageSFCProps, AuthenticationPageSFCHandlerProps>
  attrs.pending = state === 'pending'
  const emailSpec = STATE_TO_EMAIL_SPEC[state]
  attrs.email = {
    value: changes && changes.email,
    error: emailSpec.error,
    enabled: emailSpec.enabled
  }
  const passwordSpec = STATE_TO_PASSWORD_SPEC[state]
  attrs.password = {
    value: changes && changes.password,
    error: passwordSpec.error,
    enabled: passwordSpec.enabled
  }
  if (props.signup) {
    const confirmSpec = STATE_TO_CONFIRM_SPEC[state]
    attrs.confirm = {
      value: changes && changes.confirm,
      error: confirmSpec.error,
      enabled: confirmSpec.enabled
    }
  }
  attrs.submittable =
    props.signup ? attrs.confirm.enabled : attrs.password.enabled
  attrs.error = state === 'unauthorized'
  return attrs
}

const mapDispatchToProps:
(dispatch: (event: any) => void) => AuthenticationPageSFCHandlerProps =
createActionDispatchers({
  onChange: [
    'CHANGE',
    (value: string, input: HTMLElement) => ({ [input.dataset.id]: value })
  ],
  onSelectEmail: 'SELECT_EMAIL',
  onSubmit: ['SUBMIT', preventDefault],
  onToggleSignup: 'TOGGLE_SIGNUP',
  onEmailInputRef: ['INPUT_REF', inputRef('email')],
  onPasswordInputRef: ['INPUT_REF', inputRef('password')],
  onConfirmInputRef: ['INPUT_REF', inputRef('confirm')]
})

function inputRef (field: string) {
  return function (input: HTMLElement) {
    return { [field]: input } // input may be null (on component unmount)
  }
}

export function authenticationPage <P extends AuthenticationPageSFCProps> (
  AuthenticationPageSFC: SFC<P>
): ComponentClass<AuthenticationPageProps<P>> {
  return componentFromEvents<AuthenticationPageProps<P>, P>(
    AuthenticationPageSFC,
    () => tap(log('authentication-page:event:')),
    redux(
      reducer,
      validateEmailOnEmailChange,
      validatePasswordOnPasswordChange,
      validateConfirmOnConfirmChange,
      focusEmailInputOnMount,
      focusInputOnEvent('INVALID_EMAIL', 'email'),
      focusInputOnEvent('VALID_EMAIL', 'password'),
      focusInputOnEvent('INVALID_PASSWORD', 'password'),
      focusInputOnEvent('VALID_SIGNUP_PASSWORD', 'confirm'),
      focusInputOnEvent('INVALID_CONFIRM', 'confirm'),
      signinOrSignupOnSubmit,
      callHandlerOnEvent('TOGGLE_SIGNUP', ['props', 'onToggleSignup']),
      callHandlerOnEvent('SUCCESS', ['props', 'onSuccess']),
      callHandlerOnEvent('ERROR', ['props', 'onError'])
    ),
    () => tap(log('authentication-page:state:')),
    connect<AuthenticationPageState, AuthenticationPageSFCProps>(
      mapStateToProps,
      mapDispatchToProps
    ),
    () => distinctUntilChanged(shallowEqual),
    () => tap(log('authentication-page:view-props:'))
  )
}
