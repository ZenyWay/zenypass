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
import { storiesOf } from '@storybook/react'
import { RecordModal } from 'components'
import { action } from '@storybook/addon-actions'

const record = {
  id: '123456',
  name: 'Github',
  url: 'https://example.com',
  username: 'john.doe@example.com',
  password: 'P@ssw0rd!',
  keywords: ['comma', 'separated', 'values'],
  comments: '42 is *'
}

const incomplete = {
  ...record,
  url: '',
  username: ''
}

const attrs = {
  onCancel: action('CANCELLED'),
  onCopy: action('COPY'),
  onWebsite: action('WEBSITE')
}

storiesOf('RecordModal', module)
  .add('default', () => (
    <RecordModal open {...attrs} record={record} step={1} />
  ))
  .add('step-2', () => (
    <RecordModal open {...attrs} record={record} step={2} />
  ))
  .add('incomplete-record-step-1', () => (
    <RecordModal open {...attrs} record={incomplete} step={1} />
  ))
  .add('incomplete-record-step-2', () => (
    <RecordModal open {...attrs} record={incomplete} step={2} />
  ))
