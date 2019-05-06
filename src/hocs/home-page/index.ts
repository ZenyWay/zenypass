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

import reducer, { HomePageFsmState, HomePageHocProps } from './reducer'
import {
  createRecordOnCreateRecordRequested,
  injectRecordsFromService,
  injectSettings$FromService,
  persistSettings$ToService,
  unrestrictedCountdownOnInitialIdle,
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
  createActionFactories,
  createActionFactory,
  createActionDispatchers,
  StandardAction
} from 'basic-fsa-factories'
import {
  MenuSpec,
  applyHandlerOnEvent,
  callHandlerOnEvent,
  tapOnEvent
} from 'utils'
import { Observer } from 'rxjs'
// import { tap } from 'rxjs/operators'
// const log = label => console.log.bind(console, label)

export type HomePageProps<P extends HomePageSFCProps> = HomePageHocProps &
  Rest<P, HomePageSFCProps>

export interface HomePageSFCProps extends HomePageSFCHandlerProps {
  locale: string
  menu: MenuSpec
  session?: string
  records?: IndexedRecordEntry[]
  onboarding?: boolean
  unrestricted?: number
  busy?: BusyState
  error?: string
}

export enum BusyState {
  CreatingNewRecord = 'creating-new-record',
  LoadingRecords = 'loading-records'
}

export interface HomePageSFCHandlerProps {
  onAuthenticationRequest?: (res$: Observer<string>) => void
  onError?: (error?: any) => void
  onSelectMenuItem?: (target: HTMLElement) => void
  onCancelCountdown?: (event?: Event) => void
  onCloseModal?: (event?: MouseEvent) => void
  onCloseOnboarding?: (event?: MouseEvent) => void
}

interface HomePageState extends HomePageHocProps {
  attrs: Pick<
    HomePageProps<HomePageSFCProps>,
    Exclude<keyof HomePageProps<HomePageSFCProps>, keyof HomePageHocProps>
  >
  state: HomePageFsmState
  records?: IndexedRecordEntry[]
  unrestricted?: number
  error?: string
}

const HOME_PAGE_FSM_STATE_TO_BUSY_STATE: {
  [state in HomePageFsmState]?: BusyState
} = {
  [HomePageFsmState.PendingNewRecord]: BusyState.CreatingNewRecord,
  [HomePageFsmState.PendingRecords]: BusyState.LoadingRecords
}

const HOME_PAGE_FSM_STATE_TO_ERROR: {
  [state in HomePageFsmState]?: 'offline' | 'limit'
} = {
  [HomePageFsmState.OfflineError]: 'offline',
  [HomePageFsmState.RecordLimitError]: 'limit'
}

function mapStateToProps ({
  attrs,
  state,
  menu,
  records,
  locale,
  session,
  onboarding,
  unrestricted,
  error,
  onAuthenticationRequest,
  onError
}: HomePageState): Rest<HomePageSFCProps, HomePageSFCHandlerProps> &
  Pick<HomePageSFCHandlerProps, 'onAuthenticationRequest' | 'onError'> {
  return {
    ...attrs,
    menu,
    records,
    locale,
    session,
    unrestricted,
    busy: HOME_PAGE_FSM_STATE_TO_BUSY_STATE[state],
    onboarding,
    error: HOME_PAGE_FSM_STATE_TO_ERROR[state] || error,
    // pass-through
    onAuthenticationRequest,
    onError
  }
}

const selectMenuItem = createActionFactory<HTMLElement>('SELECT_MENU_ITEM')

const MENU_ACTIONS = createActionFactories({
  'new-entry': 'CREATE_RECORD_REQUESTED',
  'help/first-steps': ['UPDATE_SETTING', () => ['onboarding', true]]
})

const mapDispatchToProps: (
  dispatch: (event: any) => void
) => HomePageSFCHandlerProps = createActionDispatchers({
  onCancelCountdown: 'CANCEL_COUNTDOWN',
  onCloseModal: 'CLOSE_MODAL',
  onCloseOnboarding: ['UPDATE_SETTING', () => ['onboarding', false]],
  onSelectMenuItem (item: HTMLElement): StandardAction<any> {
    const action = MENU_ACTIONS[item.dataset.id] || selectMenuItem
    return action(item)
  }
})

export function homePage<P extends HomePageSFCProps> (
  HomePageSFC: SFC<P>
): ComponentConstructor<HomePageProps<P>> {
  return componentFromEvents<HomePageProps<P>, P>(
    HomePageSFC,
    // () => tap(log('home-page:event:')),
    redux(
      reducer,
      injectRecordsFromService,
      injectSettings$FromService,
      unrestrictedCountdownOnInitialIdle,
      persistSettings$ToService,
      createRecordOnCreateRecordRequested,
      tapOnEvent('CREATE_RECORD_RESOLVED', () => window.scrollTo(0, 0)),
      applyHandlerOnEvent('UPDATE_SETTING', 'onUpdateSetting'),
      callHandlerOnEvent('SELECT_MENU_ITEM', 'onSelectMenuItem'),
      callHandlerOnEvent('LOGOUT', 'onLogout'),
      callHandlerOnEvent(
        ({ state }, { type }) =>
          state === HomePageFsmState.RecordLimitError && type === 'CLOSE_MODAL',
        'onStorage'
      ),
      callHandlerOnEvent('FATAL_ERROR', 'onError')
    ),
    // () => tap(log('home-page:state:')),
    connect<HomePageState, HomePageSFCProps>(
      mapStateToProps,
      mapDispatchToProps
    )
    // () => tap(log('home-page:view-props:'))
  )
}
