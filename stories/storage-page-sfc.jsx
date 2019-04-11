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
import { StoragePageSFC } from 'components'
import { USERNAME } from '../stubs/zenypass-service'

const attrs = {
  docs: 14,
  code: 'code-pei6vt0kf/oreh0z',
  session: USERNAME,
  onClose: action('CLOSE'),
  onError: action('ERROR'),
  onInput: action('INPUT'),
  onToggleOffline: action('TOGGLE_OFFLINE'),
  inputRef: action('INPUT_REF')
}

const offers = [
  {
    uiid: 'UNIT',
    quantity: 1,
    price: 99
  },
  {
    uiid: 'UNIT',
    quantity: 5,
    price: 349
  },
  {
    uiid: 'UNIT',
    quantity: 10,
    price: 694,
    editable: true
  },
  {
    uiid: 'PREM',
    quantity: 1,
    price: 4900
  }
]

storiesOf('StoragePage (SFC)', module)
  .addDecorator(withL10n({ locales: ['fr', 'en'] }))
  .add('init', () => ({ locale }) => (
    <StoragePageSFC locale={locale} {...attrs} init />
  ))
  .add('pending-maxdocs', () => ({ locale }) => (
    <StoragePageSFC locale={locale} {...attrs} offers={offers} />
  ))
  .add('default', () => ({ locale }) => (
    <StoragePageSFC locale={locale} {...attrs} offers={offers} maxdocs={15} />
  ))
