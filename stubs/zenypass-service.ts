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
  Observable,
  NEVER,
  from as observableFrom,
  of as observableOf,
  throwError
} from 'rxjs'
import {
  concat,
  delay
  // tap
} from 'rxjs/operators'
import {
  AuthorizationDoc,
  Credentials,
  PouchDoc,
  PouchVaultChange,
  ZenypassRecord,
  ZenypassService,
  ZenypassServiceAccess
} from './@zenyway/zenypass-service'
import getRecordService, { KVMap, USERNAME } from './records'
import meta from './meta'
import payments from './payment-service'
import {
  BAD_REQUEST,
  UNAUTHORIZED,
  FORBIDDEN,
  NOT_FOUND,
  newStatusError
} from './status-error'
import { stall } from './utils'
// const log = label => console.log.bind(console, label)

export {
  AuthorizationDoc,
  KVMap,
  PouchDoc,
  PouchVaultChange,
  USERNAME,
  ZenypassRecord,
  ZenypassService,
  ZenypassServiceAccess
}

export const PASSWORD = '!!!'
const AUTHENTICATION_DELAY = 1500 // ms
const AUTHORIZATION_DELAY = 10000 // ms
const STORAGE_INFO_DELAY = 1500 // ms
const MIN_PASSWORD_LENGTH = 4
const TOKEN = 'BCDE FGHI JKLN'
const MAX_CERTIFIED_MS = 90 * 24 * 60 * 60 * 1000 // 90 days in ms
const AUTHORIZATIONS = [
  'Ubuntu Opera',
  'MacOS Safari',
  'Windows Chrome'
].reduce(
  function (agents, identifier, index) {
    const _id = String(index)
    const certified = Date.now() - Math.floor(Math.random() * MAX_CERTIFIED_MS)
    agents[_id] = { _id, _rev: '1-0', identifier, certified }
    return agents
  },
  {} as KVMap<AuthorizationDoc>
)
const DOCS = 14
const MAX_DOCS = 15
const DATE = new Date('2018-07-27').valueOf()
const AGENTS = [
  'Firefox',
  'Opera',
  'Chrome',
  'Chromium',
  'Safari',
  'Edge',
  'Explorer',
  'Opera Neon',
  'Opera Linux'
].map(
  (identifier, index) =>
    ({
      _id: `${index}`,
      identifier,
      certified: DATE
    } as AuthorizationDoc)
)

export default function (opts?: any): Promise<ZenypassServiceAccess> {
  return Promise.resolve({
    requestAccess,
    signup,
    signin
  })
}

export function getService (username: string): Promise<ZenypassService> {
  return username === USERNAME
    ? Promise.resolve({
        username,
        unlock,
        records: getRecordService(username),
        signout: noop,
        authorize,
        getAuthToken,
        cancelAuthorization: noop,
        getAgentInfo$,
        getStorageInfo$,
        meta,
        payments
      })
    : Promise.reject(newStatusError(404, 'NOT_FOUND'))
}

const RAW_TOKEN = TOKEN.split(' ')
  .map(str => str.trim())
  .filter(Boolean)
  .join('')

function requestAccess (
  { username, passphrase },
  secret: string
): Promise<string> {
  const isValidRequest = passphrase === PASSWORD && secret === RAW_TOKEN
  return stall(AUTHENTICATION_DELAY)(() =>
    isValidRequest ? observableOf(username) : throwError(BAD_REQUEST)
  ).toPromise()
}

function signup (
  { username, passphrase }: Credentials,
  opts?: any
): Promise<string> {
  return stall(AUTHENTICATION_DELAY)(() =>
    username !== USERNAME &&
    (passphrase && passphrase.length >= MIN_PASSWORD_LENGTH)
      ? observableOf(username)
      : throwError(FORBIDDEN)
  ).toPromise()
}

function signin (
  { username, passphrase }: Credentials,
  opts?: any
): Promise<ZenypassService> {
  return stall(AUTHENTICATION_DELAY)(() =>
    username !== USERNAME
      ? throwError(NOT_FOUND)
      : passphrase === PASSWORD
      ? observableFrom(getService(username))
      : throwError(UNAUTHORIZED)
  ).toPromise()
}

function unlock (password: string): Promise<string> {
  return stall(AUTHENTICATION_DELAY)(() =>
    password === PASSWORD ? observableOf(password) : throwError(UNAUTHORIZED)
  ).toPromise()
}

function getAuthToken (length?: number): string {
  return RAW_TOKEN
}

function authorize (
  passphrase: string,
  secret: string
): Promise<AuthorizationDoc> {
  const isValidSecret = secret === RAW_TOKEN
  return (passphrase === PASSWORD && isValidSecret
    ? observableOf(AUTHORIZATIONS[0]).pipe(delay(AUTHORIZATION_DELAY))
    : throwError(isValidSecret ? UNAUTHORIZED : BAD_REQUEST)
  ).toPromise()
}

export function getAuthorizations$ (
  username: string
): Observable<KVMap<AuthorizationDoc>> {
  const authorizations = Object.keys(AUTHORIZATIONS).reduce(
    function (agents, _id) {
      agents[_id] = { ...AUTHORIZATIONS[_id] }
      return agents
    },
    {} as KVMap<AuthorizationDoc>
  )
  return username === USERNAME
    ? observableOf(authorizations).pipe(concat(NEVER))
    : throwError(UNAUTHORIZED)
}

function getAgentInfo$ () {
  return observableFrom(AGENTS)
}

export interface StorageInfo {
  docs: number
  maxdocs: number
}

function getStorageInfo$ (): Observable<StorageInfo> {
  return observableOf({ docs: DOCS, maxdocs: MAX_DOCS }).pipe(
    delay(STORAGE_INFO_DELAY)
  )
}

function noop () {
  // do nothing
}
