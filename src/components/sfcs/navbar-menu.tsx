/**
 * Copyright 2018 ZenyWay S.A.S., Stephane M. Catala
 * @author Stephane M. Catala
 * @author Hadrien Boulanger
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
import {
  Collapse,
  Nav,
  Navbar,
  NavbarBrand,
  NavItem,
  NavLink,
  NavbarToggler
} from 'bootstrap'
import { DropdownItemsProps } from './dropdown'
import { Dropdown } from '../dropdown'
import { Icon } from './icon'
import { ZENYPASS_LOGO_SVG } from 'static'

export interface NavbarMenuProps {
  menu?: MenuSpecs
  expanded?: boolean
  children?: Children
  onClickItem?: (event: MouseEvent) => void
  onClickToggle?: (event: MouseEvent) => void
  innerRef?: (element?: HTMLElement | null) => void
}

export interface MenuSpecs extends Array<DropdownItemsProps[] | DropdownItemsProps> {}

export function NavbarMenu ({
  menu = [],
  expanded,
  children,
  onClickItem,
  onClickToggle,
  innerRef
}: NavbarMenuProps) {
  return (
    <Navbar
      color='info'
      dark
      expand='md'
      innerRef={innerRef}
    >
      <NavbarBrand>
        <img height='32' src={ZENYPASS_LOGO_SVG}/>
        <small>&nbsp;ZenyPass</small>
      </NavbarBrand>
      <span>{ children /* TODO replace wrapping span with Fragment */}</span>
      <NavbarToggler onClick={onClickToggle} />
      <Collapse navbar isOpen={expanded} >
        <Nav className='ml-auto' navbar>
          {navMenuItems({ menu, onClickItem })}
        </Nav>
      </Collapse>
    </Navbar>
  )
}

interface NavMenuItemsProps {
  menu?: MenuSpecs
  onClickItem?: (event: MouseEvent) => void
}

// TODO convert this to a Fragment component with Inferno@6
function navMenuItems ({ menu = [], onClickItem }: NavMenuItemsProps) {
  let key = menu.length
  const entries = new Array<JSX.Element>(key)
  while (key--) {
    const item = menu[key]
    entries[key] = <NavMenuItem item={item} onClickItem={onClickItem} />
  }
  return entries
}

interface NavMenuItemProps {
  item?: DropdownItemsProps[] | DropdownItemsProps
  onClickItem?: (event: MouseEvent) => void
}

function NavMenuItem ({ item = {}, onClickItem }: NavMenuItemProps) {
  return Array.isArray(item)
  ? (
    <Dropdown
      className='text-light'
      navItem
      {...item[0]}
      items={item.slice(1)}
      onSelect={onClickItem}
    />
  )
  : (
    <NavItem >
      <NavMenuLink
        className='text-light'
        item={item}
        onClickItem={onClickItem}
      />
    </NavItem>
  )
}

interface NavMenuLinkProps {
  className?: string
  item?: DropdownItemsProps
  onClickItem?: (event: MouseEvent) => void
}

function NavMenuLink ({ className, item, onClickItem }: NavMenuLinkProps) {
  const { label, icon, ...attrs } = item
  return (
    <NavLink className={className} onClick={onClickItem} {...attrs}>
      {!icon ? null : <Icon
        icon={
          Array.isArray(icon) ? icon[0] /* TODO handle icon list */ : icon
        }
      />}
      {!label ? null : ` ${label}`}
    </NavLink>
  )
}
