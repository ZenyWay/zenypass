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
import { RecordForm } from 'components'

const record = {
  id: '123456',
  url: 'https://example.com',
  username: 'john.doe@example.com',
  password: 'P@ssw0rd!',
  keywords: ['comma', 'separated', 'values'],
  comments: '42 is *'
}

const attrs = {
  record,
  locale: 'fr',
  onChange: action('CHANGE'),
  onToggleCleartext: action('TOGGLE_CLEARTEXT'),
  onCopyPassword: action('COPY_PASSWORD')
}

storiesOf('AutoformatRecordForm', module)
  .add('disabled', () => (
    <RecordForm {...attrs} disabled />
  ))
  .add('disabled-cleartext', () => (
    <RecordForm {...attrs} disabled cleartext />
  ))
  .add('enabled', () => (
    <RecordForm {...attrs} />
  ))
  .add('enabled-cleartext', () => (
    <RecordForm {...attrs} cleartext />
  ))
