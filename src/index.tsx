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
import 'symbol-observable' // polyfill
import { createElement, render } from 'create-element'
import { ControlledConnectionModal } from 'components'
import createL10n from 'basic-l10n'
const debug = (process.env.NODE_ENV !== 'production') && require('debug')('zenypass:app:')
const l10n = createL10n(require('./locales.json'), { debug, locale: 'fr' })

const RECORD = {
  id: '123456',
  name: 'Example',
  url: 'https://news.ycombinator.com/',
  username: 'john.doe@example.com',
  password: 'P@ssw0rd!',
  keywords: ['comma', 'separated', 'values'],
  comments: '42 is *'
}

const { name, url, username, password } = RECORD

const attrs = {
  name,
  url,
  username,
  password,
  onCancel: console.log.bind(console, 'CANCEL:')
}

function App () {
  return (
    <div>
      <h1>{l10n`Welcome to ZenyPass!`}</h1>
      <ControlledConnectionModal display {...attrs} />
    </div>
  )
}

render(<App />, document.getElementById('app'))
