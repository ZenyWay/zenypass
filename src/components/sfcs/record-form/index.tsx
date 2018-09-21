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
import { IconButton } from '../icon'
import createL10ns, { L10nTag } from 'basic-l10n'
const debug = (process.env.NODE_ENV !== 'production') && require('debug')('zenypass:components:record-field:')
const l10ns = createL10ns(require('./locales.json'), { debug })

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
  locale: string
  cleartext?: boolean
  disabled?: boolean
  icons?: Partial<RecordFormIcons>
  placeholders?: Partial<RecordFormPlaceholders>
  pendingPassword?: boolean
  pendingLogin?: boolean
  edit?: boolean
  password?: string
  onChange?: (field: keyof Record, value: string[] | string) => void
  onLoginExpand?: (event: MouseEvent) => void
  onToggleCleartext?: (event: MouseEvent) => void
  [prop: string]: unknown
}

export interface Record {
  id: string
  name: string
  url: string
  username: string
  keywords: string[]
  comments: string
  login: boolean
  mail: string
}

export type RecordFormIcons = KVMap<RecordFormInputFields | 'password' | 'cleartext',string>
export type RecordFormPlaceholders = KVMap<RecordFormInputFields | 'password',string>
export type RecordFormInputFields = Exclude<keyof Record,'id'>

export type KVMap<K extends string,V> = {[k in K]: V}

export function RecordForm ({
  edit,
  record,
  cleartext,
  disabled,
  onChange,
  onLoginExpand,
  onToggleCleartext,
  icons = DEFAULT_ICONS,
  password,
  placeholders = DEFAULT_PLACEHOLDERS,
  locale,
  pendingPassword,
  pendingLogin,
  ...attrs
}: RecordFormProps) {
  const { id, url, username, keywords, comments, mail } = record
  const t = l10ns[locale]
  const RecordField = disabled ? PassiveRecordField : AutoformatRecordField

  return (
    <form key={id} id={id} {...attrs}>
      <RecordField
        type='url'
        id={`${id}_url`}
        className='mb-2'
        icon={getIcon(icons, 'url')}
        placeholder={getPlaceholder(t, placeholders, 'url')}
        value={url}
        onChange={edit && onChange.bind(void 0, 'url')}
        disabled={disabled}
        locale={locale}
      />
      <PassiveRecordField
        type='email'
        id={`${id}_username`}
        className='mb-2'
        icon={getIcon(icons, 'username')}
        placeholder={getPlaceholder(t, placeholders, 'username')}
        value={username}
        onChange={onChange.bind(void 0, 'username')}
        disabled={disabled}
        locale={locale}
      >
        <InputGroupAppend>
          <CopyButton id={`${id}_copy-button`} value={username} outline />
        </InputGroupAppend>
      </PassiveRecordField>
      <RecordField
        type={cleartext ? 'text' : 'password'}
        id={`${id}_password`}
        className='mb-2'
        icon={
          pendingPassword
          ? 'fa-spin fa-spinner'
          : getIcon(icons, cleartext ? 'cleartext' : 'password')
        }
        placeholder={cleartext && getPlaceholder(t, placeholders, 'password')}
        value={cleartext ? password : '*****'}
        onChange={onChange.bind(void 0, 'password')}
        onIconClick={onToggleCleartext}
        disabled={disabled || !cleartext}
        locale={locale}
      >
        <InputGroupAppend>
          {!cleartext ? (
            <IconButton
              id={`${id}_connexion-button`}
              icon={
                pendingLogin ? 'fa-spin fa-spinner' : 'fa-external-link fa-fw'
              }
              outline
              onClick={onLoginExpand}
            />
          ) : (
            <CopyButton
              id={`${id}_password_copy-button`}
              value={password}
              outline
            />
          )}
        </InputGroupAppend>
      </RecordField>
      <RecordField
        type='csv'
        id={`${id}_keywords`}
        className='mb-2'
        icon={getIcon(icons, 'keywords')}
        placeholder={getPlaceholder(t, placeholders, 'keywords')}
        value={keywords}
        onChange={onChange.bind(void 0, 'keywords')}
        disabled={disabled}
        locale={locale}
      />
      <RecordField
        type='textarea'
        id={`${id}_comments`}
        className='mb-2'
        icon={getIcon(icons, 'comments')}
        placeholder={getPlaceholder(t, placeholders, 'comments')}
        value={comments}
        rows='3'
        onChange={onChange.bind(void 0, 'comments')}
        disabled={disabled}
        locale={locale}
      />
      <InputGroupAppend>
        <IconButton
          color='light'
          className='border-secondary mb-2'
          icon = {'fa-lock fa-fw'}
          disabled
        />
        <p className='form-control-static pl-3'>{t('Strict lock')}</p>
      </InputGroupAppend>
      <InputGroupAppend>
        <IconButton
          color='light'
          icon = {'fa-sign-in fa-fw'}
          className='border-secondary mb-2'
          disabled
        />
        <p className='form-control-static pl-3'>{t('Automatic login')}</p>
      </InputGroupAppend>
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
