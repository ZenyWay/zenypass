/**
 * @license
 * Copyright 2019 Stephane M. Catala
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

const CSV_SEPARATOR_REGEXP = /[\s,]+/
const CSV_SEPARATOR = ' '

export const csv = {
  parse: parseCsv,
  stringify: stringifyCsv
}

function stringifyCsv (arr: string[]) {
  return !arr ? '' : arr.join(CSV_SEPARATOR)
}

function parseCsv (str: string = '') {
  return !str
    ? []
    : str
        .split(CSV_SEPARATOR_REGEXP)
        .map(trim)
        .filter(Boolean)
}

function trim (str: string) {
  return str.trim()
}
