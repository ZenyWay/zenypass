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
  logger,
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
import { distinctUntilChanged } from 'rxjs/operators'
const log = logger('authorization-page')

export type AuthorizationPageProps<
  P extends AuthorizationPageSFCProps
> = AuthorizationPageHocProps & Rest<P, AuthorizationPageSFCProps>

export interface AuthorizationPageSFCProps
  extends AuthorizationPageSFCHandlerProps {
  // emails?: DropdownItemSpec[]
  email?: string
  password?: string
  token?: string
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
  inputs?: { [key in AuthorizationInputs]: HTMLElement }
}

const STATE_TO_ERROR: Partial<
  { [state in AuthorizationFsm]: AuthorizationPageError }
> = {
  [AuthorizationFsm.InvalidEmail]: 'email',
  [AuthorizationFsm.InvalidPassword]: 'password',
  [AuthorizationFsm.InvalidToken]: 'token',
  [AuthorizationFsm.Forbidden]: 'submit',
  [AuthorizationFsm.Offline]: 'offline'
}

function mapStateToProps ({
  attrs,
  state,
  email,
  password,
  token
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
    error: STATE_TO_ERROR[state]
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
    log('event'),
    redux(
      reducer,
      serviceSigninOnSigningIn,
      serviceAuthorizeOnAuthorizing,
      tapOnMount(() => window.scrollTo(0, 0)),
      tapOnEvent(
        'INPUT_REF',
        compose.into(0)(
          focus,
          ({ inputs, email }) => inputs[!email ? 'email' : 'password'],
          pluck('1')
        )
      ),
      tapOnEvent(
        'SUBMIT',
        compose.into(0)(
          focus,
          ({ inputs, state }) => inputs[STATE_TO_ERROR[state]],
          pluck('1')
        )
      ),
      tapOnEvent(
        'FORBIDDEN',
        compose.into(0)(focus, pluck('1', 'inputs', 'password'))
      ),
      callHandlerOnEvent('AUTHORIZED', 'onAuthorized'),
      callHandlerOnEvent('SIGNED_IN', 'onSignedIn'),
      callHandlerOnEvent('SIGNIN', 'onSignin'),
      callHandlerOnEvent('SIGNUP', 'onSignup'),
      callHandlerOnEvent('CHANGE_EMAIL_INPUT', 'onEmailChange'),
      callHandlerOnEvent('ERROR', 'onError')
    ),
    log('state'),
    connect<AuthorizationPageState, AuthorizationPageSFCProps>(
      mapStateToProps,
      mapDispatchToProps
    ),
    () => distinctUntilChanged(shallowEqual),
    log('view-props')
  )
}

function focus (element?: HTMLElement) {
  element && element.focus()
}
