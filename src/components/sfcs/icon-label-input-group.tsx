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
import { InputGroup, InputGroupText, InputGroupPrepend } from 'bootstrap'
import { FAIcon, FAIconButton } from './fa-icon'
import { Dropdown, DropdownItemSpec } from '../dropdown'
import { classes } from 'utils'

export interface IconLabelInputGroupProps {
  id?: string
  options?: DropdownItemSpec[]
  /**
   * TODO implement support for rotate, flip & animate in Dropdown
   */
  icon?: string
  rotate?: '90' | '180' | '270' | '' | false
  flip?: 'horizontal' | 'vertical' | '' | false
  animate?: 'spin' | 'pulse' | '' | false
  pending?: boolean
  invalid?: boolean
  size?: 'sm' | 'lg' | '' | false
  buttonTitle?: string
  disabled?: boolean
  className?: string
  children?: any
  onIconClick?: (event: MouseEvent) => void
  onSelectItem?: (item?: HTMLElement) => void
  [prop: string]: unknown
}

export function IconLabelInputGroup({
  id,
  options,
  icon,
  rotate,
  flip,
  animate,
  pending,
  invalid,
  size,
  onIconClick,
  onSelectItem,
  disabled,
  children,
  buttonTitle,
  ...attrs
}: IconLabelInputGroupProps) {
  const iconProps = {
    icon: invalid ? 'times' : icon,
    rotate: !invalid && rotate,
    flip: !invalid && flip,
    animate: !invalid && animate
  }
  return (
    <InputGroup id={id} size={size} {...attrs}>
      {!icon ? null : options && options.length ? (
        <Dropdown
          {...iconProps}
          inputGroup="prepend"
          outline
          items={options}
          onSelectItem={onSelectItem}
        />
      ) : (
        <InputGroupPrepend>
          {!onIconClick ? (
            <InputGroupText
              className={classes(invalid && 'border-danger text-danger')}
            >
              <FAIcon {...iconProps} fw />
            </InputGroupText>
          ) : (
            <FAIconButton
              id={`${id}_toggle-button`}
              {...iconProps}
              pending={pending}
              outline
              onClick={onIconClick}
              disabled={disabled}
              title={buttonTitle}
            />
          )}
        </InputGroupPrepend>
      )}
      {children}
    </InputGroup>
  )
}
