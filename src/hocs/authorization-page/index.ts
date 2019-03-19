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

import {
  reducer,
  ValidityFsm,
  AuthorizationFsm,
  AuthorizationPageHocProps
} from './reducer'
import { serviceAuthorizeOnSubmitFromSubmittable } from './effects'
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
  tapOnEvent
} from 'utils'
import { tap, distinctUntilChanged } from 'rxjs/operators'
import { isString } from 'util'
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

export type AuthorizationPageError =
  | 'email'
  | 'password'
  | 'credentials'
  | 'token'
  | 'submit'

export type AuthorizationInputs = 'email' | 'password'

export interface AuthorizationPageSFCHandlerProps {
  onCancel?: (event?: MouseEvent) => void
  onChange?: (value: string, target?: HTMLElement) => void
  // onSelectEmail?: (item?: HTMLElement) => void
  onSubmit?: (event?: Event) => void
  onToggleConsent?: (event: Event) => void
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
  email?: string
  password?: string
  token?: string
  valid: ValidityFsm
  authorization: AuthorizationFsm
  inputs?: { [key in AuthorizationInputs]: HTMLElement }
}

const STATE_TO_ERROR: Partial<
  {
    [state in AuthorizationFsm]: Partial<
      {
        [state in ValidityFsm]:
          | AuthorizationPageError
          | ((state?: AuthorizationPageState) => AuthorizationPageError | '')
      }
    >
  }
> = {
  [AuthorizationFsm.Idle]: {
    [ValidityFsm.Invalid]: ({ email, password }) =>
      (email && password && 'credentials') ||
      (email && 'email') ||
      (password && 'password'),
    [ValidityFsm.InvalidEmail]: ({ email }) => email && 'email',
    [ValidityFsm.InvalidPassword]: ({ password }) => password && 'password',
    [ValidityFsm.InvalidToken]: ({ token }) => token && 'token'
  },
  [AuthorizationFsm.Error]: {
    [ValidityFsm.InvalidToken]: 'submit'
  }
}

function mapStateToProps (
  state: AuthorizationPageState
): Rest<AuthorizationPageSFCProps, AuthorizationPageSFCHandlerProps> {
  const { attrs, valid, authorization, email, password, token } = state
  const error = get(STATE_TO_ERROR, authorization, valid)
  return {
    ...attrs,
    email,
    password,
    token,
    pending: authorization === AuthorizationFsm.Pending,
    enabled:
      !isInvalidEmailState(valid) && valid !== ValidityFsm.InvalidPassword,
    error: !error || isString(error) ? error : error(state)
  }
}

function get (obj: any, ...keys: string[]): any {
  let res: any = obj
  for (const key of keys) {
    if (!res) return
    res = res[key]
  }
  return res
}

const CHANGE_ACTIONS = createActionFactories({
  email: 'CHANGE_EMAIL',
  password: 'CHANGE_PASSWORD',
  token: 'CHANGE_TOKEN'
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
  onToggleConsent: ({ currentTarget }) =>
    CHANGE_ACTIONS[currentTarget.dataset.id](),
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
      serviceAuthorizeOnSubmitFromSubmittable,
      tapOnEvent(
        'INPUT_REF',
        compose.into(0)(
          focus,
          ({ inputs, valid }) =>
            inputs[isInvalidEmailState(valid) ? 'email' : 'password'],
          pluck('1')
        )
      ),
      tapOnEvent(
        'UNAUTHORIZED',
        compose.into(0)(focus, pluck('1', 'inputs', 'password'))
      ),
      callHandlerOnEvent('SIGNED_UP', 'onSignedUp'),
      callHandlerOnEvent('SIGNIN', 'onSignin'),
      callHandlerOnEvent('SIGNUP', 'onSignup'),
      callHandlerOnEvent('CHANGE_EMAIL', 'onEmailChange'),
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

function isInvalidEmailState (valid: ValidityFsm): boolean {
  return valid === ValidityFsm.Invalid || valid === ValidityFsm.InvalidEmail
}

function focus (element?: HTMLElement) {
  element && element.focus()
}
