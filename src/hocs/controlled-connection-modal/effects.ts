/**
 * Copyright 2018 ZenyWay S.A.S., Stephane M. Catala
 * @author Stephane M. Catala
 * @author Clement Bonet
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
import { not } from 'utils'
import { createActionFactory, StandardAction } from 'basic-fsa-factories'
import {
  catchError,
  concatMap,
  filter,
  ignoreElements,
  map,
  partition,
  pluck,
  skip,
  tap,
  withLatestFrom,
  distinctUntilKeyChanged
} from 'rxjs/operators'
import { Observable, of as observable, merge } from 'rxjs'
const copyToClipboard = require('clipboard-copy')

const CLIPBOARD_CLEARED = 'Clipboard cleared by ZenyPass'

const windowOpened = createActionFactory('WINDOW_OPENED')
const copyError = createActionFactory('COPY_ERROR')
const clipboardCleared = createActionFactory('CLIPBOARD_CLEARED')

const log = (label: string) => console.log.bind(console, label)

export function clearClipboardOnDecontaminating (_: any, state$: Observable<any>) {
  return state$.pipe(
    sampleOnTransitionToState('decontaminating'),
    concatMap(() => copyToClipboard(CLIPBOARD_CLEARED)),
    map(clipboardCleared),
    catchError(() => observable(copyError(true)))
  )
}

export function callOnCancelOnTransitionToClean (_: any, state$: Observable<any>) {
  return state$.pipe(
    sampleOnTransitionToState('clean'),
    filter(hasHandler('onCancel')),
    tap(({ props }) => props.onCancel()),
    ignoreElements()
  )
}

export function openWindowOnCopiedWhenEnabled (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  const auto$ = event$.pipe(
    filter(
      ({ type }) => (type === 'USERNAME_COPIED') || (type === 'PASSWORD_COPIED')
    ),
    withLatestFrom(state$),
    pluck('1'),
    filter<any>(({ manual }) => !manual)
  )

  const [focus$, open$] = partition<any>(({ ref }) => ref && !ref.closed)(auto$)

  const ref$ = merge(
    open$.pipe(map(({ props }) => window.open(props.url, props.name))),
    focus$.pipe(tap(({ ref }) => ref.focus()))
  )

  return ref$.pipe(map(windowOpened))
}

function sampleOnTransitionToState (target) {
  return function (state$) {
    return state$.pipe(
      distinctUntilKeyChanged('state'),
      skip(1), // initial state
      filter(({ state }) => state === target)
    )
  }
}

function hasHandler (prop) {
  return function ({ props }) {
    return !!props[prop]
  }
}
