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
import { throwIfEmpty } from 'rxjs/operators'

const RECORD_FIELD_FORMATERS: Partial<
  { [key in keyof ZenypassRecord]: (value: any) => string }
> = {
  name: trim,
  url: formatUrl
}

export default function formatRecordEntry (
  key: keyof ZenypassRecord,
  value: any
) {
  const format = RECORD_FIELD_FORMATERS[key]
  return format ? format(value) : value
}

const HAS_PROTOCOL = /^\w+:\/\//

function formatUrl (url: string): string {
  const trimmed = url.trim()
  return !trimmed || HAS_PROTOCOL.test(trimmed) ? trimmed : `https://${trimmed}`
}

function trim (str: string): string {
  return str.trim()
}
