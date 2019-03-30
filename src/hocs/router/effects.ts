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
import { RouteAutomataState } from './reducer'
import { getService } from 'zenypass-service'
import { LOCALES } from './options'
import { createActionFactories, createActionFactory } from 'basic-fsa-factories'
import {
  catchError,
  distinctUntilChanged,
  distinctUntilKeyChanged,
  filter,
  pluck,
  map,
  share,
  startWith,
  tap
} from 'rxjs/operators'
import { Observable, fromEvent, merge, of as observableOf } from 'rxjs'
import { always, isString, ERROR_STATUS } from 'utils'
const log = (label: string) => console.log.bind(console, label)

export const enum Route {
  HOMEPAGE = '/',
  AUTHORIZATIONS = '/authorizations',
  AUTHORIZE = '/authorize',
  FATAL = '/fatal',
  SIGNIN = '/signin',
  SIGNUP = '/signup',
  STORAGE = '/storage'
}

const QS_PARAM_VALIDATORS = {
  email: always(true),
  lang: lang => LOCALES.indexOf(lang) >= 0,
  onboarding: isValidBoolean
}

const QS_PARAM_ACTIONS = createActionFactories({
  email: 'EMAIL',
  lang: 'LOCALE',
  onboarding: ['ONBOARDING', val => val === 'true']
})

const paths = createActionFactories({
  [Route.HOMEPAGE]: 'HOMEPAGE',
  [Route.AUTHORIZATIONS]: 'AUTHORIZATIONS',
  [Route.AUTHORIZE]: 'AUTHORIZE',
  [Route.FATAL]: 'FATAL',
  [Route.SIGNIN]: 'SIGNIN',
  [Route.SIGNUP]: 'SIGNUP',
  [Route.STORAGE]: 'STORAGE'
})
const fatalError = createActionFactory('FATAL_ERROR')
const unauthorized = createActionFactory('UNAUTHORIZED')
const pathNotFound = createActionFactory('PATH_NOT_FOUND')
const signedOut = createActionFactory('SIGNED_OUT')

export function signoutOnSigningOut (_: any, state$: Observable<any>) {
  return state$.pipe(
    distinctUntilKeyChanged('path'),
    filter(({ path }) => path === RouteAutomataState.SigningOut),
    pluck('session'),
    tap(signout),
    map(() => signedOut()),
    catchError(err =>
      observableOf(
        err !== ERROR_STATUS.UNAUTHORIZED ? fatalError(err) : unauthorized()
      )
    )
  )
}

function signout (username: string): Promise<void> {
  return getService(username)
    .then(service => service.signout())
    .catch(log('signout:ignored:'))
}

// support url hash in storybook (iframe in development mode)
const win = window.top

export function injectPathAndQueryParamsFromLocationHash () {
  const hash$ = fromEvent(win, 'hashchange').pipe(
    map(() => win.location.hash.slice(1)), // remove leading hash
    share()
  )
  const params$ = hash$.pipe(
    map(parseQueryParamsFromLocationHash),
    share(),
    startWith(parseQueryParamsFromLocationHash())
  )
  const param$s = Object.keys(QS_PARAM_VALIDATORS).map(key =>
    params$.pipe(
      map(params => getSearchParam(params, key)),
      filter(QS_PARAM_VALIDATORS[key]),
      distinctUntilChanged(),
      map(value => QS_PARAM_ACTIONS[key](value))
    )
  )
  const path$ = hash$.pipe(
    map(parsePathFromLocationHash),
    startWith(parsePathFromLocationHash()),
    distinctUntilChanged(),
    map(path => (paths[path] || pathNotFound)())
  )
  return merge(path$, ...param$s).pipe(
    catchError(err => observableOf(fatalError(err)))
  )
}

function isValidBoolean (value: string) {
  return !value || value === 'true' || value === 'false'
}

export function updateLocationHashPath (update: string) {
  const path = parsePathFromLocationHash()
  if (update === path) return
  updateLocationHash(update)
}

export function udpateLocationHashQueryParam (key: string, value: any) {
  const params = parseQueryParamsFromLocationHash()
  const param = getSearchParam(params, key)
  const update = '' + value
  if (update === param || (!value && !param)) return
  if (update === 'false') params.delete(key)
  else params.set(key, update)
  updateLocationHash(params)
}

function updateLocationHash (path: string)
function updateLocationHash (params: URLSearchParams)
function updateLocationHash (update: string | URLSearchParams) {
  const isPathUpdate = isString(update)
  const path = isPathUpdate ? update : parsePathFromLocationHash()
  const params = (!isPathUpdate
    ? update
    : parseQueryParamsFromLocationHash()
  ).toString()
  win.location.hash = `#${path}${!params.length ? '' : `?${params.toString()}`}`
}

function parsePathFromLocationHash () {
  return parseUrlFromLocationHash().pathname
}

function parseQueryParamsFromLocationHash () {
  const { search } = parseUrlFromLocationHash()
  return new URLSearchParams(search)
}

function parseUrlFromLocationHash () {
  return new URL(win.location.hash.slice(1), win.location.origin)
}

function getSearchParam (params: URLSearchParams, key: string): string {
  return !params.has(key)
    ? ''
    : params
        .get(key)
        .trim()
        .toLowerCase()
}
