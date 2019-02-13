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
import { RecordCardSFC as RecordCard } from 'components'
import { RECORD } from './helpers/consts'

const privateRecord = {
  ...RECORD,
  password: 'P@ssw0rd!'
}

const attrs = {
  onConnectRequest: action('CONNECT_REQUEST'),
  onToggleExpanded: action('TOGGLE_EXPANDED'),
  onToggleCleartext: action('TOGGLE_CLEARTEXT'),
  onEditRecordRequest: action('EDIT_RECORD_REQUEST'),
  onChange: action('CHANGE'),
  onUpdateRecordRequest: action('UPDATE_RECORD_REQUEST'),
  onDeleteRecordRequest: action('DELETE_RECORD_REQUEST')
}

storiesOf('RecordCard (SFC)', module)
  .addDecorator(withL10n({ locales: ['fr', 'en'] }))
  .add('disabled', () => ({ locale }) => (
    <RecordCard locale={locale} record={RECORD} {...attrs} disabled />
  ))
  .add('expanded-disabled', () => ({ locale }) => (
    <RecordCard locale={locale} record={RECORD} {...attrs} expanded disabled />
  ))
  .add('expanded-disabled-pending-cleartext', () => ({ locale }) => (
    <RecordCard
      locale={locale}
      record={privateRecord}
      {...attrs}
      expanded
      disabled
      pending='cleartext'
    />
  ))
  .add('expanded-disabled-cleartext', () => ({ locale }) => (
    <RecordCard
      locale={locale}
      record={privateRecord}
      {...attrs}
      expanded
      disabled
      cleartext
    />
  ))
  .add('expanded-disabled-pending-edit', () => ({ locale }) => (
    <RecordCard
      locale={locale}
      record={privateRecord}
      {...attrs}
      expanded
      disabled
      pending='edit'
    />
  ))
  .add('expanded', () => ({ locale }) => (
    <RecordCard locale={locale} record={privateRecord} {...attrs} expanded />
  ))
  .add('expanded-cleartext', () => ({ locale }) => (
    <RecordCard
      locale={locale}
      record={privateRecord}
      {...attrs}
      expanded
      cleartext
    />
  ))
  .add('expanded-pending-save', () => ({ locale }) => (
    <RecordCard
      locale={locale}
      record={privateRecord}
      {...attrs}
      expanded
      pending='save'
    />
  ))
  .add('expanded-pending-delete', () => ({ locale }) => (
    <RecordCard
      locale={locale}
      record={privateRecord}
      {...attrs}
      expanded
      pending='delete'
    />
  ))
  .add('expanded-pending-cancel', () => ({ locale }) => (
    <RecordCard
      locale={locale}
      record={privateRecord}
      {...attrs}
      expanded
      pending='cancel'
    />
  ))
