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
import { action } from '@storybook/addon-actions'
import withL10n from 'zenyway-storybook-addon-l10n'
import { RouterSFC, withAuthenticationModal } from 'components'
import { withAuthentication } from 'hocs'
import { LANG_MENU, MENU } from './helpers/consts'

const attrs = {
  onAuthenticated: action('AUTHENTICATED'),
  onAuthenticationPageType: action('AUTHENTICATION_PAGE_TYPE'),
  onEmailChange: action('EMAIL_CHANGE'),
  onError: action('ERROR'),
  onSelectMenuItem: action('SELECT_MENU_ITEM')
}

const INTERNAL_ERROR = new Error('fatal error')
INTERNAL_ERROR.status = 500

const Router = withAuthentication(withAuthenticationModal(RouterSFC))

storiesOf('Router (SFC)', module)
  .addDecorator(withL10n({ locales: ['fr', 'en'] }))
  .add('path /', () => ({ locale }) => (
    <Router
      locale={locale}
      path='/'
      menu={MENU.slice(1) /* remove entry from home-page */}
      {...attrs}
    />
  ))
  .add('path /authorize', () => ({ locale }) => (
    <Router locale={locale} path='/authorize' menu={LANG_MENU} {...attrs} />
  ))
  .add('path /signup', () => ({ locale }) => (
    <Router locale={locale} path='/signup' menu={LANG_MENU} {...attrs} />
  ))
  .add('path /signin', () => ({ locale }) => (
    <Router locale={locale} path='/signin' menu={LANG_MENU} {...attrs} />
  ))
  .add('path /fatal', () => ({ locale }) => (
    <Router locale={locale} path='/fatal' error={INTERNAL_ERROR} {...attrs} />
  ))
  .add('path /unknown/route', () => ({ locale }) => (
    <Router locale={locale} path='/unknown/route' {...attrs} />
  ))
