/**
 * Copyright 2018 ZenyWay S.A.S., Stephane M. Catala
 * @author Stephane M. Catala
 * @author Clement Bonet
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
/** @jsx createElement */
//
import { AgentAuthorizationFsm } from './reducer'
import { getService } from 'zenypass-service'
import { createActionFactory, StandardAction } from 'basic-fsa-factories'
import {
  createPrivilegedRequest,
  toProjection,
  ERROR_STATUS,
  newStatusError
} from 'utils'
import {
  catchError,
  distinctUntilKeyChanged,
  filter,
  last,
  map,
  switchMap,
  startWith,
  takeUntil,
  tap,
  throwIfEmpty
} from 'rxjs/operators'
import { Observable, of as observableOf } from 'rxjs'

export { StandardAction }

const token = createActionFactory('TOKEN')
const authorizing = createActionFactory('AUTHORIZING')
const authorizationResolved = createActionFactory('AUTHORIZATION_RESOLVED')
const authorizationRejected = createActionFactory('AUTHORIZATION_REJECTED')
const error = createActionFactory('ERROR')
const cancel = createActionFactory('CANCEL')
const cancelled = createActionFactory('CANCELLED')

// const log = (label: string) => console.log.bind(console, label)

const authorize = createPrivilegedRequest(
  (username: string, passphrase: string, secret: string) =>
    getService(username).then(service => service.authorize(passphrase, secret))
)

export function generateTokenOnPendingToken (_: any, state$: Observable<any>) {
  return state$.pipe(
    distinctUntilKeyChanged('state'),
    filter(({ state }) => state === AgentAuthorizationFsm.PendingToken),
    switchMap(({ session }) => getService(session)),
    map(service => token(service.getAuthToken())),
    catchError(err => observableOf(error(err)))
  )
}

export function authorizeOnPendingAuthorization (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  const cancel$ = event$.pipe(filter(({ type }) => type === 'CLICK'))
  const unmount$ = state$.pipe(last())

  return state$.pipe(
    distinctUntilKeyChanged('state'),
    filter(({ state }) => state === AgentAuthorizationFsm.PendingAuthorization),
    map(({ onAuthenticationRequest, session, token }) => ({
      authenticate: toProjection<string, string>(onAuthenticationRequest),
      username: session,
      secret: token
    })),
    switchMap(({ authenticate, username, secret }) =>
      authenticate(username).pipe(
        map(passphrase => ({ authenticate, username, passphrase, secret }))
      )
    ),
    switchMap(({ authenticate, username, passphrase, secret }) =>
      authorize(
        authenticate,
        username,
        true, // unrestricted
        passphrase,
        secret
      ).pipe(
        map(() => authorizationResolved()),
        catchError(err => observableOf(authorizationRejected(err))),
        takeUntil(cancel$),
        takeUntil(unmount$),
        throwIfEmpty(() => newStatusError(ERROR_STATUS.CLIENT_CLOSED_REQUEST)),
        startWith(authorizing())
      )
    ),
    catchError((err, authorize$) =>
      err && err.status !== ERROR_STATUS.CLIENT_CLOSED_REQUEST
        ? observableOf(error(err))
        : authorize$.pipe(startWith(cancel()))
    )
  )
}

export function cancelAuthorizationOnCancelling (
  _: any,
  state$: Observable<any>
) {
  return state$.pipe(
    distinctUntilKeyChanged('state'),
    filter(({ state }) => state === AgentAuthorizationFsm.Cancelling),
    switchMap(({ session }) => getService(session)),
    tap(service => service.cancelAuthorization()),
    map(() => cancelled()),
    catchError(err => observableOf(error(err)))
  )
}
