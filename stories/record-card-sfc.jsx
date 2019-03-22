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
import withL10n from 'zenyway-storybook-addon-l10n'
import preventDefaultAction from './helpers/prevent-default'
import tapAction from './helpers/tap'
import { RecordCardSFC as RecordCard } from 'components'
import { RECORD } from './helpers/consts'

const stopPropagationAction = tapAction(event => event.stopPropagation())

const privateRecord = {
  ...RECORD,
  password: 'P@ssw0rd!'
}

const attrs = {
  onClearClipboard: action('CLEAR_CLIPBOARD'),
  onConnectRequest: action('CONNECT_REQUEST'),
  onConnectClose: action('CONNECT_CLOSE'),
  onCopied: action('COPIED'),
  onDefaultActionButtonRef: action('DEFAULT_ACTION_BUTTON_REF'),
  onToggleCleartext: action('TOGGLE_CLEARTEXT'),
  onToggleExpanded: stopPropagationAction('TOGGLE_EXPANDED'),
  onEditRecordRequest: action('EDIT_RECORD_REQUEST'),
  onChange: action('CHANGE'),
  onToggleCheckbox: action('TOGGLE_CHECKBOX'),
  onSaveRecordRequest: preventDefaultAction('SAVE_RECORD_REQUEST'),
  onDeleteRecordRequest: action('DELETE_RECORD_REQUEST')
}

storiesOf('RecordCard (SFC)', module)
  .addDecorator(withL10n({ locales: ['fr', 'en'] }))
  .add('thumbnail-pending-record', () => ({ locale }) => (
    <RecordCard
      locale={locale}
      record={{ _id: RECORD._id }}
      {...attrs}
      pending='record'
    />
  ))
  .add('thumbnail', () => ({ locale }) => (
    <RecordCard locale={locale} record={RECORD} {...attrs} />
  ))
  .add('expanded-readonly', () => ({ locale }) => (
    <RecordCard locale={locale} record={RECORD} {...attrs} expanded />
  ))
  .add('expanded-readonly-pending-cleartext', () => ({ locale }) => (
    <RecordCard
      locale={locale}
      record={privateRecord}
      {...attrs}
      expanded
      pending='cleartext'
    />
  ))
  .add('expanded-readonly-cleartext', () => ({ locale }) => (
    <RecordCard
      locale={locale}
      record={privateRecord}
      {...attrs}
      expanded
      cleartext
    />
  ))
  .add('expanded-readonly-pending-edit', () => ({ locale }) => (
    <RecordCard
      locale={locale}
      record={privateRecord}
      {...attrs}
      expanded
      pending='edit'
    />
  ))
  .add('expanded-edit', () => ({ locale }) => (
    <RecordCard
      locale={locale}
      record={privateRecord}
      {...attrs}
      expanded
      edit
    />
  ))
  .add('expanded-edit-cleartext', () => ({ locale }) => (
    <RecordCard
      locale={locale}
      record={privateRecord}
      {...attrs}
      expanded
      edit
      cleartext
    />
  ))
  .add('expanded-edit-pending-save', () => ({ locale }) => (
    <RecordCard
      locale={locale}
      record={privateRecord}
      {...attrs}
      expanded
      edit
      pending='save'
    />
  ))
  .add('expanded-edit-pending-delete', () => ({ locale }) => (
    <RecordCard
      locale={locale}
      record={privateRecord}
      {...attrs}
      expanded
      edit
      pending='delete'
    />
  ))
  .add('expanded-edit-pending-confirm-cancel', () => ({ locale }) => (
    <RecordCard
      locale={locale}
      record={privateRecord}
      {...attrs}
      expanded
      edit
      pending='confirm-cancel'
    />
  ))
  .add('expanded-edit-pending-confirm-delete', () => ({ locale }) => (
    <RecordCard
      locale={locale}
      record={privateRecord}
      {...attrs}
      expanded
      edit
      pending='confirm-delete'
    />
  ))
