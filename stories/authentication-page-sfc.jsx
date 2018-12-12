/** @jsx createElement */

import { createElement } from 'create-element'
import { storiesOf } from '@storybook/react'
import { AuthenticationPageSFC as AuthenticationPage } from 'components'
import { action } from '@storybook/addon-actions'
import preventDefaultAction from './helpers/prevent-default'
import { LANG_MENU } from './helpers/consts'

const locales = LANG_MENU.slice()
delete locales[0].label // remove label of dropdown toggle

const attrs = {
  locale: 'fr',
  locales: LANG_MENU,
  onCancelConsents: action('CANCEL_CONSENTS'),
  onChange: action('CHANGE'),
  onConfirmInputRef: action('CONFIRM_INPUT_REF'),
  onEmailInputRef: action('EMAIL_INPUT_REF'),
  onPasswordInputRef: action('PASSWORD_INPUT_REF'),
  onSelectEmail: action('SELECT_EMAIL'),
  onSelectLocale: action('SELECT_LOCALE'),
  onSignup: preventDefaultAction('SIGNUP'),
  onSignin: preventDefaultAction('SIGNIN'),
  onToggleConsent: action('TOGGLE_CONSENT'),
  onToggleSignup: action('TOGGLE_SIGNUP')
}

const emails = [ 'jane.doe@example.com', 'rob@hvsc.org' ]
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
  .add('signup', () => (
    <AuthenticationPage
      signup
      {...attrs}
    />
  ))
  .add('signup_enabled-email', () => (
    <AuthenticationPage
      signup
      email={emails[0].label}
      enabled='email'
      {...attrs}
    />
  ))
  .add('signup_error-email', () => (
    <AuthenticationPage
      signup
      email={emails[0].label}
      enabled='email'
      error='email'
      {...attrs}
    />
  ))
  .add('signup_enabled-password', () => (
    <AuthenticationPage
      signup
      email={emails[0].label}
      enabled='password'
      {...attrs}
    />
  ))
  .add('signup_error-password', () => (
    <AuthenticationPage
      signup
      email={emails[0].label}
      enabled='password'
      error='password'
      {...attrs}
    />
  ))
  .add('signup_enabled', () => (
    <AuthenticationPage
      signup
      email={emails[0].label}
      password={password}
      enabled
      {...attrs}
    />
  ))
  .add('signup_error-confirm', () => (
    <AuthenticationPage
      signup
      email={emails[0].label}
      password={password}
      enabled
      error='confirm'
      {...attrs}
    />
  ))
  .add('signup_consents', () => (
    <AuthenticationPage
      signup
      consents
      email={emails[0].label}
      password={password}
      confirm={password}
      {...attrs}
    />
  ))
  .add('signup_pending', () => (
    <AuthenticationPage
      signup
      email={emails[0].label}
      password={password}
      confirm={password}
      pending
      {...attrs}
    />
  ))
  .add('signin', () => (
    <AuthenticationPage
      email={emails[0].label}
      {...attrs}
    />
  ))
  .add('signin_enabled-email', () => (
    <AuthenticationPage
      email={emails[0].label}
      enabled='email'
      {...attrs}
    />
  ))
  .add('signin_enabled-emails', () => (
    <AuthenticationPage
      email={emails[0].label}
      emails={emails.slice(1)}
      enabled='email'
      {...attrs}
    />
  ))
  .add('signin_error-email', () => (
    <AuthenticationPage
      email={emails[0].label}
      enabled='email'
      error='email'
      {...attrs}
    />
  ))
  .add('signin_enabled', () => (
    <AuthenticationPage
      email={emails[0].label}
      enabled
      {...attrs}
    />
  ))
  .add('signin_created', () => (
    <AuthenticationPage
      email={emails[0].label}
      created
      enabled
      {...attrs}
    />
  ))
  .add('signin_error-password', () => (
    <AuthenticationPage
      email={emails[0].label}
      enabled
      error='password'
      {...attrs}
    />
  ))
  .add('signin_error-unauthorized', () => (
    <AuthenticationPage
      email={emails[0].label}
      enabled
      error='unauthorized'
      {...attrs}
    />
  ))
  .add('signin_pending', () => (
    <AuthenticationPage
      email={emails[0].label}
      password={password}
      pending
      {...attrs}
    />
  ))
