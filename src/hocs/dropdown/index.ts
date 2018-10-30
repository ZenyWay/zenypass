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
//
import reducer, { AutomataState } from './reducer'
import { toggleBackdropHandlers } from './effects'
import { callHandlerOnEvent, preventDefault } from 'utils'
import componentFromEvents, {
  ComponentConstructor,
  Rest,
  SFC,
  connect,
  redux
} from 'component-from-events'
import { createActionDispatchers } from 'basic-fsa-factories'
// import { tap } from 'rxjs/operators'

export type DropdownProps<P extends DropdownSFCProps> =
DropdownHocProps & Rest<P, DropdownSFCProps>

export interface DropdownHocProps {
  onClickItem? (event: MouseEvent): void
}

export interface DropdownSFCProps extends DropdownSFCHandlerProps {
  expanded?: boolean
  onClickItem?: (event: MouseEvent) => void
  onClickToggle?: (event: MouseEvent) => void
}

export interface DropdownSFCHandlerProps {
  onClickItem? (event: MouseEvent): void
  onClickToggle? (event: MouseEvent): void
  innerRef?: (element?: HTMLElement | null) => void
}

interface DropdownState {
  props: DropdownProps<DropdownSFCProps>
  state: AutomataState
}

function mapStateToProps (
  {
    props,
    state
  }: DropdownState
): Rest<DropdownSFCProps, DropdownSFCHandlerProps> {
  const { onClickItem, ...attrs } = props
  const expanded = state === 'expanded'
  return { ...attrs, expanded }
}

const mapDispatchToProps:
(dispatch: (event: any) => void) => DropdownSFCHandlerProps =
createActionDispatchers({
  onClickItem: 'CLICK_ITEM',
  onClickToggle: ['CLICK_TOGGLE', preventDefault],
  innerRef: 'INNER_REF'
})

export function dropdown <P extends DropdownSFCProps> (
  DropdownSFC: SFC<P>
): ComponentConstructor<DropdownProps<P>> {
  return componentFromEvents<DropdownProps<P>,P>(
    DropdownSFC,
    // () => tap(console.log.bind(console,'dropdown:event:')),
    redux(
      reducer,
      toggleBackdropHandlers,
      callHandlerOnEvent('onClickItem', 'CLICK_ITEM')
    ),
    // () => tap(console.log.bind(console,'dropdown:state:')),
    connect<DropdownState, DropdownSFCProps>(
      mapStateToProps,
      mapDispatchToProps
    )
    // () => tap(console.log.bind(console,'dropdown:view-props:'))
  )
}
