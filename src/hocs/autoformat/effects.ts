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
import DEFAULT_FORMATTERS, { right } from './formatters'
import { createActionFactories } from 'basic-fsa-factories'
import {
  distinctUntilKeyChanged,
  filter,
  ignoreElements,
  map,
  pluck,
  skip,
  tap,
  withLatestFrom
} from 'rxjs/operators'

const { onInvalidChange, onValidChange } = createActionFactories({
  onInvalidChange: 'INVALID_CHANGE',
  onValidChange: 'VALID_CHANGE'
})

function formatAndCreateEventOnChange(event$, state$) {
  return event$.pipe(
    filter(ofType('CHANGE')),
    withLatestFrom(state$),
    map(formatAndCreateEvent),
  )
}

function formatAndCreateEvent([ { payload }, { props } ]) {
  const format = props.format || DEFAULT_FORMATTERS[props.type] || right
  return format(payload).unwrap(onInvalidChange, onValidChange)
}

function callChangeHandlerOnValidChange(event$, state$) {
  return event$.pipe(
    filter(ofType('VALID_CHANGE')),
    withLatestFrom(state$),
    pluck('1'),
    map(callChangeHandler),
    ignoreElements()
  )
}

function ofType(type: string) {
  return function(event: { type: string }) {
    return event.type === type
  }
}

function callChangeHandler({ props, value }) {
  props.onChange(value)
}

export default [formatAndCreateEventOnChange, callChangeHandlerOnValidChange]
