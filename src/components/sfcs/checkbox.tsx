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
import {
  ButtonGroup,
  InputGroup,
  InputGroupPrepend,
  Label,
  InputGroupProps
} from 'bootstrap'
import { FAIconButton, IconSize } from './fa-icon'
import { style } from 'typestyle'
import { classes } from 'utils'

export interface CheckboxProps extends InputGroupProps {
  id?: string
  label?: string
  checked?: boolean
  icon?: string
  iconSize?: IconSize | '' | false
  regular?: boolean
  fw?: boolean
  rotate?: '90' | '180' | '270' | '' | false
  flip?: 'horizontal' | 'vertical' | '' | false
  className?: string
  children?: any
  onClick?: (event?: MouseEvent) => void
}

export function Checkbox ({
  id,
  label,
  checked,
  icon,
  iconSize,
  regular,
  fw,
  rotate,
  flip,
  children,
  onClick,
  ...attrs
}: CheckboxProps) {
  const _id = id || (label && `checkbox_${label}`)
  return (
    <InputGroup {...attrs}>
      <InputGroupPrepend className='btn-group-toggle'>
        <FAIconButton
          type='checkbox'
          id={_id}
          icon={icon || 'check'}
          iconSize={iconSize}
          fw={fw}
          rotate={rotate}
          flip={flip}
          checked={checked}
          color='info'
          iconInvisible={!icon && !checked}
          outline
          onClick={onClick}
        />
      </InputGroupPrepend>
      {!label ? null : (
        <Label
          for={_id}
          check
          className='form-control form-control-plaintext border pl-2'
        >
          {label}
        </Label>
      )}
      {children}
    </InputGroup>
  )
}
