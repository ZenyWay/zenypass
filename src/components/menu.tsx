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
import { createElement } from 'create-element'
import { Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink } from 'reactstrap'
import ControlledDropdownMenu, { MenuSpecs, MenuItemSpec } from './controlled-dropdown-menu'

export interface MenuProps {
  menu: MenuSpecs
  expand: boolean
  onToggleExpand: (event: MouseEvent) => void
  onSelect: (id: string) => void
  onBlur: (event: MouseEvent) => void
}

export default function Menu ({
  menu = [],
  expand,
  onToggleExpand,
  onSelect,
  onBlur
}: MenuProps) {
  return (
    <Navbar color='info' className='text-white' light expand='md' onBlur={onBlur}>
      <NavbarBrand href='/' />
      <NavbarToggler onClick={onToggleExpand}/>
      <Collapse isOpen={expand} navbar>
        <Nav className='ml-auto' navbar >
          {menu.map(
            item =>
              Array.isArray(item) ? (
                <ControlledDropdownMenu items={item} onSelect={onSelect} />
              ) : (
                menuItem(onSelect, item)
              )
          )}
        </Nav>
      </Collapse>
    </Navbar>
  )
}

function menuItem (
  onSelect: (id: string) => void,
  { title, ...attrs }: MenuItemSpec
) {
  return (
    <NavItem>
      <NavLink onClick={onSelect} {...attrs}>{title}</NavLink>
    </NavItem>
  )
}
