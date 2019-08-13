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
/** @jsx createElement */
import { createElement, Fragment } from 'create-element'
import { RecordField } from '../record-field'
import { SerializedRecordField } from '../../serialized-record-field'
import { DropdownItemSpec } from '../../dropdown'
import createL10ns from 'basic-l10n'
const l10ns = createL10ns(require('./locales.json'))

export enum AuthenticationPageType {
  Signin = 'signin',
  Signup = 'signup',
  Authorize = 'authorize'
}

export interface AuthenticationFormProps {
  locale: string
  type?: AuthenticationPageType
  emails?: DropdownItemSpec[]
  email?: string
  password?: string
  confirm?: string
  token?: string
  enabled?: boolean
  cleartext?: boolean
  error?: AuthenticationFormError | false
  onChange?: (value: string, target: HTMLElement) => void
  onConfirmInputRef?: (target: HTMLElement) => void
  onEmailInputRef?: (target: HTMLElement) => void
  onPasswordInputRef?: (target: HTMLElement) => void
  onTokenInputRef?: (target: HTMLElement) => void
  onSubmit?: (event: Event) => void
}

export type AuthenticationFormError =
  | AuthenticationFormField
  | 'submit'
  | 'offline'

export type AuthenticationFormField = 'email' | 'password' | 'confirm' | 'token'

export type UnknownProps = { [prop: string]: unknown }

const FIELD_ERRORS = {
  email: {
    [AuthenticationPageType.Authorize]: 'Please enter a valid email address',
    [AuthenticationPageType.Signup]: 'Please enter a valid email address',
    [AuthenticationPageType.Signin]: 'Please enter a valid email address'
  },
  password: {
    [AuthenticationPageType.Authorize]: 'Please enter your password',
    [AuthenticationPageType.Signup]:
      'Please choose a password with at least four characters',
    [AuthenticationPageType.Signin]: 'Please enter your password'
  },
  confirm: {
    [AuthenticationPageType.Signup]: 'Please enter the exact same password'
  },
  token: {
    [AuthenticationPageType.Authorize]:
      'Please enter the authorization code as displayed on the authorizing device'
  }
}

const SUBMIT_ERRORS = {
  [AuthenticationPageType.Authorize]: {
    submit: [
      'Access not authorized',
      'Please verify that your authorizing device is online, double-check your email address and enter your password and authorization code again'
    ],
    offline: [
      'Connection error',
      'This device appears to be offline. The ZenyPass server cannot be accessed. Please check your connection and try again'
    ]
  },
  [AuthenticationPageType.Signup]: {
    submit: [
      'A ZenyPass Vault already exists for this email',
      'Please verify your email address and enter your password again'
    ],
    offline: [
      'Connection error',
      'This device appears to be offline. The ZenyPass server cannot be accessed. Please check your connection and try again'
    ]
  },
  [AuthenticationPageType.Signin]: {
    submit: [
      'Unauthorized access',
      'Please verify your email address and enter your password again'
    ]
  }
}

const INFO: {
  [key in AuthenticationPageType]: {
    label: string
    link: string
    message?: string
  }
} = {
  [AuthenticationPageType.Authorize]: {
    label: 'More information',
    link: 'authorize-help-link',
    message:
      "To authorize access to your ZenyPass Vault from this browser, open your ZenyPass Vault on an already authorized device, click on 'Authorizations' in the menu, then click on 'Add an authorization' and copy the resulting authorization code into the above field"
  },
  [AuthenticationPageType.Signin]: {
    label: 'Troubleshooting',
    link: 'signin-troubleshooting-link'
  },
  [AuthenticationPageType.Signup]: {
    label: 'More information',
    link: 'signup-help-link',
    message:
      "For enhanced security, please choose a password that you don't use elsewhere, and make sure you don't forget or loose it"
  }
}

export function AuthenticationForm ({
  locale,
  type = AuthenticationPageType.Signin,
  emails,
  email,
  password,
  confirm,
  token,
  cleartext,
  enabled,
  error,
  onChange,
  onSubmit,
  onToggleFocus,
  onEmailInputRef,
  onPasswordInputRef,
  onConfirmInputRef,
  onTokenInputRef,
  ...attrs
}: AuthenticationFormProps & UnknownProps) {
  const t = l10ns[locale]
  const authorize = type === 'authorize'
  const dropdown = emails && emails.length
  const info = INFO[type]
  const fieldError = error && (FIELD_ERRORS[error] || {})[type]
  const submitError =
    error &&
    !fieldError &&
    (SUBMIT_ERRORS[type][error] || ['Something went wrong', error])
  return (
    <form noValidate {...attrs} onSubmit={onSubmit}>
      <RecordField
        type='email'
        id='email'
        className='mb-2'
        options={emails}
        icon={dropdown ? 'fa fa-user' : 'user'}
        iconColor='info'
        placeholder={t('Enter your email address')}
        value={email}
        error={error === 'email' && t(fieldError)}
        data-id='email'
        onChange={onChange}
        locale={locale}
        disabled={!enabled}
        innerRef={onEmailInputRef}
      />
      <RecordField
        type={cleartext ? 'text' : 'password'}
        id='password'
        className='mb-2'
        icon='lock'
        iconColor='info'
        placeholder={t('Enter your password')}
        value={password}
        error={error === 'password' && t(fieldError)}
        data-id='password'
        onChange={onChange}
        locale={locale}
        disabled={!enabled}
        innerRef={onPasswordInputRef}
      />
      {type === 'signin' ? null : authorize ? (
        <SerializedRecordField
          type='modhex'
          id='token'
          className='mb-2'
          icon='key'
          iconColor='info'
          flip='vertical'
          placeholder={t('Enter the authorization code')}
          value={token}
          error={error === 'token' && t(fieldError)}
          data-id='token'
          onChange={onChange}
          locale={locale}
          disabled={!enabled}
          innerRef={onTokenInputRef}
        />
      ) : (
        <RecordField
          type={cleartext ? 'text' : 'password'}
          id='confirm'
          className='mb-2'
          icon='lock'
          iconColor='info'
          placeholder={t('Confirm your password')}
          value={confirm}
          error={error === 'confirm' && t(fieldError)}
          data-id='confirm'
          onChange={onChange}
          locale={locale}
          disabled={!enabled}
          innerRef={onConfirmInputRef}
        />
      )}
      {!submitError ? null : (
        <p>
          <small className='text-danger'>
            {t(submitError[0])}:<br />
            {t(submitError[1])}.
          </small>
        </p>
      )}
      {!info ? null : (
        <p className='clearfix'>
          <small>
            {!info.message ? null : (
              <Fragment>
                {t(info.message)}.<br />
              </Fragment>
            )}
            <a
              href={t(info.link)}
              target='_blank'
              rel='noopener noreferer'
              className='text-info float-right'
            >
              {t(info.label)}
            </a>
          </small>
        </p>
      )}
    </form>
  )
}
