/**
 * @license
 * Copyright 2018 Stephane M. Catala
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
import { StandardAction } from 'basic-fsa-factories'
import { Observable, of as observable, throwError } from 'rxjs'
import {
  catchError,
  map,
  switchMap
} from 'rxjs/operators'
// const log = (label: string) => console.log.bind(console, label)

export function createPrivilegedRequest <T> (
  request: (session: string, ...args: any[]) => Observable<T> | Promise<T>,
  resolve: (val: T) => StandardAction<any>,
  reject: (err: any) => StandardAction<any>
) {
  return function (
    authenticate: () => Observable<string>,
    session: string,
    ...args: any[]
  ) {
    return doPrivilegedRequest(authenticate, request, session, ...args)
    .pipe(
      map(resolve),
      catchError((error: any) => observable(reject(error)))
    )
  }
}

function doPrivilegedRequest <T> (
  authenticate: () => Observable<string>,
  request: (session: string, ...args: any[]) => Observable<T> | Promise<T>,
  session?: string,
  ...args: any[]
) {
  return (!session ? authenticate() : observable(session))
  .pipe(
    switchMap(session => request(session, ...args)),
    catchError(
      error => error && error.status !== 401 // unauthorized
        ? throwError(error)
        : doPrivilegedRequest(authenticate, request, void 0, ...args)
    )
  )
}
