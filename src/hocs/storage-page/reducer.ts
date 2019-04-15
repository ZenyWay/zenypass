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
import { forType, mapPayload, mergePayload, omit, pick } from 'utils'

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
  Idle = 'IDLE'
}

const automata: AutomataSpec<StoragePageAutomataState> = {
  [StoragePageAutomataState.Pending]: {
    PRICING: StoragePageAutomataState.Idle
  },
  [StoragePageAutomataState.Idle]: {
    //
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
      mergePayload((pricing: any) => pricing.getCountrySpec()),
      mergePayload(pick('ucid', 'i18nkey')),
      into('pricing')(mapPayload())
    )
  ),
  forType('CHANGE')(into('value')(mapPayload())),
  forType('INPUT_REF')(into('input')(mapPayload())),
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
    const id = getOfferId(uiid, quantity)
    const { price } = pricing.getPaymentSpec(uiid, quantity)
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
  const { price } = pricing.getPaymentSpec(offer.uiid, quantity)
  const update = offers.slice()
  update[index] = { ...offer, quantity, price }
  return update
}

function getOfferId (uiid: string, quantity: number): string {
  return `OFFER_${quantity}_${uiid}`
}
