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
import zenypass from 'zenypass-service'
import { LOCALES } from './options'
import {
  StandardAction,
  createActionFactories,
  createActionFactory
} from 'basic-fsa-factories'
import {
  distinctUntilChanged,
  distinctUntilKeyChanged,
  filter,
  pluck,
  map,
  share,
  startWith,
  tap
} from 'rxjs/operators'
import { Observable, fromEvent, merge } from 'rxjs'
import { always } from 'utils'
// const log = (label: string) => console.log.bind(console, label)

const QS_PARAM_VALIDATORS = {
  email: always(true),
  lang: lang => LOCALES.indexOf(lang) >= 0,
  signup: isValidBoolean,
  onboarding: isValidBoolean
}

const fatal = createActionFactory('FATAL')
const signup = createActionFactory('SIGNUP')
const signin = createActionFactory('SIGNIN')

const QS_PARAM_ACTIONS = createActionFactories({
  email: 'EMAIL',
  lang: 'LOCALE',
  signup: val => (val === 'true' ? signup() : signin()),
  onboarding: ['ONBOARDING', val => val === 'true']
})

const signedOut = createActionFactory('SIGNED_OUT')

export function signoutOnPendingSignout (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  return state$.pipe(
    distinctUntilKeyChanged('path'),
    filter(({ path }) => path === RouteAutomataState.PendingSignout),
    pluck('session'),
    tap(signout),
    map(() => signedOut())
  )
}

function signout (username: string): Promise<void> {
  return zenypass.then(({ getService }) => getService(username).signout())
}

// support url hash in storybook (iframe in development mode)
const win = window.top

export function injectQueryParamsFromLocationHash () {
  const params$ = fromEvent(win, 'hashchange').pipe(
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
  return merge(...param$s)
}

function isValidBoolean (value: string) {
  return !value || value === 'true' || value === 'false'
}

export function udpateLocationHashQueryParam (key: string, value: any) {
  const params = parseQueryParamsFromLocationHash()
  const param = getSearchParam(params, key)
  const update = '' + value
  if (update === param || (!value && !param)) return
  if (update === 'false') params.delete(key)
  else params.set(key, update)
  win.location.hash = '#?' + params.toString()
}

function parseQueryParamsFromLocationHash () {
  return new URLSearchParams(win.location.hash.slice(1)) // remove leading hash
}

function getSearchParam (params: URLSearchParams, key: string): string {
  return !params.has(key)
    ? ''
    : params
        .get(key)
        .trim()
        .toLowerCase()
}
