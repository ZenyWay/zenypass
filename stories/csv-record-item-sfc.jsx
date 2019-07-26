/**
 * Copyright 2019 ZenyWay S.A.S., Stephane M. Catala
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

/** @jsx createElement */
import { createElement } from 'create-element'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import preventDefaultAction from './helpers/prevent-default'
import { RECORDS, PASSWORD } from './helpers/consts'
import { CsvRecordItemSFC as CsvRecordItem } from 'components'

const ENTRY = {
  id: '0',
  record: { ...RECORDS[0], password: PASSWORD }
}

const attrs = {
  onToggleCleartext: preventDefaultAction('TOGGLE_CLEARTEXT'),
  onToggleDetails: preventDefaultAction('TOGGLE_DETAILS'),
  onToggleSelect: preventDefaultAction('TOGGLE_SELECT')
}

storiesOf('CsvRecordItem (SFC)', module)
  .add('default', () => <CsvRecordItem {...ENTRY} {...attrs} />)
  .add('details', () => <CsvRecordItem {...ENTRY} details {...attrs} />)
  .add('details-cleartext', () => (
    <CsvRecordItem {...ENTRY} cleartext details {...attrs} />
  ))
