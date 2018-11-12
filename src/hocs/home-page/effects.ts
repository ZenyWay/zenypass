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
import {
  catchError,
  ignoreElements,
  filter,
  first,
  last,
  map,
  mapTo,
  merge,
  pluck,
  share,
  switchMap,
  startWith,
  takeUntil,
  tap,
  withLatestFrom
} from 'rxjs/operators'
import { Observable, of as observable } from 'rxjs'

const log = (label: string) => console.log.bind(console, label)

const selectLocale = createActionFactory('SELECT_LOCALE')
const selectRoute = createActionFactory('SELECT_ROUTE')

export function convertMenuEvents (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  return event$.pipe(
    filter(({ type }) => type === 'SELECT_MENU_ITEM'),
    pluck('payload'),
    map(convertMenuEvent)
  )
}

function convertMenuEvent ({ dataset }: HTMLElement) {
  const { id } = dataset
  // TODO intercept 'new-entry'
  return selectRoute(id)
}
