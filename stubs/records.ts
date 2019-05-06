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
import { UNAUTHORIZED } from './status-error'
import { stall } from './utils'
import { Observable, Subject, from as observableFrom, throwError } from 'rxjs'
import {
  first,
  map,
  scan,
  tap,
  publishBehavior,
  refCount
} from 'rxjs/operators'
import {
  PouchDoc,
  ZenypassRecord,
  ZenypassRecordService
} from './@zenyway/zenypass-service'
const log = label => console.log.bind(console, label)

export type KVMap<V> = { [key: string]: V }

export const USERNAME = 'me@zw.fr'
const RECORD_SERVICE_DELAY = 500 // ms
const RECORD_PASSWORD = 'p@ssW0rd!012345678#012345678990123456789'
const RECORDS = [
  {
    name: '8-ZenyWay',
    url: 'https://zenyway.com',
    username: 'me@zenyway.com',
    keywords: ['comma', 'separated', 'values'],
    comments: '42 is *'
  },
  {
    name: '1-Note',
    password: '',
    comments: 'bla bla bla'
  },
  {
    name: '2-Wifi',
    comments:
      'wifi password, tablet or smartphone password, code for a vault or facility access'
  },
  {
    name: '3-???',
    username: 'john.doe@example.com',
    password: '',
    comments: 'not sure what this combination would be used for...'
  },
  {
    name: '4-Visa',
    username: 'XXXX XXXX XXXX XXXX',
    comments: 'csv: 123, expires: 12/42'
  },
  {
    name: '5-Bookmark',
    url: 'https://zenyway.com',
    password: ''
  },
  {
    name: '6-???',
    url: 'https://zenyway.com',
    comments: 'not sure what this combination would be used for...'
  },
  {
    name: '7-Medium',
    url: 'https://medium.com',
    username: 'john.doe@example.com',
    password: '',
    comments: 'password-less online account'
  },
  {
    name: 'Overflow 01234567890123456789 01234567890123456789',
    url: 'https://overflow.com/01234567890123456789/01234567890123456789',
    username: 'user012345678901234567890123456789@overflow.com',
    keywords: ['0123456789', 'abcdefghij', 'klmnopqrst', 'uvwxyz0123456789'],
    comments:
      '0123456789 01234567890123456789 0123456789 01234567890123456789 0123456789 01234567890123456789'
  },
  {
    name: 'HSVC',
    url: 'https://hvsc.c64.org/',
    username: 'rob.hubbard@hsvc.org',
    keywords: ['sid', 'music', 'collection'],
    comments: 'Rob says wow !'
  }
]
  .map((record: Partial<ZenypassRecord>, index: number) => ({
    ...record,
    _id: '' + index
  }))
  .map(incrementRecordRevision)
  .reduce(
    function (records, record) {
      records[record._id] = record
      return records
    },
    {} as KVMap<Partial<ZenypassRecord>>
  )

export default function getRecordService (username: string) {
  return {
    records$,
    getRecord: getRecord.bind(void 0, username),
    newRecord: newRecord.bind(void 0, username),
    putRecord: putRecord.bind(void 0, username)
  } as ZenypassRecordService
}

const recordsUpdate$ = new Subject<RecordsUpdate>()

interface RecordsUpdate {
  (records: KVMap<Partial<ZenypassRecord>>): KVMap<Partial<ZenypassRecord>>
}

const records$ = recordsUpdate$.pipe(
  scan<RecordsUpdate, KVMap<Partial<ZenypassRecord>>>(
    (records, update) => update(records),
    RECORDS
  ),
  tap(log('stub/zenypass-service:records:')),
  publishBehavior(RECORDS),
  refCount()
)

const getRecord = accessRecordService<PouchDoc, ZenypassRecord>(({ _id }) =>
  records$.pipe(
    first(),
    map(
      records =>
        ({ ...records[_id], password: RECORD_PASSWORD } as ZenypassRecord)
    )
  )
)

function updateRecords (
  update: (
    records: KVMap<Partial<ZenypassRecord>>
  ) => KVMap<Partial<ZenypassRecord>>
) {
  setTimeout(() => recordsUpdate$.next(update))
}

const newRecord = accessRecordService<void, ZenypassRecord>(function () {
  const record = records$
    .pipe(
      first(),
      map(records => records[getMaxId(records)] as ZenypassRecord)
    )
    .toPromise()
  updateRecords(function (records) {
    const _id = '' + (getMaxId(records) + 1)
    const empty = incrementRecordRevision({ _id } as ZenypassRecord)
    return { ...records, [_id]: empty }
  })
  return record
})

function getMaxId (records: KVMap<Partial<ZenypassRecord>>): number {
  const _ids = Object.keys(records)
    .map(_id => Number.parseInt(_id))
    .sort((a, b) => a - b)
  return _ids[_ids.length - 1]
}

const putRecord = accessRecordService<ZenypassRecord, ZenypassRecord>(function (
  record
) {
  const updated = incrementRecordRevision(record)
  updateRecords(records =>
    removeDeleted({
      ...records,
      [record._id]: updated
    })
  )
  return Promise.resolve(updated)
})

function removeDeleted (
  records: KVMap<Partial<ZenypassRecord>>
): KVMap<Partial<ZenypassRecord>> {
  return Object.keys(records)
    .filter(_id => !records[_id]._deleted)
    .reduce((purged, _id) => ({ ...purged, [_id]: records[_id] }), {})
}

function accessRecordService<I, O> (
  result: (arg?: I) => Observable<O> | Promise<O>
) {
  return function (username: string, arg: I): Promise<O> {
    return stall(RECORD_SERVICE_DELAY)(() =>
      username === USERNAME
        ? observableFrom(result(arg))
        : throwError(UNAUTHORIZED)
    ).toPromise()
  }
}

function incrementRecordRevision (record: ZenypassRecord): ZenypassRecord {
  return { ...record, _rev: incrementHexString(record._rev) }
}

function incrementHexString (rev: string = '0'): string {
  return (Number.parseInt(rev, 16) + 1).toString(16)
}
