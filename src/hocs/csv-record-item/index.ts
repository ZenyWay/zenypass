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

import reducer, {
  CsvRecord,
  CsvRecordItemHocProps,
  HoistedCsvRecordItemHocProps
} from './reducer'
import componentFromEvents, {
  ComponentConstructor,
  Rest,
  SFC,
  connect,
  // logger,
  redux
} from 'component-from-events'
import { createActionDispatchers } from 'basic-fsa-factories'
import { applyHandlerOnEvent, shallowEqual } from 'utils'
import { distinctUntilChanged } from 'rxjs/operators'
// const log = logger('csv-record-item')

export type CsvRecordItemProps<
  P extends CsvRecordItemSFCProps
> = CsvRecordItemHocProps & Rest<P, CsvRecordItemSFCProps>

export interface CsvRecordItemSFCProps extends CsvRecordItemSFCHandlerProps {
  id: string
  record: Partial<CsvRecord>
  selected?: boolean
  details?: boolean
}

export interface CsvRecordItemSFCHandlerProps {
  onToggleSelect?: (event?: MouseEvent) => void
  onToggleDetails?: (event?: MouseEvent) => void
}

interface CsvRecordItemState extends HoistedCsvRecordItemHocProps {
  attrs: Pick<
    CsvRecordItemProps<CsvRecordItemSFCProps>,
    Exclude<
      keyof CsvRecordItemProps<CsvRecordItemSFCProps>,
      keyof HoistedCsvRecordItemHocProps
    >
  >
  id: string
  details?: boolean
}

function mapStateToProps ({
  attrs,
  id,
  details
}: CsvRecordItemState): Rest<
  CsvRecordItemSFCProps,
  CsvRecordItemSFCHandlerProps
> {
  return { ...attrs, id, details }
}

const mapDispatchToProps: (
  dispatch: (event: any) => void
) => CsvRecordItemSFCHandlerProps = createActionDispatchers({
  onToggleDetails: 'TOGGLE_DETAILS',
  onToggleSelect: 'TOGGLE_SELECT'
})

export function csvRecordItem<P extends CsvRecordItemSFCProps> (
  SigninPageSFC: SFC<P>
): ComponentConstructor<CsvRecordItemProps<P>> {
  return componentFromEvents(
    SigninPageSFC,
    // log('event'),
    redux(
      reducer,
      applyHandlerOnEvent('TOGGLE_SELECT', 'onToggleSelect', ({ id }) => [id])
    ),
    // log('state'),
    connect<CsvRecordItemState, CsvRecordItemSFCProps>(
      mapStateToProps,
      mapDispatchToProps
    ),
    () => distinctUntilChanged(shallowEqual)
    // log('view-props')
  )
}
