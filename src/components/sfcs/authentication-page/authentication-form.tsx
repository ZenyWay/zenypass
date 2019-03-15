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
  created?: boolean
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
  | 'email'
  | 'password'
  | 'credentials'
  | 'confirm'
  | 'submit'

export type AuthenticationFormField = 'email' | 'password' | 'confirm' | 'token'

export type UnknownProps = { [prop: string]: unknown }

const ERROR_TO_FIELDS: {
  [error in AuthenticationFormError]: Partial<
    { [field in AuthenticationFormField]: boolean }
  >
} = {
  email: {
    email: true
  },
  password: {
    password: true
  },
  credentials: {
    email: true,
    password: true
  },
  confirm: {
    confirm: true
  },
  submit: {}
}

const ERRORS = {
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

const INFO = {
  [AuthenticationPageType.Authorize]: {
    link: 'authorize-link',
    message:
      'To authorize access to your ZenyPass account from this browser, login to ZenyPass on a device that already has access, click on "Devices" in the menu, then click on "Add a device" and copy the resulting authorization code into the above field'
  },
  [AuthenticationPageType.Signup]: {
    link: 'info-link',
    message:
      "For enhanced security, please choose an exclusive password that you don't use elsewhere, and make sure you don't forget or loose it"
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
  created,
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
  const unauthorized = error === 'submit'
  const info = INFO[type]
  return (
    <form noValidate {...attrs} onSubmit={onSubmit}>
      {!created ? null : (
        <Fragment>
          <p>
            {t('An email was just sent to you')}:<br />
            {t(
              'follow the instructions in that email to validate your account, then login below'
            )}
            .
          </p>
          <p className='text-muted'>
            <small>
              {t(
                "If you haven't received the validation email, sent from the address info@zenyway.com, please check your spam folder"
              )}
              .
            </small>
          </p>
        </Fragment>
      )}
      <RecordField
        type='email'
        id='email'
        className='mb-2'
        options={emails}
        icon={dropdown ? 'fa fa-user' : 'user'}
        placeholder={t('Enter your email address')}
        value={email}
        error={
          email &&
          error &&
          ERROR_TO_FIELDS[error].email &&
          t(ERRORS.email[type])
        }
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
        placeholder={t('Enter your password')}
        value={password}
        error={
          password &&
          error &&
          ERROR_TO_FIELDS[error].password &&
          t(ERRORS.password[type])
        }
        data-id='password'
        onChange={onChange}
        locale={locale}
        disabled={!enabled}
        innerRef={onPasswordInputRef}
      />
      {type === 'signin' ? null : authorize ? (
        <RecordField
          type='text'
          id='token'
          className='mb-2'
          icon='key'
          flip='vertical'
          placeholder={t('Enter the authorization code')}
          value={token}
          error={
            token &&
            error &&
            ERROR_TO_FIELDS[error].token &&
            t(ERRORS.token[type])
          }
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
          placeholder={t('Confirm your password')}
          value={confirm}
          error={
            confirm &&
            error &&
            ERROR_TO_FIELDS[error].confirm &&
            t(ERRORS.confirm[type])
          }
          data-id='confirm'
          onChange={onChange}
          locale={locale}
          disabled={!enabled}
          innerRef={onConfirmInputRef}
        />
      )}
      <p>
        {!unauthorized ? null : (
          <small className='text-danger'>
            {t('Unauthorized access')}:<br />
            {t(
              'Please verify your email address and enter your password again'
            )}
            .
          </small>
        )}
        {!info ? null : (
          <small>
            {t(info.message)}.<br />
            <a
              href={t(info.link)}
              target='_blank'
              rel='noopener noreferer'
              className='text-info'
            >
              {t('More information')}...
            </a>
          </small>
        )}
      </p>
    </form>
  )
}
