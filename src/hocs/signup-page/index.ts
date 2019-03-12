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

import { reducer, ValidityFsm, SignupFsm, SignupPageHocProps } from './reducer'
import {
  serviceSignupOnSubmitFromSignupSubmitting,
  validatePasswordOnChangePassword
} from './effects'
import componentFromStream from 'component-from-props'
import {
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
  isInvalidEmail,
  pluck,
  preventDefault,
  shallowEqual,
  tapOnEvent
} from 'utils'
import { tap, distinctUntilChanged } from 'rxjs/operators'
const log = label => console.log.bind(console, label)

export type SignupPageProps<P extends SignupPageSFCProps> = SignupPageHocProps &
  Rest<P, SignupPageSFCProps>

export interface SignupPageSFCProps extends SignupPageSFCHandlerProps {
  // emails?: DropdownItemSpec[]
  email?: string
  password?: string
  enabled?: boolean
  pending?: boolean
  retry?: boolean
  error?: SignupPageError | unknown
}

export type SignupPageError = 'email' | 'password' | 'credentials' | 'submit'

export type SignupInputs = 'email' | 'password'

export interface DropdownItemSpec {
  label?: string
  icon?: string[] | string
  [key: string]: unknown
}

export interface SignupPageSFCHandlerProps {
  onCancel?: (event?: MouseEvent) => void
  onChange?: (value: string, target?: HTMLElement) => void
  // onSelectEmail?: (item?: HTMLElement) => void
  onSubmit?: (event?: Event) => void
  onTogglePage?: (event?: MouseEvent) => void
  onEmailInputRef?: (target: HTMLElement) => void
  onPasswordInputRef?: (target: HTMLElement) => void
  onConfirmInputRef?: (target: HTMLElement) => void
}

interface SignupPageState extends SignupPageHocProps {
  attrs: Pick<
    SignupPageProps<SignupPageSFCProps>,
    Exclude<keyof SignupPageProps<SignupPageSFCProps>, keyof SignupPageHocProps>
  >
  password?: string
  valid: ValidityFsm
  signup: SignupFsm
  inputs?: { [key in SignupInputs]: HTMLElement }
}

const VALID_STATE_TO_ERROR: Partial<
  { [state in ValidityFsm]: SignupPageError }
> = {
  [ValidityFsm.Invalid]: 'credentials',
  [ValidityFsm.InvalidEmail]: 'email',
  [ValidityFsm.InvalidPassword]: 'password'
}

function mapStateToProps ({
  attrs,
  valid,
  signup,
  email,
  password
}: SignupPageState): Rest<SignupPageSFCProps, SignupPageSFCHandlerProps> {
  return {
    ...attrs,
    email,
    password,
    pending: signup === SignupFsm.Pending,
    enabled: !isInvalidEmailState(valid),
    error: signup === SignupFsm.Error || VALID_STATE_TO_ERROR[valid]
  }
}

const CHANGE_ACTIONS = createActionFactories({
  email: 'CHANGE_EMAIL',
  password: 'CHANGE_PASSWORD',
  confirm: 'CHANGE_CONFIRM'
})

const mapDispatchToProps: (
  dispatch: (event: any) => void
) => SignupPageSFCHandlerProps = createActionDispatchers({
  onCancel: 'CANCEL',
  onChange: (value: string, { dataset: { id } }: HTMLElement) =>
    CHANGE_ACTIONS[id](value),
  // onSelectEmail: 'SELECT_EMAIL',
  onSubmit: ['SUBMIT', preventDefault],
  onTogglePage: 'TOGGLE_PAGE',
  onEmailInputRef: ['INPUT_REF', inputRef('email')],
  onPasswordInputRef: ['INPUT_REF', inputRef('password')],
  onConfirmInputRef: ['INPUT_REF', inputRef('confirm')]
})

function inputRef (field: string) {
  return function (input: HTMLElement) {
    return { [field]: input } // input may be null (on component unmount)
  }
}

const PROPS_ACTIONS = createActionFactories({
  invalid: 'INVALID_EMAIL_PROPS',
  valid: 'VALID_EMAIL_PROPS'
})

export function signupPage<P extends SignupPageSFCProps> (
  SignupPageSFC: SFC<P>
): ComponentConstructor<SignupPageProps<P>> {
  return componentFromStream(
    SignupPageSFC,
    (props: SignupPageProps<P>) =>
      (isInvalidEmail(props.email)
        ? PROPS_ACTIONS.invalid
        : PROPS_ACTIONS.valid)(props),
    () => tap(log('signup-page:event:')),
    redux(
      reducer,
      validatePasswordOnChangePassword,
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
      serviceSignupOnSubmitFromSignupSubmitting,
      callHandlerOnEvent('TOGGLE_PAGE', 'onTogglePage'),
      callHandlerOnEvent('AUTHENTICATED', 'onTogglePage'),
      callHandlerOnEvent('CHANGE_EMAIL', 'onEmailChange'),
      callHandlerOnEvent('ERROR', 'onError')
    ),
    () => tap(log('signup-page:state:')),
    connect<SignupPageState, SignupPageSFCProps>(
      mapStateToProps,
      mapDispatchToProps
    ),
    () => distinctUntilChanged(shallowEqual),
    () => tap(log('signup-page:view-props:'))
  )
}

function isInvalidEmailState (valid: ValidityFsm): boolean {
  return valid === ValidityFsm.Invalid || valid === ValidityFsm.InvalidEmail
}

function focus (element?: HTMLElement) {
  element && element.focus()
}
