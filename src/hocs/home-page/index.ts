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

import reducer, { HomePageFsmState } from './reducer'
import {
  createRecordOnCreateRecordRequested,
  injectRecordsFromService,
  IndexedRecordEntry
} from './effects'
import componentFromEvents, {
  ComponentConstructor,
  Rest,
  SFC,
  connect,
  redux
} from 'component-from-events'
import {
  createActionFactory,
  createActionDispatchers,
  StandardAction
} from 'basic-fsa-factories'
import { callHandlerOnEvent, MenuSpec, tapOnEvent } from 'utils'
import { Observer } from 'rxjs'
import { tap } from 'rxjs/operators'
const log = label => console.log.bind(console, label)
//
export type HomePageProps<P extends HomePageSFCProps> = HomePageHocProps &
  Rest<P, HomePageSFCProps>

export interface HomePageHocProps {
  locale: string
  menu: MenuSpec
  session?: string
  onAuthenticationRequest?: (res$: Observer<string>) => void
  onError?: (error?: any) => void
  onSelectMenuItem?: (target: HTMLElement) => void
}

export interface HomePageSFCProps extends HomePageSFCHandlerProps {
  locale: string
  menu: MenuSpec
  session?: string
  /**
   * array of [_id: string, record?: ZenypassRecord]
   * an undefined record is pending decypher.
   */
  records?: IndexedRecordEntry[]
  busy?: BusyState
  error?: string
}

export enum BusyState {
  CreatingNewRecord = 'creating-new-record',
  LoadingRecords = 'loading-records'
}

export interface HomePageSFCHandlerProps {
  onSelectMenuItem?: (target: HTMLElement) => void
  onCancel?: (event?: MouseEvent) => void
  onModalToggled?: () => void
}

interface HomePageState {
  props: HomePageProps<HomePageSFCProps>
  menu: MenuSpec
  state: HomePageFsmState
  records?: IndexedRecordEntry[]
  error?: string
}

const HOME_PAGE_FSM_STATE_TO_BUSY_STATE: {
  [state in HomePageFsmState]?: BusyState
} = {
  [HomePageFsmState.PendingNewRecord]: BusyState.CreatingNewRecord,
  [HomePageFsmState.PendingRecords]: BusyState.LoadingRecords
}

function mapStateToProps ({
  props,
  state,
  menu,
  records,
  error
}: HomePageState): Rest<HomePageSFCProps, HomePageSFCHandlerProps> {
  return {
    ...props, // menu and onSelectMenuItem from props are both overwritten
    menu,
    records,
    busy: HOME_PAGE_FSM_STATE_TO_BUSY_STATE[state],
    error
  }
}

const mapDispatchToProps: (
  dispatch: (event: any) => void
) => HomePageSFCHandlerProps = createActionDispatchers({
  onSelectMenuItem,
  onCancel: 'CANCEL',
  onModalToggled: 'MODAL_TOGGLED'
})

const createRecordRequested = createActionFactory<void>(
  'CREATE_RECORD_REQUESTED'
)

const selectMenuItem = createActionFactory('SELECT_MENU_ITEM')

function onSelectMenuItem (item: HTMLElement): StandardAction<any> {
  return item && item.dataset.id === 'new-entry'
    ? createRecordRequested()
    : selectMenuItem(item)
}

export function homePage<P extends HomePageSFCProps> (
  HomePageSFC: SFC<P>
): ComponentConstructor<HomePageProps<P>> {
  return componentFromEvents<HomePageProps<P>, P>(
    HomePageSFC,
    () => tap(log('home-page:event:')),
    redux(
      reducer,
      injectRecordsFromService,
      createRecordOnCreateRecordRequested,
      tapOnEvent('CREATE_RECORD_RESOLVED', () => window.scrollTo(0, 0)),
      callHandlerOnEvent('SELECT_MENU_ITEM', ['props', 'onSelectMenuItem']),
      callHandlerOnEvent('ERROR', ['props', 'onError'])
    ),
    () => tap(log('home-page:state:')),
    connect<HomePageState, HomePageSFCProps>(
      mapStateToProps,
      mapDispatchToProps
    ),
    () => tap(log('home-page:view-props:'))
  )
}
