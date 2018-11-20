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
import { InputGroupAppend } from 'bootstrap'
import { RecordField as PassiveRecordField } from '../record-field'
import { AutoformatRecordField } from '../../autoformat-record-field'
import { CopyButton } from '../../copy-button'
import { FAIconButton } from '../fa-icon'
import createL10ns, { L10nTag } from 'basic-l10n'
const l10ns = createL10ns(require('./locales.json'))

export const DEFAULT_ICONS: Partial<RecordCardBodyIcons> = {
  cleartext: 'eye-slash',
  keywords: 'tags',
  password: 'eye',
  username: 'user'
}

export const DEFAULT_PLACEHOLDERS: Partial<RecordCardBodyPlaceholders> = {
  comments: 'Comments',
  keywords: 'Keywords',
  password: 'Password',
  username: 'Username'
}

export interface RecordCardBodyProps {
  record: Record
  locale: string
  disabled?: boolean
  cleartext?: boolean
  pending?: string
  icons?: Partial<RecordCardBodyIcons>
  placeholders?: Partial<RecordCardBodyPlaceholders>
  onChange?: (value: string[] | string, target?: HTMLElement) => void
  onConnectRequest?: (event: MouseEvent) => void
  onToggleCleartext?: (event: MouseEvent) => void
  [prop: string]: unknown
}

export interface Record {
  _id: string
  name?: string
  url?: string
  username?: string
  password?: string
  keywords?: string[]
  comments?: string
  unrestricted?: boolean
  login?: boolean
  favicon?: string
  timestamp?: number
}

export type RecordCardBodyIcons = KV<RecordCardBodyInputFields | 'cleartext',string>
export type RecordCardBodyPlaceholders = KV<RecordCardBodyInputFields,string>
export type RecordCardBodyInputFields = Exclude<keyof Record,'_id'>

export type KV<K extends string,V> = {[k in K]: V}

export function RecordCardBody ({
  record,
  locale,
  disabled,
  cleartext,
  pending,
  icons = DEFAULT_ICONS,
  placeholders = DEFAULT_PLACEHOLDERS,
  onChange,
  onConnectRequest,
  onToggleCleartext,
  ...attrs
}: RecordCardBodyProps) {
  const {
    _id,
    name,
    url,
    username,
    password,
    keywords,
    comments,
    unrestricted
  } = record
  const t = l10ns[locale]
  const RecordField = disabled ? PassiveRecordField : AutoformatRecordField

  return (
    <form key={_id} id={_id} {...attrs}>
      {
        disabled ? null : (
          <PassiveRecordField
            type='text'
            id={`${_id}_name`}
            className='mb-2'
            size='lg'
            placeholder={getPlaceholder(t, placeholders, 'name')}
            value={name}
            data-id='name'
            onChange={onChange}
            locale={locale}
          />
        )
      }
      <RecordField
        type='url'
        id={`${_id}_url`}
        className='mb-2'
        icon={getIcon(icons, 'url')}
        placeholder={getPlaceholder(t, placeholders, 'url')}
        value={url}
        data-id='url'
        onChange={onChange}
        disabled={disabled}
        locale={locale}
      />
      <PassiveRecordField
        type='email'
        id={`${_id}_username`}
        className='mb-2'
        icon={getIcon(icons, 'username')}
        placeholder={getPlaceholder(t, placeholders, 'username')}
        value={username}
        data-id='username'
        onChange={onChange}
        disabled={disabled}
        locale={locale}
      >
        <InputGroupAppend>
          <CopyButton id={`${_id}_copy-button`} value={username} outline />
        </InputGroupAppend>
      </PassiveRecordField>
      <PassiveRecordField
        type={cleartext ? 'text' : 'password'}
        id={`${_id}_password`}
        className='mb-2'
        icon={getIcon(icons, cleartext ? 'cleartext' : 'password')}
        pending={pending === 'cleartext'}
        placeholder={cleartext && getPlaceholder(t, placeholders, 'password')}
        value={cleartext ? password : '*****'}
        data-id='password'
        onChange={onChange}
        onIconClick={onToggleCleartext}
        disabled={disabled || !cleartext}
        locale={locale}
      >
        <InputGroupAppend>
          {!cleartext ? (
            <FAIconButton
              id={`${_id}_connexion-button`}
              icon='external-link'
              pending={pending === 'connect'}
              outline
              onClick={onConnectRequest}
            />
          ) : (
            <CopyButton
              id={`${_id}_password_copy-button`}
              value={password}
              outline
            />
          )}
        </InputGroupAppend>
      </PassiveRecordField>
      <RecordField
        type='csv'
        id={`${_id}_keywords`}
        className='mb-2'
        icon={getIcon(icons, 'keywords')}
        placeholder={getPlaceholder(t, placeholders, 'keywords')}
        value={keywords}
        data-id='keywords'
        onChange={onChange}
        disabled={disabled}
        locale={locale}
      />
      <PassiveRecordField
        type='textarea'
        id={`${_id}_comments`}
        className='mb-2'
        icon={getIcon(icons, 'comments')}
        placeholder={getPlaceholder(t, placeholders, 'comments')}
        value={comments}
        rows='3'
        data-id='comments'
        onChange={onChange}
        disabled={disabled}
        locale={locale}
      />
      <InputGroupAppend>
        <FAIconButton
          color='light'
          className='border-secondary mb-2'
          icon='lock'
          data-id='unrestricted'
          onChange={onChange}
          disabled={disabled}
        />
        <p className='form-control-static pl-3'>{t(
          unrestricted ? 'Lock on timeout' : 'Strict lock'
        )}</p>
      </InputGroupAppend>
    </form>
  )
}

function getIcon (icons: Partial<RecordCardBodyIcons>, key: string): string {
  return icons[key] || DEFAULT_ICONS[key]
}

function getPlaceholder (
  l10n: L10nTag,
  placeholders: Partial<RecordCardBodyPlaceholders>,
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
