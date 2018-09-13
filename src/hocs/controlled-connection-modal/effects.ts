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
  distinctUntilKeyChanged,
  filter,
  map,
  partition,
  pluck,
  share,
  skip,
  tap,
  withLatestFrom
} from 'rxjs/operators'
import { Observable, of as observable, merge } from 'rxjs'
const copyToClipboard = require('clipboard-copy')

const CLIPBOARD_CLEARED = 'Clipboard cleared by ZenyPass'

const windowOpenResolved = createActionFactory('WINDOW_OPEN_RESOLVED')
const windowOpenRejected = createActionFactory('WINDOW_OPEN_REJECTED')
const copyError = createActionFactory('COPY_ERROR')
const clipboardCleared = createActionFactory('CLIPBOARD_CLEARED')
const cancelled = createActionFactory('CANCELLED')

const log = (label: string) => console.log.bind(console, label)

export function clearClipboardOnClearingClipboard (
  _: any,
  state$: Observable<any>
) {
  return state$.pipe(
    sampleOnTransitionToState('clearing-clipboard'),
    concatMap(() => copyToClipboard(CLIPBOARD_CLEARED)),
    map(clipboardCleared),
    catchError(() => observable(copyError('clear-clipboard')))
  )
}

export function callOnCancelOnCancelling (_: any, state$: Observable<any>) {
  return state$.pipe(
    sampleOnTransitionToState('cancelling'),
    tap(({ props }) => props.onCancel && props.onCancel()),
    map(() => cancelled())
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
    filter<any>(({ manual }) => !manual),
    share()
  )

  const [focus$, open$] = partition<any>(
    ({ windowref }) => windowref && !windowref.closed
  )(auto$)

  const ref$ = merge(
    open$.pipe(map(({ props }) => window.open(props.url, props.name))),
    focus$.pipe(tap(({ windowref }) => windowref.focus()))
  )

  return ref$.pipe(
    map(ref => ref ? windowOpenResolved(ref) : windowOpenRejected())
  )
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
