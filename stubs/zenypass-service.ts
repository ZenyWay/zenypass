/**
 * Copyright 2018 ZenyWay S.A.S
 * @author Stephane M. Catala
 * @license Apache 2.0
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
import {
  BehaviorSubject,
  Observable,
  NEVER,
  interval,
  from as observableFrom,
  of as observableOf,
  throwError
} from 'rxjs'
import {
  concat,
  delay,
  first,
  map,
  scan,
  switchMap,
  take,
  takeUntil
} from 'rxjs/operators'
import {
  AuthorizationDoc,
  PouchDoc,
  ZenypassRecord
} from '@zenyway/zenypass-service'

export { AuthorizationDoc, PouchDoc, ZenypassRecord }

export type KVMap<V> = { [key: string]: V }

export const USERNAME = 'me@zw.fr'
const PASSWORD = '!!!'
const AUTHENTICATION_DELAY = 1500 // ms
const AUTHORIZATION_DELAY = 10000 // ms
const TOKEN_DELAY = 500 // ms
const RECORD_SERVICE_DELAY = 500 // ms
const MIN_PASSWORD_LENGTH = 4
const SESSION_ID = '42'
const TOKEN = 'BCDE FGHI JKLN'
const UNAUTHORIZED = newStatusError(401, 'UNAUTHORIZED')
const FORBIDDEN = newStatusError(403, 'FORBIDDEN')
const MAX_CERTIFIED_MS = 90 * 24 * 60 * 60 * 1000 // 90 days in ms
const AUTHORIZATIONS = [
  'Ubuntu Opera', 'MacOS Safari', 'Windows Chrome'
].reduce(
  function (agents, identifier, index) {
    const _id = String(index)
    const certified = Date.now() - Math.floor(Math.random() * MAX_CERTIFIED_MS)
    agents[_id] = { _id, _rev: '1-0', identifier, certified }
    return agents
  },
  {} as KVMap<AuthorizationDoc>
)
const RECORD_PASSWORD = 'p@ssW0rd!'
const RECORDS = [
  {
    _id: '1',
    name: 'Example',
    url: 'https://example.com',
    username: 'john.doe@example.com',
    keywords: ['comma', 'separated', 'values'],
    comments: '42 is *'
  },
  {
    _id: '2',
    name: 'ZenyWay',
    url: 'https://zenyway.com',
    username: 'me@zenyway.com',
    keywords: [],
    comments: ''
  },
  {
    _id: '3',
    name: 'HSVC',
    url: 'https://hvsc.c64.org/',
    username: 'rob.hubbard@hsvc.org',
    keywords: ['sid', 'music', 'collection'],
    comments: 'Rob says wow !'
  }
].reduce(
  function (records, record) {
    records[record._id] = record
    return records
  },
  {} as KVMap<Partial<ZenypassRecord>>
)

const EMPTY_RECORD = { _id: '4' } as ZenypassRecord

export default Promise.resolve({
  signup,
  signin,
  getService
})

function signup (username: string, passphrase: string): Promise<string> {
  return stall(AUTHENTICATION_DELAY)(
    () => (username !== USERNAME)
    && (passphrase && passphrase.length >= MIN_PASSWORD_LENGTH)
      ? observableOf(SESSION_ID)
      : throwError(FORBIDDEN)
    )
    .toPromise()
}

function signin (username: string, passphrase: string): Promise<string> {
  return stall(AUTHENTICATION_DELAY)(
    () => username === USERNAME && passphrase === PASSWORD
      ? observableOf(username)
      : throwError(UNAUTHORIZED)
    )
    .toPromise()
}

function getService (username: string) {
  if (username !== USERNAME) { return }
  const records = {
    records$,
    getRecord: getRecord.bind(void 0, username),
    newRecord: newRecord.bind(void 0, username),
    putRecord: putRecord.bind(void 0, username)
  }
  return { unlock, records, signout: noop }
}

function unlock (password: string): Promise<string> {
  return stall(AUTHENTICATION_DELAY)(
    () => password === PASSWORD
      ? observableOf(SESSION_ID)
      : throwError(UNAUTHORIZED)
    )
    .toPromise()
}

export function authorize (sessionId: string): Observable<string> {
  return sessionId === SESSION_ID
  ? observableOf(TOKEN).pipe(
      delay(TOKEN_DELAY),
      concat(NEVER),
      takeUntil(interval(AUTHORIZATION_DELAY))
    )
  : throwError(UNAUTHORIZED)
}

export function getAuthorizations$ (sessionId: string): Observable<KVMap<AuthorizationDoc>> {
  const authorizations = Object.keys(AUTHORIZATIONS).reduce(
    function (agents, _id) {
      agents[_id] = { ...AUTHORIZATIONS[_id] }
      return agents
    },
    {} as KVMap<AuthorizationDoc>
  )
  return sessionId === SESSION_ID
  ? observableOf(authorizations).pipe(concat(NEVER))
  : throwError(UNAUTHORIZED)
}

const recordsUpdate$ =
  new BehaviorSubject<RecordsUpdate>(() => RECORDS)

interface RecordsUpdate {
  (records: KVMap<Partial<ZenypassRecord>>): KVMap<Partial<ZenypassRecord>>
}

const records$ = recordsUpdate$.pipe(
  scan<RecordsUpdate, KVMap<Partial<ZenypassRecord>>>(
    (records, update) => update(records),
    {}
  )
)

const getRecord = accessRecordService<PouchDoc,ZenypassRecord>(
  ({ _id }) => records$.pipe(
    first(),
    map(
      records => ({ ...records[_id], password: RECORD_PASSWORD }) as ZenypassRecord
    )
  )
)

const newRecord = accessRecordService<void,ZenypassRecord>(
  function () {
    const record = EMPTY_RECORD
    recordsUpdate$.next(
      records => ({ ...records, [record._id]: record })
    )
    return Promise.resolve(record)
  }
)

const putRecord = accessRecordService<ZenypassRecord,ZenypassRecord>(
  function (record) {
    recordsUpdate$.next(
      records => ({ ...records, [record._id]: record })
    )
    return Promise.resolve(record)
  }
)

const deleteRecord = accessRecordService<PouchDoc,PouchDoc>(ref => {
  const deleted = ({ ...ref, _deleted: true })
  recordsUpdate$.next(
    records => ({ ...records, [deleted._id]: deleted })
  )
  return Promise.resolve(deleted)
})

function accessRecordService <I,O> (
  result: (arg?: I) => Observable<O> | Promise<O>
) {
  return function (username: string, arg: I): Promise<O> {
    return stall(RECORD_SERVICE_DELAY)(
      () => username === USERNAME
        ? observableFrom(result(arg))
        : throwError(UNAUTHORIZED)
    )
    .toPromise()
  }
}

function stall (ms: number) {
  return function <T> (fn: () => Observable<T> | Promise<T>) {
    return interval(ms).pipe(take(1), switchMap(fn))
  }
}

interface StatusError extends Error {
  status: number
}

function newStatusError (status = 501, message = '') {
  const err = new Error(message) as StatusError
  err.status = status
  return err
}

function noop () {
  // do nothing
}
