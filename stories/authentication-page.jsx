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
import { AuthenticationPage } from 'components'
import { action } from '@storybook/addon-actions'
import withL10n from 'zenyway-storybook-addon-l10n'
import { LANG_MENU } from './helpers/consts'

const locales = LANG_MENU.slice()
delete locales[0].label // remove label of dropdown toggle

const attrs = {
  locales: LANG_MENU,
  onAuthenticated: action('AUTHENTICATED'),
  onAuthenticationPageType: action('AUTHENTICATION_PAGE_TYPE'),
  onEmailChange: action('EMAIL_CHANGE'),
  onError: action('ERROR'),
  onSelectLocale: action('SELECT_LOCALE')
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

storiesOf('AuthenticationPage', module)
  .addDecorator(withL10n({ locales: ['fr', 'en'] }))
  .add('signin', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      emails={emails.slice(1)} // TODO remove
      {...attrs}
    />
  ))
  .add('signin-error-email', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      emails={emails.slice(1)} // TODO remove
      email={emails[0].label.split('@')[0]}
      {...attrs}
    />
  ))
  .add('signin-email', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      emails={emails.slice(1)} // TODO remove
      email={emails[0].label}
      {...attrs}
    />
  ))
  .add('signup', () => ({ locale }) => (
    <AuthenticationPage locale={locale} type='signup' {...attrs} />
  ))
  .add('signup-email', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      type='signup'
      email={emails[0].label}
      {...attrs}
    />
  ))
  .add('authorize-email', () => ({ locale }) => (
    <AuthenticationPage
      locale={locale}
      type='authorize'
      email={emails[0].label}
      {...attrs}
    />
  ))
