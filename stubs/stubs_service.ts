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
import { interval, NEVER, of as observable, Observable, throwError } from 'rxjs'
import { concat, switchMap, takeUntil, delay, take } from 'rxjs/operators'

const AUTHENTICATION_DELAY = 1500 // ms
const AUTHORIZATION_DELAY = 10000 // ms
const TOKEN_DELAY = 500 // ms
const PASSWORD = '!!!'
const SESSION_ID = '42'
const TOKEN = 'BCDE FGHI JKLN'
const UNAUTHORIZED = newStatusError(401, 'UNAUTHORIZED')
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
  {} as KV<AuthorizationDoc>
)

export function authenticate (password: string): Observable<string> {
  return interval(AUTHENTICATION_DELAY).pipe(
      take(1),
      switchMap(() => password === PASSWORD
        ? observable(SESSION_ID)
        : throwError(UNAUTHORIZED))
    )
}

export function authorize (sessionId: string): Observable<string> {
  return sessionId === SESSION_ID
  ? observable(TOKEN).pipe(
      delay(TOKEN_DELAY),
      concat(NEVER),
      takeUntil(interval(AUTHORIZATION_DELAY))
    )
  : throwError(UNAUTHORIZED)
}

export function getAuthorizations$ (sessionId: string): Observable<KV<AuthorizationDoc>> {
  const authorizations = Object.keys(AUTHORIZATIONS).reduce(
    function (agents, _id) {
      agents[_id] = { ...AUTHORIZATIONS[_id] }
      return agents
    },
    {} as KV<AuthorizationDoc>
  )
  return sessionId === SESSION_ID
  ? observable(authorizations).pipe(concat(NEVER))
  : throwError(UNAUTHORIZED)
}

export interface AuthorizationDoc {
  _id: string
  _rev: string
  identifier: string
  certified: number // EPOC
}

export interface KV<T> {
  [key: string]: T
}

interface StatusError extends Error {
  status: number
}

function newStatusError (status = 501, message = '') {
  const err = new Error(message) as StatusError
  err.status = status
  return err
}

function errorPassword (status: StatusError) {
  return status
}
