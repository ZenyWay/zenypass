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
  onCancel: action('CANCEL'),
  onChange: action('CHANGE'),
  onConfirmInputRef: action('CONFIRM_INPUT_REF'),
  onEmailInputRef: action('EMAIL_INPUT_REF'),
  onPasswordInputRef: action('PASSWORD_INPUT_REF'),
  onTokenInputRef: action('TOKEN_INPUT_REF'),
  onSelectEmail: action('SELECT_EMAIL'),
  onSelectLocale: action('SELECT_LOCALE'),
  onSubmit: action('SUBMIT'),
  onToggleConsent: action('TOGGLE_CONSENT'),
  onTogglePageType: action('TOGGLE_PAGE_TYPE')
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

const password = 'P@ssw0rd!'

storiesOf('AuthenticationPage (SFC)', module)
  .addDecorator(withL10n({ locales: ['fr', 'en'] }))
  .add('signup', () => ({ locale }) => (
    <AuthenticationPage locale={locale} type='signup' {...attrs} />
  ))
  .add('signup_enabled-email', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      type='signup'
      email={emails[0].label}
      enabled='email'
      {...attrs}
    />
  ))
  .add('signup_error-email', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      type='signup'
      email={emails[0].label}
      enabled='email'
      error='email'
      {...attrs}
    />
  ))
  .add('signup_enabled-password', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      type='signup'
      email={emails[0].label}
      enabled='password'
      {...attrs}
    />
  ))
  .add('signup_error-password', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      type='signup'
      email={emails[0].label}
      enabled='password'
      error='password'
      {...attrs}
    />
  ))
  .add('signup_enabled', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      type='signup'
      email={emails[0].label}
      password={password}
      enabled
      {...attrs}
    />
  ))
  .add('signup_error-confirm', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      type='signup'
      email={emails[0].label}
      password={password}
      enabled
      error='confirm'
      {...attrs}
    />
  ))
  .add('signup_consents', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      type='signup'
      consents
      email={emails[0].label}
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
      email={emails[0].label}
      password={password}
      confirm={password}
      terms
      {...attrs}
    />
  ))
  .add('signup_pending', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      type='signup'
      email={emails[0].label}
      password={password}
      confirm={password}
      pending
      {...attrs}
    />
  ))
  .add('signin', () => ({ locale }) => (
    <AuthenticationPage locale={locale} email={emails[0].label} {...attrs} />
  ))
  .add('signin_enabled-email', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      email={emails[0].label}
      enabled='email'
      {...attrs}
    />
  ))
  /*
  .add('signin_enabled-emails', () => (
    <AuthenticationPage
      email={emails[0].label}
      emails={emails.slice(1)}
      enabled='email'
      {...attrs}
    />
  ))
  */
  .add('signin_error-email', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      email={emails[0].label}
      enabled='email'
      error='email'
      {...attrs}
    />
  ))
  .add('signin_enabled', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      email={emails[0].label}
      enabled
      {...attrs}
    />
  ))
  .add('signin_created', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      email={emails[0].label}
      created
      enabled
      {...attrs}
    />
  ))
  .add('signin_error-password', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      email={emails[0].label}
      enabled
      error='password'
      {...attrs}
    />
  ))
  .add('signin_error-submit', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      email={emails[0].label}
      enabled
      error='submit'
      {...attrs}
    />
  ))
  .add('signin_error-submit-retry', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      email={emails[0].label}
      retry
      error='submit'
      {...attrs}
    />
  ))
  .add('signin_pending', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      email={emails[0].label}
      password={password}
      pending
      {...attrs}
    />
  ))
  .add('authorize', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      type='authorize'
      email={emails[0].label}
      {...attrs}
    />
  ))
  .add('authorize_enabled-email', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      type='authorize'
      email={emails[0].label}
      enabled='email'
      {...attrs}
    />
  ))
  .add('authorize_enabled-password', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      type='authorize'
      email={emails[0].label}
      enabled='password'
      {...attrs}
    />
  ))
  .add('authorize_error-password', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      type='authorize'
      email={emails[0].label}
      enabled='password'
      error='password'
      {...attrs}
    />
  ))
  .add('authorize_enabled', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      type='authorize'
      email={emails[0].label}
      password={password}
      enabled
      {...attrs}
    />
  ))
  .add('authorize_error-token', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      type='authorize'
      email={emails[0].label}
      password={password}
      enabled
      error='token'
      {...attrs}
    />
  ))
