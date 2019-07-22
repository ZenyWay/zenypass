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
import withL10n from 'zenyway-storybook-addon-l10n'
import { RECORDS, PASSWORD } from './helpers/consts'
import { ImportPageSFC as ImportPage } from 'components'

const CONFIGS = ['keepass', 'excel', 'standard']

const MAX_ENTRIES = 3

const ENTRIES = RECORDS.map((record, id) => ({
  id,
  record: { ...record, password: PASSWORD },
  selected: id < MAX_ENTRIES
}))

const attrs = {
  onAddStorage: action('ADD_STORAGE'),
  onClose: action('CLOSE'),
  onCloseInfo: action('CLOSE_INFO'),
  onError: action('ERROR'),
  onImport: action('IMPORT'),
  onSelectFile: action('SELECT_FILE'),
  onToggleSelect: action('TOGGLE_SELECT')
}

storiesOf('ImportPage (SFC)', module)
  .addDecorator(withL10n({ locales: ['fr', 'en'] }))
  .add('pending', () => ({ locale }) => (
    <ImportPage locale={locale} alert pending {...attrs} />
  ))
  .add('offline', () => ({ locale }) => (
    <ImportPage locale={locale} alert offline {...attrs} />
  ))
  .add('max-0', () => ({ locale }) => (
    <ImportPage locale={locale} alert max={0} {...attrs} />
  ))
  .add('select-file', () => ({ locale }) => (
    <ImportPage locale={locale} configs={CONFIGS} {...attrs} />
  ))
  .add('select-records-alert-1-from-5', () => ({ locale }) => (
    <ImportPage
      locale={locale}
      entries={ENTRIES.slice(0, 5)}
      alert
      max={1}
      {...attrs}
    />
  ))
  .add('select-records', () => ({ locale }) => (
    <ImportPage locale={locale} entries={ENTRIES} {...attrs} />
  ))
  .add('select-records-3-from-all', () => ({ locale }) => (
    <ImportPage
      locale={locale}
      entries={ENTRIES}
      max={MAX_ENTRIES}
      {...attrs}
    />
  ))
