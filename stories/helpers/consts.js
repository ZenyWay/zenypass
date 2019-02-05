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
export const PASSWORD = 'P@ssw0rd!'

export const RECORDS = [
  {
    _id: '1',
    name: 'Example',
    url: 'https://example.com',
    username: 'john.doe@example.com',
    keywords: ['comma', 'separated', 'values'],
    comments: '42 is *'
  },
  {
    _id: '2',
    name: 'ZenyWay',
    url: 'https://zenyway.com',
    username: 'me@zenyway.com',
    keywords: [],
    comments: ''
  },
  {
    _id: '2',
    name: 'HSVC',
    url: 'https://hvsc.c64.org/',
    username: 'rob.hubbard@hsvc.org',
    keywords: ['sid', 'music', 'collection'],
    comments: 'Rob says wow !'
  }
]

export const EMPTY_RECORD = {
  _id: '4',
  name: '',
  url: '',
  username: '',
  keywords: [],
  comments: ''
}

export const RECORD = RECORDS[0]

export const LANG_MENU = [
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
]

export const HELP_MENU = [
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
]

export const MENU = [
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
  LANG_MENU,
  HELP_MENU,
  {
    'data-id': 'sign-out',
    label: 'sign-out',
    icon: 'fa fa-power-off'
  }
]
