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
import { StandardAction } from 'basic-fsa-factories'
import { Observable, Observer, Subject } from 'rxjs'
import { filter, ignoreElements, tap, withLatestFrom } from 'rxjs/operators'
import { isFunction } from './basic'

export type StandardActionSpec =
  (string | ((...args: any[]) => any))[] | string | ((...args: any[]) => any)

export type Handler<V> = (val?: V) => void

export function callHandlerOnEvent <
  H extends string,
  V = any,
  S extends T & { props: P } = T & { props: P },
  T extends void | {} = void,
  P extends { [prop in H]?: Handler<V> } = { [prop in H]?: Handler<V> }
> (
  handler: H,
  type: string,
  payload?: (state: T, event: StandardAction<any>) => V
)
export function callHandlerOnEvent <
  V = any,
  S extends T = T,
  T extends void | {} = void
> (
  handler: (state: S) => Handler<V>,
  type: string,
  payload?: (state: T, event: StandardAction<any>) => V
)
export function callHandlerOnEvent <V = any, S = any> (
  handler: string | ((state: S) => Handler<V>),
  type: string,
  payload?: (state: S, event: StandardAction<any>) => V
) {
  if (!isFunction(handler)) {
    return callHandlerOnEvent(
      pluckHandlerProp(handler),
      type,
      payload
    )
  }
  return function (
    event$: Observable<StandardAction<any>>,
    state$: Observable<S>
  ) {
    return event$.pipe(
      filter(event => event.type === type),
      withLatestFrom(state$),
      tap(
        ([event, state]) => callHandler(
          handler(state),
          payload ? payload(state, event) : event.payload
        )
      ),
      ignoreElements()
    )
  }
}

export function toProjection <I,O> (
  handler: (res$: Observer<O>, req?: I) => void
) {
  return function (req?: I): Observable<O> {
    const res$ = new Subject<O>()
    Promise.resolve().then(() => handler(res$, req)) // asap
    return res$
  }
}

export function pluckHandlerProp <
  K extends string,
  P extends { [prop in K]?: Function } = { [prop in K]?: Function }
> (handler: K) {
  return function (state: any) {
    return hasHandlerProp(handler) && state.props[handler]
  }
}

export function hasHandlerProp <
  K extends string,
  P extends { [prop in K]?: Function } = { [prop in K]?: Function }
> (prop: K) {
  return function ({ props }: { props: P }) {
    return isFunction(props[prop])
  }
}

function callHandler <V> (handler?: (val: V) => void, val?: V) {
  handler && handler(val)
}
