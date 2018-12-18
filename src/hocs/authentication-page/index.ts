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
  toggleSignupOnSignupPropChange,
  serviceSigninOnSigninFromValid,
  serviceSignupOnSignupFromConsentsWhenAccepted,
  validateEmailOnEmailPropChange,
  validatePasswordOnChangePassword,
  validateConfirmOnChangeConfirm
} from './effects'
import componentFromEvents, {
  ComponentClass,
  Rest,
  SFC,
  connect,
  redux
} from 'component-from-events'
import { createActionDispatchers, createActionFactories } from 'basic-fsa-factories'
import {
  callHandlerOnEvent,
  preventDefault,
  shallowEqual
} from 'utils'
import { tap, distinctUntilChanged } from 'rxjs/operators'
const log = label => console.log.bind(console, label)

export type AuthenticationPageProps<P extends AuthenticationPageSFCProps> =
  AuthenticationPageHocProps & Rest<P, AuthenticationPageSFCProps>

export enum AuthenticationPageType {
  Signin = 'signin',
  Signup = 'signup',
  Authorize = 'authorize'
}

export interface AuthenticationPageHocProps {
  type?: AuthenticationPageType
  email?: string
  onAuthenticated?: (session?: string) => void
  onAuthenticationPageType?: (type?: AuthenticationPageType) => void
  onEmailChange?: (email?: string) => void
  onError?: (error?: any) => void
}

export interface AuthenticationPageSFCProps
extends AuthenticationPageSFCHandlerProps {
  type?: AuthenticationPageType
  consents?: boolean
  created?: boolean
  emails?: DropdownItemSpec[]
  email?: string
  password?: string
  confirm?: string // confirm (signup) or token (authorize)
  terms?: boolean
  news?: boolean
  cleartext?: boolean
  /**
   * email: email field enabled; password, confirm and submit disabled
   *
   * password: email and password field enabled; confirm and submit disabled
   *
   * true: all enabled
   *
   * false: all disabled
   */
  enabled?: SigninInputs | boolean
  pending?: boolean
  error?: SignupInputs | 'unauthorized' | false
}

export type SignupInputs = SigninInputs | 'confirm'
export type SigninInputs = 'email' | 'password'
export type ConsentInputs = 'terms' | 'news'

export interface DropdownItemSpec {
  label?: string
  icon?: string[] | string
  [key: string]: unknown
}

export interface AuthenticationPageSFCHandlerProps {
  onCancelConsents?: (event: Event) => void
  onChange?: (value: string, target: HTMLElement) => void
  onSelectEmail?: (item?: HTMLElement) => void
  onSignin?: (event: Event) => void
  onSignup?: (event: Event) => void
  onToggleConsent?: (event: Event) => void
  onToggleSignup?: (event: Event) => void
  onEmailInputRef?: (target: HTMLElement) => void
  onPasswordInputRef?: (target: HTMLElement) => void
  onConfirmInputRef?: (target: HTMLElement) => void
}

interface AuthenticationPageState {
  props: AuthenticationPageProps<AuthenticationPageSFCProps>
  state: AutomataState
  inputs?: { [key in SignupInputs]: HTMLElement }
  password?: string
  confirm?: string
  terms?: boolean
  news?: boolean
  created?: boolean
  error?: SignupInputs | 'unauthorized' | false
}

/**
 * signup only
 */
const STATE_TO_ENABLED: Partial<{
  [key in AutomataState]: SigninInputs | boolean
}> = {
  email: 'email',
  password: 'password',
  confirm: true,
  valid: true,
  consents: false,
  pending: false
}

function mapStateToProps (
  { props, state, created, error, inputs, ...changes }: AuthenticationPageState
): Rest<AuthenticationPageSFCProps, AuthenticationPageSFCHandlerProps> {
  const {
    onAuthenticated,
    onAuthenticationPageType: onAuthenticationPageMode,
    onEmailChange,
    onError,
    ...attrs
  } = props
  const enabled = STATE_TO_ENABLED[state]
  return {
    ...attrs,
    ...changes,
    consents: state === 'consents',
    pending: state === 'pending',
    enabled: (props.type === 'signin') && (enabled === 'password') || enabled,
    created,
    error
  }
}

const change = createActionFactories({
  email: 'CHANGE_EMAIL',
  password: 'CHANGE_PASSWORD',
  confirm: 'CHANGE_CONFIRM'
})

const mapDispatchToProps:
(dispatch: (event: any) => void) => AuthenticationPageSFCHandlerProps =
createActionDispatchers({
  onCancelConsents: 'CANCEL_CONSENTS',
  onChange:
    (value: string, input: HTMLElement) => change[input.dataset.id](value),
  onSelectEmail: 'SELECT_EMAIL',
  onSignin: ['SIGNIN', preventDefault],
  onSignup: ['SIGNUP', preventDefault],
  onToggleSignup: 'TOGGLE_SIGNUP_REQUEST',
  onToggleConsent: [
    'TOGGLE_CONSENT',
    ({ currentTarget }) => currentTarget.dataset.id
  ],
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
      toggleSignupOnSignupPropChange,
      validateEmailOnEmailPropChange,
      validatePasswordOnChangePassword,
      validateConfirmOnChangeConfirm,
      focusEmailInputOnMount,
      focusInputOnEvent('INVALID_EMAIL', 'email'),
      focusInputOnEvent('VALID_EMAIL', 'password'),
      focusInputOnEvent('INVALID_PASSWORD', 'password'),
      focusInputOnEvent('VALID_SIGNUP_PASSWORD', 'confirm'),
      focusInputOnEvent('INVALID_CONFIRM', 'confirm'),
      focusInputOnEvent('UNAUTHORIZED', 'password'),
      serviceSigninOnSigninFromValid,
      serviceSignupOnSignupFromConsentsWhenAccepted,
      callHandlerOnEvent('TOGGLE_SIGNUP_REQUEST', ['props', 'onToggleSignup']),
      callHandlerOnEvent('AUTHENTICATED', ['props', 'onAuthenticated']),
      callHandlerOnEvent('CHANGE_EMAIL', ['props', 'onEmailChange']),
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
