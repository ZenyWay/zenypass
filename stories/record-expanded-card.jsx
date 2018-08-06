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
//
import { createElement } from 'create-element'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { RecordExpandedCard } from 'components'
import Wrapper from './helpers/card-wrapper'

const record = {
  id: '123456',
  name: 'Github',
  url: 'https://example.com',
  username: 'John Doe',
  mail: 'john.doe@example.com',
  keywords: ['comma', 'separated', 'values'],
  comments: '42 is *'
}

const emptyRecord = {
  ...record,
  name: '',
  url: '',
  username: '',
  password: '',
  mail: '',
  keywords: [],
  comments: ''
}
const attrs = {
  onToggleRequest: action('TOGGLE'),
  onEdit: action('EDIT'),
  onLogin: action('LOGIN'),
  onSave: action('SAVE'),
  onDelete: action('DELETE'),
  password: 'P@ssw0rd!',

  record,
  locale: 'fr',
  onChange: action('CHANGE'),
  onToggleCleartext: action('TOGGLE_CLEARTEXT'),
  onCopyPassword: action('COPY_PASSWORD'),
  onCancel: action('CANCEL'),
  onCopyDone: action('COPY_DONE'),
  onCancelEdit: action('CANCEL_EDIT'),
  onLoginExpand: action('LOGIN_REQUESTED')
}

storiesOf('RecordExpandedCard', module)
  .add('empty', () => (
    <Wrapper>
      <RecordExpandedCard {...attrs} record={emptyRecord} />
    </Wrapper>
  ))
  .add('default', () => (
    <Wrapper>
      <RecordExpandedCard {...attrs} />
    </Wrapper>
  ))
  .add('unpacked-disabled', () => (
    <Wrapper>
      <RecordExpandedCard {...attrs} disabled />
    </Wrapper>
  ))
  .add('unpacked-disabled-cleartext', () => (
    <Wrapper>
      <RecordExpandedCard {...attrs} disabled cleartext />
    </Wrapper>
  ))
  .add('unpacked-cleartext', () => (
    <Wrapper>
      <RecordExpandedCard {...attrs} cleartext />
    </Wrapper>
  ))
  .add('edit', () => (
    <Wrapper>
      <RecordExpandedCard {...attrs} edit />
    </Wrapper>
  ))
  .add('edit-cleartext', () => (
    <Wrapper>
      <RecordExpandedCard {...attrs} edit cleartext />
    </Wrapper>
  ))
  .add('pending-save', () => (
    <Wrapper>
      <RecordExpandedCard {...attrs} edit pendingSave />
    </Wrapper>
  ))
  .add('pending-delete', () => (
    <Wrapper>
      <RecordExpandedCard {...attrs} edit pendingTrash />
    </Wrapper>
  ))
  .add('pending-cleartext', () => (
    <Wrapper>
      <RecordExpandedCard {...attrs} pendingPassword />
    </Wrapper>
  ))
  .add('edit-pending-toggle', () => (
    <Wrapper>
      <RecordExpandedCard {...attrs} edit pendingSave pendingToggle />
    </Wrapper>
  ))
  .add('pending-login', () => (
    <Wrapper>
      <RecordExpandedCard {...attrs} pendingLogin />
    </Wrapper>
  ))
  .add('edit-pending-login', () => (
    <Wrapper>
      <RecordExpandedCard {...attrs} edit pendingLogin />
    </Wrapper>
  ))
  .add('login', () => (
    <Wrapper>
      <RecordExpandedCard {...attrs} login />
    </Wrapper>
  ))
  .add('login-edit', () => (
    <Wrapper>
      <RecordExpandedCard {...attrs} edit login />
    </Wrapper>
  ))
