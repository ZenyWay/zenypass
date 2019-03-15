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
import { identity, isFunction, isString, shallowEqual } from './basic'
import { createActionFactory } from 'basic-fsa-factories'

export type Reducer<A = any, V = any> = (acc: A, value: V) => A

export interface StandardAction<T extends string = string, P = any> {
  type: T
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

export function mapPayload<I, O> (project = identity as (val: I) => O) {
  return function<A extends StandardAction<string, I>> (_, { payload }: A) {
    return project(payload)
  }
}
export function mergePayload<S extends O, I, O> (
  project = identity as (val: I) => O
) {
  return function<A extends StandardAction<string, I>> (
    state: S,
    { payload }: A
  ): S {
    const update = project(payload)
    return !update ? state : { ...(state as any), ...(update as any) }
  }
}

export function forType (type) {
  return function (reduce) {
    return function (state, action) {
      return action.type === type ? reduce(state, action) : state
    }
  }
}

export type EventMorphismSpec<T extends string = string> = [
  (state: any, payload?: any) => boolean,
  T | EventMorphism<T>,
  (T | EventMorphism<T>)?
]

export type EventMorphism<T extends string = string> = (
  state: any,
  payload?: any
) => T | StandardAction<T>

export function mapEvents<T extends string = string> (
  specs: { [type in T]: EventMorphismSpec<T> }
) {
  const triggers = {} as {
    [type in T]: (state: any, event: StandardAction<T>) => StandardAction<T>
  }
  for (const type of Object.keys(specs)) {
    const [predicate, onTrue, onFalse] = specs[type]
    triggers[type] = mapEventOn(predicate)(onTrue, onFalse)
  }
  return function (state: any, event: StandardAction<T>) {
    const trigger = triggers[event.type]
    return !trigger ? event : trigger(state, event)
  }
}

export function mapEventOn<T extends string = string> (
  predicate: (state: any, event?: any) => boolean
)
export function mapEventOn<T extends string = string> (
  type: T,
  predicate?: (state: any, payload?: any) => boolean
)
export function mapEventOn<T extends string = string> (
  type: T | ((state: any, payload?: any) => boolean),
  predicate?: (state: any, payload?: any) => boolean
) {
  const _predicate = isFunction(type)
    ? type
    : function (state: any, event: StandardAction<T>) {
        return (
          event.type === type && predicate && predicate(state, event.payload)
        )
      }
  return function (
    eventOnTrue: T | EventMorphism<T>,
    eventOnFalse?: T | EventMorphism<T>
  ) {
    return function (state: any, event: StandardAction<T>): StandardAction<T> {
      const trigger = _predicate(state, event) ? eventOnTrue : eventOnFalse
      return !trigger ? event : asAction(trigger, state, event.payload)
    }
  }
}

function asAction<T extends string = string> (
  spec: T | EventMorphism<T> | StandardAction<T>,
  state?: any,
  payload?: any
): StandardAction<T> {
  return isFunction(spec)
    ? asAction(spec(state, payload))
    : isString(spec)
    ? { type: spec, payload }
    : spec
}
