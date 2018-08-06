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
/** @jsx createElement */
//
import { createActionFactory, StandardAction } from 'basic-fsa-factories'
import {
  catchError,
  concat,
  filter,
  last,
  map,
  mapTo,
  pluck,
  switchMap,
  takeUntil,
  tap,
  withLatestFrom
} from 'rxjs/operators'
import { Observable, of as observable } from 'rxjs'

export { StandardAction }

const onServerToken = createActionFactory('SERVER_TOKEN')
const onServerError = createActionFactory('SERVER_ERROR')
const onServerDone = createActionFactory('SERVER_DONE')
const authenticationError = createActionFactory('AUTH_ERROR')
const authenticate = createActionFactory('AUTHENTICATE')

const log = (label: string) => console.log.bind(console, label)

export function getTokenOnAuthenticated ({ authorize }) {

  return function (event$, state$: Observable<{}>) {
    const unmount$ = state$.pipe(last())

    return event$.pipe(
      filter(ofType('AUTHENTICATED')),
      pluck('payload'),
      takeUntil(unmount$),
      switchMap(authorizing)
    )

    function authorizing (sessionId) {
      const cancel$ = event$.pipe(filter(ofType('CLICK')))

      return authorize(sessionId).pipe(
        takeUntil(unmount$),
        takeUntil(cancel$),
        map(onServerToken),
        concat(observable(onServerDone())),
        catchError(dealWithError)
      )
    }
  }
}

function dealWithError (err) {
  const status = err && err.status || 501
  return observable(err && err.message || `ERROR ${status}`).pipe(
    map(status === 401 ? authenticationError : onServerError)
  )
}

function isEqual (ref) {
  return function (val) {
    return val === ref
  }
}

function ofType (type) {
  return function (action) {
    return action.type === type
  }
}
