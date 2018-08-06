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
import IconLabelInputGroup from '../icon-label-input-group'
import InputGroup, { InputGroupAppend } from '../input-group'
import Button from '../button'
import PassiveInput from '../input'
import ControlledInput from '../controlled-input'
import createL10n, { L10nTag } from 'basic-l10n'
import { classes } from 'utils'
const debug = (process.env.NODE_ENV !== 'production') && require('debug')('zenypass:components:record-field:')
const l10n = createL10n(require('./locales.json'), { debug, locale: 'fr' })

export const DEFAULT_ICONS = {
  email: 'fa-envelope',
  password: 'fa-key fa-flip-vertical',
  text: 'fa-question',
  textarea: 'fa-sticky-note',
  url: 'fa-bookmark'
}

export const DEFAULT_PLACEHOLDERS = {
  email: 'Email',
  password: 'Password',
  text: 'Content',
  textarea: 'Text',
  url: 'Url'
}

export interface RecordFieldProps {
  type: string
  id: string
  value: string
  error: string
  placeholder: string
  icon: string
  className: string
  size: 'sm' | 'lg'
  autocomplete: 'off' | 'on'
  autocorrect: 'off' | 'on'
  onChange: (value: string) => void
  onIconClick: (event: MouseEvent) => void
  disabled: boolean
  [prop: string]: any
}

export default function ({
  type,
  id,
  value,
  error,
  placeholder,
  icon,
  className,
  size,
  autocomplete = 'off',
  autocorrect = 'off',
  onChange,
  onIconClick,
  disabled,
  locale,
  children,
  ...attrs
}: Partial<RecordFieldProps>) {
  l10n.locale = locale || l10n.locale // impure !!! TODO fix this
  const _icon = error ? 'fa-times' : icon || DEFAULT_ICONS[type]
  const Input = disabled ? PassiveInput : ControlledInput
  return (
    <IconLabelInputGroup
      id={id}
      className={className}
      size={size}
      icon={_icon}
      onIconClick={onIconClick}
    >
      <Input
        type={type}
        id={`${id}_input`}
        className={'form-control'}
        invalid={!!error}
        value={value}
        placeholder={
          placeholder || formatPlaceholder(l10n, DEFAULT_PLACEHOLDERS[type])
        }
        autocomplete={autocomplete}
        autocorrect={autocorrect}
        disabled={disabled}
        onChange={onChange}
        {...attrs}
      />
      {error ? <small className='invalid-feedback'>{error}</small> : null}
      {children}
    </IconLabelInputGroup>
  )
}

function formatPlaceholder (
  l10n: L10nTag,
  placeholder: string
): string {
  return placeholder && `${l10n(placeholder)}...`
}
