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
  RetryFsm,
  SigninFsm,
  SigninPageError,
  SigninPageHocProps
} from './reducer'
import { serviceSigninOnSigningIn } from './effects'
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
const log = logger('signin-page')

export type SigninPageProps<P extends SigninPageSFCProps> = SigninPageHocProps &
  Rest<P, SigninPageSFCProps>

export interface SigninPageSFCProps extends SigninPageSFCHandlerProps {
  // emails?: DropdownItemSpec[]
  email?: string
  password?: string
  enabled?: boolean
  pending?: boolean
  retry?: boolean
  error?: SigninPageError | unknown
}

export type SigninInputs = 'email' | 'password'

export interface SigninPageSFCHandlerProps {
  onCancel?: (event?: MouseEvent) => void
  onChange?: (value: string, target?: HTMLElement) => void
  // onSelectEmail?: (item?: HTMLElement) => void
  onSubmit?: (event?: Event) => void
  onTogglePage?: (event?: MouseEvent) => void
  onEmailInputRef?: (target: HTMLElement) => void
  onPasswordInputRef?: (target: HTMLElement) => void
}

interface SigninPageState extends SigninPageHocProps {
  attrs: Pick<
    SigninPageProps<SigninPageSFCProps>,
    Exclude<keyof SigninPageProps<SigninPageSFCProps>, keyof SigninPageHocProps>
  >
  state: SigninFsm
  retry: RetryFsm
  email?: string
  password?: string
  inputs?: { [key in SigninInputs]: HTMLElement }
}

const STATE_TO_ERROR: Partial<{ [state in SigninFsm]: SigninPageError }> = {
  [SigninFsm.InvalidEmail]: 'email',
  [SigninFsm.InvalidPassword]: 'password',
  [SigninFsm.Unautorized]: 'submit'
}

function mapStateToProps ({
  attrs,
  state,
  retry,
  email,
  password
}: SigninPageState): Rest<SigninPageSFCProps, SigninPageSFCHandlerProps> {
  return {
    ...attrs,
    email,
    password,
    pending: state === SigninFsm.SigningIn,
    enabled: true,
    retry: retry === RetryFsm.Alert,
    error: STATE_TO_ERROR[state]
  }
}

const CHANGE_ACTIONS = createActionFactories({
  email: 'CHANGE_EMAIL_INPUT',
  password: 'CHANGE_PASSWORD_INPUT'
})

const mapDispatchToProps: (
  dispatch: (event: any) => void
) => SigninPageSFCHandlerProps = createActionDispatchers({
  onAuthorize: 'AUTHORIZE',
  onCancel: 'CANCEL',
  onChange: (value: string, { dataset: { id } }: HTMLElement) =>
    CHANGE_ACTIONS[id](value),
  // onSelectEmail: 'SELECT_EMAIL',
  onSignup: 'SIGNUP',
  onSubmit: ['SUBMIT', preventDefault],
  onEmailInputRef: ['INPUT_REF', inputRef('email')],
  onPasswordInputRef: ['INPUT_REF', inputRef('password')]
})

function inputRef (field: string) {
  return function (input: HTMLElement) {
    return { [field]: input } // input may be null (on component unmount)
  }
}

export function signinPage<P extends SigninPageSFCProps> (
  SigninPageSFC: SFC<P>
): ComponentConstructor<SigninPageProps<P>> {
  return componentFromEvents(
    SigninPageSFC,
    log('event'),
    redux(
      reducer,
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
        'UNAUTHORIZED',
        compose.into(0)(focus, pluck('1', 'inputs', 'password'))
      ),
      serviceSigninOnSigningIn,
      callHandlerOnEvent('AUTHORIZE', 'onAuthorize'),
      callHandlerOnEvent('SIGNED_IN', 'onSignedIn'),
      callHandlerOnEvent('SIGNUP', 'onSignup'),
      callHandlerOnEvent('CHANGE_EMAIL_INPUT', 'onEmailChange'),
      callHandlerOnEvent('ERROR', 'onError')
    ),
    log('state'),
    connect<SigninPageState, SigninPageSFCProps>(
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
