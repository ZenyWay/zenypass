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
import { into, propCursor } from 'basic-cursors'
import compose from 'basic-compose'
import {
  alt,
  always,
  forType,
  max,
  mapPayload,
  mergePayload,
  min,
  not,
  omit,
  pick,
  pluck,
  withEventGuards
} from 'utils'
import { createActionFactory, StandardAction } from 'basic-fsa-factories'

export interface ImportPageHocProps extends HoistedImportPageHocProps {}

export interface HoistedImportPageHocProps {
  session?: string
  onAddStorage?: (event?: MouseEvent) => void
  onClose?: (event?: MouseEvent) => void
  onError?: (error?: any) => void
  onImport?: (records?: CsvRecord[]) => void
}

export interface RecordSelectorEntry {
  id: string
  record: Partial<CsvRecord>
  selected?: boolean
}

export interface CsvRecord {
  name: string
  keywords: string[]
  url: string
  username: string
  password: string
  comments: string
}

export enum ImportPageFsm {
  Pending = 'PENDING',
  Offline = 'OFFLINE',
  NoStorage = 'NO_STORAGE',
  SelectFile = 'SELECT_FILE',
  InsufficienStorage = 'INSUFFICIENT_STORAGE',
  SelectRecords = 'SELECT_RECORDS',
  Exit = 'EXIT'
}

const reset = [
  into('entries')(always()),
  into('error')(always()),
  into('max')(always()),
  into('service')(always())
]

const importPageFsm: AutomataSpec<ImportPageFsm> = {
  [ImportPageFsm.Pending]: {
    SUFFICIENT_STORAGE: ImportPageFsm.SelectFile,
    INSUFFICIENT_STORAGE: ImportPageFsm.NoStorage,
    OFFLINE: [ImportPageFsm.Offline, into('error')(mapPayload())]
  },
  [ImportPageFsm.Offline]: {
    CLOSE: [ImportPageFsm.Exit, ...reset]
  },
  [ImportPageFsm.NoStorage]: {
    CLOSE: [ImportPageFsm.Exit, ...reset],
    ADD_STORAGE: [ImportPageFsm.Exit, ...reset]
  },
  [ImportPageFsm.SelectFile]: {
    CLOSE: [ImportPageFsm.Exit, ...reset],
    ENTRIES: into('entries')(mapPayload()),
    SUFFICIENT_STORAGE: ImportPageFsm.SelectRecords,
    INSUFFICIENT_STORAGE: ImportPageFsm.InsufficienStorage
  },
  [ImportPageFsm.InsufficienStorage]: {
    CLOSE_INFO: ImportPageFsm.SelectRecords,
    ADD_STORAGE: [ImportPageFsm.Exit, ...reset]
  },
  [ImportPageFsm.SelectRecords]: {
    TOGGLE_SELECT: propCursor('entries')(toggleSelected),
    REJECT_SELECT: [
      ImportPageFsm.InsufficienStorage,
      propCursor('entries')(toggleSelected)
    ]
  },
  [ImportPageFsm.Exit]: {}
}

const SELECTED_PROPS: (keyof HoistedImportPageHocProps)[] = [
  'session',
  'onAddStorage',
  'onClose',
  'onError',
  'onImport'
]

const reducer = compose.into(0)(
  createAutomataReducer(importPageFsm, ImportPageFsm.Pending),
  forType('INFO')(
    into('max')(mapPayload(({ docs, maxdocs }) => maxdocs - docs))
  ),
  forType('SERVICE')(into('service')(mapPayload())),
  forType('PROPS')(
    compose.into(0)(
      mergePayload(pick(SELECTED_PROPS)),
      into('attrs')(mapPayload(omit(SELECTED_PROPS)))
    )
  )
)

const sufficientStorage = createActionFactory('SUFFICIENT_STORAGE')
const insufficientStorage = createActionFactory('INSUFFICIENT_STORAGE')
const rejectSelect = createActionFactory('REJECT_SELECT')

export default withEventGuards<string, any>({
  INFO: (_, { max }) =>
    max === 0 ? insufficientStorage() : sufficientStorage(0),
  ENTRIES: (entries, { max }) =>
    entries.length > max ? insufficientStorage() : sufficientStorage(),
  TOGGLE_SELECT: (id, { entries, max }) =>
    entries.filter(({ selected }) => selected).length > max && rejectSelect(id)
})(reducer)

function toggleSelected (
  entries: RecordSelectorEntry[],
  { payload: id }: StandardAction<string>
) {
  const index = entries.findIndex(entry => entry.id === id)
  if (index < 0) return
  const entry = entries[index]
  const result = entries.slice()
  result[index] = { ...entry, selected: !entry.selected }
  return result
}
