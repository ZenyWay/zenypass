/**
 * Copyright 2018 ZenyWay S.A.S., Stephane M. Catala
 * @author Stephane M. Catala
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

import { getService } from 'zenypass-service'
import { createActionFactory, StandardAction } from 'basic-fsa-factories'
import {
  catchError,
  distinctUntilChanged,
  filter,
  ignoreElements,
  pluck,
  map,
  switchMap,
  startWith,
  tap
} from 'rxjs/operators'
import { Observable, from as observableFrom, of as observableOf } from 'rxjs'
import { pick, ERROR_STATUS, shallowEqual } from 'utils'
const log = (label: string) => console.log.bind(console, label)

const pricing = createActionFactory('PRICING')
const info = createActionFactory('INFO')
const error = createActionFactory('ERROR')
const offline = createActionFactory('OFFLINE')

export function injectPricingFactoryOnSpecUpdate (
  _: any,
  state$: Observable<any>
) {
  return state$.pipe(
    map(pick('session', 'country', 'currency', 'ucid', 'uiid')),
    distinctUntilChanged(shallowEqual),
    switchMap(({ session, ...spec }) =>
      observableFrom(getService(session)).pipe(
        switchMap(service => service.payments.getPricing({ ucid: spec.ucid })),
        map(factory => pricing(factory)),
        catchError(err =>
          observableOf(
            (err && err.status !== ERROR_STATUS.GATEWAY_TIMEOUT
              ? error
              : offline)(err)
          )
        )
      )
    )
  )
}

export function injectStorageStatusOnMount (_: any, state$: Observable<any>) {
  return state$.pipe(
    pluck('session'),
    distinctUntilChanged(),
    switchMap(session =>
      observableFrom(getService(session)).pipe(
        switchMap(service => observableFrom(service.getStorageInfo$())),
        map(status => info(status)),
        catchError(err =>
          observableOf(
            (err && err.status !== ERROR_STATUS.GATEWAY_TIMEOUT
              ? error
              : offline)(err)
          )
        )
      )
    )
  )
}
