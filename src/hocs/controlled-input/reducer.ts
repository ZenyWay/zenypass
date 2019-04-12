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
import { into } from 'basic-cursors'
import compose from 'basic-compose'
import createAutomataReducer, { AutomataSpec } from 'automata-reducer'
import {
  always,
  forType,
  mapPayload,
  mergePayload,
  omit,
  pluck,
  pick
} from 'utils'

export interface ControlledInputHocProps extends HoistedControlledInputProps {
  value?: string
  autoFocus?: boolean
  autocorrect?: 'off' | 'on' | '' | false
  autocomplete?: 'off' | 'on' | '' | false
  spellcheck?: 'true' | 'false' | '' | false
}

export interface HoistedControlledInputProps {
  debounce?: string | number
  innerRef?: (ref: HTMLElement) => void
  onChange?: (value: string, item?: HTMLElement) => void
  onKeyDown?: (event: KeyboardEvent) => void
}

export enum ControlledInputFsmState {
  Pristine = 'PRISTINE',
  Dirty = 'DIRTY'
}

const intoValue = into('value')
const mapInputValueIntoValue = intoValue(
  mapPayload(pluck('currentTarget', 'value'))
)
const clearValue = intoValue(always(''))

const automata: AutomataSpec<ControlledInputFsmState> = {
  [ControlledInputFsmState.Pristine]: {
    PROPS: intoValue(mapPayload(pluck('value'))),
    INPUT: [ControlledInputFsmState.Dirty, mapInputValueIntoValue]
  },
  [ControlledInputFsmState.Dirty]: {
    INPUT: mapInputValueIntoValue,
    BLUR: ControlledInputFsmState.Pristine
  }
}

const HOISTED_PROPS: (keyof HoistedControlledInputProps)[] = [
  'debounce',
  'innerRef',
  'onChange',
  'onKeyDown'
]

export default compose.into(0)(
  createAutomataReducer(automata, ControlledInputFsmState.Pristine),
  forType('ESCAPE_KEY')(clearValue),
  forType('CLEAR')(clearValue),
  forType('PROPS')(
    compose.into(0)(
      mergePayload(pick(HOISTED_PROPS)),
      into('props')(mapPayload(omit(HOISTED_PROPS)))
    )
  ),
  forType('INPUT_REF')(into('input')(mapPayload())),
  forType('CLEAR_ICON_REF')(into('icon')(mapPayload()))
)
