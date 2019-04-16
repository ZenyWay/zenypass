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

export enum Locale {
  en = 'EN',
  fr = 'FR'
}

export enum Currency {
  Euro = 'EUR'
}

const CURRENCIES: Currency[] = [Currency.Euro]

const DEFAULT_FORMATERS = CURRENCIES.reduce(function (formaters, currency) {
  formaters[currency] = createFormaters(currency)
  return formaters
}, {})

function createFormaters (currency: Currency) {
  return Object.keys(Locale).reduce(function (formaters, locale) {
    formaters[locale] = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    })
    return formaters
  }, {})
}

export function localizePrice (
  locale: string,
  currency: Currency = Currency.Euro,
  cents: number
) {
  const price = Math.floor(cents) / 100
  const formaters = DEFAULT_FORMATERS[currency]
  const formater =
    (formaters && formaters[locale]) ||
    new Intl.NumberFormat(locale, { style: 'currency', currency })
  return formater.format(price)
}
