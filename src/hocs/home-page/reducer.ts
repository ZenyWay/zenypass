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
import { always, forType, localizeMenu, mapPayload, values } from 'utils'
import compose from 'basic-compose'
import createL10ns from 'basic-l10n'
import { ZenypassRecord } from 'zenypass-service'

export type AutomataState = 'idle' | 'busy' | 'error'

const homemenu = localizeMenu(
  createL10ns(require('./locales.json')),
  require('./options.json')
)

const setBusyCreatingNewRecord = into('busy')(always('creating-new-record'))
const clearBusy = into('busy')(always())
const mapPayloadToError = into('error')(mapPayload())
const clearError = into('error')(always())

const newRecordAutomata: AutomataSpec<AutomataState> = {
  idle: {
    CREATE_RECORD_REQUESTED: ['busy', setBusyCreatingNewRecord]
  },
  busy: {
    CREATE_RECORD_RESOLVED: ['idle', clearBusy],
    CREATE_RECORD_REJECTED: ['error', clearBusy, mapPayloadToError]
  },
  error: {
    CANCEL: ['idle', clearError]
  }
}

export default compose.into(0)(
  createAutomataReducer(newRecordAutomata, 'idle'),
  forType('UPDATE_RECORDS')(into('records')(mapPayload(sortRecordsByName))),
  forType('PROPS')(
    compose.into(0)(
      into('menu')(({ props }) => homemenu[props.locale].concat(props.menu)),
      into('props')(mapPayload())
    )
  )
)

function sortRecordsByName (records: {
  [id: string]: Partial<ZenypassRecord>
}): Partial<ZenypassRecord>[] {
  return values(records)
    .filter(Boolean)
    .sort(compareRecordNames)
}

function compareRecordNames (
  a: Partial<ZenypassRecord>,
  b: Partial<ZenypassRecord>
) {
  if (a.name === b.name) {
    return 0
  }
  const aname = a.name.toLowerCase()
  const bname = b.name.toLowerCase()
  return aname === bname ? (a.name > b.name ? 1 : -1) : aname > bname ? 1 : -1
}
