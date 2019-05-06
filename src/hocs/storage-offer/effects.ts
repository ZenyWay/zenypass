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

import { Currency, StorageOfferAutomataState } from './reducer'
import { getService, ZenypassService } from 'zenypass-service'
import {
  createActionFactories,
  createActionFactory,
  StandardAction
} from 'basic-fsa-factories'
import createL10ns from 'basic-l10n'
import { ERROR_STATUS, localizePrice } from 'utils'
import {
  catchError,
  filter,
  pluck,
  map,
  switchMap,
  distinctUntilChanged
  // tap
} from 'rxjs/operators'
import { Observable, from as observableFrom, of as observableOf } from 'rxjs'
// const log = (label: string) => console.log.bind(console, label)

const l10ns = createL10ns(require('./locales.json'))

const service = createActionFactory('SERVICE')
const checkoutResolved = createActionFactory('CHECKOUT_RESOLVED')
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

export function checkoutOnPendingCheckout (_: any, state$: Observable<any>) {
  return state$.pipe(
    filter(({ state }) => state === StorageOfferAutomataState.PendingCheckout),
    filter(({ service }) => !!service),
    switchMap(
      ({ service, locale, country, currency, ucid, uiid, quantity, price }) =>
        checkout$(service, locale, {
          country,
          currency,
          ucid,
          uiid,
          quantity,
          price
        })
    )
  )
}

function checkout$ (
  service: ZenypassService,
  lang: string,
  spec: {
    country: string
    currency: 'EUR'
    ucid: string
    uiid: string
    quantity: number
    price: number
  }
) {
  return observableFrom(
    service.payments.checkout(document, { localize }, lang, spec)
  ).pipe(
    map(checkoutResolved),
    catchError(err =>
      observableOf(
        err && err.status !== ERROR_STATUS.GATEWAY_TIMEOUT
          ? error(err)
          : offline(err)
      )
    )
  )
}

// TODO update service to remove this workaround
function localize (lang: string, currency: string, cents: number): string
function localize (lang: string, key: string): string
function localize (
  lang: string,
  currencyOrKey: string,
  cents?: number
): string {
  return arguments.length > 2
    ? localizePrice(lang, currencyOrKey as Currency, cents)
    : l10ns[lang](currencyOrKey)
}
