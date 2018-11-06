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

import reducer from './reducer'
import { clearTokensOnDisableFilter, filterOnChangeOrRecords } from './effects'
import { ZenypassRecord } from 'services'
import componentFromEvents, {
  ComponentClass,
  Rest,
  SFC,
  connect,
  redux
} from 'component-from-events'
import { createActionDispatchers } from 'basic-fsa-factories'
import { tap } from 'rxjs/operators'
const log = label => console.log.bind(console, label)

const DEFAULT_PROPS: Partial<FilteredRecordCardsProps<FilteredRecordCardsSFCProps>> = {
  debounce: 300 // ms
}

export type FilteredRecordCardsProps<P extends FilteredRecordCardsSFCProps> =
  FilteredRecordCardsHocProps & Rest<P, FilteredRecordCardsSFCProps>

export interface FilteredRecordCardsHocProps {
  filter?: boolean
  debounce?: string | number
  records: Partial<ZenypassRecord>[]
}

export interface FilteredRecordCardsSFCProps
extends FilteredRecordCardsSFCHandlerProps {
  records: Partial<ZenypassRecord>[]
  filter?: boolean[]
  tokens?: string[]
  debounce?: string | number
}

export interface FilteredRecordCardsSFCHandlerProps {
  onTokensChange?: (tokens: string[]) => void
  onTokensClear?: (event: MouseEvent) => void
}

interface FilteredRecordCardsState {
  props: FilteredRecordCardsProps<FilteredRecordCardsSFCProps>
  tokens?: string[]
  filter?: boolean[]
}

function mapStateToProps (
  { props, tokens, filter }: FilteredRecordCardsState
): Rest<FilteredRecordCardsSFCProps, FilteredRecordCardsSFCHandlerProps> {
  return { ...props, tokens, filter }
}

const mapDispatchToProps:
(dispatch: (event: any) => void) => FilteredRecordCardsSFCHandlerProps =
createActionDispatchers({
  onTokensChange: 'CHANGE_TOKENS',
  onTokensClear: 'CLEAR_TOKENS'
})

export function filteredRecordCards <P extends FilteredRecordCardsSFCProps> (
  FilteredRecordCardsSFC: SFC<P>
): ComponentClass<FilteredRecordCardsProps<P>> {
  const FilteredRecordCards = componentFromEvents<FilteredRecordCardsProps<P>, P>(
    FilteredRecordCardsSFC,
    () => tap(log('filtered-record-cards:event:')),
    redux(
      reducer,
      clearTokensOnDisableFilter,
      filterOnChangeOrRecords
    ),
    () => tap(log('filtered-record-cards:state:')),
    connect<FilteredRecordCardsState, FilteredRecordCardsSFCProps>(
      mapStateToProps,
      mapDispatchToProps
    ),
    () => tap(log('filtered-record-cards:view-props:'))
  )

  FilteredRecordCards.defaultProps =
    DEFAULT_PROPS as Partial<FilteredRecordCardsProps<P>>

  return FilteredRecordCards
}
