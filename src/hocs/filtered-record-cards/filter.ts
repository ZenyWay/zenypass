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

import { ZenypassRecord } from 'zenypass-service'

export { ZenypassRecord }

export interface FilteredRecordEntry extends IndexedRecordEntry {
  exclude?: boolean
}

export interface IndexedRecordEntry {
  _id: string
  record?: Partial<ZenypassRecord>
}

const TARGET_RECORD_FIELDS: [
  'name',
  'url',
  'username',
  'comments',
  'keywords'
] = ['name', 'url', 'username', 'comments', 'keywords']

export default function (
  tokens: string[],
  records: IndexedRecordEntry[]
): FilteredRecordEntry[] {
  if (!records) return
  let i = records.length
  if (!i || !tokens || !tokens.length) return records
  const result = new Array(i) as FilteredRecordEntry[]
  while (i--) {
    const { _id, record } = records[i]
    const exclude =
      !!record && !!record.name && !recordIncludesAllTokens(tokens, record)
    result[i] = { _id, record, exclude }
  }
  return result
}

function recordIncludesAllTokens (
  tokens: string[],
  record: Partial<ZenypassRecord>
): boolean {
  for (const token of tokens) {
    if (!recordIncludesToken(token, record)) return false
  }
  return true
}

function recordIncludesToken (
  token: string,
  record: Partial<ZenypassRecord>
): boolean {
  for (const field of TARGET_RECORD_FIELDS) {
    if (fieldIncludesToken(token.toLowerCase(), record[field])) return true
  }
  return false
}

function fieldIncludesToken (
  token: string,
  field?: string[] | string
): boolean {
  if (Array.isArray(field)) {
    for (const val of field) {
      if (fieldIncludesToken(token, val)) return true
    }
    return false
  }
  return !!field && field.toLowerCase().indexOf(token) >= 0
}
