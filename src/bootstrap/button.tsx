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
import { classes } from 'utils'
import { BasicColor } from './types'

export interface ButtonProps {
  active?: boolean
  block?: boolean
  className?: string
  color?: BasicColor | 'link' | '' | false
  outline?: boolean
  size?: 'lg' | 'sm' | '' | false
  href?: string
  disabled?: boolean
  children?: any // TODO
  onClick?: (event: MouseEvent) => void
  [prop: string]: unknown
}

export function Button ({
  active,
  block,
  className,
  color = 'secondary', // primary | secondary | success | info | warning | danger | link
  outline,
  size,
  href,
  disabled,
  onClick,
  ...attrs
}: ButtonProps) {
  const Tag = href ? 'a' : 'button'

  return (
    <Tag
      type={!href && onClick ? 'button' : void 0}
      className={classes(
        'btn',
        `btn${outline ? '-outline' : ''}-${color}`,
        size && `btn-${size}`,
        block && 'btn-block',
        active && 'active',
        disabled && 'disabled',
        className
      )}
      href={href}
      onClick={onClick}
      disabled={disabled}
      {...attrs}
    />
  )
}
