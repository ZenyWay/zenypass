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
import InputGroup, {
  InputGroupPrepend,
  InputGroupAppend,
  InputGroupIcon
} from '../input-group'
import Button from '../button'
import CopyButton from '../copy-button'
import Input from '../controlled-input'
import createL10n from 'basic-l10n'
import { classes } from 'utils'
const debug = (process.env.NODE_ENV !== 'production') && require('debug')('zenypass:components:record-field:')
const l10n = createL10n(require('./locales.json'), { debug, locale: 'fr' })

export const DEFAULT_ICONS = {
  cleartext: 'fa-eye-slash',
  email: 'fa-envelope',
  password: 'fa-eye',
  text: 'fa-question',
  textarea: 'fa-sticky-note',
  url: 'fa-bookmark'
}

export const DEFAULT_PLACEHOLDERS = {
  cleartext: 'Password',
  email: 'Email',
  password: '',
  text: 'Content',
  textarea: 'Text',
  url: 'Url'
}

export interface RecordFieldProps {
  type: string
  id: string
  value: string
  cleartext: string
  placeholder: string
  icon: string
  className: string
  autocomplete: 'off'|'on'
  autocorrect: 'off'|'on'
  onChange: (value: string) => void
  onToggle: (event: MouseEvent) => void
  onCopy: (event: MouseEvent) => void
  disabled: boolean
  [prop: string]: any
}

export default function ({
  type,
  id,
  value,
  cleartext,
  placeholder,
  icon,
  className,
  autocomplete = 'off',
  autocorrect = 'off',
  onChange,
  onToggle,
  onCopy,
  disabled,
  locale,
  ...attrs
}: Partial<RecordFieldProps>) {
  l10n.locale = locale || l10n.locale
  const isPassword = type === 'password'
  const isCleartextPassword = isPassword && cleartext
  const isConcealedPassword = isPassword && !cleartext
  const _icon = icon
    || DEFAULT_ICONS[isCleartextPassword ? 'cleartext' : type]
  const _placeholder = value && placeholder
    || `${l10n(DEFAULT_PLACEHOLDERS[isCleartextPassword ? 'cleartext' : type])}...`
  return (
    <InputGroup id={id} className={className}>
      {!_icon ? null : (
        <InputGroupPrepend>
          {!isPassword || !onToggle ? (
            <InputGroupIcon icon={_icon} fw />
          ) : (
            <Button
              id={`${id}_toggle-button`}
              icon={_icon}
              outline
              onClick={onToggle}
            />
          )}
        </InputGroupPrepend>
      )}
      <Input
        type={isCleartextPassword ? 'text' : type}
        id={`${id}_${isConcealedPassword ? 'concealed-' : ''}input`}
        className="form-control"
        value={value}
        placeholder={_placeholder}
        autocomplete={autocomplete}
        autocorrect={autocorrect}
        disabled={disabled || isConcealedPassword}
        onChange={onChange}
        {...attrs}
      />
      <InputGroupAppend>
        {isConcealedPassword ? (
          <Button
            id={`${id}_copy-button`}
            icon="fa-copy"
            outline
            onClick={onCopy}
          />
        ) : (
          <CopyButton id={`${id}_copy-button`} value={value} outline />
        )}
      </InputGroupAppend>
    </InputGroup>
  )
}
