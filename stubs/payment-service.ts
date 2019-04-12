/**
 * Copyright 2018 ZenyWay S.A.S
 * @author Stephane M. Catala
 * @license Apache 2.0
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

import { Pricing, PaymentSpec } from '@zenyway/zenypass-service'
import { delay } from 'rxjs/operators'
import { of as observableOf } from 'rxjs'

const CHECKOUT_DELAY = 1500 // ms
const PRICING_FACTORY_DELAY = 1500 // ms
const COUNTRY = 'FR'
const CURRENCY: 'EUR' = 'EUR'
const VAT = 20 // percent
const UCID = 'LAUNCH'
const I18NKEY = 'PEi6vT0kf/Oreh0Z'
const PRICING_SPEC = {
  PREM: { 1: 4900 },
  UNIT: {
    1: 99,
    4: 329,
    5: 349,
    10: 694
  }
}

// TODO export these interfaces from '@zenyway/zenypass-service'
export interface PaymentService {
  url: any // not used
  getPricing(opts?: Partial<PricingSpec>): Promise<Pricing>
  checkout(
    document: Document,
    locale: Locale,
    lang: string,
    spec: PaymentSpec
  ): Promise<void>
  getPaymentNotification$(): any // not used
}

export interface PricingSpec {
  country: string
  currency: 'EUR'
  uiid: string
  ucid: string
}

export interface Locale {
  localize(
    lang: Exclude<keyof LocaleMap, number>,
    currency: string,
    cents: number
  ): string
  localize(
    lang: Exclude<keyof LocaleMaps, number>,
    key: Exclude<keyof LocaleMap, number>
  ): string
}
export declare type LocaleMaps = { [lang: string]: LocaleMap }
export declare type LocaleMap = { [key: string]: string }

export default {
  getPricing,
  checkout
} as PaymentService

function getPricing (opts?: Partial<PricingSpec>): Promise<Pricing> {
  return observableOf({
    ucid: UCID,
    i18nkey: I18NKEY,
    getCountrySpec,
    getPaymentSpec
  })
    .pipe(delay(PRICING_FACTORY_DELAY))
    .toPromise()
}

function getCountrySpec () {
  return { country: COUNTRY, currency: CURRENCY, vat: VAT }
}

function getPaymentSpec (uiid: string, quantity: number): PaymentSpec {
  const pricing = PRICING_SPEC[uiid]
  const price = Object.keys(pricing)
    .sort()
    .reduce(
      (price, key) =>
        price
          ? price
          : quantity >= +key
          ? getPrice(+key, pricing[key], quantity)
          : 0,
      0
    )
  return {
    country: COUNTRY,
    currency: CURRENCY,
    ucid: UCID,
    uiid,
    quantity,
    price
  }
}

function getPrice (key: number, price: number, quantity: number) {
  return Math.floor(((quantity - key) * price) / key) + price
}

function checkout (
  document: Document,
  locale: Locale,
  lang: string,
  spec: PaymentSpec
): Promise<void> {
  return observableOf(void 0)
    .pipe(delay(CHECKOUT_DELAY))
    .toPromise()
}
