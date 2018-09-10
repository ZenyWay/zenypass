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
import { Input as PassiveInput } from 'bootstrap'
import { UnknownProps } from 'bootstrap/types'
import IconLabelInputGroup from '../icon-label-input-group'
import ControlledInput from '../controlled-input'
import createL10n, { L10nTag } from 'basic-l10n'

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
  titleIcon: string
  icon: string
  className: string
  size: 'sm' | 'lg'
  autocomplete: 'off' | 'on'
  autocorrect: 'off' | 'on'
  onChange: (value: string) => void
  onIconClick: (event: MouseEvent) => void
  disabled: boolean
  locale: string
  children: any
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
  titleIcon,
  disabled,
  locale,
  children,
  ...attrs
}: Partial<RecordFieldProps> & UnknownProps) {
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
      titleIcon={titleIcon}
    >
      <Input
        type={type}
        id={`${id}_${type}_input`}
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
