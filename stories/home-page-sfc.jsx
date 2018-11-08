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
import { RECORDS } from './helpers/consts'
import preventDefaultAction from './helpers/prevent-default'
import {
  HomePageSFC,
  withAuthenticationModal
} from 'components'
import { withAuthentication } from 'hocs'
import { menu } from './navbar-menu-sfc'

const attrs = {
  locale: 'fr',
  menu,
  records: RECORDS,
  onAuthenticationRequest: action('AUTHENTICATION_REQUESTED'),
  onSelectMenuItem: preventDefaultAction('MENU_ITEM_SELECTED'),
  onSearchFieldRef: action('SEARCH_FIELD_REF'),
  onTokensChange: action('TOKENS_CHANGE'),
  onTokensClear: action('TOKENS_CLEAR'),
  onToggleFilter: action('TOGGLE_FILTER')
}

const HomePage =
  withAuthentication(withAuthenticationModal(HomePageSFC))

storiesOf('HomePage (SFC)', module)
  .add('default', () => (
    <HomePage {...attrs} />
  ))
  .add('filter', () => (
    <HomePage filter={[false, true, false]} tokens='com zen' {...attrs} />
  ))
