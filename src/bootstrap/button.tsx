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
  type?: 'button' | 'reset' | 'submit' | 'checkbox'
  active?: boolean
  /**
   * for `type === 'checkbox'`
   */
  checked?: boolean
  block?: boolean
  className?: string
  color?: BasicColor | 'link' | 'none' | '' | false
  outline?: boolean
  size?: 'lg' | 'sm' | '' | false
  href?: string
  disabled?: boolean
  children?: any // TODO
  onClick?: (event: MouseEvent) => void
  innerRef?: (element?: HTMLElement) => void
  [prop: string]: unknown
}

export function Button ({
  type = 'button',
  active,
  checked,
  block,
  className,
  color = 'secondary', // primary | secondary | success | info | warning | danger | link | none
  outline,
  size,
  href,
  disabled,
  children,
  innerRef,
  ...attrs
}: ButtonProps) {
  const Tag: any = href ? 'a' : 'button'
  const classNames = classes(
    'btn',
    color !== 'none' && `btn${outline ? '-outline' : ''}-${color}`,
    size && `btn-${size}`,
    block && 'btn-block',
    active && 'active',
    disabled && 'disabled',
    className
  )

  return type !== 'checkbox' ? (
    <Tag
      type={!href && type}
      className={classNames}
      href={href}
      disabled={disabled}
      ref={innerRef}
      {...attrs}
    >
      {children}
    </Tag>
  ) : (
    <label className={classNames}>
      <input
        type='checkbox'
        checked={checked}
        disabled={disabled}
        autoComplete='off'
        ref={innerRef}
        {...attrs}
      />
      {children}
    </label>
  )
}
