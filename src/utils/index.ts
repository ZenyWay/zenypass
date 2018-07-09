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
// TODO split into dedicated files
export function shallowEqual(a, b) {
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
    if (a[k] !== b[k]) {
      return false
    }
  }
  return true
}

export function shallowDiffer(a, b) {
  return !shallowEqual(a, b)
}

// basic
export function isObject(v) {
  return typeof v === 'object'
}

export function isFunction(v) {
  return typeof v === 'function'
}

export function isString(v) {
  return typeof (v && v.valueOf()) === 'string'
}

export function identity(v) {
  return v
}

export function pluck <T>(...keys) {
  return function(obj: object): T {
    let res: any = obj
    for (const key of keys) {
      if (!res) {
        return
      }
      res = res[key]
    }
    return res
  }
}

export function always <T>(value) {
  return function(): T {
    return value
  }
}

// reducers
export function keepIfEqual(equal = shallowEqual) {
  return function(reduce) {
    return function(previous, action) {
      const update = reduce(previous, action)
      return equal(update, previous) ? previous : update
    }
  }
}

export function mapPayload <I,O>(project = identity as (val: I) => O) {
  return function <A extends { payload: I }>(_, { payload }: A) {
    return project(payload)
  }
}

export function forType(type) {
  return function(reduce) {
    return function(state, action) {
      return action.type === type ? reduce(state, action) : state
    }
  }
}

export type Reducer<S, V> = (state: S, value: V) => S

// jsx helper
export function classes(...classes: string[]): string {
  return classes.filter(Boolean).join(' ')
}
