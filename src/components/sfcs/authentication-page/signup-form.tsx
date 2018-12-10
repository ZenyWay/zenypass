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
import { createElement } from 'create-element'
import { SigninFormField } from './signin-form'
import { RecordField as PassiveRecordField } from '../record-field'
import createL10ns from 'basic-l10n'
const l10ns = createL10ns(require('./locales.json'))

export interface SignupFormProps {
  locale: string
  email?: string
  password?: string
  /**
   * email: email field enabled; password, confirm and submit disabled
   *
   * password: email and password field enabled; confirm and submit disabled
   *
   * true: all enabled
   *
   * false: all disabled
   */
  enabled?: SigninFormField | boolean
  error?: SignupFormField | 'unauthorized' | false
  onChange?: (value: string, target: HTMLElement) => void
  onSubmit?: (event: Event) => void
  onEmailInputRef?: (target: HTMLElement) => void
  onPasswordInputRef?: (target: HTMLElement) => void
  confirm?: string
  onConfirmInputRef?: (target: HTMLElement) => void
}

export type SignupFormField = SigninFormField | 'confirm'

export type UnknownProps = { [prop: string]: unknown }

export function SignupForm ({
  locale,
  email,
  password,
  confirm,
  cleartext,
  enabled,
  error,
  onChange,
  onSubmit,
  onToggleFocus,
  onEmailInputRef,
  onPasswordInputRef,
  onConfirmInputRef,
  ...attrs
}: SignupFormProps & UnknownProps) {
  const t = l10ns[locale]
  const passwordEnabled = enabled && (enabled !== 'email')
  const confirmEnabled = enabled === true
  return (
    <form {...attrs} onSubmit={onSubmit}>
      <PassiveRecordField
        type='email'
        id='email'
        blurOnEnterKey
        className='mb-2'
        icon='user'
        placeholder={t('Enter your email address')}
        value={email}
        error={(error === 'email') && t('Please enter a valid email address')}
        data-id='email'
        onChange={onChange}
        locale={locale}
        disabled={!enabled}
        innerRef={onEmailInputRef}
      />
      <PassiveRecordField
        type={cleartext ? 'text' : 'password'}
        id='password'
        blurOnEnterKey
        className='mb-2'
        icon='lock'
        placeholder={passwordEnabled && t('Enter your password')}
        value={password}
        error={
          (error === 'password')
          && t('Please choose a password with at least four characters')
        }
        data-id='password'
        onChange={onChange}
        locale={locale}
        disabled={!passwordEnabled}
        innerRef={onPasswordInputRef}
      />
      <PassiveRecordField
        type={cleartext ? 'text' : 'password'}
        id='confirm-password'
        blurOnEnterKey
        className='mb-2'
        icon='lock'
        placeholder={confirmEnabled && t('Confirm your password')}
        value={confirm}
        error={(error === 'confirm') && t('Please enter the exact same password')}
        data-id='confirm'
        onChange={onChange}
        locale={locale}
        disabled={!confirmEnabled}
        innerRef={onConfirmInputRef}
      />
      <p>
        <small>
          {t('security-info')}.<br/>
          <a href={t('info-link')} target='_blank' className='text-info'>
            {t('More information')}...
          </a>
        </small>
      </p>
    </form>
  )
}
