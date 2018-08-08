/**
 * Copyright 2018 ZenyWay S.A.S. Stephane M. Catala
 * @author Stephane M. Catala
 * @author Hadrien Boulanger
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
import {
  ignoreElements,
  tap,
  withLatestFrom,
  filter,
  pluck
} from 'rxjs/operators'

export function callOnSelect (event$, state$) {
  return event$.pipe(
    filter(ofType('SELECT')),
    pluck('payload'),
    withLatestFrom(state$),
    filter(hasOnSelectHandler),
    tap(callSelectHandler),
    ignoreElements()
  )
}

function hasOnSelectHandler ([_, { props }]) {
  return !!props.onSelect
}

function ofType (type) {
  return function (event) {
    return event.type === type
  }
}

function callSelectHandler ([id, { props }]) {
  props.onSelect(id)
}
