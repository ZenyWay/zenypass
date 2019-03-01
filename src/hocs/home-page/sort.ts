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
import { isUndefined } from 'utils'

export default function sortIndexedRecordsByName (
  records: IndexedRecordEntry[],
  locale: string
): IndexedRecordEntry[] {
  const collator = new Intl.Collator(locale)
  return records.sort(compareIndexedRecordEntries(collator))
}

/**
 * if both `record` props are undefined, compare `_id` props.
 * if only one of both `record` props is undefined,
 * it is considered greater than the defined `record` prop.
 * otherwise compare record `name` props:
 * if both record `name` props are undefined, compare `_id` props.
 * otherwise, first compare `name` ignoring case,
 * then if equal, with case.
 * undefined is always less than a string.
 */
function compareIndexedRecordEntries (collator: Intl.Collator) {
  const compareLocaleStrings = compareStrings(collator)
  return function (a: IndexedRecordEntry, b: IndexedRecordEntry) {
    return !a.record || !b.record
      ? !a.record && !b.record
        ? compareIds(a._id, b._id)
        : !a.record
        ? 1
        : -1
      : !a.record.name && !b.record.name
      ? compareIds(a._id, b._id)
      : compareLocaleStrings(a.record.name, b.record.name)
  }
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
function compareStrings (collator: Intl.Collator) {
  return function (a: string | void, b: string | void) {
    const noa = isUndefined(a)
    const nob = isUndefined(b)
    if (noa || nob) {
      return noa ? (nob ? 0 : -1) : 1
    }
    // a and b are both defined
    return collator.compare(a as string, b as string)
  }
}
