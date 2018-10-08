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
import { createActionFactory, StandardAction } from 'basic-fsa-factories'
import { Observable } from 'rxjs'
import { filter, ignoreElements, map, tap, withLatestFrom } from 'rxjs/operators'
import { constantFromCamelCase, isFunction, isBoolean } from './basic'

export interface HandlerOnEventCallerOpts<S> {
  predicate?: ((state: S, event?: StandardAction<any>) => boolean)
  action?: StandardActionSpec | boolean
}

export type StandardActionSpec =
  (string | ((...args: any[]) => any))[] | string | ((...args: any[]) => any)

export interface ComponentState<P> {
  props?: P
}

export type HandlerProps<H extends string> = {
  [prop in H]?: (val?: any) => void
}

export function callHandlerOnEvent <
  H extends string,
  P extends HandlerProps<H> = HandlerProps<H>,
  S extends ComponentState<P> = ComponentState<P>
> (
  handler: H,
  type: string,
  opts: HandlerOnEventCallerOpts<S> = {}
) {
  const { predicate } = opts
  const action = createActionFactoryFromSpec(
    isBoolean(opts.action)
    ? `${constantFromCamelCase(handler)}_CALLED`
    : opts.action
  )

  return function (
    event$: Observable<StandardAction<any>>,
    state$: Observable<S>
  ) {
    return event$.pipe(
      filter(event => event.type === type),
      withLatestFrom(state$),
      tap(
        ([event, state]) => (!predicate || predicate(state, event))
          && callHandler(state.props[handler], event.payload)
      ),
      action
      ? map(([event, state]) => action(state, event))
      : ignoreElements()
    )
  }
}

function createActionFactoryFromSpec (
  spec: StandardActionSpec
) {
  return spec && (
    isFunction(spec)
    ? spec
    : Array.isArray(spec)
      ? createActionFactory(
          spec[0] as string,
          spec[1] as ((...args: any[]) => any)
        )
      : createActionFactory(spec)
  )
}

function callHandler <V> (handler?: (val: V) => void, val?: V) {
  handler && handler(val)
}
