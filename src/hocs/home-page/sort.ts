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

import { IndexedRecordEntry } from './effects'
import { ZenypassRecord } from 'zenypass-service'
import { isUndefined } from 'utils'

export default function sortIndexedRecordsByName (
  records: IndexedRecordEntry[]
): IndexedRecordEntry[] {
  return records.sort(compareIndexedRecordEntries)
}

/**
 * if both `record` props are undefined, return the comparison of `_id` props.
 * otherwise compare record names, first case insensitive,
 * then if equal, with case.
 * undefined is always less than a string.
 */
function compareIndexedRecordEntries (
  a: IndexedRecordEntry,
  b: IndexedRecordEntry
) {
  const aname = a.record && a.record.name
  const bname = b.record && b.record.name
  return !aname && !bname
    ? compareIds(a._id, b._id)
    : compareStrings(aname, bname)
}

/**
 * assume a !== b (ids are unique)
 */
function compareIds (a: string, b: string) {
  return a > b ? 1 : -1
}

/**
 * compare strings without differentiating case,
 * and if equal, with case.
 * undefined is always less than a string.
 */
function compareStrings (a: string | void, b: string | void) {
  if (a === b) {
    // this includes the case where both a and b are undefined
    return 0
  }
  const noa = isUndefined(a)
  if (noa || isUndefined(b)) {
    return noa ? -1 : 1 // a and b cannot be both undefined
  }
  // a and b are both defined
  const _a = (a as string).toLowerCase()
  const _b = b.toLowerCase()
  return _a === _b ? (a > b ? 1 : -1) : _a > _b ? 1 : -1
}
