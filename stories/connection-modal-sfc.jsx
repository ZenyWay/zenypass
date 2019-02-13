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
import withL10n from 'zenyway-storybook-addon-l10n'
import { RECORD, PASSWORD } from './helpers/consts'
import preventDefaultAction from './helpers/prevent-default'

const { name, username } = RECORD

const attrs = {
  open: true,
  name,
  username,
  password: PASSWORD,
  onCancel: action('CANCELLED'),
  onToggleManual: action('TOGGLE_MANUAL'),
  onToggleCleartext: action('TOGGLE_CLEARTEXT'),
  onClickCopy: preventDefaultAction('CLICK_COPY'),
  onUsernameCopied: action('USERNAME_COPIED'),
  onPasswordCopied: action('USERNAME_COPIED'),
  onDefaultActionButtonRef: action('DEFAULT_ACTION_BUTTON_REF')
}

storiesOf('ConnectionModal (SFC)', module)
  .addDecorator(withL10n({ locales: ['fr', 'en'] }))
  .add('copy-all', () => ({ locale }) => (
    <ConnectionModal locale={locale} copy='all' {...attrs} />
  ))
  .add('copy-username', () => ({ locale }) => (
    <ConnectionModal
      locale={locale}
      warning='password-first'
      copy='username'
      {...attrs}
    />
  ))
  .add('copy-password', () => ({ locale }) => (
    <ConnectionModal
      locale={locale}
      warning='clipboard-contaminated'
      copy='password'
      {...attrs}
    />
  ))
  .add('cleartext', () => ({ locale }) => (
    <ConnectionModal locale={locale} cleartext copy='all' {...attrs} />
  ))
  .add('manual', () => ({ locale }) => (
    <ConnectionModal locale={locale} manual copy='all' {...attrs} />
  ))
  .add('error', () => ({ locale }) => (
    <ConnectionModal locale={locale} error='something went wrong' {...attrs} />
  ))
