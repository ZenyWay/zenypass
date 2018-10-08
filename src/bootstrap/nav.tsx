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
import { createElement, Children } from 'create-element'
import { classes } from 'utils'
import { orDefaultHref } from './utils'

export interface NavProps {
  tabs?: boolean,
  pills?: boolean,
  vertical?: boolean,
  horizontal?: 'center' | 'end'
  justified?: boolean
  fill?: boolean
  navbar?: boolean
  card?: boolean
  className?: string
  children?: Children
  tag?: string
  [prop: string]: unknown
}

export function Nav ({
  tabs,
  pills,
  vertical,
  horizontal,
  justified,
  fill,
  navbar,
  card,
  className,
  tag,
  ...attrs
}: NavProps) {
  const Tag = tag || 'ul'
  const classNames = classes(
    navbar ? 'navbar-nav' : 'nav',
    horizontal && `justify-content-${horizontal}`,
    tabs && 'nav-tabs',
    card && tabs && 'card-header-tabs',
    pills && 'nav-pills',
    card && pills && 'card-header-pills',
    justified && 'nav-justified',
    fill && 'nav-fill',
    vertical && 'flex-column',
    className
  )

  return (
    <Tag className={classNames} {...attrs} />
  )
}

export interface NavbarProps {
  expand?: boolean | string
  light?: boolean
  dark?: boolean
  inverse?: boolean
  fixed?: boolean
  sticky?: boolean
  color?: string
  className?: string
  children?: Children
  tag?: string
  [prop: string]: unknown
}

export function Navbar ({
  expand,
  light,
  dark,
  inverse,
  fixed,
  sticky,
  color,
  tag,
  className,
  ...attrs
}: NavbarProps) {
  const Tag = tag || 'nav'
  const classNames = classes(
    'navbar',
    expand && `navbar-expand${expand === true ? '' : `-${expand}`}`,
    light && 'navbar-light',
    (inverse || dark) && 'navbar-dark',
    color && `bg-${color}`,
    fixed && `fixed-${fixed}`,
    sticky && `sticky-${sticky}`,
    className
  )

  return (
    <Tag className={classNames} {...attrs} />
  )
}

export interface NavbarBrandProps {
  href?: string
  className?: string
  children?: Children
  tag?: string
  [prop: string]: unknown
}

export function NavbarBrand ({
  href,
  className,
  tag,
  ...attrs
}: NavbarBrandProps) {
  const Tag = tag || 'a'
  const classNames = classes('navbar-brand', className)

  return (
    <Tag className={classNames} href={orDefaultHref(Tag, href)} {...attrs} />
  )
}

export interface NavbarTogglerProps {
  className?: string
  children?: Children
  tag?: string
  [prop: string]: unknown
}

export function NavbarToggler ({
  className,
  children,
  tag,
  ...attrs
}: NavbarTogglerProps) {
  const Tag = tag || 'button'
  const classNames = classes('navbar-toggler', className)

  return (
    <Tag className={classNames} {...attrs}>
      {children || <span className='navbar-toggler-icon' />}
    </Tag>
  )
}

export interface NavItemProps {
  active?: boolean
  disabled?: boolean
  className?: string
  children?: Children
  tag?: string
  [prop: string]: unknown
}

export function NavItem ({
  active,
  disabled,
  className,
  tag,
  ...attrs
}: NavItemProps) {
  const Tag = tag || 'li'
  const classNames = classes(
    'nav-item',
    active && 'active',
    disabled && 'disabled',
    className
  )
  return (
    <Tag className={classNames} {...attrs} />
  )
}

export interface NavLinkProps {
  href?: string
  toggle?: boolean
  disabled?: boolean
  active?: boolean
  className?: string
  children?: Children
  onClick? (event: MouseEvent): void
  tag?: string
  [prop: string]: unknown
}

export function NavLink ({
  href,
  toggle,
  disabled,
  active,
  className,
  tag,
  ...attrs
}: NavLinkProps) {
  const Tag = tag || 'a'
  const classNames = classes(
    'nav-link',
    toggle && 'dropdown-toggle',
    disabled && 'disabled',
    active && 'active',
    className
  )
  return (
    <Tag className={classNames} href={orDefaultHref(Tag, href)} {...attrs} />
  )
}
