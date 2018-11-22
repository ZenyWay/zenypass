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
import { MenuItemIcon, DropdownItemSpec } from './dropdown'
import { Dropdown } from '../dropdown'
import { ZENYPASS_LOGO_WHITE_SVG } from 'static'

export interface NavbarMenuProps {
  menu?: MenuSpecs
  expanded?: boolean
  children?: Children
  onClickItem?: (event: MouseEvent) => void
  onSelectItem?: (target: HTMLElement) => void
  onClickToggle?: (event: MouseEvent) => void
  innerRef?: (element?: HTMLElement | null) => void
}

export interface MenuSpecs
extends Array<DropdownItemSpec[] | DropdownItemSpec> {}

export { DropdownItemSpec }

export function NavbarMenu ({
  menu = [],
  expanded,
  children,
  onClickItem,
  onSelectItem,
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
        <img height='32' src={ZENYPASS_LOGO_WHITE_SVG}/>
        <small>&nbsp;ZenyPass</small>
      </NavbarBrand>
      <span class='flex-fill text-light'>
        { children }
      </span>
      <NavbarToggler onClick={onClickToggle} />
      <Collapse navbar isOpen={expanded} >
        <Nav className='ml-auto' navbar>
          {navMenuItems({ menu, onClickItem, onSelectItem })}
        </Nav>
      </Collapse>
    </Navbar>
  )
}

interface NavMenuItemsProps {
  menu?: MenuSpecs
  onClickItem?: (event: MouseEvent) => void
  onSelectItem?: (target: HTMLElement) => void
}

// TODO convert this to a Fragment component with Inferno@6
function navMenuItems (
  { menu = [], onClickItem, onSelectItem }: NavMenuItemsProps
) {
  let key = menu.length
  const entries = new Array<JSX.Element>(key)
  while (key--) {
    const item = menu[key]
    entries[key] = (
      <NavMenuItem
        item={item}
        onClickItem={onClickItem}
        onSelectItem={onSelectItem}
      />
    )
  }
  return entries
}

interface NavMenuItemProps {
  item?: DropdownItemSpec[] | DropdownItemSpec
  onClickItem?: (event: MouseEvent) => void
  onSelectItem?: (target: HTMLElement) => void
}

function NavMenuItem (
  { item = {}, onClickItem, onSelectItem }: NavMenuItemProps
) {
  return Array.isArray(item)
  ? (
    <Dropdown
      className='text-light'
      right
      navItem
      {...item[0]}
      items={item.slice(1)}
      onSelectItem={onSelectItem}
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
  item?: DropdownItemSpec
  onClickItem?: (event: MouseEvent) => void
}

function NavMenuLink ({ className, item, onClickItem }: NavMenuLinkProps) {
  const { label, icon, ...attrs } = item
  return (
    <NavLink className={className} onClick={onClickItem} {...attrs}>
      <MenuItemIcon icon={icon} />
      {label}
    </NavLink>
  )
}
