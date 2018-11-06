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

import filterRecords from './filter'
import { createActionFactory, StandardAction } from 'basic-fsa-factories'
import {
  debounceTime,
  filter,
  map,
  pluck,
  skip,
  // tap,
  withLatestFrom,
  distinctUntilChanged
} from 'rxjs/operators'
import { Observable, merge } from 'rxjs'
// const log = label => console.log.bind(console, label)

const CHANGE_DEBOUNCE = 300 // ms
const clearTokens = createActionFactory('CLEAR_TOKENS')
const setFilter = createActionFactory('SET_FILTER')

export function clearTokensOnDisableFilter (
  _: any,
  state$: Observable<any>
) {
  return state$.pipe(
    pluck('filter'),
    distinctUntilChanged(),
    skip(1), // no need to reset on initial state
    filter(filter => !filter),
    map(() => clearTokens())
  )
}

export function filterOnChangeOrRecords (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  const tokens$ = event$.pipe(
    filter(({ type }) => type === 'CHANGE_TOKENS'),
    debounceTime(CHANGE_DEBOUNCE)
  )
  const records$ = event$.pipe(
    filter(({ type, payload }) => (type === 'PROPS') && payload.filter),
    pluck('payload', 'records'),
    distinctUntilChanged()
  )

  return merge(tokens$, records$).pipe(
    withLatestFrom(state$),
    pluck('1'),
    map(({ props, tokens }) => setFilter(filterRecords(tokens, props.records)))
  )
}
