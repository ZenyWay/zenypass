/**
 * @license
 * Copyright 2018 Stephane M. Catala
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
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  ignoreElements,
  map,
  pluck,
  switchMap,
  tap,
  withLatestFrom
} from 'rxjs/operators'
import { Observable, merge } from 'rxjs'
import { StandardAction } from 'basic-fsa-factories'
import { isString } from 'utils'

export function callChangeHandlerOnDebounceOrBlurWhenIsChange (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  const blur$ = event$.pipe(
    filter(ofType('BLUR'))
  )
  const debounce$ = state$.pipe(
    pluck('props', 'debounce'),
    filter(Boolean),
    distinctUntilChanged(),
    map(
      (delay: number | string) => isString(delay)
        ? Number.parseInt(delay, 10)
        : delay
    ),
    switchMap(
      delay => event$.pipe(
        filter(ofType('INPUT')),
        debounceTime(delay)
      )
    )
  )

  return merge(blur$, debounce$).pipe(
    withLatestFrom(state$),
    pluck('1'),
    filter(hasOnChangeHandler),
    filter(isChange),
    tap(callChangeHandler),
    ignoreElements()
  )
}

function hasOnChangeHandler ({ props }) {
  return !!props.onChange
}

function isChange ({ props, value }) {
  return props.value !== value
}

function ofType (type) {
  return function (event) {
    return event.type === type
  }
}

function callChangeHandler ({ props, value }) {
  props.onChange(value)
}
