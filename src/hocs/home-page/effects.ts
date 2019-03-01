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
//
import sortIndexedRecordsByName from './sort'
import zenypass, {
  PouchDoc,
  PouchVaultChange,
  ZenypassRecord
} from 'zenypass-service'
import { createActionFactory, StandardAction } from 'basic-fsa-factories'
import { createPrivilegedRequest, entries, toProjection } from 'utils'
import {
  catchError,
  concatMap,
  defaultIfEmpty,
  distinctUntilChanged,
  distinctUntilKeyChanged,
  filter,
  first,
  last,
  map,
  pluck,
  startWith,
  switchMap,
  // tap,
  withLatestFrom
} from 'rxjs/operators'
import {
  Observable,
  from as observableFrom,
  identity,
  of as observableOf
} from 'rxjs'

// const log = (label: string) => console.log.bind(console, label)

export interface IndexedRecordEntry {
  _id: string
  record?: Partial<ZenypassRecord>
}

export interface SettingsDoc extends PouchDoc {
  lang?: string
  noOnboarding?: boolean
}

const SETTINGS_DOC_ID = 'settings'
const updateSetting = createActionFactory<any>('UPDATE_SETTING')
const createRecordResolved = createActionFactory<any>('CREATE_RECORD_RESOLVED')
const createRecordRejected = createActionFactory<any>('CREATE_RECORD_REJECTED')
const updateRecords = createActionFactory('UPDATE_RECORDS')
const error = createActionFactory('ERROR')

const zenypass$ = observableFrom(zenypass)

const createRecord$ = createPrivilegedRequest<ZenypassRecord>(
  (username: string) =>
    zenypass$.pipe(
      switchMap(({ getService }) => getService(username).records.newRecord())
    )
)

export function createRecordOnCreateRecordRequested (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  const records$ = state$.pipe(
    pluck('records'),
    distinctUntilChanged()
  )
  return event$.pipe(
    filter(({ type }) => type === 'CREATE_RECORD_REQUESTED'),
    withLatestFrom(state$),
    pluck('1'),
    switchMap(({ onAuthenticationRequest, session: username }) =>
      createRecord$(
        toProjection(onAuthenticationRequest),
        username,
        true // unrestricted
      ).pipe(
        switchMap((record: ZenypassRecord) =>
          records$.pipe(
            filter(includesDefinedRecord(record)),
            first()
          )
        ),
        map(() => createRecordResolved()),
        catchError(err => observableOf(createRecordRejected(err)))
      )
    ),
    catchError(err => observableOf(error(err)))
  )
}

function includesDefinedRecord (record: ZenypassRecord) {
  return function (entries: IndexedRecordEntry[]) {
    for (const entry of entries) {
      if (entry.record && entry.record._id === record._id) {
        return true
      }
    }
    return false
  }
}

const getRecords$ = createPrivilegedRequest((username: string) =>
  zenypass$.pipe(
    switchMap(({ getService }) => getService(username).records.records$)
  )
)

export function injectRecordsFromService (_: any, state$: Observable<any>) {
  return state$.pipe(
    distinctUntilKeyChanged('session'),
    switchMap(({ onAuthenticationRequest, session, locale }) =>
      getRecords$(
        toProjection(onAuthenticationRequest),
        session,
        true // unrestricted
      ).pipe(
        map((records: IndexedMap<ZenypassRecord>) =>
          updateRecords(
            sortIndexedRecordsByName(toIndexedRecordsArray(records), locale)
          )
        ),
        catchError(err => observableOf(error(err)))
      )
    ),
    catchError(err => observableOf(error(err)))
  )
}

type IndexedMap<T> = { [key: string]: T }

function toIndexedRecordsArray (
  records: IndexedMap<ZenypassRecord>
): IndexedRecordEntry[] {
  const _ids = Object.keys(records)
  let i = _ids.length
  const result = new Array(i) as IndexedRecordEntry[]
  while (i--) {
    const _id = _ids[i]
    const record = records[_id]
    result[i] = { _id, record }
  }
  return result
}

const getSettings$ = createPrivilegedRequest<SettingsDoc>((username: string) =>
  zenypass$.pipe(
    map(({ getService }) => getService(username).meta),
    switchMap(meta =>
      observableFrom(
        meta.getChange$<SettingsDoc>({
          doc_ids: [SETTINGS_DOC_ID],
          since: 0,
          include_docs: true
        })
      ).pipe(
        defaultIfEmpty<PouchVaultChange<SettingsDoc>>(void 0),
        last<PouchVaultChange<SettingsDoc>>(),
        filter<PouchVaultChange<SettingsDoc>>(Boolean),
        concatMap(change =>
          observableFrom(
            meta.getChange$({
              doc_ids: [SETTINGS_DOC_ID],
              include_docs: true,
              live: true,
              since: (change && change.seq) || 0
            })
          ).pipe(
            pluck<PouchVaultChange<SettingsDoc>, SettingsDoc>('doc'),
            change && change.doc ? startWith(change.doc) : identity
          )
        )
      )
    )
  )
)

export function settings$FromService (_: any, state$: Observable<any>) {
  return state$.pipe(
    distinctUntilKeyChanged('session'),
    switchMap(({ onAuthenticationRequest, session }) =>
      getSettings$(
        toProjection(onAuthenticationRequest),
        session,
        true // unrestricted
      ).pipe(
        filter(({ _deleted }) => !_deleted),
        concatMap(({ _id, _rev, _deleted, ...settings }: SettingsDoc) =>
          entries(settings)
        ),
        map(setting => updateSetting(setting)),
        catchError(err => observableOf(error(err)))
      )
    ),
    catchError(err => observableOf(error(err)))
  )
}
