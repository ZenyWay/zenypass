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
import { storiesOf } from '@storybook/react'
import { AuthenticationPageSFC as AuthenticationPage } from 'components'
import { action } from '@storybook/addon-actions'
import withL10n from 'zenyway-storybook-addon-l10n'
import preventDefaultAction from './helpers/prevent-default'
import { LANG_MENU } from './helpers/consts'

const locales = LANG_MENU.slice()
delete locales[0].label // remove label of dropdown toggle

const attrs = {
  locales: LANG_MENU,
  onAuthorize: action('AUTHORIZE'),
  onCancel: action('CANCEL'),
  onChange: action('CHANGE'),
  onSelectLocale: action('SELECT_LOCALE'),
  onSignin: action('SIGNIN'),
  onSignup: action('SIGNUP'),
  onSubmit: preventDefaultAction('SUBMIT'),
  onToggleConsent: action('TOGGLE_CONSENT'),
  onConfirmInputRef: action('CONFIRM_INPUT_REF'),
  onEmailInputRef: action('EMAIL_INPUT_REF'),
  onPasswordInputRef: action('PASSWORD_INPUT_REF'),
  onTokenInputRef: action('TOKEN_INPUT_REF')
}

const emails = ['jane.doe@example.com', 'rob@hvsc.org']
  .map(email => ({
    'data-id': `email/${email}`,
    icon: 'fa fa-user',
    label: email
  }))
  .concat({
    'data-id': 'email',
    icon: 'fa fa-plus',
    label: 'Enter another email'
  })

const email = emails[0].label
const password = 'P@ssw0rd!'
const token = 'BCDEFGHIJKLN'

storiesOf('AuthenticationPage (SFC)', module)
  .addDecorator(withL10n({ locales: ['fr', 'en'] }))
  .add('signup', () => ({ locale }) => (
    <AuthenticationPage locale={locale} type='signup' {...attrs} />
  ))
  .add('signup_valid-email', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      type='signup'
      email={email}
      {...attrs}
    />
  ))
  .add('signup_error-email', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      type='signup'
      email={email.split('@')[0]}
      error='email'
      {...attrs}
    />
  ))
  .add('signup_valid-password', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      type='signup'
      password={password}
      {...attrs}
    />
  ))
  .add('signup_error-password', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      type='signup'
      error='password'
      {...attrs}
    />
  ))
  .add('signup_valid-confirm', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      type='signup'
      email={email}
      password={password}
      confirm={password}
      {...attrs}
    />
  ))
  .add('signup_error-confirm', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      type='signup'
      email={email}
      password={password}
      error='confirm'
      {...attrs}
    />
  ))
  .add('signup_consents', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      type='signup'
      consents
      email={email}
      password={password}
      confirm={password}
      {...attrs}
    />
  ))
  .add('signup_consents-terms-checked', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      type='signup'
      consents
      email={email}
      password={password}
      confirm={password}
      news
      terms
      {...attrs}
    />
  ))
  .add('signup_pending', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      type='signup'
      email={email}
      password={password}
      confirm={password}
      pending
      {...attrs}
    />
  ))
  .add('signup_error-submit', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      type='signup'
      email={email}
      error='submit'
      {...attrs}
    />
  ))
  .add('signup_error-offline', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      type='signup'
      email={email}
      error='offline'
      {...attrs}
    />
  ))
  .add('signin', () => ({ locale }) => (
    <AuthenticationPage locale={locale} {...attrs} />
  ))
  .add('signin_valid-email', () => ({ locale }) => (
    <AuthenticationPage locale={locale} email={email} {...attrs} />
  ))
  .add('signin_error-email', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      email={email.split('@')[0]}
      error='email'
      {...attrs}
    />
  ))
  .add('signin_valid-password', () => ({ locale }) => (
    <AuthenticationPage locale={locale} password={password} {...attrs} />
  ))
  .add('signin_error-password', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      password={password}
      error='password'
      {...attrs}
    />
  ))
  .add('signin_valid-credentials', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      email={email}
      password={password}
      {...attrs}
    />
  ))
  .add('signin_pending', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      email={email}
      password={password}
      pending
      {...attrs}
    />
  ))
  .add('signin_error-submit', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      email={email}
      error='submit'
      {...attrs}
    />
  ))
  .add('signin_error-submit-retry', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      email={email}
      retry
      error='submit'
      {...attrs}
    />
  ))
  .add('authorize', () => ({ locale }) => (
    <AuthenticationPage locale={locale} type='authorize' {...attrs} />
  ))
  .add('authorize_valid-email', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      type='authorize'
      email={email}
      {...attrs}
    />
  ))
  .add('authorize_error-email', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      type='authorize'
      email={email.split('@')[0]}
      error='email'
      {...attrs}
    />
  ))
  .add('authorize_valid-password', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      type='authorize'
      password={password}
      {...attrs}
    />
  ))
  .add('authorize_error-password', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      type='authorize'
      password={password}
      error='password'
      {...attrs}
    />
  ))
  .add('authorize_valid-token', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      type='authorize'
      email={email}
      password={password}
      token={token}
      {...attrs}
    />
  ))
  .add('authorize_error-token', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      type='authorize'
      email={email}
      password={password}
      token={token}
      error='token'
      {...attrs}
    />
  ))
  .add('authorize_pending', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      type='authorize'
      email={email}
      password={password}
      token={token}
      pending
      {...attrs}
    />
  ))
  .add('authorize_error-submit', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      type='authorize'
      email={email}
      error='submit'
      {...attrs}
    />
  ))
  .add('authorize_error-offline', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      type='authorize'
      email={email}
      error='offline'
      {...attrs}
    />
  ))
