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
import { createActionFactory } from 'basic-fsa-factories'
import {
  filter,
  ignoreElements,
  map,
  mapTo,
  pluck,
  tap,
  withLatestFrom
} from 'rxjs/operators'

const windowOpened = createActionFactory('WINDOW_OPENED')
const windowReopened = createActionFactory('WINDOW_REOPENED')

const log = (label: string) => console.log.bind(console, label)
const ofType = type => filter(isOfType(type))

// TODO clear clipboard on close step 2
export function callOnCancel (event$, state$) {
  return event$.pipe(
    ofType('CANCEL'),
    withLatestFrom(state$),
    pluck('1'),
    filter(hasHandler('onCancel')),
    tap(({ props }) => props.onCancel()),
    ignoreElements()
  )
}

export function callOnCopyUsername (event$, state$) {
  return event$.pipe(
    ofType('COPY'),
    withLatestFrom(state$),
    pluck('1'),
    filter(({ state }) => state === 'firstStep'),
    tap(({ props }) => props.onCopy())
  )
}

export function openWindowOnWebsite (event$, state$) {
  return event$.pipe(
    ofType('WEBSITE'),
    withLatestFrom(state$),
    pluck('1','props','record'),
    map(goToUrl),
    map(windowOpened)
  )
}

export function reopenWindowOnCopyFromSecondStep (event$, state$) {
  return event$.pipe(
    ofType('COPY'),
    withLatestFrom(state$),
    pluck('1'),
    filter(({ state, windowref }) => windowref && state === 'firstStep'),
    tap(goToRef),
    mapTo(windowReopened())
  )
}

function hasHandler (prop) {
  return function ({ props }) {
    return !!props[prop]
  }
}

function isOfType (type) {
  return function (event) {
    return event.type === type
  }
}

function goToRef ({ windowref }) {
  windowref && !windowref.closed && setTimeout(() => windowref.focus())
}

function goToUrl (record) {
  return window.open(
    record.url,
    'url'
  )
}
