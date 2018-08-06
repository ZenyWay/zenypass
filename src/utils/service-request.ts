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
import { createActionFactories, StandardAction } from 'basic-fsa-factories'
import {
  catchError,
  filter,
  last,
  map,
  pluck,
  switchMap,
  takeUntil,
  tap,
  withLatestFrom
} from 'rxjs/operators'
import { always } from 'utils'
import { abortOrAuthorize, authorize } from '../hocs/controlled-authentication-modal/effects'

const log = (label: string) => console.log.bind(console, label)

export function serviceRequestOnEventFromState (specs) {
  const { event, request, restricted = always(false) } = specs
  const events = typeof event !== 'string'
    ? event
    : {
      requested: `${event}_REQUESTED`,
      resolved: `${event}_RESOLVED`,
      rejected: `${event}_REJECTED`
    }
  const { resolved, rejected } = createActionFactories(events)

  return function (service) {
    const requestService = request(service)

    return function (event$, state$) {
      return event$.pipe(
        filter(isOfType(events.requested)),
        withLatestFrom(state$),
        pluck('1'),
        filter(({ state }) => state === specs.state),
        switchMap(
          state => restricted(state)
            ? authorize(doRequestService)(event$, state$)
            : doRequestService(state)
        )
      )

      function doRequestService (state) {
        return requestService(state).pipe(
            takeUntil(state$.pipe(last())),
            map(resolved),
            catchError(abortOrAuthorize(rejected, doRequestService)(event$, state$))
          )
      }
    }
  }
}

function isOfType (type) {
  return function (event) {
    return event.type === type
  }
}
