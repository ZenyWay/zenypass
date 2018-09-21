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
import { Input as PassiveInput, InputProps } from 'bootstrap'
import { IconLabelInputGroup } from '../icon-label-input-group'
import { ControlledInput } from '../../controlled-input'
import createL10ns, { L10nTag } from 'basic-l10n'

const debug = (process.env.NODE_ENV !== 'production') && require('debug')('zenypass:components:record-field:')
const l10ns = createL10ns(require('./locales.json'), { debug })

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

export interface RecordFieldProps extends InputProps {
  id: string
  locale: string
  type?: string
  value?: string
  error?: string
  placeholder?: string
  buttonTitle?: string
  icon?: string
  className?: string
  size?: 'sm' | 'lg' | '' | false
  autocomplete?: 'off' | 'on' | '' | false
  autocorrect?: 'off' | 'on' | '' | false
  disabled?: boolean
  children?: any
  onChange?: (value: string) => void
  onIconClick?: (event: MouseEvent) => void
}

export function RecordField ({
  id,
  locale,
  type,
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
  buttonTitle,
  disabled,
  children,
  ...attrs
}: RecordFieldProps) {
  const t = l10ns[locale]
  const _icon = error ? 'fa-times' : icon || DEFAULT_ICONS[type]
  const Input = disabled ? PassiveInput : ControlledInput
  return (
    <IconLabelInputGroup
      id={id}
      className={className}
      size={size}
      icon={_icon}
      onIconClick={onIconClick}
      buttonTitle={buttonTitle}
    >
      <Input
        type={type}
        id={`${id}${type ? `_${type}` : ''}_input`}
        className={'form-control'}
        invalid={!!error}
        value={value}
        placeholder={
          placeholder || formatPlaceholder(t, DEFAULT_PLACEHOLDERS[type])
        }
        autocomplete={autocomplete || 'off'}
        autocorrect={autocorrect || 'off'}
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
