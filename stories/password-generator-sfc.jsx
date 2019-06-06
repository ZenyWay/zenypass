/**
 * Copyright 2018 ZenyWay S.A.S., Stephane M. Catala
 * @author Stephane M. Catala
 * @author Clement Bonet
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
import { PasswordGeneratorSFC as PasswordGenerator } from 'components'
import { action } from '@storybook/addon-actions'
import withL10n from 'zenyway-storybook-addon-l10n'
import preventDefaultAction from './helpers/prevent-default'

const PASSWORD = 'p@ssW0rd!'
const attrs = {
  icon: 'tools',
  outline: true,
  color: 'info',
  length: '12',
  value: '#r@nD0m',
  innerRef: action('INNER_REF'),
  onClickMinus: action('CLICK_MINUS'),
  onClickPlus: action('CLICK_PLUS'),
  onDefaultActionButton: action('DEFAULT_ACTION_BUTTON'),
  onInput: action('INPUT'),
  onRefresh: action('REFRESH'),
  onSelect: preventDefaultAction('SELECT'),
  onToggleCleartext: action('TOGGLE_CLEARTEXT'),
  onToggleGenerator: action('TOGGLE_GENERATOR'),
  onToggleLowerCase: action('TOGGLE_LOWER_CASE'),
  onToggleNumbers: action('TOGGLE_NUMBERS'),
  onToggleUpperCase: action('TOGGLE_UPPER_CASE'),
  onToggleSymbols: action('TOGGLE_SYMBOLS')
}

storiesOf('PasswordGenerator (SFC)', module)
  .addDecorator(withL10n({ locales: ['fr', 'en'] }))
  .add('idle', () => ({ locale }) => (
    <PasswordGenerator locale={locale} {...attrs} />
  ))
  .add('open-lowercase', () => ({ locale }) => (
    <PasswordGenerator locale={locale} open lowercase {...attrs} />
  ))
  .add('open-original-uppercase', () => ({ locale }) => (
    <PasswordGenerator
      locale={locale}
      open
      original={PASSWORD}
      uppercase
      {...attrs}
    />
  ))
  .add('open-original-numbers-symbols-cleartext', () => ({ locale }) => (
    <PasswordGenerator
      locale={locale}
      open
      original={PASSWORD}
      numbers
      symbols
      cleartext
      {...attrs}
    />
  ))
