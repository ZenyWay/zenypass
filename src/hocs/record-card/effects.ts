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
import { Observable, merge } from 'rxjs'
import {
  distinctUntilKeyChanged,
  filter,
  switchMap
} from 'rxjs/operators'
import { hasEntry, hasHandlerProp, createPrivilegedRequest } from 'utils'
// const log = (label: string) => console.log.bind(console, label)

const cleartextResolved = createActionFactory('CLEARTEXT_RESOLVED')
const cleartextRejected = createActionFactory('CLEARTEXT_REJECTED')
const cleartext = createPrivilegedRequest(
  getRecord,
  ({ password }: ZenypassRecord) => cleartextResolved(password),
  (error: any) => cleartextRejected(
    error && error.status !== 499 // request cancelled
    ? error && error.message || 'unknown error'
    : void 0
  )
)

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
    switchMap(
      ({ props: { onAuthenticationRequest, session, record } }) => cleartext(
        onAuthenticationRequest,
        record.unrestricted && session,
        record._id
      )
    )
  )
}
