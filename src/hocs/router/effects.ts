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
import {
  createActionFactories,
  createActionFactory,
  StandardAction
} from 'basic-fsa-factories'
import {
  catchError,
  distinctUntilChanged,
  distinctUntilKeyChanged,
  filter,
  ignoreElements,
  pluck,
  map,
  share,
  startWith,
  tap
} from 'rxjs/operators'
import {
  Observable,
  combineLatest,
  fromEvent,
  merge,
  of as observableOf
} from 'rxjs'
import { always, isString, ERROR_STATUS } from 'utils'
const log = (label: string) => console.log.bind(console, label)

const QS_PARAM_VALIDATORS = {
  email: always(true),
  lang: lang => LOCALES.indexOf(lang.toLowerCase()) >= 0,
  onboarding: isValidBoolean
}

const QS_PARAM_ACTIONS = createActionFactories({
  email: 'EMAIL',
  lang: ['LOCALE', lang => lang.toLowerCase()],
  onboarding: ['ONBOARDING', val => val.toLowerCase() === 'true']
})

const V1_PARAMS = {
  email: moveQSParamToHashQS,
  lang: moveQSParamToHashQS,
  signup: moveQSParamToHashPath
}

const fatalError = createActionFactory('FATAL_ERROR')
const unauthorized = createActionFactory('UNAUTHORIZED')
const signedOut = createActionFactory('SIGNED_OUT')
const urlPathUpdate = createActionFactory('URL_PATH_UPDATE')

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
importV1Params()

export function urlPathUpdateAndQsParamActionsFromLocationHash () {
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
    map(path => urlPathUpdate(path))
  )
  return merge(path$, ...param$s).pipe(
    catchError(err => observableOf(fatalError(err)))
  )
}

export function replaceLocationHashPathOnUrlPathUpdateOrPathState (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  const path$ = state$.pipe(
    pluck('path'),
    distinctUntilChanged()
  )
  const urlPathUpdate$ = event$.pipe(
    filter(({ type }) => type === 'URL_PATH_UPDATE')
  )
  return combineLatest(path$, urlPathUpdate$).pipe(
    pluck('0'),
    tap(replaceLocationHashPath),
    ignoreElements()
  )
}

function replaceLocationHashPath (update: string) {
  const path = parsePathFromLocationHash()
  if (update === path) return
  replaceLocationHash(update)
}

export function replaceLocationHashQueryParam (key: string, value: any) {
  const params = parseQueryParamsFromLocationHash()
  const param = getSearchParam(params, key)
  const update = '' + value
  if (update === param || (!value && !param)) return
  if (update === 'false') params.delete(key)
  else params.set(key, update)
  replaceLocationHash(params)
}

function replaceLocationHash (path: string)
function replaceLocationHash (params: URLSearchParams)
function replaceLocationHash (update: string | URLSearchParams) {
  const isPathUpdate = isString(update)
  const path = isPathUpdate ? update : parsePathFromLocationHash()
  const params = !isPathUpdate
    ? (update as URLSearchParams)
    : parseQueryParamsFromLocationHash()
  const url = new URL(win.location.toString())
  url.hash = `#${path}${toSearchString(params)}`
  win.location.replace(url.toString())
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
  return !params.has(key) ? '' : params.get(key).trim()
}

function toSearchString (params: URLSearchParams): string {
  const stringified = params.toString()
  return !stringified.length ? '' : `?${stringified}`
}

const BOOLEANS = ['true', 'false']
function isValidBoolean (val: string) {
  return !val || BOOLEANS.indexOf(val.toLowerCase()) >= 0
}

function importV1Params () {
  const url = new URL(win.location.href)
  if (!url.search) return
  for (const key of Object.keys(V1_PARAMS)) {
    importV1ParamToHashQS(key, getSearchParam(url.searchParams, key))
  }
  url.search = ''
  url.hash = win.location.hash
  win.location.replace(url.href)
}

function importV1ParamToHashQS (key: string, value: string) {
  if (value === '') return
  const moveQSParam = V1_PARAMS[key]
  moveQSParam && moveQSParam(key, value)
}

function moveQSParamToHashQS (key: string, value: string) {
  const params = parseQueryParamsFromLocationHash()
  if (params.has(key)) return
  params.append(key, value)
  replaceLocationHash(params)
}

function moveQSParamToHashPath (key: string, value: string) {
  if (value !== 'true' || parsePathFromLocationHash() !== '/') return
  replaceLocationHash(`/${key}`)
}
