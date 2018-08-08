/**
 * Copyright 2018 ZenyWay S.A.S. Stephane M. Catala
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
//
import reducer from './reducer'
import { callOnSelect } from './effects'
import componentFromEvents, {
  Children,
  Component,
  ComponentClass,
  ComponentFromStreamConstructor,
  SFC,
  connect,
  redux
} from 'component-from-events'
import { createActionDispatchers } from 'basic-fsa-factories'
import { /* distinctUntilChanged, tap */ } from 'rxjs/operators'
// import { shallowEqual } from 'utils'

export {
  Children,
  Component,
  ComponentFromStreamConstructor
}

export interface ControlledMenuProps {
  menu?: MenuSpecs
}

export interface MenuProps {
  menu: MenuSpecs
  expand: boolean
  onToggleExpand: (event: MouseEvent) => void
  onSelect: (id: string) => void
}

export interface MenuSpecs extends Array<MenuSpecs | MenuItemSpec> {}

export interface MenuItemSpec {
  'data-id': string
  title: string
  icon?: string[] | string
  href?: string
  disabled?: boolean
}

const DEFAULT_PROPS = {
  menu: []
}

interface ControlledMenuState {
  props: any,
  state: 'collapsed' | 'expanded'
}

function mapStateToProps ({ props, state }: ControlledMenuState) {
  const expand = state === 'expanded'
  return { ...props, expand }
}

const mapDispatchToProps = createActionDispatchers({
  onToggleExpand: 'TOGGLE_EXPAND',
  onSelect: ['SELECT', ({ target }) => target.dataset.id ]
})

export default function <P extends MenuProps>(
  Menu: SFC<P>
): ComponentClass<ControlledMenuProps> {
  const ControlledMenu = componentFromEvents<ControlledMenuProps,P>(
    Menu,
    // () => tap(console.log.bind(console, 'controlled-input:EVENT:')),
    redux(reducer, callOnSelect),
    // () => tap(console.log.bind(console, 'controlled-input:STATE:')),
    connect(mapStateToProps, mapDispatchToProps)
    // () => distinctUntilChanged(shallowEqual),
    // () => tap(console.log.bind(console, 'controlled-input:PROPS:'))
  )

  ControlledMenu.defaultProps = DEFAULT_PROPS

  return ControlledMenu
}
