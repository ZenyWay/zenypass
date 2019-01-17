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
import {
  Observable,
  from as observableFrom,
  of as observableOf,
  throwError
} from 'rxjs'
import { catchError, map, switchMap } from 'rxjs/operators'
// const log = (label: string) => console.log.bind(console, label)

export function createPrivilegedRequest<T>(
  request: (username: string, ...args: any[]) => Observable<T> | Promise<T>,
  resolve: (val: T) => StandardAction<any>,
  reject: (err: any) => StandardAction<any>
) {
  return function(
    authenticate: (username: string) => Observable<string> | Promise<string>,
    username: string,
    unrestricted: boolean,
    ...args: any[]
  ) {
    return doPrivilegedRequest(
      authenticate,
      request,
      username,
      unrestricted,
      ...args
    ).pipe(
      map(resolve),
      catchError((error: any) => observableOf(reject(error)))
    )
  }
}

function doPrivilegedRequest<T>(
  authenticate: (username: string) => Observable<string> | Promise<string>,
  request: (username: string, ...args: any[]) => Observable<T> | Promise<T>,
  username: string,
  unrestricted: boolean,
  ...args: any[]
) {
  return (!unrestricted
    ? observableFrom(authenticate(username))
    : observableOf(username)
  ).pipe(
    switchMap(username => request(username, ...args)),
    catchError(error =>
      error && error.status !== 401 // unauthorized
        ? throwError(error)
        : doPrivilegedRequest(authenticate, request, username, false, ...args)
    )
  )
}
