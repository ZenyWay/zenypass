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
import { createActionFactory, StandardAction } from 'basic-fsa-factories'
import {
  catchError,
  ignoreElements,
  filter,
  last,
  map,
  mapTo,
  merge,
  pluck,
  share,
  switchMap,
  takeUntil,
  tap,
  withLatestFrom
} from 'rxjs/operators'
import { Observable, of as observable } from 'rxjs'

const log = (label: string) => console.log.bind(console, label)
const ofType = type => filter(isOfType(type))

const onServerError = createActionFactory('SERVER_ERROR')
const unauthorized = createActionFactory('UNAUTHORIZED')
const authenticationDone = createActionFactory('AUTHENTICATION_DONE')

export function callOnCancel (event$, state$) {
  return event$.pipe(
    ofType('CANCEL'),
    merge(event$.pipe(ofType('SERVER_ERROR'))),
    withLatestFrom(state$),
    pluck('1'),
    filter(hasHandler('onCancel')),
    tap(({ props, error }) => props.onCancel(error)),
    ignoreElements()
  )
}

export function authenticateOnSubmit ({ authenticate }) {
  return function (event$, state$) {
    const unmount$ = state$.pipe(last(), share())

    return event$.pipe(
      ofType('SUBMIT'),
      withLatestFrom(state$),
      pluck('1'),
      filter(hasHandler('onAuthenticated')),
      switchMap(authenticateUntilCancel),
      takeUntil(unmount$)
    )

    function authenticateUntilCancel ({ props, value }) {
      const { onAuthenticated } = props
      const cancel$ = event$.pipe(ofType('CANCEL'))

      return authenticate(value).pipe(
        takeUntil(unmount$),
        takeUntil(cancel$),
        tap(onAuthenticated),
        mapTo(void 0),
        map(authenticationDone),
        catchError(dealWithError)
      )
    }
  }
}

function dealWithError (err) {
  const status = err && err.status || 501
  return observable(err && err.message || `ERROR ${status}`).pipe(
    map(status === 401 ? unauthorized : onServerError)
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
