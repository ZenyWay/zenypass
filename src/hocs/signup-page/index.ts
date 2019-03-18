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
import { serviceSignupOnSubmitFromSubmittable } from './effects'
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
import { always, isString } from 'utils'
const log = label => console.log.bind(console, label)

export type SignupPageProps<P extends SignupPageSFCProps> = SignupPageHocProps &
  Rest<P, SignupPageSFCProps>

export interface SignupPageSFCProps extends SignupPageSFCHandlerProps {
  // emails?: DropdownItemSpec[]
  email?: string
  password?: string
  confirm?: string
  terms?: boolean
  news?: boolean
  enabled?: boolean
  consents?: boolean
  pending?: boolean
  retry?: boolean
  error?: SignupPageError | false | unknown
}

export type SignupPageError =
  | 'email'
  | 'password'
  | 'credentials'
  | 'confirm'
  | 'submit'

export type SignupInputs = 'email' | 'password'

export interface SignupPageSFCHandlerProps {
  onAuthorize?: (event?: MouseEvent) => void
  onCancel?: (event?: MouseEvent) => void
  onChange?: (value: string, target?: HTMLElement) => void
  // onSelectEmail?: (item?: HTMLElement) => void
  onSignin?: (event?: MouseEvent) => void
  onSubmit?: (event?: Event) => void
  onToggleConsent?: (event: Event) => void
  onEmailInputRef?: (target: HTMLElement) => void
  onPasswordInputRef?: (target: HTMLElement) => void
  onConfirmInputRef?: (target: HTMLElement) => void
}

interface SignupPageState extends SignupPageHocProps {
  attrs: Pick<
    SignupPageProps<SignupPageSFCProps>,
    Exclude<keyof SignupPageProps<SignupPageSFCProps>, keyof SignupPageHocProps>
  >
  email?: string
  password?: string
  confirm?: string
  news?: boolean
  valid: ValidityFsm
  signup: SignupFsm
  inputs?: { [key in SignupInputs]: HTMLElement }
}

const STATE_TO_ERROR: Partial<
  {
    [state in SignupFsm]: Partial<
      {
        [state in ValidityFsm]:
          | SignupPageError
          | ((state?: SignupPageState) => SignupPageError | '')
      }
    >
  }
> = {
  [SignupFsm.Idle]: {
    [ValidityFsm.Invalid]: ({ email, password }) =>
      (email && password && 'credentials') ||
      (email && 'email') ||
      (password && 'password'),
    [ValidityFsm.InvalidEmail]: ({ email }) => email && 'email',
    [ValidityFsm.InvalidPassword]: ({ password }) => password && 'password',
    [ValidityFsm.Tbc]: ({ confirm }) => confirm && 'confirm'
  },
  [SignupFsm.Error]: {
    [ValidityFsm.Tbc]: 'submit'
  }
}

function mapStateToProps (
  state: SignupPageState
): Rest<SignupPageSFCProps, SignupPageSFCHandlerProps> {
  const { attrs, valid, signup, email, password, confirm, news } = state
  const error = get(STATE_TO_ERROR, signup, valid)
  const terms = valid === ValidityFsm.Submittable
  return {
    ...attrs,
    email,
    password,
    confirm,
    news,
    terms,
    consents: terms || valid === ValidityFsm.Consents,
    pending: signup === SignupFsm.Pending,
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
  confirm: 'CHANGE_CONFIRM',
  news: 'TOGGLE_NEWS',
  terms: 'TOGGLE_TERMS'
})

const mapDispatchToProps: (
  dispatch: (event: any) => void
) => SignupPageSFCHandlerProps = createActionDispatchers({
  onAuthorize: 'AUTHORIZE',
  onCancel: 'CANCEL',
  onChange: (value: string, { dataset: { id } }: HTMLElement) =>
    CHANGE_ACTIONS[id](value),
  // onSelectEmail: 'SELECT_EMAIL',
  onSignin: 'SIGNIN',
  onSubmit: ['SUBMIT', preventDefault],
  onToggleConsent: ({ currentTarget }) =>
    CHANGE_ACTIONS[currentTarget.dataset.id](),
  onEmailInputRef: ['INPUT_REF', inputRef('email')],
  onPasswordInputRef: ['INPUT_REF', inputRef('password')],
  onConfirmInputRef: ['INPUT_REF', inputRef('confirm')]
})

function inputRef (field: string) {
  return function (input: HTMLElement) {
    return { [field]: input } // input may be null (on component unmount)
  }
}

export function signupPage<P extends SignupPageSFCProps> (
  SignupPageSFC: SFC<P>
): ComponentConstructor<SignupPageProps<P>> {
  return componentFromEvents(
    SignupPageSFC,
    () => tap(log('signup-page:event:')),
    redux(
      reducer,
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
      serviceSignupOnSubmitFromSubmittable,
      callHandlerOnEvent('AUTHORIZE', 'onAuthorize'),
      callHandlerOnEvent('SIGNIN', 'onSignin'),
      callHandlerOnEvent('SIGNED_UP', 'onSignedUp'),
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
