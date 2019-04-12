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

import createAutomataReducer, { AutomataSpec } from 'automata-reducer'
import { into } from 'basic-cursors'
import compose from 'basic-compose'
import { forType, mapPayload, mergePayload, omit, pick } from 'utils'

export interface StorageOfferHocProps extends HoistedStorageOfferHocProps {}

export interface StorageOfferSpec extends StorageOfferBaseSpec {
  id: string
  editable?: boolean
  uiid?: Uiid
  quantity?: number
  price?: number
}

export interface StorageOfferBaseSpec {
  ucid?: string
  country?: string
  currency?: Currency
}

export enum Uiid {
  Premium = 'PREM',
  Unit = 'UNIT'
}

export enum Currency {
  Euro = 'EUR'
}

export interface HoistedStorageOfferHocProps extends StorageOfferSpec {
  offline?: boolean
  session?: string
  onChange?: (id?: string, quantity?: number) => void
  onToggleOffline?: (offline?: boolean) => void
}

export enum StorageOfferAutomataState {
  Idle = 'IDLE',
  PendingCheckout = 'PENDING_CHECKOUT'
}

const automata: AutomataSpec<StorageOfferAutomataState> = {
  [StorageOfferAutomataState.Idle]: {
    CHECKOUT: StorageOfferAutomataState.PendingCheckout
  },
  [StorageOfferAutomataState.PendingCheckout]: {
    CHECKOUT_RESOLVED: StorageOfferAutomataState.Idle
  }
}

const HOISTED_PROPS: (keyof HoistedStorageOfferHocProps)[] = [
  'id',
  'country',
  'currency',
  'editable',
  'offline',
  'price',
  'quantity',
  'session',
  'ucid',
  'uiid',
  'onChange',
  'onToggleOffline'
]

export default compose.into(0)(
  createAutomataReducer(automata, StorageOfferAutomataState.Idle),
  forType('PROPS')(
    compose.into(0)(
      mergePayload(pick(HOISTED_PROPS)),
      into('attrs')(mapPayload(omit(HOISTED_PROPS)))
    )
  )
)
