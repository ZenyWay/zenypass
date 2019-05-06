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
import { StorageOfferCardSFC } from 'components'

const attrs = {
  country: 'FR',
  currency: 'EUR',
  onCheckout: action('CHECKOUT'),
  onClickMinus: action('CLICK_MINUS'),
  onClickPlus: action('CLICK_PLUS'),
  onInput: action('INPUT')
}

storiesOf('StorageOfferCard (SFC)', module)
  .addDecorator(withL10n({ locales: ['fr', 'en'] }))
  .add('A-la-Carte_1', () => ({ locale }) => (
    <StorageOfferCardSFC
      locale={locale}
      uiid='UNIT'
      quantity={1}
      price={99}
      {...attrs}
    />
  ))
  .add('A-la-Carte_1_Processing', () => ({ locale }) => (
    <StorageOfferCardSFC
      locale={locale}
      uiid='UNIT'
      quantity={1}
      price={99}
      processing
      {...attrs}
    />
  ))
  .add('A-la-Carte_1_Offline', () => ({ locale }) => (
    <StorageOfferCardSFC
      locale={locale}
      uiid='UNIT'
      quantity={1}
      price={99}
      offline
      {...attrs}
    />
  ))
  .add('A-la-Carte_5', () => ({ locale }) => (
    <StorageOfferCardSFC
      locale={locale}
      uiid='UNIT'
      quantity={5}
      price={349}
      {...attrs}
    />
  ))
  .add('A-la-Carte_Custom', () => ({ locale }) => (
    <StorageOfferCardSFC
      locale={locale}
      ucid='LAUNCH'
      uiid='UNIT'
      quantity={10}
      price={694}
      editable
      {...attrs}
    />
  ))
  .add('Premium', () => ({ locale }) => (
    <StorageOfferCardSFC
      locale={locale}
      ucid='LAUNCH'
      uiid='PREM'
      quantity={1}
      price={4900}
      {...attrs}
    />
  ))
