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

import reducer, { AutomataState } from './reducer'
import {
  updateOnNewRecordsProp,
  focusSearchFieldOnMountOrEnable
} from './effects'
import componentFromEvents, {
  ComponentConstructor,
  Rest,
  SFC,
  connect,
  redux
} from 'component-from-events'
import { createActionDispatchers } from 'basic-fsa-factories'
import { callHandlerOnEvent } from 'utils'
// import { tap } from 'rxjs/operators'
// const log = label => console.log.bind(console, label)

const DEFAULT_PROPS: Partial<FilteredRecordCardsProps<FilteredRecordCardsSFCProps>> = {
  debounce: 300 // ms
}

export type FilteredRecordCardsProps<P extends FilteredRecordCardsSFCProps> =
  FilteredRecordCardsHocProps & Rest<P, FilteredRecordCardsSFCProps>

export interface FilteredRecordCardsHocProps {
  filter?: boolean
  debounce?: string | number
  onFilterCancel?: (event: MouseEvent) => void
}

export interface FilteredRecordCardsSFCProps
extends FilteredRecordCardsSFCHandlerProps {
  filter?: boolean[]
  tokens?: string[]
  debounce?: string | number
}

export interface FilteredRecordCardsSFCHandlerProps {
  onTokensChange?: (tokens: string[]) => void
  onTokensClear?: (event: MouseEvent) => void
  onToggleFilter?: (event: MouseEvent) => void
  onSearchFieldRef?: (ref: HTMLElement) => void
}

interface FilteredRecordCardsState {
  props: FilteredRecordCardsProps<FilteredRecordCardsSFCProps>
  state: AutomataState
  tokens?: string[]
  filter?: boolean[]
}

function mapStateToProps (
  { props, state, tokens, filter }: FilteredRecordCardsState
): Rest<FilteredRecordCardsSFCProps, FilteredRecordCardsSFCHandlerProps> {
  const { onFilterCancel, ...attrs } = props
  return {
    ...attrs,
    tokens,
    filter: state === 'enabled' ? filter || [] : void 0
  }
}

const mapDispatchToProps:
(dispatch: (event: any) => void) => Partial<FilteredRecordCardsSFCHandlerProps> =
createActionDispatchers({
  onTokensChange: 'TOKENS',
  onTokensClear: 'CLEAR',
  onToggleFilter: 'TOGGLE_FILTER',
  onSearchFieldRef: 'SEARCH_FIELD_REF'
})

export function filteredRecordCards <P extends FilteredRecordCardsSFCProps> (
  FilteredRecordCardsSFC: SFC<P>
): ComponentConstructor<FilteredRecordCardsProps<P>> {
  const FilteredRecordCards = componentFromEvents<FilteredRecordCardsProps<P>, P>(
    FilteredRecordCardsSFC,
    // () => tap(log('filtered-record-cards:event:')),
    redux(
      reducer,
      focusSearchFieldOnMountOrEnable,
      updateOnNewRecordsProp,
      callHandlerOnEvent('CLEAR', ['props', 'onFilterCancel'])
    ),
    // () => tap(log('filtered-record-cards:state:')),
    connect<FilteredRecordCardsState, FilteredRecordCardsSFCProps>(
      mapStateToProps,
      mapDispatchToProps
    )
    // () => tap(log('filtered-record-cards:view-props:'))
  )

  ;(FilteredRecordCards as any).defaultProps =
    DEFAULT_PROPS as Partial<FilteredRecordCardsProps<P>>

  return FilteredRecordCards
}
