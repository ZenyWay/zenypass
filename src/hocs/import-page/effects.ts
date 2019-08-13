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

import { createPrivilegedRequest, ZenypassRecord } from 'zenypass-service'
import formatRecordEntry from '../record-card/reducer/formaters'
import { getCsvParser, CSV_PARSER_SPEC } from 'basic-csv-parser'
import { CsvRecord, ImportPageFsm, RecordSelectorEntry } from './reducer'
import {
  createActionFactories,
  createActionFactory,
  StandardAction
} from 'basic-fsa-factories'
import { ERROR_STATUS, toProjection } from 'utils'
import { Observable, from as observableFrom, of as observableOf } from 'rxjs'
import {
  catchError,
  concatMap,
  distinctUntilKeyChanged,
  endWith,
  filter,
  ignoreElements,
  pluck,
  map,
  startWith,
  switchMap
} from 'rxjs/operators'

const entries = createActionFactory<RecordSelectorEntry[]>('ENTRIES')
const importComplete = createActionFactory<void>('IMPORT_COMPLETE')
const importingRecord = createActionFactory<number>('IMPORTING_RECORD')
const error = createActionFactory<any>('ERROR')
const ERRORS = createActionFactories({
  [ERROR_STATUS.GATEWAY_TIMEOUT]: 'OFFLINE'
  // [ERROR_STATUS.FORBIDDEN]: 'FORBIDDEN'
})

type CSV_PARSER_SPECS_KEYS = 'keepass' | 'excel' | 'standard'
type CSV_PARSER_SPECS = {
  [key in CSV_PARSER_SPECS_KEYS]: Partial<CSV_PARSER_SPEC>
}

const CONFIGS: CSV_PARSER_SPECS = {
  keepass: {
    escape: '\\',
    header: true,
    postprocess: val => val.replace(/\\(\\|")/g, '$1') // unescape
  },
  excel: {
    delimiter: ';',
    escape: '"',
    header: true
  },
  standard: {
    delimiter: ',',
    escape: '"',
    header: true
  }
}

export const CONFIG_KEYS: CSV_PARSER_SPECS_KEYS[] = [
  'standard',
  'excel',
  'keepass'
]

export function importRecordsOnImportRecords (_: any, state$: Observable<any>) {
  return state$.pipe(
    distinctUntilKeyChanged('state'),
    filter(({ state }) => state === ImportPageFsm.ImportRecords),
    switchMap(({ entries, onAuthenticationRequest, session }) =>
      importEntries(toProjection(onAuthenticationRequest), session, entries)
    ),
    catchError(err => observableOf(((err && ERRORS[err.status]) || error)(err)))
  )
}

const createRecord$ = createPrivilegedRequest<ZenypassRecord>(
  ({ records }, record: ZenypassRecord) => records.newRecord(record)
)

function importEntries (
  authenticate: (username: string) => Observable<string> | Promise<string>,
  username: string,
  selected: RecordSelectorEntry[]
) {
  return observableFrom(selected).pipe(
    pluck('record'),
    concatMap((record, index) =>
      createRecord$(
        authenticate,
        username,
        true, // unrestricted
        record
      ).pipe(
        ignoreElements(), // complete or error
        startWith(importingRecord(index))
      )
    ),
    endWith(importComplete())
  )
}

export function readCsvFileOnSelectFile (
  event$: Observable<StandardAction<any>>
) {
  return event$.pipe(
    filter(({ type }) => type === 'SELECT_FILE'),
    filter(({ payload: { file, key } }) => !!file && !!key),
    switchMap(({ payload: { file, key } }) =>
      readCsvFile(CONFIGS[key], file).then(records =>
        entriesFromRecords(key, file.name, records)
      )
    ),
    map(res => entries(res)),
    catchError(err => observableOf(error(err)))
  )
}

interface RawCsvRecord {
  [key: string]: string
}

function readCsvFile (
  config: CSV_PARSER_SPEC,
  file: File
): Promise<RawCsvRecord[]> {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader()
    reader.onload = onload
    reader.onerror = onerror
    reader.readAsText(file)

    function onload () {
      const csv = reader.result as string
      const parse = getCsvParser<RawCsvRecord>(config)
      resolve(parse(csv) as RawCsvRecord[])
    }

    function onerror () {
      reject(reader.error)
    }
  })
}

const PROP_MAPS: Partial<
  { [key in CSV_PARSER_SPECS_KEYS]: { [prop: string]: keyof CsvRecord } }
> = {
  keepass: {
    Account: 'name',
    'Web Site': 'url',
    'Login Name': 'username',
    Password: 'password',
    Comments: 'comments'
  },
  standard: {
    name: 'name',
    url: 'url',
    username: 'username',
    password: 'password',
    comments: 'comments'
  }
}

function entriesFromRecords (
  key: CSV_PARSER_SPECS_KEYS,
  filename: string,
  records: RawCsvRecord[]
): RecordSelectorEntry[] {
  return records.map((record, index) => ({
    id: index.toString(),
    record: withDefaultName(filename, index, convertProps(key, record))
  }))
}

function withDefaultName (filename: string, index: number, record: CsvRecord) {
  return record.name
    ? record
    : {
        ...record,
        name: `${filename} #${index}`
      }
}

function convertProps (
  key: CSV_PARSER_SPECS_KEYS,
  csv: RawCsvRecord
): CsvRecord {
  const propMap = PROP_MAPS[key] || PROP_MAPS.standard
  return Object.keys(propMap).reduce(function (record, prop) {
    const key = propMap[prop]
    record[key] = formatRecordEntry(key, csv[prop])
    return record
  }, Object.create(null))
}
