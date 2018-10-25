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
import { getRecord, ZenypassRecord } from 'services'
import { createActionFactory } from 'basic-fsa-factories'
import {
  Observable,
  Observer,
  Subject,
  merge,
  of as observable,
  throwError
} from 'rxjs'
import {
  catchError,
  distinctUntilKeyChanged,
  filter,
  map,
  switchMap
} from 'rxjs/operators'
import { hasEntry, isFunction } from 'utils'
// const log = (label: string) => console.log.bind(console, label)

export function cleartextOnPendingCleartextOrConnect (
  _: any,
  state$: Observable<any>
) {
  const cleartext$ = state$.pipe(
    distinctUntilKeyChanged('state'),
    filter(hasEntry('state', 'pending:cleartext'))
  )
  const edit$ = state$.pipe(
    distinctUntilKeyChanged('state'),
    filter(hasEntry('state', 'pending:edit'))
  )
  const connect$ = state$.pipe(
    distinctUntilKeyChanged('connect'),
    filter(hasEntry('connect', 'pending:connect'))
  )
  return merge(cleartext$, edit$, connect$).pipe(
    filter<any>(hasHandlerProp('onAuthenticationRequest')),
    switchMap(cleartext)
  )
}

const cleartextResolved = createActionFactory('CLEARTEXT_RESOLVED')
const cleartextRejected = createActionFactory('CLEARTEXT_REJECTED')
const doGetRecord = createPrivilegedRequest(getRecord)

function cleartext <
  S extends {
    props: {
      record: ZenypassRecord,
      session: string,
      onAuthenticationRequest: (res$: Observer<string>) => void
    }
  }
> ({ props }: S) {
  const { onAuthenticationRequest, record, session } = props

  return doGetRecord(
    onAuthenticationRequest,
    record.unrestricted && session,
    record._id
  )
  .pipe(
    map(({ password }) => cleartextResolved(password)),
    catchError(
      error => observable(
        cleartextRejected(
          error && error.status !== 499 // request cancelled
          ? error && error.message || 'unknown error'
          : void 0
        )
      )
    )
  )
}

function createPrivilegedRequest <T> (
  request: (session: string, ...args: any[]) => Promise<T>
) {
  return function doPrivilegedRequest (
    onAuthenticationRequest: (result$: Observer<string>) => void,
    session?: string,
    ...args: any[]
  ) {
    const authenticate = toProjection(onAuthenticationRequest)

    return (!session ? authenticate() : observable(session))
    .pipe(
      switchMap(session => request(session, ...args)),
      catchError(
        error => error && error.status !== 401 // unauthorized
          ? throwError(error)
          : doPrivilegedRequest(onAuthenticationRequest, void 0, ...args)
      )
    )
  }
}

function toProjection <I,O> (
  handler: (res$: Observer<O>, req?: I) => void
) {
  return function (req?: I): Observable<O> {
    const res$ = new Subject<O>()
    Promise.resolve().then(() => handler(res$, req)) // asap
    return res$
  }
}

function hasHandlerProp <
  K extends string,
  P extends { [prop in K]?: Function } = { [prop in K]?: Function }
> (prop: K) {
  return function ({ props }: { props: P }) {
    return isFunction(props[prop])
  }
}

/*
function operator <
  K extends string,
  I extends { props: { [prop in K]: (res$: Observer<O>, req?: T) => void } },
  O,
  T = void
> (
  handler: K,
  payload: (req?: I) => T = nop as any
): (req: Observable<I>) => Observable<O> {
  return switchMap(
    req => projection(req.props[handler])(payload(req))
  )
}
*/
