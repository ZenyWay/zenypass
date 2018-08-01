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
import ControlledRecordField from '../record-field'
import { InputGroupAppend } from '../input-group'
import CopyButton from '../copy-button'
import Button from '../button'
import createL10n, { L10nTag } from 'basic-l10n'
const debug = (process.env.NODE_ENV !== 'production') && require('debug')('zenypass:components:record-field:')
const l10n = createL10n(require('./locales.json'), { debug, locale: 'fr' })

export const DEFAULT_ICONS: Partial<RecordFormIcons> = {
  cleartext: 'fa-eye-slash',
  keywords: 'fa-tags',
  password: 'fa-eye',
  username: 'fa-user'
}

export const DEFAULT_PLACEHOLDERS: Partial<RecordFormPlaceholders> = {
  comments: 'Comments',
  keywords: 'Keywords',
  password: 'Password',
  username: 'Username'
}

export interface RecordFormProps {
  record: Record
  cleartext?: boolean
  disabled?: boolean
  onChange: (field: keyof Record, value: string[] | string) => void
  onCopyPassword: (event: MouseEvent) => void
  onToggleCleartext: (event: MouseEvent) => void
  icons?: Partial<RecordFormIcons>
  placeholders?: Partial<RecordFormPlaceholders>
  locale: string
  [prop: string]: any
}

export interface Record {
  id: string
  name: string
  url: string
  username: string
  password: string
  keywords: string[]
  comments: string
  login: boolean
}

export type RecordFormIcons = KVMap<RecordFormInputFields | 'cleartext',string>
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
  l10n.locale = locale || l10n.locale // impure !!! TODO fix this
  const RecordField = disabled ? ControlledRecordField : AutoformatRecordField

  return (
    <form key={id} id={id} {...attrs}>
      <RecordField
        type='url'
        id={`${id}_url`}
        className='mb-2'
        icon={getIcon(icons, 'url')}
        placeholder={getPlaceholder(l10n, placeholders, 'url')}
        value={url}
        onChange={onChange.bind(void 0, 'url')}
        disabled={disabled}
        locale={locale}
      />
      <ControlledRecordField
        type='email'
        id={`${id}_username`}
        className='mb-2'
        icon={getIcon(icons, 'username')}
        placeholder={getPlaceholder(l10n, placeholders, 'username')}
        value={username}
        onChange={onChange.bind(void 0, 'username')}
        disabled={disabled}
        locale={locale}
      >
        <InputGroupAppend>
          <CopyButton id={`${id}_copy-button`} value={username} outline />
        </InputGroupAppend>
      </ControlledRecordField>
      <ControlledRecordField
        type={cleartext ? 'text' : 'password'}
        id={`${id}_password`}
        className='mb-2'
        icon={getIcon(icons, cleartext ? 'cleartext' : 'password')}
        placeholder={cleartext && getPlaceholder(l10n, placeholders, 'password')}
        value={cleartext ? password : '*****'}
        onChange={onChange.bind(void 0, 'password')}
        onIconClick={onToggleCleartext}
        disabled={disabled || !cleartext}
        locale={locale}
      >
        <InputGroupAppend>
          {!cleartext ? (
            <Button
              id={`${id}_password_copy-button`}
              icon='fa-copy'
              outline
              onClick={onCopyPassword}
            />
          ) : (
            <CopyButton id={`${id}_password__copy-button`} value={password} outline />
          )}
        </InputGroupAppend>
      </ControlledRecordField>
      <RecordField
        type='csv'
        id={`${id}_keywords`}
        className='mb-2'
        icon={getIcon(icons, 'keywords')}
        placeholder={getPlaceholder(l10n, placeholders, 'keywords')}
        value={keywords}
        onChange={onChange.bind(void 0, 'keywords')}
        disabled={disabled}
        locale={locale}
      />
      <ControlledRecordField
        type='textarea'
        id={`${id}_comments`}
        className='mb-2'
        icon={getIcon(icons, 'comments')}
        placeholder={getPlaceholder(l10n, placeholders, 'comments')}
        value={comments}
        rows='3'
        onChange={onChange.bind(void 0, 'comments')}
        disabled={disabled}
        locale={locale}
      />
    </form>
  )
}

function getIcon (icons: Partial<RecordFormIcons>, key: string): string {
  return icons[key] || DEFAULT_ICONS[key]
}

function getPlaceholder (
  l10n: L10nTag,
  placeholders: Partial<RecordFormPlaceholders>,
  key: string
): string {
  return formatPlaceholder(l10n, placeholders[key])
    || formatPlaceholder(l10n, DEFAULT_PLACEHOLDERS[key])
}

function formatPlaceholder (
  l10n: L10nTag,
  placeholder: string
): string {
  return placeholder && `${l10n(placeholder)}...`
}
