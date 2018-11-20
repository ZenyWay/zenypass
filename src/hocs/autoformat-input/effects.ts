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
  filter,
  ignoreElements,
  tap,
  withLatestFrom
} from 'rxjs/operators'
import { hasHandlerProp } from 'utils'

const hasChangeHandler = hasHandlerProp('onChange')

export function callChangeHandlerOnValidChange (event$, state$) {
  return event$.pipe(
    filter(ofType('CHANGE')),
    withLatestFrom(state$),
    filter(([_, state]) => hasChangeHandler(state) && isValidChange(state)),
    tap(callChangeHandler),
    ignoreElements()
  )
}

function ofType (type: string) {
  return function (event: { type: string }) {
    return event.type === type
  }
}

function isValidChange ({ props, value, error }) {
  return !error && props.value !== value
}

function callChangeHandler ([{ payload }, { props, value }]) {
  const { target } = payload
  props.onChange(value, target)
}
