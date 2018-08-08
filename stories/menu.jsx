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
import { Menu } from 'components'
import { storiesOf, action } from '@storybook/react'

export const menu = [
  {
    'data-id': 'new-bookmark',
    title: 'new-bookmark',
    href: 'https://zenyway.com/password-manager/home/fr/index.html',
    icon: 'fa fa-plus'
  },
  {
    'data-id': 'authorizations',
    title: 'authorizations',
    icon: 'fa fa-mobile fa-lg'
  },
  {
    'data-id': 'storage',
    title: 'storage',
    icon: 'fa fa-database'
  },
  [
    {
      title: 'lang',
      icon: 'fa fa-globe'
    },
    {
      'data-id': 'lang/fr',
      title: 'fr',
      icon: 'flag-icon flag-icon-fr'
    },
    {
      'data-id': 'lang/en',
      title: 'en',
      icon: ['flag-icon flag-icon-gb', 'flag-icon flag-icon-us']
    }
  ],
  [
    {
      title: 'help',
      icon: 'fa fa-question-circle'
    },
    {
      'data-id': 'help/first-steps',
      title: 'first-steps',
      icon: 'fa fa-fast-forward'
    },
    {
      'data-id': 'help/online-help',
      title: 'online-help',
      icon: 'fa fa-question-circle',
      href: 'help-link'
    }
  ],
  {
    'data-id': 'sign-out',
    title: 'sign-out',
    icon: 'fa fa-power-off'
  }
]

const attr = {
  menu,
  onToggleExpand: action('TOGGLE_EXPAND'),
  onSelect: action('SELECT')
}

storiesOf('Menu', module)
  .add('default', () => (
    <Menu {...attr} />
  ))
  .add('expand', () => (
    <Menu {...attr} expand />
  ))
