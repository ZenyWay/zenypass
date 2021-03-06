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
  map,
  pluck,
  switchMap
} from 'rxjs/operators'
import { Observable } from 'rxjs'
import { StandardAction, createActionFactory } from 'basic-fsa-factories'
import { isString } from 'utils'

const debounce = createActionFactory('DEBOUNCE')

export function debounceInputWhenDebounce (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  return state$.pipe(
    pluck('debounce'),
    distinctUntilChanged(),
    map((delay: number | string) =>
      isString(delay) ? Number.parseInt(delay, 10) : delay
    ),
    filter<number>(Boolean),
    switchMap(delay =>
      event$.pipe(
        filter(({ type }) => type === 'INPUT'),
        debounceTime(delay)
      )
    ),
    map(({ payload }) => debounce(payload))
  )
}
