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

import reducer, { FilteredRecordEntry, IndexedRecordEntry } from './reducer'
import { updateOnNewRecordsProp } from './effects'
import componentFromEvents, {
  ComponentConstructor,
  Rest,
  SFC,
  connect,
  redux
} from 'component-from-events'
import { createActionDispatchers } from 'basic-fsa-factories'
import { tapOnEvent } from 'utils'
import { tap } from 'rxjs/operators'
const log = label => console.log.bind(console, label)

export type FilteredRecordCardsProps<
  P extends FilteredRecordCardsSFCProps
> = FilteredRecordCardsHocProps & Rest<P, FilteredRecordCardsSFCProps>

export interface FilteredRecordCardsHocProps {
  records?: IndexedRecordEntry[]
}

export interface FilteredRecordCardsSFCProps
  extends Partial<FilteredRecordCardsSFCHandlerProps> {
  tokens?: string[]
  records?: FilteredRecordEntry[]
}

export interface FilteredRecordCardsSFCHandlerProps {
  onTokensChange?: (tokens: string[]) => void
  onSearchFieldRef?: (ref: HTMLElement) => void
}

interface FilteredRecordCardsState {
  props: FilteredRecordCardsProps<FilteredRecordCardsSFCProps>
  tokens?: string[]
  records?: FilteredRecordEntry[]
}

function mapStateToProps ({
  props,
  tokens,
  records
}: FilteredRecordCardsState): Rest<
  FilteredRecordCardsSFCProps,
  FilteredRecordCardsSFCHandlerProps
> {
  return {
    ...props,
    tokens,
    records: records || props.records
  }
}

const mapDispatchToProps: (
  dispatch: (event: any) => void
) => Partial<FilteredRecordCardsSFCHandlerProps> = createActionDispatchers({
  onTokensChange: 'TOKENS',
  onSearchFieldRef: 'SEARCH_FIELD_REF'
})

export function filteredRecordCards<P extends FilteredRecordCardsSFCProps> (
  FilteredRecordCardsSFC: SFC<P>
): ComponentConstructor<FilteredRecordCardsProps<P>> {
  return componentFromEvents<FilteredRecordCardsProps<P>, P>(
    FilteredRecordCardsSFC,
    () => tap(log('filtered-record-cards:event:')),
    redux(
      reducer,
      tapOnEvent('TOKENS', () => window.scrollTo(0, 0)),
      updateOnNewRecordsProp
    ),
    () => tap(log('filtered-record-cards:state:')),
    connect<FilteredRecordCardsState, FilteredRecordCardsSFCProps>(
      mapStateToProps,
      mapDispatchToProps
    ),
    () => tap(log('filtered-record-cards:view-props:'))
  )
}
