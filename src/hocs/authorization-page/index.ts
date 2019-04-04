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

import reducer, {
  AuthorizationFsm,
  AuthorizationPageError,
  AuthorizationPageHocProps
} from './reducer'
import {
  serviceAuthorizeOnAuthorizing,
  serviceSigninOnSigningIn
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
import compose from 'basic-compose'
import {
  callHandlerOnEvent,
  pluck,
  preventDefault,
  shallowEqual,
  tapOnEvent,
  tapOnMount
} from 'utils'
import { tap, distinctUntilChanged } from 'rxjs/operators'
const log = label => console.log.bind(console, label)

export type AuthorizationPageProps<
  P extends AuthorizationPageSFCProps
> = AuthorizationPageHocProps & Rest<P, AuthorizationPageSFCProps>

export interface AuthorizationPageSFCProps
  extends AuthorizationPageSFCHandlerProps {
  // emails?: DropdownItemSpec[]
  email?: string
  password?: string
  token?: string
  enabled?: boolean
  pending?: boolean
  retry?: boolean
  error?: AuthorizationPageError | false | unknown
}

export type AuthorizationInputs = 'email' | 'password'

export interface AuthorizationPageSFCHandlerProps {
  onCancel?: (event?: MouseEvent) => void
  onChange?: (value: string, target?: HTMLElement) => void
  // onSelectEmail?: (item?: HTMLElement) => void
  onSubmit?: (event?: Event) => void
  onTogglePage?: (event?: MouseEvent) => void
  onEmailInputRef?: (target: HTMLElement) => void
  onPasswordInputRef?: (target: HTMLElement) => void
  onTokenInputRef?: (target: HTMLElement) => void
}

interface AuthorizationPageState extends AuthorizationPageHocProps {
  attrs: Pick<
    AuthorizationPageProps<AuthorizationPageSFCProps>,
    Exclude<
      keyof AuthorizationPageProps<AuthorizationPageSFCProps>,
      keyof AuthorizationPageHocProps
    >
  >
  state: AuthorizationFsm
  email?: string
  password?: string
  token?: string
  error?: string
  inputs?: { [key in AuthorizationInputs]: HTMLElement }
}

const STATE_TO_ERROR: Partial<
  { [state in AuthorizationFsm]: AuthorizationPageError }
> = {
  [AuthorizationFsm.PristinePasswordInvalidEmail]: 'email',
  [AuthorizationFsm.PristineEmailInvalidPassword]: 'password',
  [AuthorizationFsm.Invalid]: 'email',
  [AuthorizationFsm.InvalidEmail]: 'email',
  [AuthorizationFsm.InvalidPassword]: 'password',
  [AuthorizationFsm.InvalidToken]: 'token'
}

function mapStateToProps ({
  attrs,
  state,
  email,
  password,
  token,
  error
}: AuthorizationPageState): Rest<
  AuthorizationPageSFCProps,
  AuthorizationPageSFCHandlerProps
> {
  const pending =
    state === AuthorizationFsm.Authorizing ||
    state === AuthorizationFsm.SigningIn
  return {
    ...attrs,
    email,
    password,
    token,
    pending,
    enabled: true,
    error: STATE_TO_ERROR[state] || error
  }
}

const CHANGE_ACTIONS = createActionFactories({
  email: 'CHANGE_EMAIL_INPUT',
  password: 'CHANGE_PASSWORD_INPUT',
  token: 'CHANGE_TOKEN_INPUT'
})

const mapDispatchToProps: (
  dispatch: (event: any) => void
) => AuthorizationPageSFCHandlerProps = createActionDispatchers({
  onCancel: 'CANCEL',
  onChange: (value: string, { dataset: { id } }: HTMLElement) =>
    CHANGE_ACTIONS[id](value),
  // onSelectEmail: 'SELECT_EMAIL',
  onSignin: 'SIGNIN',
  onSignup: 'SIGNUP',
  onSubmit: ['SUBMIT', preventDefault],
  onEmailInputRef: ['INPUT_REF', inputRef('email')],
  onPasswordInputRef: ['INPUT_REF', inputRef('password')],
  onTokenInputRef: ['INPUT_REF', inputRef('token')]
})

function inputRef (field: string) {
  return function (input: HTMLElement) {
    return { [field]: input } // input may be null (on component unmount)
  }
}

export function authorizationPage<P extends AuthorizationPageSFCProps> (
  AuthorizationPageSFC: SFC<P>
): ComponentConstructor<AuthorizationPageProps<P>> {
  return componentFromEvents(
    AuthorizationPageSFC,
    () => tap(log('authorization-page:event:')),
    redux(
      reducer,
      serviceSigninOnSigningIn,
      serviceAuthorizeOnAuthorizing,
      tapOnMount(() => window.scrollTo(0, 0)),
      tapOnEvent(
        'INPUT_REF',
        compose.into(0)(
          focus,
          ({ inputs, state }) =>
            inputs[isPristineOrInvalidEmail(state) ? 'email' : 'password'],
          pluck('1')
        )
      ),
      tapOnEvent(
        'UNAUTHORIZED',
        compose.into(0)(focus, pluck('1', 'inputs', 'password'))
      ),
      callHandlerOnEvent('AUTHORIZED', 'onAuthorized'),
      callHandlerOnEvent('SIGNED_IN', 'onSignedIn'),
      callHandlerOnEvent('SIGNIN', 'onSignin'),
      callHandlerOnEvent('SIGNUP', 'onSignup'),
      callHandlerOnEvent('CHANGE_EMAIL_INPUT', 'onEmailChange'),
      callHandlerOnEvent('ERROR', 'onError')
    ),
    () => tap(log('authorization-page:state:')),
    connect<AuthorizationPageState, AuthorizationPageSFCProps>(
      mapStateToProps,
      mapDispatchToProps
    ),
    () => distinctUntilChanged(shallowEqual),
    () => tap(log('authorization-page:view-props:'))
  )
}

const PRISTINE_OR_INVALID_EMAIL: AuthorizationFsm[] = [
  AuthorizationFsm.Pristine,
  AuthorizationFsm.PristineEmail,
  AuthorizationFsm.PristineEmailInvalidPassword,
  AuthorizationFsm.PristinePasswordInvalidEmail,
  AuthorizationFsm.Invalid,
  AuthorizationFsm.InvalidEmail
]

function isPristineOrInvalidEmail (state: AuthorizationFsm) {
  return PRISTINE_OR_INVALID_EMAIL.indexOf(state) >= 0
}

function focus (element?: HTMLElement) {
  element && element.focus()
}
