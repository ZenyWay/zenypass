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
  Button,
  InputGroup,
  InputGroupText,
  InputGroupPrepend
} from 'bootstrap'
import { Icon } from './icon'
import { classes } from 'utils'

export interface IconLabelInputGroupProps {
  id?: string
  icon?: string
  invalid?: boolean
  size?: 'sm' | 'lg' | '' | false
  buttonTitle?: string
  disabled?: boolean
  children?: any
  onIconClick?: (event: MouseEvent) => void
  [prop: string]: unknown
}

export function IconLabelInputGroup ({
  id,
  icon,
  invalid,
  size,
  onIconClick,
  disabled,
  children,
  buttonTitle,
  ...attrs
}: IconLabelInputGroupProps) {
  const _icon = invalid ? 'fa-times' : icon
  return (
    <InputGroup id={id} size={size} {...attrs}>
      {!_icon ? null : (
        <InputGroupPrepend>
          {!onIconClick ? (
            <InputGroupText
              className={classes(invalid && 'border-danger text-danger')}
            >
              <Icon icon={_icon} fw />
            </InputGroupText>
          ) : (
            <Button
              id={`${id}_toggle-button`}
              outline
              onClick={onIconClick}
              disabled={disabled}
              title={buttonTitle}
            >
              <Icon icon={_icon} fw />
            </Button>
          )}
        </InputGroupPrepend>
      )}
      {children}
    </InputGroup>
  )
}
