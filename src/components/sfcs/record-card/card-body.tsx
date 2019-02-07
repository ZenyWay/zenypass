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
import { RecordField } from '../record-field'
import { SerializedRecordField } from '../../serialized-record-field'
import { CopyButton } from '../../copy-button'
import { CheckboxRecordField } from '../checkbox-record-field'
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
  name: 'Card Title',
  comments: 'Comments',
  keywords: 'Keywords',
  password: 'Password',
  url: 'Website URL',
  username: 'Username'
}

export interface RecordCardBodyProps {
  record: Record
  locale: string
  id?: string
  edit?: boolean
  cleartext?: boolean
  pending?: 'connect' | 'cleartext' | string
  errors?: Partial<Errors>
  icons?: Partial<RecordCardBodyIcons>
  placeholders?: Partial<RecordCardBodyPlaceholders>
  onChange?: (value: string[] | string, target?: HTMLElement) => void
  onCopied?: (success: boolean, target?: HTMLElement) => void
  onToggleCheckbox?: (event?: Event) => void
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

export type Errors = KV<
  Exclude<
    keyof Record,
    '_id' | 'timestamp' | 'favicon' | 'unrestricted' | 'login'
  >,
  boolean
>

export type RecordCardBodyIcons = KV<
  RecordCardBodyInputFields | 'cleartext',
  string
>
export type RecordCardBodyPlaceholders = KV<RecordCardBodyInputFields, string>
export type RecordCardBodyInputFields = Exclude<keyof Record, '_id'>

export type KV<K extends string, V> = { [k in K]: V }

export function RecordCardBody ({
  record,
  locale,
  id,
  edit,
  cleartext,
  pending,
  errors = {},
  icons = DEFAULT_ICONS,
  placeholders = DEFAULT_PLACEHOLDERS,
  onChange,
  onCopied,
  onToggleCheckbox,
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
  const key = id || _id

  return (
    <form key={key} id={key} noValidate {...attrs}>
      {!edit ? null : (
        <RecordField
          type='text'
          id={`${key}_name`}
          className='mb-2'
          size='lg'
          placeholder={getPlaceholder(t, placeholders, 'name')}
          value={name}
          error={!errors.name ? null : t('Please name this card')}
          data-id='name'
          onChange={onChange}
          locale={locale}
        />
      )}
      <RecordField
        type='url'
        id={`${key}_url`}
        className='mb-2'
        icon={getIcon(icons, 'url')}
        placeholder={getPlaceholder(t, placeholders, 'url')}
        value={url}
        data-id='url'
        error={!errors.url ? null : t('Please enter a valid url')}
        onChange={onChange}
        disabled={!edit}
        locale={locale}
      />
      <RecordField
        type='email'
        id={`${key}_username`}
        className='mb-2'
        icon={getIcon(icons, 'username')}
        placeholder={getPlaceholder(t, placeholders, 'username')}
        value={username}
        data-id='username'
        onChange={onChange}
        disabled={!edit}
        locale={locale}
      >
        <InputGroupAppend>
          <CopyButton
            id={`${key}_copy-button`}
            value={username}
            data-id='username'
            onCopied={onCopied}
            className={!username && 'd-none'}
            outline
          />
        </InputGroupAppend>
      </RecordField>
      <RecordField
        type={cleartext ? 'text' : 'password'}
        id={`${key}_password`}
        className='mb-2'
        icon={getIcon(icons, cleartext ? 'cleartext' : 'password')}
        pending={pending === 'cleartext'}
        placeholder={cleartext && getPlaceholder(t, placeholders, 'password')}
        value={cleartext ? password : '*****'}
        data-id='password'
        onChange={onChange}
        onIconClick={password !== '' && onToggleCleartext}
        disabled={!edit || !cleartext}
        locale={locale}
      >
        <InputGroupAppend>
          {!edit && !cleartext ? (
            <FAIconButton
              id={`${key}_connexion-button`}
              icon='external-link'
              pending={pending === 'connect'}
              outline
              onClick={onConnectRequest}
            />
          ) : (
            <CopyButton
              id={`${key}_password_copy-button`}
              value={password}
              onCopied={onCopied}
              data-id='password'
              outline
              className={!password && 'd-none'}
            />
          )}
        </InputGroupAppend>
      </RecordField>
      <SerializedRecordField
        type='csv'
        id={`${key}_keywords`}
        className='mb-2'
        icon={getIcon(icons, 'keywords')}
        placeholder={getPlaceholder(t, placeholders, 'keywords')}
        value={keywords}
        data-id='keywords'
        onChange={onChange}
        disabled={!edit}
        locale={locale}
      />
      <RecordField
        type='textarea'
        id={`${key}_comments`}
        className='mb-2'
        icon={getIcon(icons, 'comments')}
        placeholder={getPlaceholder(t, placeholders, 'comments')}
        value={comments}
        rows='3'
        data-id='comments'
        onChange={onChange}
        disabled={!edit}
        locale={locale}
      />
      <CheckboxRecordField
        id={`${key}_unrestricted`}
        icon={unrestricted ? 'clock-o' : 'lock'}
        label={t(unrestricted ? 'Lock on timeout' : 'Strict lock')}
        value={unrestricted}
        disabled={!edit}
        data-id='unrestricted'
        onClick={onToggleCheckbox}
      />
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
  return (
    formatPlaceholder(l10n, placeholders[key]) ||
    formatPlaceholder(l10n, DEFAULT_PLACEHOLDERS[key])
  )
}

function formatPlaceholder (l10n: L10nTag, placeholder: string): string {
  return placeholder && `${l10n(placeholder)}...`
}
