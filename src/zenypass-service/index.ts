/**
 * Copyright 2019 ZenyWay S.A.S., Stephane M. Catala
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

import getZenypassServiceAccess, {
  AuthorizationDoc,
  PouchDoc,
  PouchVaultChange,
  ZenypassRecord,
  ZenypassService as CoreZenypassService,
  ZenypassServiceAccess
} from '@zenyway/zenypass-service'
import { newStatusError, ERROR_STATUS } from 'utils'
import {
  NEVER,
  Observable,
  defer,
  interval,
  from as observableFrom,
  of as observableOf,
  throwError
} from 'rxjs'
import {
  concat,
  map,
  retryWhen,
  shareReplay,
  switchMap,
  take,
  takeUntil,
  catchError
} from 'rxjs/operators'

export { AuthorizationDoc, PouchDoc, PouchVaultChange, ZenypassRecord }

export interface ZenypassServiceFactory {
  signup(
    username: string,
    passphrase: string,
    opts?: SignupSpec
  ): Promise<string>
  signin(username: string, passphrase: string): Promise<ZenypassService>
  requestAccess(
    username: string,
    passphrase: string,
    secret: string
  ): Promise<string>
  getService(username: string): ZenypassService
}

export interface SignupSpec {
  locale: string
  newsletter: boolean
}

export interface ZenypassService extends CoreZenypassService {
  signout(): void
  getSingleRunCountdown(spec?: SingleRunCountdownSpec): Observable<number>
}

export interface SingleRunCountdownSpec {
  start?: number
  period?: number
  cancel$?: Observable<any>
}

const SINGLE_RUN_COUNTDOWN_PERIOD = 1000 // ms

// tslint:disable-next-line:class-name
class _ZenypassServiceFactory implements ZenypassServiceFactory {
  static getInstance (access: ZenypassServiceAccess): ZenypassServiceFactory {
    return new _ZenypassServiceFactory(access)
  }

  signup (
    username: string,
    passphrase: string,
    opts: SignupSpec = {} as any
  ): Promise<string> {
    return this._access.signup(
      { username, passphrase },
      {
        lang: opts.locale,
        newsletter: opts.newsletter
      }
    )
  }

  signin (username: string, passphrase: string): Promise<ZenypassService> {
    if (this._services[username]) {
      return Promise.reject(newStatusError(ERROR_STATUS.CONFLICT)) // max one session per username
    }
    return this._access
      .signin({ username, passphrase })
      .then(
        service =>
          (this._services[username] = this._wrapService(username, service))
      )
  }

  requestAccess (
    username: string,
    passphrase: string,
    secret: string
  ): Promise<string> {
    return this._access.requestAccess({ username, passphrase }, secret)
  }

  getService (username: string): ZenypassService {
    return this._services[username]
  }

  private constructor (
    private _access: ZenypassServiceAccess,
    private _services = Object.create(null) as {
      [username: string]: ZenypassService
    }
  ) {
    this.signup = this.signup.bind(this)
    this.signin = this.signin.bind(this)
    this.requestAccess = this.requestAccess.bind(this)
    this.getService = this.getService.bind(this)
  }

  private _wrapService (
    username: string,
    service: CoreZenypassService
  ): ZenypassService {
    const wrapped: ZenypassService = Object.create(
      Object.getPrototypeOf(service)
    )
    Object.defineProperties(wrapped, Object.getOwnPropertyDescriptors(service))

    wrapped.signout = () => {
      service.signout()
      delete this._services[username]
    }

    let countdown$: Observable<number>
    wrapped.getSingleRunCountdown = function ({
      start = 0,
      period = SINGLE_RUN_COUNTDOWN_PERIOD,
      cancel$ = NEVER
    }: SingleRunCountdownSpec) {
      if (!countdown$) {
        countdown$ = interval(period).pipe(
          take(start + 1), // from start to zero
          takeUntil(cancel$),
          map(ticks => start - ticks),
          concat(observableOf(0)),
          shareReplay(0)
        )
      }
      return countdown$
    }
    return wrapped
  }
}

const zenypass = getZenypassServiceAccess().then(
  _ZenypassServiceFactory.getInstance
)

export default zenypass

export function getService (username?: string): Promise<ZenypassService> {
  return zenypass
    .then(({ getService }) => username && getService(username))
    .then(service =>
      !service
        ? Promise.reject(newStatusError(ERROR_STATUS.NOT_FOUND))
        : Promise.resolve(service)
    )
}

export function createPrivilegedRequest<T> (
  request: (
    service: ZenypassService,
    ...args: any[]
  ) => Observable<T> | Promise<T>
) {
  return function (
    authenticate: (username: string) => Observable<string> | Promise<string>,
    username: string,
    unrestricted: boolean,
    ...args: any[]
  ): Observable<T> {
    // curry request argument
    return observableFrom(getService(username)).pipe(
      catchError(err =>
        throwError(
          err && err.state !== ERROR_STATUS.NOT_FOUND
            ? err
            : ERROR_STATUS.FORBIDDEN
        )
      ),
      switchMap(service =>
        (!unrestricted
          ? observableFrom(authenticate(username))
          : observableOf(void 0)
        ).pipe(
          switchMap(() =>
            defer(() => request(service, ...args)).pipe(
              retryWhen((error$: Observable<any>) =>
                error$.pipe(
                  switchMap(error =>
                    error && error.status !== 401
                      ? throwError(error)
                      : observableFrom(authenticate(username))
                  )
                )
              )
            )
          )
        )
      )
    )
  }
}
