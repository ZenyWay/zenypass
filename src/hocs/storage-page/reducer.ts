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

import { Uiid, StorageOfferSpec } from '../storage-offer'
import createAutomataReducer, { AutomataSpec } from 'automata-reducer'
import { into } from 'basic-cursors'
import compose from 'basic-compose'
import { always, forType, mapPayload, mergePayload, omit, pick } from 'utils'

const DEFAULT_OFFERS: Partial<StorageOfferSpec>[] = [
  { uiid: Uiid.Unit, quantity: 1 },
  { uiid: Uiid.Unit, quantity: 5 },
  { uiid: Uiid.Unit, quantity: 10, editable: true },
  { uiid: Uiid.Premium, quantity: 1 }
]

export interface StoragePageHocProps extends HoistedStoragePageHocProps {}

export interface HoistedStoragePageHocProps {
  session?: string
  onClose?: (event?: MouseEvent) => void
  onError?: (error?: any) => void
}

export enum StoragePageAutomataState {
  Pending = 'PENDING',
  Idle = 'IDLE',
  Offline = 'OFFLINE'
}

const automata: AutomataSpec<StoragePageAutomataState> = {
  [StoragePageAutomataState.Pending]: {
    // NOT_FOUND: TODO consider how to handle 404 during init
    PRICING: StoragePageAutomataState.Idle
  },
  [StoragePageAutomataState.Idle]: {
    OFFLINE: StoragePageAutomataState.Offline
  },
  [StoragePageAutomataState.Offline]: {
    PRICING: StoragePageAutomataState.Idle,
    INFO: StoragePageAutomataState.Idle
  }
}

const HOISTED_PROPS: (keyof HoistedStoragePageHocProps)[] = [
  'session',
  'onClose',
  'onError'
]

export default compose.into(0)(
  createAutomataReducer(automata, StoragePageAutomataState.Pending),
  forType('OFFER_QUANTITY_CHANGE')(into('offers')(updateQuantityAndPrice)),
  forType('INFO')(mergePayload()),
  forType('PRICING')(
    compose.into(0)(
      into('offers')(updatePrices),
      mergePayload((pricing: any) => ({
        ...pricing.getCountrySpec(),
        ucid: pricing.ucid,
        i18nkey: pricing.i18nkey && pricing.i18nkey.toLowerCase()
      })),
      into('pricing')(mapPayload())
    )
  ),
  forType('CHANGE')(into('value')(mapPayload())),
  forType('CONTACT')(into('emailing')(always(true))),
  forType('CLEAR_EMAILING')(into('emailing')(always(false))),
  forType('INPUT_REF')(into('input')(mapPayload())),
  forType('SERVICE')(into('service')(mapPayload())),
  forType('PROPS')(
    compose.into(0)(
      mergePayload(pick(HOISTED_PROPS)),
      into('attrs')(mapPayload(omit(HOISTED_PROPS)))
    )
  )
)

interface PartialPricingState {
  offers: Partial<StorageOfferSpec>[]
  pricing: {
    getPaymentSpec: (uiid: string, quantity: number) => { price: number }
  }
}

function updatePrices ({
  offers = DEFAULT_OFFERS,
  pricing
}: PartialPricingState): StorageOfferSpec[] {
  let index = offers.length
  const update = new Array(index) as StorageOfferSpec[]
  while (index--) {
    const { uiid, quantity, editable = false } = offers[index]
    const id = getOfferId(uiid, quantity, editable)
    const price = getPrice(pricing, uiid, quantity)
    update[index] = { id, uiid, editable, quantity, price }
  }
  return update
}

function updateQuantityAndPrice (
  { offers, pricing }: PartialPricingState,
  { payload: [id, quantity] }
) {
  const index = offers.findIndex(offer => offer.id === id)
  const offer = offers[index]
  const update = offers.slice()
  update[index] = {
    ...offer,
    ...getConstrainedPriceAndQuantity(
      pricing,
      getPrice(pricing, Uiid.Premium, 1),
      offer.uiid,
      quantity
    )
  }
  return update
}

function getConstrainedPriceAndQuantity (
  pricing: {
    getPaymentSpec: (uiid: string, quantity: number) => { price: number }
  },
  maxPrice: number,
  uiid: string,
  quantity: number
) {
  if (Number.isNaN(quantity)) {
    return { price: NaN, quantity }
  }
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return getConstrainedPriceAndQuantity(
      pricing,
      maxPrice,
      uiid,
      quantity <= 0 ? 1 : getMaxQuantity(pricing, maxPrice, uiid)
    )
  }
  const price = getPrice(pricing, uiid, quantity)
  if (price < maxPrice) return { price, quantity }
  const step = price - getPrice(pricing, uiid, quantity - 1)
  const dq = Math.ceil((price - maxPrice) / step)
  return getConstrainedPriceAndQuantity(pricing, maxPrice, uiid, quantity - dq)
}

function getMaxQuantity (
  pricing: {
    getPaymentSpec: (uiid: string, quantity: number) => { price: number }
  },
  maxPrice: number,
  uiid: string,
  quantity: number = 1
) {
  const unitPrice = getPrice(pricing, uiid, quantity) / quantity
  const maxQuantity = Math.floor(maxPrice / unitPrice)
  return maxQuantity > quantity
    ? getMaxQuantity(pricing, maxPrice, uiid, maxQuantity)
    : quantity
}

function getPrice (
  pricing: {
    getPaymentSpec: (uiid: string, quantity: number) => { price: number }
  },
  uiid: string,
  quantity: number
): number {
  return Number.isNaN(quantity)
    ? NaN
    : pricing.getPaymentSpec(uiid, quantity).price
}

function getOfferId (
  uiid: string,
  quantity: number,
  editable?: boolean
): string {
  return `OFFER_${editable ? 'CUSTOM' : quantity}_${uiid}`
}
