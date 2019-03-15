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
import { identity } from './basic'

export function pluck<T> (...keys: string[])
export function pluck<T> (keys: string[] | string)
export function pluck<T> (keys: string[] | string, ...rest: string[]) {
  return !Array.isArray(keys)
    ? pluck([keys].concat(rest))
    : function (obj: any): T {
        if (arguments.length > 1) {
          return pluck(keys.slice(1))(arguments[keys[0]])
        }
        let res = obj
        for (const key of keys) {
          if (!res) return
          res = res[key]
        }
        return res
      }
}

export function pick<T> (...keys: string[])
export function pick<T> (keys: string[] | string)
export function pick<T> (keys: string[] | string, ...rest: string[]) {
  return !Array.isArray(keys)
    ? pick([keys].concat(rest))
    : function<O extends T> (obj: O): T {
        let res = {} as T
        for (const key of keys) {
          if (key in obj) res[key] = obj[key]
        }
        return res
      }
}

export function omit<T> (...keys: string[])
export function omit<T> (keys: string[] | string)
export function omit<T> (keys: string[] | string, ...rest: string[]) {
  return !Array.isArray(keys)
    ? omit([keys].concat(rest))
    : function<O extends T> (obj: O): T {
        let res = {} as T
        for (const key of Object.keys(obj)) {
          if (keys.indexOf(key) < 0) res[key] = obj[key]
        }
        return res
      }
}

export function alt<T> (alt: T) {
  return function (val?: T): T {
    return typeof val === 'undefined' ? alt : val
  }
}

export function always<T> (value?: T) {
  return function (): T {
    return value
  }
}

export function assign<A extends object> (alt: A) {
  return function<T extends object> (obj: T): A & T {
    return Object.assign({}, alt, obj)
  }
}

export function not (fn = identity) {
  return function (val) {
    return !fn(val)
  }
}

export function when<A extends any[], T = A[0]> (
  predicate: (...args: A) => boolean
) {
  return function (
    ontrue: (...args: A) => T,
    onfalse: (...args: A) => T = identity as any
  ) {
    return function (...args: A): T {
      return predicate(...args) ? ontrue(...args) : onfalse(...args)
    }
  }
}

export function hasEntry<K extends string, V> (key: K, val: V) {
  return function<T extends { [k in K]?: V } = { [k in K]?: V }> (obj?: T) {
    return obj && obj[key] === val
  }
}
