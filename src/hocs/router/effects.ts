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
import zenypass from 'zenypass-service'
import { LOCALES } from './options'
import {
  StandardAction,
  createActionFactories,
  createActionFactory
} from 'basic-fsa-factories'
import {
  catchError,
  concatMap,
  filter,
  pluck,
  map,
  startWith,
  tap,
  withLatestFrom
} from 'rxjs/operators'
import { Observable, fromEvent, of as observableOf } from 'rxjs'
import { isInvalidEmail, not } from 'utils'
const log = (label: string) => console.log.bind(console, label)

const QS_PARAM_VALIDATORS = {
  email: not(isInvalidEmail),
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

export function signoutOnLogout (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  return event$.pipe(
    filter(({ type }) => type === 'LOGOUT'),
    withLatestFrom(state$),
    pluck('1', 'session'),
    tap(signout),
    map(() => signedOut())
  )
}

function signout (username: string): Promise<void> {
  return zenypass.then(({ getService }) => getService(username).signout())
}

const win = window.top

export function injectQueryParamsFromLocationHash () {
  // support url hash in storybook (iframe in development mode)
  return fromEvent(win, 'hashchange').pipe(
    concatMap(() => parseQueryParamsFromLocationHash()),
    startWith(...parseQueryParamsFromLocationHash()),
    map(({ key, value }) => QS_PARAM_ACTIONS[key](value)),
    catchError(err => observableOf(fatal(err)))
  )
}

function isValidBoolean (value: string) {
  return value === 'true' || value === 'false'
}

const QS_PARAM_KEYS = Object.keys(QS_PARAM_VALIDATORS)

interface Entry<V> {
  key: string
  value: V
}

function parseQueryParamsFromLocationHash (): Entry<any>[] {
  const params = new URLSearchParams(win.location.hash.slice(1)) // remove leading hash
  const parsed = [] as Entry<any>[]
  for (const key of QS_PARAM_KEYS) {
    if (params.has(key)) {
      const value = params
        .get(key)
        .trim()
        .toLowerCase()
      const isValid = QS_PARAM_VALIDATORS[key]
      if (isValid(value)) parsed.push({ key, value })
    }
  }
  return parsed
}

export function udpateLocationHashQueryParam (key: string, value: any) {
  const params = new URLSearchParams(win.location.hash.slice(1)) // remove leading hash
  params.set(key, '' + value)
  win.location.hash = '#?' + params.toString()
}
