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
import { PasswordGenerator } from 'components'
import { action } from '@storybook/addon-actions'
import withL10n from 'zenyway-storybook-addon-l10n'

const PASSWORD = 'p@ssW0rd!'
const attrs = {
  icon: 'tools',
  outline: true,
  color: 'info',
  innerRef: action('INNER_REF'),
  onError: action('ERROR'),
  onChange: action('CHANGE')
}

storiesOf('PasswordGenerator', module)
  .addDecorator(withL10n({ locales: ['fr', 'en'] }))
  .add('undefined-value', () => ({ locale }) => (
    <PasswordGenerator locale={locale} {...attrs} />
  ))
  .add('defined-value', () => ({ locale }) => (
    <PasswordGenerator locale={locale} value={PASSWORD} {...attrs} />
  ))
