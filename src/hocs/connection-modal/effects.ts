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
import { ConnectionFsmState, ClipboardFsmState } from './reducer'
import { createActionFactory, StandardAction } from 'basic-fsa-factories'
import {
  distinctUntilKeyChanged,
  filter,
  map,
  pluck,
  tap,
  withLatestFrom
} from 'rxjs/operators'
import { Observable } from 'rxjs'

const windowOpenResolved = createActionFactory('WINDOW_OPEN_RESOLVED')
const windowOpenRejected = createActionFactory('WINDOW_OPEN_REJECTED')
const close = createActionFactory<{ cancel: boolean; dirty: boolean }>('CLOSE')

// const log = (label: string) => console.log.bind(console, label)

export function closeOnCancellingOrClosing (_: any, state$: Observable<any>) {
  return state$.pipe(
    distinctUntilKeyChanged('state'),
    filter(
      ({ state }) =>
        state === ConnectionFsmState.Cancelling ||
        state === ConnectionFsmState.Closing
    ),
    map(({ state, clipboard }) =>
      close({
        cancel: state === ConnectionFsmState.Cancelling,
        dirty: clipboard === ClipboardFsmState.Dirty
      })
    )
  )
}

export function openWindowOnUsernameOrPasswordCopiedWhenNotManual (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  return event$.pipe(
    filter(
      ({ type }) => type === 'USERNAME_COPIED' || type === 'PASSWORD_COPIED'
    ),
    pluck('payload'),
    withLatestFrom(state$),
    filter(([_, { manual }]) => !manual),
    map(([target, { windowref }]) => openWindow(target, windowref)),
    map(ref => (ref ? windowOpenResolved(ref) : windowOpenRejected()))
  )
}

function openWindow (target, windowref) {
  if (!windowref) {
    // || windowref.closed) {
    if (!target.href) return
    const ref = window.open(target.href, target.target)
    return ref
  }
  windowref.focus()
  return windowref
}
