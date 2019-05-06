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

const RECORD_FIELD_VALIDATORS: Partial<
  { [key in keyof ZenypassRecord]: (value: any) => boolean }
> = {
  name: isNotEmptyString,
  url: isAcceptableUrl
}

export function isValidRecordEntry (key: string, value): boolean {
  const isValid = RECORD_FIELD_VALIDATORS[key]
  return !isValid || isValid(value)
}

export function errorsFromRecord (
  record: Partial<ZenypassRecord>
): Partial<{ [key in keyof ZenypassRecord]: boolean }> {
  let errors: Partial<{ [key in keyof ZenypassRecord]: boolean }>
  for (const key in RECORD_FIELD_VALIDATORS) {
    const isValid = RECORD_FIELD_VALIDATORS[key]
    if (isValid && !isValid(record[key])) {
      errors = withError(errors, key)
    }
  }
  return errors
}

/**
 * WARNING: mutates `errors` if supplied
 */
function withError (
  errors: Partial<{ [key in keyof ZenypassRecord]: boolean }> = {},
  key: string
): Partial<{ [key in keyof ZenypassRecord]: boolean }> {
  errors[key] = true
  return errors
}

const IS_ACCEPTABLE_URL = /^(?:\w+?:\/\/)?(?:[^@\s/?]+@)?(?:(?:[^.:\s/?]+\.)+?[^.:\s/?]+)(?::\d{2,5})?(?:[/?][^\s]*)?$/ // 1 = protocol, 2 = auth, 3 = domain, 4 = port, 5 = path

function isAcceptableUrl (value: string) {
  const trimmed = value && value.trim()
  return !trimmed || IS_ACCEPTABLE_URL.test(trimmed)
}

function isNotEmptyString (str: string) {
  return !!(str && str.trim())
}
