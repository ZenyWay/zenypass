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
  StorageOfferHocProps,
  StorageOfferAutomataState
} from './reducer'
import componentFromEvents, {
  ComponentConstructor,
  Rest,
  SFC,
  connect,
  redux
} from 'component-from-events'
import { createActionDispatchers } from 'basic-fsa-factories'
import { pluck, shallowEqual, tapOnEvent } from 'utils'
import { distinctUntilChanged, tap } from 'rxjs/operators'
const log = label => console.log.bind(console, label)

export type StorageOfferProps<
  P extends StorageOfferSFCProps
> = StorageOfferHocProps & Rest<P, StorageOfferSFCProps>

export interface StorageOfferSFCProps
  extends StorageOfferSpec,
    StorageOfferSFCHandlerProps {
  ucid?: string
  country?: string
  currency?: Currency
  offline?: boolean
  processing?: boolean
}

export interface StorageOfferSpec {
  uiid?: Uiid
  quantity?: number
  price?: number
  editable?: boolean
}

export enum Uiid {
  Premium = 'PREM',
  Unit = 'UNIT'
}

export enum Currency {
  Euro = 'EUR'
}

export interface StorageOfferSFCHandlerProps {
  onCheckout?: (event?: MouseEvent) => void
  onClickMinus?: (event?: MouseEvent) => void
  onClickPlus?: (event?: MouseEvent) => void
  onInput?: (event?: Event) => void
}

interface StorageOfferState {
  attrs: StorageOfferProps<StorageOfferSFCProps>
  state: StorageOfferAutomataState
}

function mapStateToProps ({
  attrs,
  state
}: StorageOfferState): Rest<StorageOfferSFCProps, StorageOfferSFCHandlerProps> {
  return {
    ...attrs
  }
}

const mapDispatchToProps: (
  dispatch: (event: any) => void
) => StorageOfferSFCHandlerProps = createActionDispatchers({
  onCheckout: 'CHECKOUT',
  onClickMinus: 'CLICK_MINUS',
  onClickPlus: 'CLICK_PLUS'
})

export function storageOffer<P extends StorageOfferSFCProps> (
  StorageOfferSFC: SFC<P>
): ComponentConstructor<StorageOfferProps<P>> {
  return componentFromEvents<StorageOfferProps<P>, P>(
    StorageOfferSFC,
    () => tap(log('storage-offer:event:')),
    redux(reducer),
    () => tap(log('storage-offer:state:')),
    connect<StorageOfferState, StorageOfferSFCProps>(
      mapStateToProps,
      mapDispatchToProps
    ),
    () => distinctUntilChanged(shallowEqual),
    () => tap(log('storage-offer:view-props:'))
  )
}
