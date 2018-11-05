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

import { ZenypassRecord } from 'services'
import { SFC } from 'component-from-events'

const TARGET_RECORD_FIELDS: [
  'name', 'url', 'username', 'comments', 'keywords'
] = [
  'name', 'url', 'username', 'comments', 'keywords'
]

export type FilteredRecordsProps<P extends RecordsSFCProps> =
P & FilteredRecordsHocProps

export interface FilteredRecordsHocProps {
  tokens: string[]
}

export interface RecordsSFCProps {
  records: Partial<ZenypassRecord>[]
}

export function filteredRecordCards <P extends RecordsSFCProps> (
  RecordCardsSFC: SFC<P>
) {
  return function (props: FilteredRecordsProps<P>) {
    const attrs = Object.assign({}, props)
    attrs.records = filter(props.tokens, props.records)
    delete attrs.tokens
    return RecordCardsSFC(attrs)
  }
}

function filter (
  tokens: string[],
  records: Partial<ZenypassRecord>[]
): Partial<ZenypassRecord>[] {
  const result = [] as Partial<ZenypassRecord>[]
  for (const record of records) {
    if (includesSome(tokens, record)) {
      result.push(record)
    }
  }
  return result
}

function includesSome (
  tokens: string[],
  record: Partial<ZenypassRecord>
): boolean {
  for (const token of tokens) {
    for (const field of TARGET_RECORD_FIELDS) {
      if (includes(token.toLowerCase(), record[field])) return true
    }
  }
  return false
}

function includes (token: string, field: string[] | string): boolean {
  if (Array.isArray(field)) {
    for (const val of field) {
      if (includes(token, val)) return true
    }
    return false
  }
  return field.toLowerCase().indexOf(token) >= 0
}
