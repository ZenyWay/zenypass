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
//
/** @jsx createElement */
import { createElement } from 'create-element'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import withL10n from 'zenyway-storybook-addon-l10n'
import { RECORDS, EMPTY_RECORD, MENU } from './helpers/consts'
import preventDefaultAction from './helpers/prevent-default'
import { HomePageSFC, withAuthenticationModal } from 'components'
import { withAuthentication } from 'hocs'
import { concat } from 'rxjs'

const records = RECORDS.map(record => ({ _id: record._id, record }))
const randomFilter = entry => ({ ...entry, exclude: Math.random() > 0.33 })

const attrs = {
  menu: MENU,
  onAuthenticationRequest: action('AUTHENTICATION_REQUESTED'),
  onCancelCountdown: action('CANCEL_COUNTDOWN'),
  onSelectMenuItem: preventDefaultAction('MENU_ITEM_SELECTED'),
  onSearchFieldRef: action('SEARCH_FIELD_REF'),
  onTokensChange: action('TOKENS_CHANGE'),
  onTokensClear: action('TOKENS_CLEAR'),
  onToggleFilter: action('TOGGLE_FILTER')
}

const HomePage = withAuthentication(withAuthenticationModal(HomePageSFC))

storiesOf('HomePage (SFC)', module)
  .addDecorator(withL10n({ locales: ['fr', 'en'] }))
  .add('default', () => ({ locale }) => (
    <HomePage locale={locale} records={records} {...attrs} />
  ))
  .add('filter', () => ({ locale }) => (
    <HomePage
      locale={locale}
      records={records.map(randomFilter)}
      tokens={['com', 'zen']}
      {...attrs}
    />
  ))
  .add('loading-records', () => ({ locale }) => (
    <HomePage
      locale={locale}
      records={records}
      busy='loading-records'
      {...attrs}
    />
  ))
  .add('countdown', () => ({ locale }) => (
    <HomePage locale={locale} records={records} unrestricted={42} {...attrs} />
  ))
  .add('creating-new-record', () => ({ locale }) => (
    <HomePage
      locale={locale}
      records={records}
      busy='creating-new-record'
      {...attrs}
    />
  ))
  .add('pending-record', () => ({ locale }) => (
    <HomePage
      locale={locale}
      records={records.slice(0, 2).concat([{ _id: EMPTY_RECORD._id }])}
      {...attrs}
    />
  ))
  .add('error', () => ({ locale }) => (
    <HomePage locale={locale} records={records} error='ouch !' {...attrs} />
  ))
