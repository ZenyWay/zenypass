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
//
import { identity, shallowEqual } from './basic'

export type Reducer<A = any, V = any> = (acc: A, value: V) => A

export interface StandardAction<P = any> {
  type: string
  payload?: P
}

export function keepIfEqual (equal = shallowEqual) {
  return function (reduce) {
    return function (previous, action) {
      const update = reduce(previous, action)
      return equal(update, previous) ? previous : update
    }
  }
}

export function mapPayload <I,O> (project = identity as (val: I) => O) {
  return function <A extends { payload: I }>(_, { payload }: A) {
    return project(payload)
  }
}
export function mergePayload <S,I,O> (project = identity as (val: I) => O) {
  return function <S extends O, A extends { payload: I }>(
    state: S,
    { payload }: A
  ): S {
    return { ...(state as any), ...(project(payload) as any) }
  }
}

export function forType (type) {
  return function (reduce) {
    return function (state, action) {
      return action.type === type ? reduce(state, action) : state
    }
  }
}
