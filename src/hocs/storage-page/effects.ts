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

import { getService, ZenypassService } from 'zenypass-service'
import {
  createActionFactories,
  createActionFactory,
  StandardAction
} from 'basic-fsa-factories'
import {
  catchError,
  concat,
  delay,
  distinctUntilChanged,
  filter,
  pluck,
  map,
  retryWhen,
  switchMap
  // tap
} from 'rxjs/operators'
import { Observable, defer, of as observableOf } from 'rxjs'
import { pick, ERROR_STATUS, shallowEqual } from 'utils'
// const log = (label: string) => console.log.bind(console, label)

const RETRY_DELAY = 3000 // ms
const service = createActionFactory('SERVICE')
const pricing = createActionFactory('PRICING')
const info = createActionFactory('INFO')
const error = createActionFactory('ERROR')
const ERRORS = createActionFactories({
  [ERROR_STATUS.GATEWAY_TIMEOUT]: 'OFFLINE',
  [ERROR_STATUS.NOT_FOUND]: 'NOT_FOUND'
})
const offline = ERRORS[ERROR_STATUS.GATEWAY_TIMEOUT]

export function injectServiceOnSessionProp (
  event$: Observable<StandardAction<any>>
) {
  return event$.pipe(
    filter(({ type }) => type === 'PROPS'),
    pluck('payload', 'session'),
    distinctUntilChanged(),
    switchMap(getService),
    map(service),
    catchError(err => observableOf(error(err)))
  )
}

export function injectPricingFactoryOnSpecUpdate (
  _: any,
  state$: Observable<any>
) {
  return state$.pipe(
    map(pick('service', 'value')),
    distinctUntilChanged(shallowEqual),
    filter(({ service }) => !!service),
    switchMap(({ service, value }) => getPricing$(service, value))
  )
}

function getPricing$ (service: ZenypassService, ucid: string) {
  return defer(() => service.payments.getPricing({ ucid })).pipe(
    map(factory => pricing(factory)),
    catchError((err, retry$) =>
      isOfflineError(err)
        ? observableOf((ERRORS[err && err.status] || error)(err))
        : observableOf(offline(err)).pipe(
            delay(RETRY_DELAY),
            concat(retry$)
          )
    )
  )
}

export function injectStorageStatusOnMount (_: any, state$: Observable<any>) {
  return state$.pipe(
    pluck('service'),
    distinctUntilChanged(),
    filter(Boolean),
    switchMap(getStorageInfo$)
  )
}

function getStorageInfo$ (service: ZenypassService) {
  return defer(() => service.getStorageInfo$()).pipe(
    map(status => info(status)),
    retryWhen(err$ =>
      err$.pipe(
        filter(isOfflineError),
        delay(RETRY_DELAY)
      )
    ),
    catchError(err => observableOf(error(err)))
  )
}

function isOfflineError (err: any) {
  return err && err.status !== ERROR_STATUS.GATEWAY_TIMEOUT
}
