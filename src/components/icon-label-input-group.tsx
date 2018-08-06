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
  InputGroupIcon
} from './input-group'
import Button from './button'
import { classes } from 'utils'

export interface IconLabelInputGroupProps {
  id: string
  icon: string
  className: string
  size: 'sm' | 'lg'
  onIconClick: (event: MouseEvent) => void
  disabled: boolean
  [prop: string]: any
}

export default function ({
  id,
  icon,
  invalid,
  onIconClick,
  disabled,
  children,
  ...attrs
}: Partial<IconLabelInputGroupProps>) {
  const _icon = invalid ? 'fa-times' : icon
  return (
    <InputGroup id={id} {...attrs}>
      {!_icon ? null : (
        <InputGroupPrepend>
          {!onIconClick ? (
            <InputGroupIcon
              className={classes(invalid && 'border-danger text-danger')}
              icon={_icon}
              fw
            />
          ) : (
            <Button
              id={`${id}_toggle-button`}
              icon={_icon}
              outline
              onClick={onIconClick}
              disabled={disabled}
            />
          )}
        </InputGroupPrepend>
      )}
      {children}
    </InputGroup>
  )
}
