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
import React from 'react'
import 'react-devtools'
import { storiesOf } from '@storybook/react'
import { RecordField } from 'components'

const attrs = {
  icon: 'fa-question',
  placeholder: 'enter text'
}

storiesOf('RecordField', module)
  .add('url', () => (
    <RecordField id='url' type='url' value='https://example.com' {...attrs} />
  ))
  .add('url-copy', () => (
    <RecordField id='url-copy' type='url' value='https://example.com' copy {...attrs} />
  ))
  .add('url-disabled', () => (
    <RecordField
      id='url-disabled'
      type='url'
      value='https://example.com'
      disabled
      {...attrs}
    />
  ))
  /*
  .add('url-copy-disabled', () => (
    <RecordField
      id='url-copy-disabled'
      type='url'
      value='https://example.com'
      copy
      disabled
      {...attrs}
    />
  ))
  .add('email', () => (
    <RecordField id='email' type='email' value='john.doe@example.com' {...attrs} />
  ))
  .add('text', () => (
    <RecordField id='text' type='text' value='example' {...attrs} />
  ))
  .add('textarea', () => (
    <RecordField id='textarea' type='textarea' value='Rob says wow !' {...attrs} />
  ))
  */
