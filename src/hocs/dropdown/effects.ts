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
import { createActionFactory } from 'basic-fsa-factories'
import { Observable, NEVER, fromEvent, merge } from 'rxjs'
import {
  distinctUntilChanged,
  filter,
  map,
  pluck,
  switchMap,
  tap,
  withLatestFrom
} from 'rxjs/operators'
import { AutomataState } from './reducer'

const clickOutside = createActionFactory('CLICK_OUTSIDE')

interface DropdownComponentState {
  state: AutomataState
  dropdown: HTMLElement
}

export function toggleBackdropHandlers (
  _: any,
  state$: Observable<DropdownComponentState>
) {
  return state$.pipe(
    pluck<DropdownComponentState,AutomataState>('state'),
    distinctUntilChanged(),
    switchMap(
      state => state === 'expanded'
      ? merge(
        fromEvent<MouseEvent>(document, 'click'),
        fromEvent<TouchEvent>(document, 'touchstart')
        // TODO fromEvent<KeyboardEvent>(document, 'keyup')
      )
      : NEVER
    ),
    withLatestFrom(state$),
    filter(
      ([{ target }, { dropdown }]) =>
        dropdown && isClickOutside(dropdown, target as HTMLElement)
    ),
    map(() => clickOutside())
  )
}

function isClickOutside (dropdown: HTMLElement, target: HTMLElement) {
  return (dropdown === target) || !dropdown.contains(target)
}
