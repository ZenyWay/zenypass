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

import { StandardAction } from 'basic-fsa-factories'
import { Observable, Observer, Subject } from 'rxjs'
import {
  filter,
  ignoreElements,
  map,
  tap,
  withLatestFrom
} from 'rxjs/operators'
import { isFunction } from './basic'
import { pluck } from './functional'
import { mapPayload } from './reducers'

export type StandardActionSpec =
  (string | ((...args: any[]) => any))[] | string | ((...args: any[]) => any)

export type Handler = (...args: any) => void

export type Effect<S = any> = (
  event$: Observable<StandardAction<any>>,
  state$: Observable<S>
) => Observable<StandardAction<any>>

export function callHandlerOnEvent <S = any> (
  type: string,
  handler: string | string[] | ((state: S) => Handler),
  payload = mapPayload() as (state: S, event: StandardAction<any>) => any
) {
  return applyHandlerOnEvent(
    type,
    handler,
    (state, event) => [payload(state, event)]
  )
}

export function applyHandlerOnEvent <S = any> (
  type: string,
  handler: string | string[] | ((state: S) => Handler),
  payload = mapPayload(v => [v]) as (state: S, event: StandardAction<any>) => any[]
) {
  return !isFunction(handler)
  ? applyHandlerOnEvent(type, pluck(handler), payload)
  : function (
    event$: Observable<StandardAction<any>>,
    state$: Observable<S>
  ) {
    return event$.pipe(
      filter(event => event.type === type),
      withLatestFrom(state$),
      map(([ event, state ]) => ({ event, state, handler: handler(state) })),
      filter(({ handler }) => isFunction(handler)),
      tap(({ event, state, handler }) => handler(...payload(state, event))),
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

export function hasHandlerProp <
  K extends string,
  P extends { [prop in K]?: Function } = { [prop in K]?: Function }
> (prop: K) {
  return function ({ props }: { props: P }) {
    return isFunction(props[prop])
  }
}
