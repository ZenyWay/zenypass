/**
 * @license
 *
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
import { createActionFactory } from 'basic-fsa-factories'
import { empty, of as observable, never } from 'rxjs'
import {
  catchError,
  concat,
  concatMap,
  delay,
  distinctUntilChanged,
  filter,
  mapTo,
  pluck,
  sample,
  tap
} from 'rxjs/operators'
const copyToClipboard = require('clipboard-copy')

const expired = createActionFactory('EXPIRED')
const copied = createActionFactory('COPIED')

function timeoutAfterDisabled(_, state$) {
  const disabled$ = state$.pipe(
    pluck('state'),
    distinctUntilChanged(),
    filter(equals('disabled')),
    concat(never()) // never complete, otherwise samples on unmount !
  )

  return state$.pipe(
    sample(disabled$),
    pluck('props', 'timeout'),
    concatMap(timeout)
  )
}

function timeout(ms) {
  return observable(expired()).pipe(delay(ms))
}

function copyToClipboardOnClick(event$, state$) {
  const click$ = event$.pipe(
    filter(ofType('CLICK')),
    pluck('payload'),
    tap(preventDefault),
    concat(never()) // never complete, otherwise samples on unmount !
  )

  return state$.pipe(
    sample(click$),
    pluck('props', 'value'),
    concatMap(copyToClipboard), // resolves on success, rejects otherwise
    mapTo(copied()),
    catchError(empty) // do nothing if fail
  )
}

function preventDefault(event) {
  event.preventDefault()
}

function equals(v) {
  return function(val) {
    return v === val
  }
}

function ofType(t) {
  return function({ type }) {
    return type === t
  }
}

export default [timeoutAfterDisabled, copyToClipboardOnClick]
