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
  HoistedStoragePageHocProps,
  StoragePageHocProps,
  StoragePageAutomataState
} from './reducer'
import {
  injectPricingFactoryOnSpecUpdate,
  injectStorageStatusOnMount
} from './effects'
import { Currency, Uiid, StorageOfferSpec } from '../storage-offer'
import componentFromEvents, {
  ComponentConstructor,
  Rest,
  SFC,
  connect,
  redux
} from 'component-from-events'
import { createActionDispatchers } from 'basic-fsa-factories'
import { callHandlerOnEvent, pluck, shallowEqual } from 'utils'
import { distinctUntilChanged, tap } from 'rxjs/operators'
const log = label => console.log.bind(console, label)

export type StoragePageProps<
  P extends StoragePageSFCProps
> = StoragePageHocProps & Rest<P, StoragePageSFCProps>

export interface StoragePageSFCProps extends StoragePageSFCHandlerProps {
  session?: string
  value?: string
  docs?: number
  maxdocs?: number
  discount?: string
  offers?: StorageOfferSpec[]
  country?: string
  currency?: Currency
  init?: boolean
  offline?: boolean
}

export interface StoragePageSFCHandlerProps {
  onClose?: (event?: MouseEvent) => void
  onError?: (error?: any) => void
  onChange?: (value: string, item?: HTMLElement) => void
  onOfferQuantityChange?: (id: string, quantity?: number) => void
  onToggleOffline?: (offline?: boolean) => void
}

interface StoragePageState extends HoistedStoragePageHocProps {
  attrs: Partial<
    Rest<StoragePageProps<StoragePageSFCProps>, HoistedStoragePageHocProps>
  >
  state: StoragePageAutomataState
  value?: string
  input?: HTMLElement
  docs?: number
  maxdocs?: number
  discount?: string
  offers?: StorageOfferSpec[]
  country?: string
  currency?: Currency
}

function mapStateToProps ({
  attrs,
  country,
  currency,
  discount,
  docs,
  offers,
  maxdocs,
  session,
  state,
  value
}: StoragePageState): Rest<StoragePageSFCProps, StoragePageSFCHandlerProps> {
  const init = state === StoragePageAutomataState.Pending
  return {
    ...attrs,
    country,
    currency,
    discount,
    docs,
    init,
    offers,
    maxdocs,
    session,
    value
  }
}

const mapDispatchToProps: (
  dispatch: (event: any) => void
) => StoragePageSFCHandlerProps = createActionDispatchers({
  onClose: 'CLOSE',
  onError: 'ERROR',
  onChange: 'CHANGE',
  onOfferQuantityChange: [
    'OFFER_QUANTITY_CHANGE',
    (id: string, quantity: number) => [id, quantity]
  ],
  onToggleOffline: 'OFFLINE'
})

export function storagePage<P extends StoragePageSFCProps> (
  StoragePageSFC: SFC<P>
): ComponentConstructor<StoragePageProps<P>> {
  return componentFromEvents<StoragePageProps<P>, P>(
    StoragePageSFC,
    () => tap(log('storage-page:event:')),
    redux(
      reducer,
      injectStorageStatusOnMount,
      injectPricingFactoryOnSpecUpdate,
      callHandlerOnEvent('TOGGLE_OFFLINE', 'onToggleOffline'),
      callHandlerOnEvent('CLOSE', 'onClose'),
      callHandlerOnEvent('ERROR', 'onError')
    ),
    () => tap(log('storage-page:state:')),
    connect<StoragePageState, StoragePageSFCProps>(
      mapStateToProps,
      mapDispatchToProps
    ),
    () => distinctUntilChanged(shallowEqual),
    () => tap(log('storage-page:view-props:'))
  )
}
