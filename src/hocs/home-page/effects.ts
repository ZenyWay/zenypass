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
import { HomePageFsmState } from './reducer'
import sortIndexedRecordsByName from './sort'
import {
  createPrivilegedRequest,
  getService,
  PouchDoc,
  PouchVaultChange,
  ZenypassRecord
} from 'zenypass-service'
import {
  createActionFactories,
  createActionFactory,
  StandardAction
} from 'basic-fsa-factories'
import { ERROR_STATUS, entries, isUndefined, toProjection } from 'utils'
import {
  catchError,
  concatMap,
  debounceTime,
  defaultIfEmpty,
  distinctUntilChanged,
  distinctUntilKeyChanged,
  filter,
  first,
  last,
  map,
  pluck,
  skip,
  startWith,
  switchMap,
  // tap,
  withLatestFrom
} from 'rxjs/operators'
import {
  Observable,
  from as observableFrom,
  combineLatest,
  of as observableOf,
  merge,
  throwError
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

const UNRESTRICTED_COUNTDOWN = 45 // s
const SETTINGS_DOC_ID = 'settings'
const SETTINGS_PERSIST_DEBOUNCE = 1500 // s

const updateSetting = createActionFactory<any>('UPDATE_SETTING')
const settingsPersisted = createActionFactory<any>('SETTINGS_PERSISTED')
const unrestrictedCountdown = createActionFactory<number>(
  'UNRESTRICTED_COUNTDOWN'
)
const createRecordResolved = createActionFactory<any>('CREATE_RECORD_RESOLVED')
const createRecordRejected = createActionFactory<any>('CREATE_RECORD_REJECTED')
const updateRecords = createActionFactory('UPDATE_RECORDS')
const logout = createActionFactory('LOGOUT')
const fatalError = createActionFactory('FATAL_ERROR')

const logoutOnClientClosedRequestOrFatalError = err =>
  (err && err.status !== ERROR_STATUS.CLIENT_CLOSED_REQUEST
    ? fatalError
    : logout)(err)

const NEW_RECORD_ERRORS: Partial<
  { [status in ERROR_STATUS]: StandardAction<any> }
> = createActionFactories({
  [ERROR_STATUS.FORBIDDEN]: 'FORBIDDEN',
  [ERROR_STATUS.CLIENT_CLOSED_REQUEST]: 'CLIENT_CLOSED_REQUEST',
  [ERROR_STATUS.GATEWAY_TIMEOUT]: 'GATEWAY_TIMEOUT'
})

const createRecord$ = createPrivilegedRequest(({ records }) =>
  records.newRecord()
)

export function createRecordOnCreateRecordRequested (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  const records$ = state$.pipe(pluck('records'), distinctUntilChanged())
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
          records$.pipe(filter(includesDefinedRecord(record)), first())
        ),
        map(() => createRecordResolved()),
        catchError(err =>
          observableOf(
            (NEW_RECORD_ERRORS[err && err.status] || createRecordRejected)(err)
          )
        )
      )
    ),
    catchError(err => observableOf(fatalError(err)))
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

const getRecords$ = createPrivilegedRequest(({ records }) => records.records$)

export function injectRecordsFromService (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
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
        catchError(err =>
          observableOf(logoutOnClientClosedRequestOrFatalError(err))
        )
      )
    ),
    catchError(err =>
      observableOf(logoutOnClientClosedRequestOrFatalError(err))
    )
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

export function unrestrictedCountdownOnInitialIdle (
  event$: Observable<StandardAction<any>>,
  state$: Observable<{ session: string; state: HomePageFsmState }>
) {
  const cancel$ = merge(
    event$.pipe(filter(({ type }) => type === 'CANCEL_COUNTDOWN')),
    event$.pipe(last()) // unmount
  )

  return state$.pipe(
    filter(({ state }) => state === HomePageFsmState.Idle),
    first(),
    switchMap(({ session }) => getService(session)),
    switchMap(service =>
      service.getSingleRunCountdown({ start: UNRESTRICTED_COUNTDOWN, cancel$ })
    ),
    map(count => unrestrictedCountdown(count))
  )
}

const getSettings$ = createPrivilegedRequest<SettingsDoc>(({ meta }) =>
  observableFrom(
    meta.getChange$<SettingsDoc>({
      doc_ids: [SETTINGS_DOC_ID],
      include_docs: true,
      live: false,
      since: 0
    })
  ).pipe(
    defaultIfEmpty<PouchVaultChange<SettingsDoc>>(void 0),
    last<PouchVaultChange<SettingsDoc>>(),
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
        startWith((change && change.doc) || ({} as SettingsDoc))
      )
    )
  )
)

export function injectSettings$FromService (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  return state$.pipe(
    distinctUntilKeyChanged('session'),
    switchMap(({ onAuthenticationRequest, session }) =>
      getSettings$(
        toProjection(onAuthenticationRequest),
        session,
        true // unrestricted
      ).pipe(
        filter(doc => !doc || !doc._deleted),
        concatMap(({ lang, noOnboarding }: SettingsDoc) =>
          entries({ locale: lang, onboarding: !noOnboarding })
        ),
        filter(([_, val]) => !isUndefined(val)),
        map(setting => updateSetting(setting)),
        catchError(err =>
          observableOf(logoutOnClientClosedRequestOrFatalError(err))
        )
      )
    ),
    catchError(err => observableOf(fatalError(err)))
  )
}

const upsertSettings$ = createPrivilegedRequest<SettingsDoc>(
  ({ meta }, { lang, noOnboarding }) =>
    observableFrom(meta.get<SettingsDoc>(SETTINGS_DOC_ID)).pipe(
      catchError(err =>
        err && err.status !== ERROR_STATUS.NOT_FOUND
          ? throwError(err)
          : observableOf({ _id: SETTINGS_DOC_ID } as SettingsDoc)
      ),
      filter(doc => doc.lang !== lang || doc.noOnboarding !== noOnboarding),
      concatMap(({ _id, _rev }) => meta.put({ _id, _rev, lang, noOnboarding }))
    )
)

export function persistSettings$ToService (_: any, state$: Observable<any>) {
  const setting$s = ['locale', 'onboarding'].map(setting =>
    state$.pipe(pluck(setting), distinctUntilChanged())
  )
  return combineLatest(...setting$s).pipe(
    skip(1), // initial state
    debounceTime(SETTINGS_PERSIST_DEBOUNCE),
    withLatestFrom(state$),
    concatMap(([[lang, onboarding], { onAuthenticationRequest, session }]) =>
      upsertSettings$(
        toProjection(onAuthenticationRequest),
        session,
        true, // unrestricted
        { lang, noOnboarding: !onboarding }
      ).pipe(
        map(settings => settingsPersisted(settings)),
        catchError(err =>
          observableOf(logoutOnClientClosedRequestOrFatalError(err))
        )
      )
    ),
    catchError(err => observableOf(fatalError(err)))
  )
}
