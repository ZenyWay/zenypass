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
import { HomePage } from 'components'
import { menu } from './navbar-menu-sfc'

const attrs = {
  locale: 'fr',
  menu: menu.slice(1), // remove entry from home-page
  onLogout: action('LOGOUT'),
  onSelectMenuItem: action('SELECT_MENU_ITEM')
}

storiesOf('HomePage', module)
  .add('default', () => (
    <HomePage {...attrs} />
  ))
