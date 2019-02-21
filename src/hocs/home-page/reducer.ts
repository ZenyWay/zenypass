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

import sortIndexedRecordsByName from './sort'
import createAutomataReducer, { AutomataSpec } from 'automata-reducer'
import { into } from 'basic-cursors'
import { always, forType, localizeMenu, mapPayload, mergeMenus } from 'utils'
import compose from 'basic-compose'
import createL10ns from 'basic-l10n'

export enum HomePageFsmState {
  Idle = 'IDLE',
  PendingRecords = 'PENDING_RECORDS',
  PendingNewRecord = 'PENDING_NEW_RECORD',
  NewRecordError = 'NEW_RECORD_ERROR'
}

const homemenu = localizeMenu(
  createL10ns(require('./locales.json')),
  require('./options.json')
)

const mapPayloadToError = into('error')(mapPayload())
const clearError = into('error')(always())

const automata: AutomataSpec<HomePageFsmState> = {
  [HomePageFsmState.PendingRecords]: {
    UPDATE_RECORDS: HomePageFsmState.Idle
  },
  [HomePageFsmState.Idle]: {
    CREATE_RECORD_REQUESTED: HomePageFsmState.PendingNewRecord
  },
  [HomePageFsmState.PendingNewRecord]: {
    CREATE_RECORD_RESOLVED: HomePageFsmState.Idle,
    CREATE_RECORD_REJECTED: [HomePageFsmState.NewRecordError, mapPayloadToError]
  },
  [HomePageFsmState.NewRecordError]: {
    CANCEL: [HomePageFsmState.Idle, clearError]
  }
}

export default compose.into(0)(
  createAutomataReducer(automata, HomePageFsmState.PendingRecords),
  forType('UPDATE_RECORDS')(
    into('records')(mapPayload(sortIndexedRecordsByName))
  ),
  forType('PROPS')(
    compose.into(0)(
      into('menu')(({ props: { menu, locale } }) =>
        mergeMenus(menu, homemenu[locale])
      ),
      into('props')(mapPayload())
    )
  )
)
