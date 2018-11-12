/**
 * Copyright 2018 ZenyWay S.A.S., Stephane M. Catala
 * @author Stephane M. Catala
 * @author Hadrien Boulanger
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
import { NavbarMenuSFC } from 'components'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import preventDefaultAction from './helpers/prevent-default'

export const menu = [
  {
    'data-id': 'new-entry',
    label: 'new-entry',
    href: 'https://zenyway.com/password-manager/home/fr/index.html',
    icon: 'fa fa-plus'
  },
  {
    'data-id': 'authorizations',
    label: 'authorizations',
    icon: 'fa fa-mobile fa-lg'
  },
  {
    'data-id': 'storage',
    label: 'storage',
    icon: 'fa fa-database'
  },
  [
    {
      'data-id': 'lang',
      label: 'lang',
      icon: 'fa fa-globe'
    },
    {
      'data-id': 'lang/fr',
      label: 'fr',
      icon: 'flag-icon flag-icon-fr'
    },
    {
      'data-id': 'lang/en',
      label: 'en',
      icon: ['flag-icon flag-icon-gb', 'flag-icon flag-icon-us']
    }
  ],
  [
    {
      'data-id': 'help',
      label: 'help',
      icon: 'fa fa-question-circle'
    },
    {
      'data-id': 'help/first-steps',
      label: 'first-steps',
      icon: 'fa fa-fast-forward'
    },
    {
      'data-id': 'help/online-help',
      label: 'online-help',
      icon: 'fa fa-question-circle',
      href: 'help-link'
    }
  ],
  {
    'data-id': 'sign-out',
    label: 'sign-out',
    icon: 'fa fa-power-off'
  }
]

const attr = {
  menu,
  onClickItem: preventDefaultAction('CLICK_ITEM'),
  onClickToggle: preventDefaultAction('CLICK_TOGGLE'),
  innerRef: action('INNER_REF')
}

storiesOf('NavbarMenu (SFC)', module)
  .add('default', () => (
    <NavbarMenuSFC {...attr} />
  ))
  .add('expanded', () => (
    <NavbarMenuSFC {...attr} expanded />
  ))
