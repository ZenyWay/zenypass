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
  AuthenticationPageType,
  callAuthenticationPageTypeHandlerOnStatePagePending,
  focusEmailInputOnMount,
  focusInputOnEvent,
  signupOrSigninOrAuthorizeOnTypePropChange,
  serviceSigninOnSubmitFromSigninSubmitting,
  serviceSignupOnSubmitFromSignupSubmitting,
  validateEmailOnEmailPropChange,
  validatePasswordOnChangePassword,
  validateConfirmOnChangeConfirm
} from './effects'
import componentFromEvents, {
  ComponentConstructor,
  Rest,
  SFC,
  connect,
  redux
} from 'component-from-events'
import {
  createActionDispatchers,
  createActionFactories
} from 'basic-fsa-factories'
import { callHandlerOnEvent, preventDefault, shallowEqual } from 'utils'
import { tap, distinctUntilChanged } from 'rxjs/operators'
const log = label => console.log.bind(console, label)

export type AuthenticationPageProps<
  P extends AuthenticationPageSFCProps
> = AuthenticationPageHocProps & Rest<P, AuthenticationPageSFCProps>

export interface AuthenticationPageHocProps {
  type?: AuthenticationPageType
  email?: string
  onAuthenticated?: (session?: string) => void
  onAuthenticationPageType?: (type?: AuthenticationPageType) => void
  onEmailChange?: (email?: string) => void
  onError?: (error?: any) => void
}

export { AuthenticationPageType }

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
   * email: email field enabled; password, confirm/token and submit disabled
   *
   * password: email and password field enabled; confirm/token and submit disabled
   *
   * true: all enabled
   *
   * false: all disabled
   */
  enabled?: SigninInputs | boolean
  pending?: boolean
  retry?: boolean
  error?: AuthenticationPageInputs | 'submit' | false
}

export type AuthenticationPageInputs = SigninInputs | 'confirm' | 'token'
export type SigninInputs = 'email' | 'password'
export type ConsentInputs = 'terms' | 'news'

export interface DropdownItemSpec {
  label?: string
  icon?: string[] | string
  [key: string]: unknown
}

export interface AuthenticationPageSFCHandlerProps {
  onCancel?: (event: Event) => void
  onChange?: (value: string, target: HTMLElement) => void
  onSelectEmail?: (item?: HTMLElement) => void
  onSubmit?: (event: Event) => void
  onToggleConsent?: (event: Event) => void
  onTogglePageType?: (event: Event) => void
  onEmailInputRef?: (target: HTMLElement) => void
  onPasswordInputRef?: (target: HTMLElement) => void
  onConfirmInputRef?: (target: HTMLElement) => void
}

interface AuthenticationPageState {
  props: AuthenticationPageProps<AuthenticationPageSFCProps>
  state: AutomataState
  inputs?: { [key in AuthenticationPageInputs]: HTMLElement }
  password?: string
  confirm?: string
  token?: string
  news?: boolean
  created?: boolean
}

const CURRENT_INPUT_TO_ENABLED = {
  [AuthenticationPageType.Signin]: {
    email: 'email',
    password: true,
    submit: true
  },
  [AuthenticationPageType.Signup]: {
    email: 'email',
    password: 'password',
    confirm: true,
    consents: true,
    submit: true
  },
  [AuthenticationPageType.Authorize]: {
    email: 'email',
    password: 'password',
    token: true,
    submit: true
  }
}

function mapStateToProps ({
  props,
  state,
  created,
  inputs,
  ...changes
}: AuthenticationPageState): Rest<
  AuthenticationPageSFCProps,
  AuthenticationPageSFCHandlerProps
> {
  const {
    onAuthenticated,
    onAuthenticationPageType,
    onEmailChange,
    onError,
    email,
    ...attrs
  } = props
  const [type, inputState, currentInput, opt] = state.split(':')
  const pending = inputState === 'submitting'
  const enabled =
    opt !== 'pending' && CURRENT_INPUT_TO_ENABLED[type][currentInput]
  const error = inputState === 'error' && (currentInput as any)
  const terms =
    currentInput === 'submit' && type === AuthenticationPageType.Signup
  return {
    ...attrs,
    ...changes,
    email,
    consents: terms || currentInput === 'terms',
    terms,
    created,
    pending,
    enabled,
    retry: error === 'submit' && opt === 'retry',
    error
  }
}

const change = createActionFactories({
  email: 'CHANGE_EMAIL',
  password: 'CHANGE_PASSWORD',
  confirm: 'CHANGE_CONFIRM',
  token: 'CHANGE_TOKEN',
  news: 'TOGGLE_NEWS',
  terms: 'TOGGLE_TERMS'
})

const mapDispatchToProps: (
  dispatch: (event: any) => void
) => AuthenticationPageSFCHandlerProps = createActionDispatchers({
  onCancel: 'CANCEL',
  onChange: (value: string, input: HTMLElement) =>
    change[input.dataset.id](value),
  // onSelectEmail: 'SELECT_EMAIL',
  onSubmit: ['SUBMIT', preventDefault],
  onTogglePageType: 'TOGGLE_PAGE_TYPE',
  onToggleConsent: ({ currentTarget }) => change[currentTarget.dataset.id](),
  onEmailInputRef: ['INPUT_REF', inputRef('email')],
  onPasswordInputRef: ['INPUT_REF', inputRef('password')],
  onConfirmInputRef: ['INPUT_REF', inputRef('confirm')]
})

function inputRef (field: string) {
  return function (input: HTMLElement) {
    return { [field]: input } // input may be null (on component unmount)
  }
}

export function authenticationPage<P extends AuthenticationPageSFCProps> (
  AuthenticationPageSFC: SFC<P>
): ComponentConstructor<AuthenticationPageProps<P>> {
  return componentFromEvents<AuthenticationPageProps<P>, P>(
    AuthenticationPageSFC,
    () => tap(log('authentication-page:event:')),
    redux(
      reducer,
      callAuthenticationPageTypeHandlerOnStatePagePending,
      signupOrSigninOrAuthorizeOnTypePropChange,
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
      serviceSigninOnSubmitFromSigninSubmitting,
      serviceSignupOnSubmitFromSignupSubmitting,
      callHandlerOnEvent(
        'TOGGLE_PAGE_TYPE',
        ['props', 'onAuthenticationPageType'],
        ({ props }) =>
          props.type === AuthenticationPageType.Signup
            ? AuthenticationPageType.Signin
            : AuthenticationPageType.Signup
      ),
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
