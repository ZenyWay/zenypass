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
  always,
  forType,
  mapPayload,
  mergePayload,
  omit,
  pick,
  pluck,
  withEventGuards
} from 'utils'
import { createActionFactory, StandardAction } from 'basic-fsa-factories'
import createL10ns from 'basic-l10n'
export const l10ns = createL10ns(require('./locales.json'))

export interface ImportPageHocProps extends HoistedImportPageHocProps {}

export interface HoistedImportPageHocProps {
  locale: string
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
  EditRecords = 'EDIT_RECORDS',
  ImportRecords = 'IMPORT_RECORDS',
  Exit = 'EXIT'
}

const reset = [
  'comments',
  'entries',
  'error',
  'filename',
  'index',
  'keywords',
  'max',
  'service'
].map(prop => into(prop)(always()))

const DATE_OPTIONS = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}

const formaters = Object.keys(l10ns).reduce(function (formaters, locale) {
  formaters[locale] = new Intl.DateTimeFormat(locale, DATE_OPTIONS)
  return formaters
}, {})

const defaultComment = ({ filename, locale }: any) =>
  l10ns[locale]`Imported on ${formaters[locale].format(
    new Date()
  )}, from file "${filename}"`
const appendLines = (text, lines) => (text ? `${text}\n${lines}` : lines)
const appendElements = (array = [], elements = []) => [].concat(array, elements)
const appendKeywordsAndComments = ({ keywords, comments, entries }) =>
  entries.map(entry => ({
    ...entry,
    record: {
      ...entry.record,
      keywords: appendElements(entry.record.keywords, keywords),
      comments: appendLines(entry.record.comments, comments)
    }
  }))
const isSelectedEntry = ({ selected }: RecordSelectorEntry) => selected
const countSelected = ({ entries }: any) =>
  entries.filter(isSelectedEntry).length
const setSelected = (
  predicate: (max: number, index: number, entry: RecordSelectorEntry) => boolean
) => ({ entries, max }) =>
  entries.map((entry, index) => ({
    ...entry,
    selected: predicate(max, index, entry)
  }))

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
    SELECT_FILE: into('filename')(mapPayload(pluck('file', 'name'))),
    ENTRIES: into('entries')(mapPayload()),
    SUFFICIENT_STORAGE: ImportPageFsm.SelectRecords,
    INSUFFICIENT_STORAGE: ImportPageFsm.InsufficienStorage
  },
  [ImportPageFsm.InsufficienStorage]: {
    CLOSE_INFO: ImportPageFsm.SelectRecords,
    ADD_STORAGE: [ImportPageFsm.Exit, ...reset]
  },
  [ImportPageFsm.SelectRecords]: {
    TOGGLE_SELECT: [
      into('selected')(countSelected),
      propCursor('entries')(toggleSelected)
    ],
    REJECT_SELECT: [
      ImportPageFsm.InsufficienStorage,
      into('selected')(countSelected),
      propCursor('entries')(toggleSelected)
    ],
    DESELECT_ALL: [
      into('selected')(always(0)),
      into('entries')(setSelected(always(false)))
    ],
    SELECT_ALL: [
      into('selected')(({ entries: { length }, max }) =>
        length > max ? max : length
      ),
      into('entries')(setSelected((max, index) => index < max))
    ],
    SUBMIT: [ImportPageFsm.EditRecords, into('comments')(defaultComment)]
  },
  [ImportPageFsm.EditRecords]: {
    CHANGE_KEYWORDS: into('keywords')(mapPayload()),
    CHANGE_COMMENTS: into('comments')(mapPayload()),
    SUBMIT: [
      ImportPageFsm.ImportRecords,
      into('entries')(appendKeywordsAndComments),
      into('entries')(({ entries }) => entries.filter(isSelectedEntry))
    ],
    CLOSE_INFO: ImportPageFsm.SelectRecords
  },
  [ImportPageFsm.ImportRecords]: {
    OFFLINE: [ImportPageFsm.Offline, into('error')(mapPayload())],
    IMPORTING_RECORD: into('index')(mapPayload()),
    IMPORT_COMPLETE: [ImportPageFsm.Exit, ...reset]
  },
  [ImportPageFsm.Exit]: {}
}

const SELECTED_PROPS: (keyof HoistedImportPageHocProps)[] = [
  'locale',
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
  TOGGLE_SELECT: (id, { selected, max }) => selected > max && rejectSelect(id)
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
