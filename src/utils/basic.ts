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

export function shallowEqual (a, b) {
  if (a === b) {
    return true
  }
  if (!isObject(a) || !isObject(b)) {
    return false
  }
  const keys = Object.keys(a)
  let i = keys.length
  if (Object.keys(b).length !== i) {
    return false
  }
  while (i--) {
    const k = keys[i]
    const v = a[k]
    if (v !== b[k] || (!v && !(k in b))) {
      return false
    }
  }
  return true
}

export function shallowDiffer (a, b) {
  return !shallowEqual(a, b)
}

export function isObject (v: any): v is object {
  return typeof v === 'object'
}

export function isFunction (v: any): v is Function {
  return typeof v === 'function'
}

export function isString (v: any): v is String | string {
  return typeof (v && v.valueOf()) === 'string'
}

export function isBoolean (v: any): v is Boolean | boolean {
  return typeof (v && v.valueOf()) === 'boolean'
}

export function isNumber (v: any): v is Number | number {
  return typeof (v && v.valueOf()) === 'number'
}

export function isUndefined (v: any): v is void {
  return typeof v === 'undefined'
}

export function identity (v: any): typeof v {
  return v
}

export function noop () {}

export function values<T extends {} = {}> (entries: T): T[keyof T][] {
  const values = Object.keys(entries) as any[]
  let i = values.length
  while (i--) values[i] = entries[values[i]]
  return values
}

export function entries<O extends {} = {}> (obj: O): [keyof O, O[keyof O]][] {
  const entries = Object.keys(obj) as any[]
  let i = entries.length
  while (i--) {
    const key = entries[i]
    entries[i] = [key, obj[key]]
  }
  return entries
}

export function setListEntry<V = any> (
  arr: V[],
  key: string | number,
  val: V
): V[] {
  const result = arr.slice()
  result[key] = val
  return result
}

// strings
const UPPERCASE_REGEX = /[A-Z\d]+/g
export function constantFromCamelCase (camel: string, separator: string = '_') {
  return camel.replace(UPPERCASE_REGEX, `${separator}$&`).toUpperCase()
}
