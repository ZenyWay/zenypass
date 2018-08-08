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
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap'

export interface ControlledDropdownMenuProps {
  items: MenuSpecs,
  onSelect: (id: string) => void
}

export interface MenuSpecs extends Array<MenuSpecs | MenuItemSpec> {}

export interface MenuItemSpec {
  title: string
  icon?: string[] | string
  href?: string
  disabled?: boolean
}

export default function ControlledDropdownMenu ({
  items,
  onSelect
}: ControlledDropdownMenuProps) {
  return (
    <UncontrolledDropdown nav inNavbar>
      <DropdownToggle nav caret>
        {(items[0] as MenuItemSpec).title}
      </DropdownToggle>
      <DropdownMenu right>
        {items.slice(1).map(renderMenuItem)}
      </DropdownMenu>
    </UncontrolledDropdown>
  )

  function renderMenuItem (item: MenuSpecs | MenuItemSpec) {
    return Array.isArray(item) ? (
      <ControlledDropdownMenu items={item} onSelect={onSelect}/>
    ) : (
      dropdownItem(onSelect, item)
    )
  }
}

function dropdownItem (
  onSelect: (id: string) => void,
  { title, ...attrs }: MenuItemSpec
) {
  return <DropdownItem onClick={onSelect} {...attrs}>{title}</DropdownItem>
}
