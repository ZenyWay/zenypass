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

import csprpg, { CsprpgSpec } from 'csprpg'
import copyToClipboard from 'clipboard-copy'
import { PasswordGeneratorFsm } from './reducer'
import { createActionFactory } from 'basic-fsa-factories'
import createL10ns from 'basic-l10n'
import { Observable, bindNodeCallback, of as observableOf } from 'rxjs'
import {
  catchError,
  debounceTime,
  distinctUntilKeyChanged,
  filter,
  map,
  switchMap,
  tap
} from 'rxjs/operators'

const rxcsprpg = bindNodeCallback<Partial<CsprpgSpec>, string>(csprpg)
const SYMBOLS = '#$%&_=+-*/<>()!?,;.:'

const password = createActionFactory<string>('PASSWORD')
const toggleGenerator = createActionFactory<void>('TOGGLE_GENERATOR')
const close = createActionFactory<void>('CLOSE')
const error = createActionFactory<any>('ERROR')

const CLIPBOARD_CLEARED = 'Clipboard cleared by ZenyPass'
const l10ns = createL10ns({
  fr: {
    [CLIPBOARD_CLEARED]: 'Presse-papier effacé par ZenyPass'
  },
  en: {
    [CLIPBOARD_CLEARED]: CLIPBOARD_CLEARED
  }
})

const DEBOUNCE_REFRESH = 150 // ms
export function generatePasswordOnPending (_: any, state$: Observable<any>) {
  return state$.pipe(
    distinctUntilKeyChanged('state'),
    filter(({ state }) => state === PasswordGeneratorFsm.Pending),
    debounceTime(DEBOUNCE_REFRESH),
    switchMap(({ length, numbers, lowercase, uppercase, symbols }) =>
      rxcsprpg({
        length,
        numbers,
        lowercase,
        uppercase,
        symbols: symbols && SYMBOLS
      })
    ),
    map(rnd => password(rnd)),
    catchError(err => observableOf(error(err)))
  )
}

export function callOnChangeAndToggleGeneratorOnSelected (
  _: any,
  state$: Observable<any>
) {
  return state$.pipe(
    distinctUntilKeyChanged('state'),
    filter(
      ({ state, onChange }) =>
        state === PasswordGeneratorFsm.Selected && !!onChange
    ),
    tap(({ onChange, value, ref }) => onChange(value, ref)),
    map(() => toggleGenerator()),
    catchError(err => observableOf(error(err)))
  )
}

export function clearClipboardAndCloseOnClearingClipboard (
  _: any,
  state$: Observable<any>
) {
  return state$.pipe(
    distinctUntilKeyChanged('state'),
    filter(
      ({ state, clipboardDirty }) =>
        !!clipboardDirty && state === PasswordGeneratorFsm.ClearingClipboard
    ),
    switchMap(({ attrs: { locale } }) =>
      copyToClipboard(l10ns[locale](CLIPBOARD_CLEARED))
    ),
    map(() => close()),
    catchError(err => observableOf(error(err)))
  )
}
