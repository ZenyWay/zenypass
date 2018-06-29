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
/** @jsx createElement */
import { createElement } from 'create-element'
import AutoformatRecordField from '../autoformat-record-field'
import RecordField from '../record-field'
import Button from '../button'
import createL10n from 'basic-l10n'
import { classes } from 'utils'
const debug = (process.env.NODE_ENV !== 'production') && require('debug')('zenypass:components:record-field:')
const l10n = createL10n(require('./locales.json'), { debug, locale: 'fr' })

export const DEFAULT_ICONS: Partial<RecordFormIcons> = {
  keywords: 'fa-tags',
  username: 'fa-user'
}

export const DEFAULT_PLACEHOLDERS: Partial<RecordFormPlaceholders> = {
  keywords: 'Tags',
  comments: 'Comments'
}

export interface RecordFormProps {
  record: Record
	cleartext: boolean
	disabled: boolean
	onChange: (field: keyof Record, value: string[]|string) => void
	onCopyPassword: (id: string) => void
  onToggleCleartext: (id: string) => void
  icons: RecordFormIcons
  placeholders: RecordFormPlaceholders
  locale: string
  [prop: string]: any
}

export interface Record {
  id: string
  url: string
  username: string
  password: string
  keywords: string[]
  comments: string
}

export type RecordFormIcons = KVMap<RecordFormInputFields,string>
export type RecordFormPlaceholders = KVMap<RecordFormInputFields,string>
export type RecordFormInputFields = Exclude<keyof Record,'id'>

export type KVMap<K extends string,V> = {[k in K]: V}

export default function ({
  record,
  cleartext,
  disabled,
  onChange,
  onCopyPassword,
  onToggleCleartext,
  icons = DEFAULT_ICONS,
  placeholders = DEFAULT_PLACEHOLDERS,
  locale,
  ...attrs
}: Partial<RecordFormProps>) {
  const { id, url, username, password, keywords, comments } = record
  l10n.locale = locale || l10n.locale

  return (
		<form key={id} id={id} {...attrs}>
			<AutoformatRecordField
				type="url"
				id={`${id}_url`}
        className="mb-2"
        icon={icons.url || DEFAULT_ICONS.url}
        placeholder={
          placeholders.url
          || DEFAULT_PLACEHOLDERS.url && `${l10n(DEFAULT_PLACEHOLDERS.url)}...`
        }
				value={url}
				onChange={onChange.bind(void 0, 'url')}
				disabled={disabled}
			/>
			<RecordField
				type="email"
				id={`${id}_email`}
				className="mb-2"
        icon={icons.username || DEFAULT_ICONS.username}
        placeholder={
          placeholders.username
          || DEFAULT_PLACEHOLDERS.username && `${l10n(DEFAULT_PLACEHOLDERS.username)}...`
        }
				value={username}
				onChange={onChange.bind(void 0, 'email')}
				disabled={disabled}
			/>
			<AutoformatRecordField
				type="password"
				id={`${id}_password`}
				className="mb-2"
        icon={icons.password || DEFAULT_ICONS.password}
        placeholder={
          placeholders.password
          || DEFAULT_PLACEHOLDERS.password && `${l10n(DEFAULT_PLACEHOLDERS.password)}...`
        }
				value={password}
				cleartext={cleartext}
				onChange={onChange.bind(void 0, 'password')}
				onToggle={onToggleCleartext}
				onCopy={onCopyPassword}
				disabled={disabled}
			/>
			<AutoformatRecordField
				type="csv"
				id={`${id}_keywords`}
				className="mb-2"
        icon={icons.keywords || DEFAULT_ICONS.keywords}
        placeholder={
          placeholders.keywords
          || DEFAULT_PLACEHOLDERS.keywords && `${l10n(DEFAULT_PLACEHOLDERS.keywords)}...`
        }
				value={keywords}
				onChange={onChange.bind(void 0, 'keywords')}
				disabled={disabled}
			/>
			<AutoformatRecordField
				type="textarea"
				id={`${id}_comments`}
				className="mb-2"
        icon={icons.comments || DEFAULT_ICONS.comments}
        placeholder={
          placeholders.comments
          || DEFAULT_PLACEHOLDERS.comments && `${l10n(DEFAULT_PLACEHOLDERS.comments)}...`
        }
				value={comments}
				rows="3"
				onChange={onChange.bind(void 0, 'comments')}
				disabled={disabled}
			/>
		</form>
	)
}
