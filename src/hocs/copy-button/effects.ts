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
import { of as observable } from 'rxjs'
import {
  concatMap,
  delay,
  distinctUntilChanged,
  filter,
  pluck,
  withLatestFrom
} from 'rxjs/operators'
const copyToClipboard = require('clipboard-copy')

const expired = createActionFactory('EXPIRED')
const copied = createActionFactory('COPIED')

function timeoutAfterDisabled (_, state$) {

  return state$.pipe(
    pluck('state'),
    distinctUntilChanged(),
    filter(equals('disabled')),
    withLatestFrom(state$),
    pluck('1', 'props', 'timeout'),
    concatMap(timeout)
  )

  function timeout (ms) {
    return observable(expired()).pipe(delay(ms))
  }
}

function copyToClipboardOnClick (event$, state$) {

  return event$.pipe(
    filter(ofType('CLICK')),
    withLatestFrom(state$),
    pluck('1'),
    concatMap(copy)
  )
}

function equals (v) {
  return function (val) {
    return v === val
  }
}

function ofType (t) {
  return function ({ type }) {
    return type === t
  }
}

function copy ({ props }) {
  const { onCopy } = props

  return copyToClipboard(props.value)
  .then(success(true))
  .catch(success(false))

  function success (val: boolean) {
    return function () {
      onCopy && onCopy(val)
      return copied(val)
    }
  }
}

export default [timeoutAfterDisabled, copyToClipboardOnClick]
