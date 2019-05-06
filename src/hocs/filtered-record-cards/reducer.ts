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

import getFilteredRecords, {
  FilteredRecordEntry,
  IndexedRecordEntry
} from './filter'
import { csv } from '../serialized-input/serializers'
import { into } from 'basic-cursors'
import { forType, mapPayload } from 'utils'
import compose from 'basic-compose'

export { FilteredRecordEntry, IndexedRecordEntry }

const updateFilter = ({ props, tokens }: any) =>
  getFilteredRecords(csv.parse(tokens), props.records)

export default compose.into(0)(
  forType('TOKENS')(
    compose.into(0)(into('records')(updateFilter), into('tokens')(mapPayload()))
  ),
  forType('UPDATE')(into('records')(updateFilter)),
  forType('PROPS')(into('props')(mapPayload())),
  forType('SEARCH_FIELD_REF')(into('searchField')(mapPayload()))
)
