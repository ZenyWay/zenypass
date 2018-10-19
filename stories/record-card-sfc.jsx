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
import { RecordCardSFC as RecordCard } from 'components'

const publicRecord = {
  _id: '123456',
  name: 'Example',
  url: 'https://example.com',
  username: 'john.doe@example.com',
  keywords: ['comma', 'separated', 'values'],
  comments: '42 is *'
}

const privateRecord = {
  ...publicRecord,
  password: 'P@ssw0rd!'
}

const attrs = {
  locale: 'fr',
  onConnectRequest: action('CONNECT_REQUEST'),
  onToggleExpand: action('TOGGLE_EXPAND'),
  onToggleCleartext: action('TOGGLE_CLEARTEXT'),
  onChange: action('CHANGE'),
  onCancelEditRecord: action('CANCEL_EDIT_RECORD'),
  onUpdateRecordRequest: action('UPDATE_RECORD_REQUEST'),
  onDeleteRecordRequest: action('DELETE_RECORD_REQUEST')
}

storiesOf('RecordCard (SFC)', module)
  .add('disabled', () => (
    <RecordCard record={publicRecord} {...attrs} disabled />
  ))
  .add('expanded-disabled-cleartext', () => (
    <RecordCard record={privateRecord} {...attrs} expanded disabled cleartext />
  ))
  .add('expanded', () => (
    <RecordCard record={privateRecord} {...attrs} expanded />
  ))
  .add('expanded-cleartext', () => (
    <RecordCard record={privateRecord} {...attrs} expanded cleartext />
  ))
