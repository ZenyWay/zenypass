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
    name: '8-ZenyWay',
    url: 'https://zenyway.com',
    username: 'me@zenyway.com',
    keywords: ['comma', 'separated', 'values'],
    comments: '42 is *'
  },
  {
    name: '1-Note',
    password: '',
    comments: 'bla bla bla'
  },
  {
    name: '2-Wifi',
    comments:
      'wifi password, tablet or smartphone password, code for a vault or facility access'
  },
  {
    name: '3-???',
    username: 'john.doe@example.com',
    password: '',
    comments: 'not sure what this combination would be used for...'
  },
  {
    name: '4-Visa',
    username: 'XXXX XXXX XXXX XXXX',
    comments: 'csv: 123, expires: 12/42'
  },
  {
    name: '5-Bookmark',
    url: 'https://zenyway.com',
    password: ''
  },
  {
    name: '6-???',
    url: 'https://zenyway.com',
    comments: 'not sure what this combination would be used for...'
  },
  {
    name: '7-Medium',
    url: 'https://medium.com',
    username: 'john.doe@example.com',
    password: '',
    comments: 'password-less online account'
  },
  {
    name: 'Overflow 01234567890123456789 01234567890123456789',
    url: 'https://overflow.com/01234567890123456789/01234567890123456789',
    username: 'user012345678901234567890123456789@overflow.com',
    keywords: ['0123456789', 'abcdefghij', 'klmnopqrst', 'uvwxyz0123456789'],
    comments:
      '0123456789 01234567890123456789 0123456789 01234567890123456789 0123456789 01234567890123456789'
  },
  {
    name: 'HSVC',
    url: 'https://hvsc.c64.org/',
    username: 'rob.hubbard@hsvc.org',
    keywords: ['sid', 'music', 'collection'],
    comments: 'Rob says wow !'
  }
].map((record, index) => ({
  _id: `${index}`,
  _rev: '1',
  url: '',
  username: '',
  keywords: [],
  comment: '',
  ...record
}))

export const EMPTY_RECORD = {
  _id: '99',
  name: '',
  url: '',
  username: '',
  password: '',
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
