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

import { createActionFactory, StandardAction } from 'basic-fsa-factories'
import {
  distinctUntilChanged,
  filter,
  ignoreElements,
  map,
  pluck,
  tap,
  withLatestFrom
} from 'rxjs/operators'
import { Observable, merge } from 'rxjs'
// const log = label => console.log.bind(console, label)

const update = createActionFactory('UPDATE')

export function focusSearchFieldOnMountOrEnable (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  const enable$ = event$.pipe(filter(({ type }) => type === 'ENABLE'))
  const mount$ = event$.pipe(filter(({ type }) => type === 'SEARCH_FIELD_REF'))

  return merge(enable$, mount$).pipe(
    withLatestFrom(state$),
    tap(([_, { searchField }]) => searchField && searchField.focus()),
    ignoreElements()
  )
}

export function updateOnNewRecordsProp (
  event$: Observable<StandardAction<any>>
) {
  return event$.pipe(
    filter(({ type, payload }) => (type === 'PROPS') && payload.filter),
    pluck('payload', 'records'),
    distinctUntilChanged(),
    map(() => update())
  )
}
