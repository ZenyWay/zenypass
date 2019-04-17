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

import reducer, {
  Currency,
  HoistedStorageOfferHocProps,
  StorageOfferAutomataState,
  StorageOfferBaseSpec,
  StorageOfferHocProps,
  StorageOfferSpec,
  Uiid
} from './reducer'
import {
  injectServiceOnSessionProp,
  checkoutOnPendingCheckout
} from './effects'
import componentFromEvents, {
  ComponentConstructor,
  Rest,
  SFC,
  connect,
  redux
} from 'component-from-events'
import { createActionDispatchers } from 'basic-fsa-factories'
import {
  always,
  applyHandlerOnEvent,
  callHandlerOnEvent,
  shallowEqual
} from 'utils'
import { distinctUntilChanged, tap } from 'rxjs/operators'
const log = label => console.log.bind(console, label)

export { Currency, StorageOfferBaseSpec, StorageOfferSpec, Uiid }

export type StorageOfferProps<
  P extends StorageOfferSFCProps
> = StorageOfferHocProps & Rest<P, StorageOfferSFCProps>

export interface StorageOfferSFCProps
  extends StorageOfferSFCHandlerProps,
    Pick<
      StorageOfferSpec,
      Exclude<keyof StorageOfferSpec, 'country' | 'id' | 'ucid'>
    > {
  locale: string
  id?: string
  offline?: boolean
  processing?: boolean
}

export interface StorageOfferSFCHandlerProps {
  onCheckout?: (event?: MouseEvent) => void
  onClickMinus?: (event?: MouseEvent) => void
  onClickPlus?: (event?: MouseEvent) => void
  onError?: (error?: any) => void
  onInput?: (event?: Event) => void
}

interface StorageOfferState extends HoistedStorageOfferHocProps {
  attrs: Partial<
    Rest<StorageOfferProps<StorageOfferSFCProps>, HoistedStorageOfferHocProps>
  >
  state: StorageOfferAutomataState
}

function mapStateToProps ({
  attrs,
  state,
  locale,
  currency,
  editable,
  id,
  offline,
  quantity,
  price,
  uiid
}: StorageOfferState): Rest<StorageOfferSFCProps, StorageOfferSFCHandlerProps> {
  const processing = state === StorageOfferAutomataState.PendingCheckout
  return {
    ...attrs,
    locale,
    currency,
    editable,
    id,
    offline,
    processing,
    quantity,
    price,
    uiid
  }
}

const mapDispatchToProps: (
  dispatch: (event: any) => void
) => StorageOfferSFCHandlerProps = createActionDispatchers({
  onCheckout: 'CHECKOUT',
  onClickMinus: ['ADD', always(-1)],
  onClickPlus: ['ADD', always(1)],
  onError: 'ERROR',
  onInput: ['INPUT', ({ currentTarget: { value } }) => parseInt(value, 10)]
})

const MAX_QUANTITY = 49
const constrainWithinOneAndMaxQuantity = constrainWithin(1, MAX_QUANTITY)

export function storageOffer<P extends StorageOfferSFCProps> (
  StorageOfferSFC: SFC<P>
): ComponentConstructor<StorageOfferProps<P>> {
  return componentFromEvents<StorageOfferProps<P>, P>(
    StorageOfferSFC,
    () => tap(log('storage-offer:event:')),
    redux(
      reducer,
      injectServiceOnSessionProp,
      checkoutOnPendingCheckout,
      applyHandlerOnEvent(
        'ADD',
        'onChange',
        ({ id, quantity }, { payload }) => [
          id,
          constrainWithinOneAndMaxQuantity(
            !isNaN(quantity)
              ? quantity + payload
              : payload < 0
              ? Infinity
              : -Infinity
          )
        ]
      ),
      applyHandlerOnEvent('INPUT', 'onChange', ({ id }, { payload }) => [
        id,
        payload
      ]),
      callHandlerOnEvent('OFFLINE', 'onToggleOffline'),
      callHandlerOnEvent('ERROR', 'onError')
    ),
    () => tap(log('storage-offer:state:')),
    connect<StorageOfferState, StorageOfferSFCProps>(
      mapStateToProps,
      mapDispatchToProps
    ),
    () => distinctUntilChanged(shallowEqual),
    () => tap(log('storage-offer:view-props:'))
  )
}

function constrainWithin (min: number, max: number) {
  return function (val: number) {
    return val < min ? min : val > max ? max : val
  }
}
