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
  injectServiceOnSessionProp,
  injectStorageStatusOnMount,
  clearEmailingOnDelayAfterContact
} from './effects'
import { Currency, StorageOfferSpec } from '../storage-offer'
import componentFromEvents, {
  ComponentConstructor,
  Rest,
  SFC,
  connect,
  logger,
  redux
} from 'component-from-events'
import { createActionDispatchers } from 'basic-fsa-factories'
import { callHandlerOnEvent, shallowEqual } from 'utils'
import { distinctUntilChanged } from 'rxjs/operators'
const log = logger('storage-page')

export type StoragePageProps<
  P extends StoragePageSFCProps
> = StoragePageHocProps & Rest<P, StoragePageSFCProps>

export interface StoragePageSFCProps extends StoragePageSFCHandlerProps {
  session?: string
  value?: string
  docs?: number
  maxdocs?: number
  ucid?: string
  i18nkey?: string
  offers?: StorageOfferSpec[]
  country?: string
  currency?: Currency
  init?: boolean
  emailing?: boolean
  offline?: boolean
}

export interface StoragePageSFCHandlerProps {
  onClose?: (event?: MouseEvent) => void
  onContact?: (event?: MouseEvent) => void
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
  ucid?: string
  i18nkey?: string
  offers?: StorageOfferSpec[]
  country?: string
  currency?: Currency
  emailing?: boolean
}

function mapStateToProps ({
  attrs,
  country,
  currency,
  i18nkey,
  docs,
  offers,
  maxdocs,
  session,
  state,
  value,
  ucid,
  emailing
}: StoragePageState): Rest<StoragePageSFCProps, StoragePageSFCHandlerProps> {
  return {
    ...attrs,
    country,
    currency,
    i18nkey,
    docs,
    init: state === StoragePageAutomataState.Pending,
    offers,
    offline: state === StoragePageAutomataState.Offline,
    maxdocs,
    session,
    value,
    ucid,
    emailing
  }
}

const mapDispatchToProps: (
  dispatch: (event: any) => void
) => StoragePageSFCHandlerProps = createActionDispatchers({
  onClose: 'CLOSE',
  onError: 'ERROR',
  onChange: 'CHANGE',
  onContact: 'CONTACT',
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
    log('event'),
    redux(
      reducer,
      injectServiceOnSessionProp,
      injectStorageStatusOnMount,
      injectPricingFactoryOnSpecUpdate,
      clearEmailingOnDelayAfterContact,
      callHandlerOnEvent('TOGGLE_OFFLINE', 'onToggleOffline'),
      callHandlerOnEvent('CLOSE', 'onClose'),
      callHandlerOnEvent('ERROR', 'onError')
    ),
    log('state'),
    connect<StoragePageState, StoragePageSFCProps>(
      mapStateToProps,
      mapDispatchToProps
    ),
    () => distinctUntilChanged(shallowEqual),
    log('view-props')
  )
}
