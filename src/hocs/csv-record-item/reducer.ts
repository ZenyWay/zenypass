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

import { into, propCursor } from 'basic-cursors'
import compose from 'basic-compose'
import { forType, mapPayload, mergePayload, not, omit, pick } from 'utils'

export interface CsvRecordItemHocProps extends HoistedCsvRecordItemHocProps {
  id: string
  record: Partial<CsvRecord>
  selected?: boolean
}

export interface CsvRecord {
  name: string
  url: string
  username: string
  password: string
  comments: string
}

export interface HoistedCsvRecordItemHocProps {
  id: string
  onToggleSelect?: (id?: string) => void
}

const SELECTED_PROPS: (keyof HoistedCsvRecordItemHocProps)[] = [
  'id',
  'onToggleSelect'
]

export default compose.into(0)(
  forType('TOGGLE_CLEARTEXT')(propCursor('cleartext')(not())),
  forType('TOGGLE_DETAILS')(propCursor('details')(not())),
  forType('PROPS')(
    compose.into(0)(
      mergePayload(pick(SELECTED_PROPS)),
      into('attrs')(mapPayload(omit(SELECTED_PROPS)))
    )
  )
)
