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
import withL10n from 'zenyway-storybook-addon-l10n'
import {
  RecordCard as PrivilegedRecordCard,
  withAuthenticationModal
} from 'components'
import { withAuthentication } from 'hocs'
import { RECORDS, EMPTY_RECORD } from './helpers/consts'
import { USERNAME } from '../stubs/zenypass-service'

const RecordCard = withAuthentication(
  withAuthenticationModal(PrivilegedRecordCard)
)

storiesOf('RecordCard', module)

for (const record of RECORDS) {
  storiesOf('RecordCard', module)
    .addDecorator(withL10n({ locales: ['fr', 'en'] }))
    .add(record.name, () => ({ locale }) => (
      <RecordCard record={record} locale={locale} session={USERNAME} />
    ))
}

storiesOf('RecordCard', module)
  .addDecorator(withL10n({ locales: ['fr', 'en'] }))
  .add('empty', () => ({ locale }) => (
    <RecordCard record={EMPTY_RECORD} locale={locale} session={USERNAME} />
  ))
