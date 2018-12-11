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
import { RecordField as PassiveRecordField } from '../record-field'
import { DropdownItemSpec } from '../../dropdown'
import { classes } from 'utils'
import createL10ns from 'basic-l10n'
const l10ns = createL10ns(require('./locales.json'))

export interface SigninFormProps {
  locale: string
  emails?: DropdownItemSpec[]
  email?: string
  password?: string
  /**
   * email: email field enabled; password, confirm and submit disabled
   *
   * true: all enabled
   *
   * false: all disabled
   */
  enabled?: 'email' | boolean
  error?: SigninFormField | 'unauthorized' | false
  onChange?: (value: string, target: HTMLElement) => void
  onSignin?: (event: Event) => void
  onEmailInputRef?: (target: HTMLElement) => void
  onPasswordInputRef?: (target: HTMLElement) => void
  onSelectEmail?: (item?: HTMLElement) => void
}

export type SigninFormField = 'email' | 'password'

export type UnknownProps = { [prop: string]: unknown }

export function SigninForm ({
  locale,
  emails,
  email,
  password,
  cleartext,
  enabled,
  error,
  onChange,
  onSignin,
  onSelectEmail,
  onEmailInputRef,
  onPasswordInputRef,
  onConfirmInputRef,
  ...attrs
}: SigninFormProps & UnknownProps) {
  const t = l10ns[locale]
  const dropdown = emails && emails.length
  const passwordEnabled = enabled && (enabled !== 'email')
  return (
    <form {...attrs} onSubmit={onSignin}>
      <PassiveRecordField
        type='email'
        id='email'
        blurOnEnterKey
        className='mb-2'
        options={emails}
        icon={dropdown ? 'fa fa-user' : 'user'}
        placeholder={t('Enter your email address')}
        value={email}
        error={(error === 'email') && t('Please enter a valid email address')}
        data-id='email'
        onChange={onChange}
        onSelectEmail={onSelectEmail}
        locale={locale}
        disabled={!enabled}
        innerRef={onEmailInputRef}
      />
      <PassiveRecordField
        type={cleartext ? 'text' : 'password'}
        blurOnEnterKey
        id='password'
        className='mb-2'
        icon={classes('lock', dropdown && 'mx-1')}
        placeholder={passwordEnabled && t('Enter your password')}
        value={password}
        error={(error === 'password') && t('Please enter your password')}
        data-id='password'
        onChange={onChange}
        locale={locale}
        disabled={!passwordEnabled}
        innerRef={onPasswordInputRef}
      />
      {
        error !== 'unauthorized'
        ? null
        : (
          <p>
            <small className='text-danger'>
              {t('Unauthorized access')}:<br/>
              {t('Please verify your email address and enter your password again')}.
            </small>
          </p>
        )
      }
    </form>
  )
}
