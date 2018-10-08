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
import { Dropdown, MenuItemSpec } from './dropdown'
import { Icon } from './icon'
import { ZENYPASS_LOGO_SVG } from 'static'

export interface NavbarMenuProps {
  menu?: MenuSpecs
  expanded?: boolean
  children?: Children
  onToggleExpand?: (event: MouseEvent) => void
  onSelect?: (event: MouseEvent) => void
  onBlur?: (event: MouseEvent) => void
  onFocus?: (event: MouseEvent) => void
}

export interface MenuSpecs extends Array<MenuItemSpec[] | MenuItemSpec> {}

export function NavbarMenu ({
  menu = [],
  expanded,
  onToggleExpand,
  onSelect,
  children
}: NavbarMenuProps) {
  return (
    <Navbar
      color='info'
      dark expand='md'
      onFocusOut={onToggleExpand}
    >
      <NavbarBrand>
        <img height='32' src={ZENYPASS_LOGO_SVG}/>
        <small>&nbsp;ZenyPass</small>
      </NavbarBrand>
      <span>{ children /* TODO replace wrapping span with Fragment */}</span>
      <NavbarToggler onClick={onToggleExpand} />
      <Collapse navbar isOpen={expanded} >
        <Nav className='ml-auto' navbar onFocusIn={onToggleExpand}>
          {navMenuItems({ menu, onSelect })}
        </Nav>
      </Collapse>
    </Navbar>
  )
}

interface NavMenuItemsProps {
  menu?: MenuSpecs
  onSelect?: (event: MouseEvent) => void
}

// TODO convert this to a Fragment component with Inferno@6
function navMenuItems ({ menu = [], onSelect }: NavMenuItemsProps) {
  let key = menu.length
  const entries = new Array<JSX.Element>(key)
  while (key--) {
    const item = menu[key]
    entries[key] = <NavMenuItem item={item} onSelect={onSelect} />
  }
  return entries
}

interface NavMenuItemProps {
  item?: MenuItemSpec[] | MenuItemSpec
  onSelect?: (event: MouseEvent) => void
}

function NavMenuItem ({ item = {}, onSelect }: NavMenuItemProps) {
  return Array.isArray(item)
  ? (
    <Dropdown
      className='text-light'
      navItem {...item[0]}
      menu={item.slice(1)}
      onSelect={onSelect}
    />
  )
  : (
    <NavItem >
      <NavMenuLink
        className='text-light'
        item={item}
        onSelect={onSelect}
      />
    </NavItem>
  )
}

interface NavMenuLinkProps {
  className?: string
  item?: MenuItemSpec
  onSelect?: (event: MouseEvent) => void
}

function NavMenuLink ({ className, item, onSelect }: NavMenuLinkProps) {
  const { label, icon, ...attrs } = item
  return (
    <NavLink className={className} onClick={onSelect} {...attrs}>
      {!icon ? null : <Icon
        icon={
          Array.isArray(icon) ? icon[0] /* TODO handle icon list */ : icon
        }
      />}
      {!label ? null : ` ${label}`}
    </NavLink>
  )
}
