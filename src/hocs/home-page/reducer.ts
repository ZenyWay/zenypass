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
import {
  MenuSpec,
  always,
  omit,
  forType,
  localizeMenu,
  mapPayload,
  mergePayload,
  mergeMenus,
  pick,
  stringifyError
} from 'utils'
import compose from 'basic-compose'
import createL10ns from 'basic-l10n'
import { Observer } from 'rxjs'

export interface HomePageHocProps {
  locale: string
  menu: MenuSpec
  onboarding?: boolean
  session?: string
  onAuthenticationRequest?: (res$: Observer<string>) => void
  onError?: (error?: any) => void
  onLogout?: (error?: any) => void
  onSelectMenuItem?: (target: HTMLElement) => void
  onStorage?: () => void
  onUpdateSetting?: (key?: string, value?: any) => void
}

export enum HomePageFsmState {
  Idle = 'IDLE',
  PendingRecords = 'PENDING_RECORDS',
  PendingNewRecord = 'PENDING_NEW_RECORD',
  OfflineError = 'OFFLINE_ERROR',
  RecordLimitError = 'RECORD_LIMIT_ERROR',
  NewRecordError = 'NEW_RECORD_ERROR'
}

const intoError = value => into('error')(always(value))
const clearError = intoError(void 0)

const homemenu = localizeMenu(
  createL10ns(require('./locales.json')),
  require('./options.json')
)

const automata: AutomataSpec<HomePageFsmState> = {
  [HomePageFsmState.PendingRecords]: {
    UPDATE_RECORDS: HomePageFsmState.Idle
  },
  [HomePageFsmState.Idle]: {
    CREATE_RECORD_REQUESTED: HomePageFsmState.PendingNewRecord,
    LOGOUT: HomePageFsmState.PendingNewRecord,
    FATAL_ERROR: HomePageFsmState.PendingNewRecord
  },
  [HomePageFsmState.PendingNewRecord]: {
    CREATE_RECORD_RESOLVED: HomePageFsmState.Idle,
    CLIENT_CLOSED_REQUEST: HomePageFsmState.Idle,
    GATEWAY_TIMEOUT: HomePageFsmState.OfflineError,
    FORBIDDEN: HomePageFsmState.RecordLimitError,
    CREATE_RECORD_REJECTED: [
      HomePageFsmState.NewRecordError,
      into('error')(mapPayload(stringifyError))
    ],
    LOGOUT: HomePageFsmState.PendingNewRecord,
    FATAL_ERROR: HomePageFsmState.PendingNewRecord
  },
  [HomePageFsmState.OfflineError]: {
    CLOSE_MODAL: HomePageFsmState.Idle
  },
  [HomePageFsmState.RecordLimitError]: {
    CLOSE_MODAL: HomePageFsmState.Idle
  },
  [HomePageFsmState.NewRecordError]: {
    CLOSE_MODAL: [HomePageFsmState.Idle, clearError]
  }
}

const SELECTED_PROPS: (keyof HomePageHocProps)[] = [
  'locale',
  'menu',
  'session',
  'onboarding',
  'onAuthenticationRequest',
  'onError',
  'onLogout',
  'onSelectMenuItem',
  'onStorage',
  'onUpdateSetting'
]

export default compose.into(0)(
  createAutomataReducer(automata, HomePageFsmState.PendingRecords),
  forType('CANCEL_COUNTDOWN')(into('unrestricted')(mapPayload(always(0)))),
  forType('UNRESTRICTED_COUNTDOWN')(into('unrestricted')(mapPayload())),
  forType('UPDATE_RECORDS')(into('records')(mapPayload())),
  forType('PROPS')(
    compose.into(0)(
      into('menu')(
        mapPayload(({ menu, locale }) => mergeMenus(menu, homemenu[locale]))
      ),
      mergePayload(pick(SELECTED_PROPS)),
      into('attrs')(mapPayload(omit(SELECTED_PROPS)))
    )
  )
)
