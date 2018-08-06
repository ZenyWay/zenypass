/**
 * Copyright 2018 ZenyWay S.A.S., Stephane M. Catala
 * @author Stephane M. Catala
 * @author Clement Bonet
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
import { CardBody } from 'reactstrap'
import createL10n, { L10nTag } from 'basic-l10n'
import { Button, CopyButton } from 'components'
import AutoformatRecordField from '../autoformat-record-field'
import ControlledRecordField from '../record-field'
import { InputGroupAppend } from '../input-group'

const debug = (process.env.NODE_ENV !== 'production') && require('debug')('zenypass:components:access-browser:')
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

export interface Record {
  id: string
  name: string
  url: string
  username: string
  password?: string
  keywords: string[]
  comments: string
  login: boolean
  mail: string
}

export type RecordFormIcons = KVMap<RecordFormInputFields | 'password' | 'cleartext',string>
export type RecordFormPlaceholders = KVMap<RecordFormInputFields | 'password',string>
export type RecordFormInputFields = Exclude<keyof Record,'id'>

export type KVMap<K extends string,V> = {[k in K]: V}

export interface RecordExpandedCardProps {
  attrs: any,
  cleartext?: boolean,
  disabled?: boolean,
  edit?: boolean,
  icons?: Partial<RecordFormIcons>,
  locale: string,
  onChange: (field: Exclude<keyof Record, number>, value: string[] | string) => void
  onLoginExpand: (event: MouseEvent) => void
  onToggleCleartext: (event: MouseEvent) => void
  pendingLogin?: boolean,
  pendingPassword?: boolean,
  placeholders?: Partial<RecordFormPlaceholders>,
  record: Record
}

export default function ({
  cleartext,
  disabled,
  edit,
  icons = DEFAULT_ICONS,
  locale,
  onChange,
  onLoginExpand,
  onToggleCleartext,
  pendingLogin,
  pendingPassword,
  placeholders = DEFAULT_PLACEHOLDERS,
  record,
  ...attrs
}: Partial<RecordExpandedCardProps>) {

  const { id, url, username, keywords, comments, mail, password } = record
  l10n.locale = locale || l10n.locale
  const RecordField = disabled ? ControlledRecordField : AutoformatRecordField

  return (
    <CardBody className='mx-2'>

      <RecordField
        type='url'
        id={`${id}_url`}
        className='mb-2'
        icon={getIcon(icons, 'url')}
        placeholder={getPlaceholder(l10n, placeholders, 'url')}
        value={url}
        onChange={edit && onChange.bind(void 0, 'url')}
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
        onChange={edit && onChange.bind(void 0, 'username')}
        disabled={disabled}
        locale={locale}
      >
        <InputGroupAppend>
          <CopyButton
            id={`${id}_copy-button`}
            value={username}
            outline
            title={l10n('Copy')}
          />
        </InputGroupAppend>
      </ControlledRecordField>
      <ControlledRecordField
        type='email'
        id={`${id}_mail`}
        className='mb-2'
        icon={getIcon(icons, 'mail')}
        placeholder={getPlaceholder(l10n, placeholders, 'mail')}
        value={mail}
        onChange={edit && onChange.bind(void 0, 'mail')}
        disabled={disabled}
        locale={locale}
      >
        <InputGroupAppend>
          <CopyButton
            id={`${id}_mail__copy-button`}
            value={mail}
            outline
            title={l10n('Copy')}
          />
        </InputGroupAppend>
      </ControlledRecordField>
      <ControlledRecordField
        type={cleartext ? 'text' : 'password'}
        id={`${id}_password`}
        className='mb-2'
        icon={pendingPassword ? 'fa-spin fa-spinner' : getIcon(icons, cleartext ? 'cleartext' : 'password')}
        titleIcon={l10n('Show the password')}
        placeholder={cleartext && getPlaceholder(l10n, placeholders, 'password')}
        value={cleartext ? password : '*****'}
        onChange={edit && onChange.bind(void 0, 'password')}
        onIconClick={onToggleCleartext}
        disabled={disabled || !cleartext}
        locale={locale}
      >
        <InputGroupAppend>
          {!edit && !cleartext ? (
            <Button
              id={`${id}_connexion-button`}
              icon={pendingLogin ? 'fa-spin fa-spinner' : 'fa-external-link fa-fw'}
              outline
              onClick={onLoginExpand}
              title={l10n('Login')}
            />
          ) : (
            <CopyButton
              id={`${id}_password__copy-button`}
              value={password}
              outline
              title={l10n('Copy')}
            />
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
        onChange={edit && onChange.bind(void 0, 'keywords')}
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
        onChange={edit && onChange.bind(void 0, 'comments')}
        disabled={disabled}
        locale={locale}
      />
      <InputGroupAppend>
        <Button
          color='light'
          className='border-secondary mb-2'
          icon = {'fa-lock fa-fw'}
          disabled>
        </Button>
        <p className='form-control-static pl-3'>{l10n('Strict lock')}</p>
      </InputGroupAppend>
      <InputGroupAppend>
       <Button
          color='light'
          icon = {'fa-sign-in fa-fw'}
          className='border-secondary mb-2'
          disabled>
        </Button>
        <p className='form-control-static pl-3'>{l10n('Automatic login')}</p>
      </InputGroupAppend>
    </CardBody>
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
