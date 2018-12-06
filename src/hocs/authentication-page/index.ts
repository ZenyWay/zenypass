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
  validateConfirmOnConfirmChange,
  validConfirmOnValidPasswordWhenSignin
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
  email?: InputSpec
  password?: InputSpec
  confirm?: InputSpec
  cleartext?: boolean
  valid?: boolean
  pending?: boolean
  error?: boolean
}

export interface InputSpec {
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
  errors?: { [key in AuthenticationPageInputs | 'service']: boolean }
}

type AuthenticationPageInputs = 'email' | 'password' | 'confirm'

function mapStateToProps (
  { props, state, changes, errors }: AuthenticationPageState
): Rest<AuthenticationPageSFCProps, AuthenticationPageSFCHandlerProps> {
  const { onSuccess, onError, ...attrs } =
    props as AuthenticationPageProps<AuthenticationPageSFCProps> &
      Rest<AuthenticationPageSFCProps, AuthenticationPageSFCHandlerProps>
  attrs.pending = state === 'pending'
  attrs.email = {
    value: changes && changes.email,
    error: errors && errors.email,
    enabled: !attrs.pending
  }
  attrs.password = {
    value: changes && changes.password,
    error: errors && errors.password,
    enabled: attrs.email.enabled && state !== 'credentials' && state !== 'email'
  }
  if (props.signup) {
    attrs.confirm = {
      value: changes && changes.confirm,
      error: errors && errors.confirm,
      enabled: attrs.password.enabled && state !== 'password'
    }
  }
  attrs.valid = attrs.pending || state === 'valid'
  attrs.error = errors && errors.service
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
      validConfirmOnValidPasswordWhenSignin,
      focusEmailInputOnMount,
      focusInputOnEvent('INVALID_EMAIL', 'email'),
      focusInputOnEvent('VALID_EMAIL', 'password'),
      focusInputOnEvent('INVALID_PASSWORD', 'password'),
      focusInputOnEvent('VALID_PASSWORD', 'confirm'),
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
