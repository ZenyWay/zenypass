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
import { AutoformatRecordField } from 'components'

const attrs = {
  locale: 'fr',
  onChange: action('CHANGE')
}
const onToggleCleartext = action('TOGGLE_CLEARTEXT')
const onCopyPassword = action('COPY_PASSWORD')

storiesOf('AutoformatRecordField', module)
  // onChange prop becomes onInput: https://github.com/infernojs/inferno/issues/1263#issuecomment-361710508
  // text inputs with both onChange and onInput handlers will malfunction in Storybook (inferno-compat)
  .add('onchange-issue', () => (
    <input
      id='onchange-issue'
      type='text'
      onInput={action('INPUT')}
      onChange={action('CHANGE')}
    />
  ))
  .add('csv', () => (
    <AutoformatRecordField
      {...attrs}
      id='csv'
      type='csv'
      value={['comma', 'separated', 'values']}
    />
  ))
  .add('email', () => (
    <AutoformatRecordField
      {...attrs}
      id='email'
      type='email'
      value='john.doe@example.com'
    />
  ))
  .add('password', () => (
    <AutoformatRecordField
      {...attrs}
      id='password'
      type='password'
      value='P@ssw0rd'
      onToggle={onToggleCleartext}
      onCopy={onCopyPassword}
    />
  ))
  .add('textarea', () => (
    <AutoformatRecordField
      {...attrs}
      id='textarea'
      type='textarea'
      value='Rob says wow !'
    />
  ))
  .add('url', () => (
    <AutoformatRecordField
      {...attrs}
      id='url'
      type='url'
      value='https://example.com'
    />
  ))
  .add('url-copy', () => (
    <AutoformatRecordField
      {...attrs}
      id='url-copy'
      type='url'
      value='https://example.com'
      copy
    />
  ))
  .add('url-disabled', () => (
    <AutoformatRecordField
      {...attrs}
      id='url-disabled'
      type='url'
      value='https://example.com'
      disabled
    />
  ))
  /*
  .add('url-copy-disabled', () => (
    <RecordField
      {...attrs}
      id='url-copy-disabled'
      type='url'
      value='https://example.com'
      copy
      disabled
    />
  ))
  */
