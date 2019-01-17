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
import { InputProps, InputGroupText } from 'bootstrap'
import { IconLabelInputGroup } from '../icon-label-input-group'
import { Dropdown, DropdownItemSpec } from '../../dropdown'
import { ControlledInput } from '../../controlled-input'
import createL10ns, { L10nTag } from 'basic-l10n'
const l10ns = createL10ns(require('./locales.json'))

export const DEFAULT_ICONS = {
  email: 'envelope',
  password: 'key fa-flip-vertical',
  textarea: 'sticky-note',
  url: 'bookmark'
}

export const DEFAULT_PLACEHOLDERS = {
  email: 'Email',
  password: 'Password',
  textarea: 'Text',
  url: 'Url'
}

export interface RecordFieldProps extends InputProps {
  id: string
  locale: string
  type?: string
  options?: DropdownItemSpec[]
  value?: string
  error?: string
  placeholder?: string
  buttonTitle?: string
  icon?: string
  rotate?: '90' | '180' | '270' | '' | false
  flip?: 'horizontal' | 'vertical' | '' | false
  animate?: 'spin' | 'pulse' | '' | false
  pending?: boolean
  className?: string
  size?: 'sm' | 'lg' | '' | false
  autocomplete?: 'off' | 'on' | '' | false
  autocorrect?: 'off' | 'on' | '' | false
  disabled?: boolean
  children?: any
  onChange?: (value: string, target?: HTMLElement) => void
  onIconClick?: (event: MouseEvent) => void
}

export function RecordField({
  id,
  locale,
  type,
  options,
  value,
  error,
  placeholder,
  icon,
  rotate,
  flip,
  animate,
  pending,
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
  return (
    <IconLabelInputGroup
      id={id}
      className={className}
      size={size}
      options={options}
      icon={icon || DEFAULT_ICONS[type]}
      rotate={rotate}
      flip={flip}
      animate={animate}
      pending={pending}
      invalid={!!error}
      onIconClick={onIconClick}
      buttonTitle={buttonTitle}
    >
      <ControlledInput
        type={type}
        id={`${id}${type ? `_${type}` : ''}_input`}
        className="form-control"
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
      {error ? <small className="invalid-feedback">{error}</small> : null}
      {children}
    </IconLabelInputGroup>
  )
}

function formatPlaceholder(l10n: L10nTag, placeholder: string): string {
  return placeholder && `${l10n(placeholder)}...`
}
