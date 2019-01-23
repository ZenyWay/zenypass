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
import { orDefaultHref } from './utils'
import { Button } from './button'
import { BasicColor } from './types'

export interface DropdownProps {
  expanded?: boolean
  direction?: 'up' | 'down' | 'left' | 'right' | '' | false
  inputGroup?: 'prepend' | 'append' | '' | false
  navItem?: boolean
  active?: boolean
  disabled?: boolean
  className?: string
  tag?: string
  innerRef?: (element?: HTMLElement | null) => void
  [prop: string]: unknown
}

export function Dropdown ({
  expanded,
  direction,
  inputGroup,
  navItem,
  active,
  disabled,
  className,
  tag,
  innerRef,
  ...attrs
}: DropdownProps) {
  const Tag = tag || (navItem ? 'li' : 'div')
  const classNames = classes(
    inputGroup ? `input-group-${inputGroup}` : 'dropdown',
    direction && direction !== 'down' && `drop${direction}`,
    navItem && 'nav-item',
    navItem && active && 'active',
    expanded && 'show',
    className
  )
  return <Tag className={classNames} ref={innerRef} {...attrs} />
}

export interface DropdownDividerProps {
  className?: string
  tag?: string
  [prop: string]: unknown
}

export function DropdownDivider ({
  className,
  tag,
  ...attrs
}: DropdownDividerProps) {
  const Tag = tag || 'li'
  const classNames = classes('dropdown-divider', className)
  return <Tag className={classNames} {...attrs} />
}

export interface DropdownHeaderProps {
  className?: string
  tag?: string
  [prop: string]: unknown
}

export function DropdownHeader ({
  className,
  tag,
  ...attrs
}: DropdownHeaderProps) {
  const Tag = tag || 'h6'
  const classNames = classes('dropdown-header', className)
  return <Tag className={classNames} {...attrs} />
}

export interface DropdownItemProps {
  active?: boolean
  href?: string
  target?: '_self' | '_blank' | '_parent' | '_top' | ''
  className?: string
  tag?: string
  [prop: string]: unknown
}

export function DropdownItem ({
  active,
  href,
  className,
  tag,
  ...attrs
}: DropdownItemProps) {
  const Tag: any = tag as 'li'
  const classNames = classes('dropdown-item', active && 'active', className)
  return !Tag ? (
    <li>
      <a className={classNames} href={orDefaultHref('a', href)} {...attrs} />
    </li>
  ) : (
    <Tag className={classNames} href={href} {...attrs} />
  )
}

export interface DropdownMenuProps {
  expanded?: boolean
  right?: boolean
  className?: string
  tag?: string
  [prop: string]: unknown
}

export function DropdownMenu ({
  expanded,
  right,
  className,
  tag,
  ...attrs
}: DropdownMenuProps) {
  const Tag = tag || 'ul'
  const classNames = classes(
    'dropdown-menu',
    right && 'dropdown-menu-right',
    expanded && 'show',
    className
  )
  return <Tag className={classNames} {...attrs} />
}

export interface DropdownToggleProps {
  split?: boolean
  color?: BasicColor | '' | false
  disabled?: boolean
  nav?: boolean
  href?: string
  className?: string
  tag?: string
  [prop: string]: unknown
}

export function DropdownToggle ({
  split,
  color = 'secondary',
  nav,
  href,
  className,
  tag,
  ...attrs
}: DropdownToggleProps) {
  const Tag = tag || (nav ? 'a' : Button)
  const classNames = classes(
    'dropdown-toggle',
    split && 'dropdown-toggle-split',
    nav && 'nav-link',
    className
  )
  return (
    <Tag
      className={classNames}
      color={!nav && color}
      href={href || (nav && orDefaultHref('a', href))}
      {...attrs}
    />
  )
}
