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
import { ConnectionModalSFC as ConnectionModal } from 'components'
import { action } from '@storybook/addon-actions'
import { RECORD } from './helpers/consts'
import preventDefaultAction from './helpers/prevent-default'

const { name, username } = RECORD
const password = 'P@ssw0rd!'

const attrs = {
  open: true,
  name,
  username,
  password,
  locale: 'fr',
  onCancel: action('CANCELLED'),
  onToggleManual: action('TOGGLE_MANUAL'),
  onToggleCleartext: action('TOGGLE_CLEARTEXT'),
  onClickCopy: preventDefaultAction('CLICK_COPY'),
  onUsernameCopied: action('USERNAME_COPIED'),
  onPasswordCopied: action('USERNAME_COPIED'),
  onDefaultCopyButtonRef: action('DEFAULT_COPY_BUTTON_REF')
}

storiesOf('ConnectionModal (SFC)', module)
  .add('copy-all', () => <ConnectionModal copy='all' {...attrs} />)
  .add('copy-username', () => (
    <ConnectionModal warning='password-first' copy='username' {...attrs} />
  ))
  .add('copy-password', () => (
    <ConnectionModal
      warning='clipboard-contaminated'
      copy='password'
      {...attrs}
    />
  ))
  .add('cleartext', () => <ConnectionModal cleartext copy='all' {...attrs} />)
  .add('manual', () => <ConnectionModal manual copy='all' {...attrs} />)
  .add('clear-clipboard', () => <ConnectionModal {...attrs} />)
  .add('clear-clipboard-error', () => (
    <ConnectionModal error='clear-clipboard' {...attrs} />
  ))
