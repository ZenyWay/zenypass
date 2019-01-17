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
import { StandardAction, createActionFactory } from 'basic-fsa-factories'
import * as qs from 'query-string'
import {
  ignoreElements,
  filter,
  pluck,
  map,
  share,
  startWith,
  tap,
  withLatestFrom
} from 'rxjs/operators'
import { Observable, fromEvent, merge } from 'rxjs'
import { isBoolean, isString } from 'utils'
// const log = (label: string) => console.log.bind(console, label)

const signedOut = createActionFactory('SIGNED_OUT')
const email = createActionFactory('EMAIL')
const locale = createActionFactory('LOCALE')
const signup = createActionFactory('SIGNUP')
const signin = createActionFactory('SIGNIN')

export function signoutOnLogout(
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

function signout(username: string): Promise<void> {
  return zenypass.then(({ getService }) => getService(username).signout())
}

export function openLinkOnCloseInfo(
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  return event$.pipe(
    filter(({ type }) => type === 'CLOSE_INFO'),
    withLatestFrom(state$),
    pluck('1', 'link'),
    tap(openItemLink),
    ignoreElements()
  )
}

function openItemLink({ target, href }: HTMLLinkElement) {
  window.open(href, target)
}

export function injectParamsFromUrl() {
  // support url hash in storybook (iframe in development mode)
  const win = process.env.NODE_ENV === 'development' ? window.top : window
  const hash$ = fromEvent(win, 'hashchange').pipe(
    map(() => parseQsParamsFromLocationHash(win)),
    share(),
    startWith(parseQsParamsFromLocationHash(win))
  )
  const email$ = hash$.pipe(
    pluck('email'),
    map(sanitizeEmail),
    filter(Boolean),
    map(email)
  )
  const locale$ = hash$.pipe(
    pluck('lang'),
    map(sanitizeLang),
    filter(Boolean),
    map(locale)
  )
  const signup$ = hash$.pipe(
    pluck('signup'),
    map(sanitizeSignup),
    filter(isBoolean),
    map(isSignup => (isSignup ? signup() : signin()))
  )
  return merge(email$, locale$, signup$)
}

const INVALID_EMAIL = /^(?:[^@]+|.*[\n(){}\/\\<>]+.*)$/m
function sanitizeEmail(email: unknown) {
  return !isString(email) || INVALID_EMAIL.test(email.valueOf())
    ? void 0
    : email
}

function sanitizeLang(lang: unknown) {
  if (!isString(lang)) return void 0
  const i = LOCALES.indexOf(lang.trim().toLowerCase())
  return i < 0 ? void 0 : LOCALES[i]
}

function sanitizeSignup(signup: unknown) {
  return isString(signup)
    ? signup.trim().toLowerCase() === 'true'
    : isBoolean(signup)
    ? signup
    : void 0
}

function parseQsParamsFromLocationHash(win: Window) {
  const { hash } = win.location
  return qs.parse(getQueryString(hash))
}

const QS_REGEXP = /\?(.*)$/
function getQueryString(url: string) {
  const qs = QS_REGEXP.exec(url)
  return (qs && qs[1]) || ''
}
