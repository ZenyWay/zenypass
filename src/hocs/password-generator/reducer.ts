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

import createAutomataReducer, { AutomataSpec } from 'automata-reducer'
import { into, propCursor } from 'basic-cursors'
import compose from 'basic-compose'
import {
  alt,
  always,
  forType,
  max,
  mapPayload,
  mergePayload,
  min,
  not,
  omit,
  pick,
  withEventGuards
} from 'utils'
import { createActionFactory } from 'basic-fsa-factories'

export interface PasswordGeneratorHocProps
  extends HoistedPasswordGeneratorHocProps {
  value?: string
}

export interface HoistedPasswordGeneratorHocProps {
  innerRef?: (ref: HTMLElement) => void
  onError?: (error?: any) => void
  onChange?: (value: string, item?: HTMLElement) => void
}

export enum PasswordGeneratorFsm {
  Closed = 'CLOSED',
  Open = 'OPEN',
  Pending = 'PENDING',
  Selected = 'SELECTED',
  ClearingClipboard = 'CLEARING_CLIPBOARD'
}

const DEFAULT_SETTINGS = {
  length: 12,
  lowercase: true,
  numbers: true,
  symbols: true,
  uppercase: true
}

const MIN_LENGTH = 4
const MAX_LENGTH = 4096

const limitLength = compose.into(0)(
  max(MAX_LENGTH),
  min(MIN_LENGTH),
  alt(isNaN)(DEFAULT_SETTINGS.length)
)
const addPayload = (val: number, { payload }: { payload?: number }) =>
  Number.isNaN(val) ? DEFAULT_SETTINGS.length : limitLength(val + payload)
const mapPayloadIntoValue = into('value')(mapPayload())
const clearValue = propCursor('value')(always(''))
const clearCleartext = propCursor('cleartext')(always(''))
const clearClipboardDirty = propCursor('clipboardDirty')(always())
const reset = [clearValue, clearCleartext, clearClipboardDirty]
const toggleSetting = param => propCursor(param)(not())
const setDefaultSettings = compose.into(0)(
  ...Object.keys(DEFAULT_SETTINGS).map(param =>
    propCursor(param)(always(DEFAULT_SETTINGS[param]))
  )
)

const passwordGeneratorFsm: AutomataSpec<PasswordGeneratorFsm> = {
  [PasswordGeneratorFsm.Closed]: {
    TOGGLE_GENERATOR: [PasswordGeneratorFsm.Pending, setDefaultSettings]
  },
  [PasswordGeneratorFsm.Pending]: {
    PASSWORD: [PasswordGeneratorFsm.Open, mapPayloadIntoValue]
  },
  [PasswordGeneratorFsm.Open]: {
    ADD: [PasswordGeneratorFsm.Pending, propCursor('length')(addPayload)],
    BLUR_INPUT: [
      PasswordGeneratorFsm.Pending,
      propCursor('length')(limitLength)
    ],
    CLEAR_CLIPBOARD: PasswordGeneratorFsm.ClearingClipboard,
    CLOSE: [PasswordGeneratorFsm.Closed, ...reset],
    ERROR: [PasswordGeneratorFsm.Closed, ...reset],
    INPUT: propCursor('length')(mapPayload()),
    PASSWORD_COPIED: propCursor('clipboardDirty')(always(true)),
    REFRESH: PasswordGeneratorFsm.Pending,
    SELECT: PasswordGeneratorFsm.Selected,
    TOGGLE_CLEARTEXT: propCursor('cleartext')(not()),
    TOGGLE_LOWER_CASE: toggleSetting('lowercase'),
    TOGGLE_NUMBERS: toggleSetting('numbers'),
    TOGGLE_SYMBOLS: toggleSetting('symbols'),
    TOGGLE_UPPER_CASE: toggleSetting('uppercase'),
    VALID_SETTINGS: PasswordGeneratorFsm.Pending
  },
  [PasswordGeneratorFsm.Selected]: {
    CLEAR_CLIPBOARD: PasswordGeneratorFsm.ClearingClipboard,
    CLOSE: [PasswordGeneratorFsm.Closed, ...reset]
  },
  [PasswordGeneratorFsm.ClearingClipboard]: {
    CLOSE: [PasswordGeneratorFsm.Closed, ...reset]
  }
}

const SELECTED_PROPS: (keyof HoistedPasswordGeneratorHocProps)[] = [
  'innerRef',
  'onError',
  'onChange'
]

const reducer = compose.into(0)(
  createAutomataReducer(passwordGeneratorFsm, PasswordGeneratorFsm.Closed),
  forType('INNER_REF')(into('ref')(mapPayload())),
  forType('DEFAULT_ACTION_BUTTON_REF')(
    propCursor('defaultActionButtonRef')(mapPayload())
  ),
  forType('PROPS')(
    compose.into(0)(
      mergePayload(pick(SELECTED_PROPS)),
      into('attrs')(mapPayload(omit(SELECTED_PROPS)))
    )
  )
)

const close = createActionFactory('CLOSE')
const clearClipboard = createActionFactory('CLEAR_CLIPBOARD')
const isValidSettings = createActionFactory('VALID_SETTINGS')
const toggleLowerCase = createActionFactory('TOGGLE_LOWER_CASE')
const validSettingsOrElseToggleLowerCaseWhenOpen = (
  _,
  { state, lowercase, numbers, uppercase, symbols }
) =>
  state === PasswordGeneratorFsm.Open &&
  (lowercase || numbers || uppercase || symbols
    ? isValidSettings
    : toggleLowerCase)()
const closeOrClearClipboardWhenOpenOrSelected = (
  _,
  { state, clipboardDirty }
) =>
  (state === PasswordGeneratorFsm.Open ||
    state === PasswordGeneratorFsm.Selected) &&
  (clipboardDirty ? clearClipboard : close)()

export default withEventGuards<string, any>({
  TOGGLE_GENERATOR: closeOrClearClipboardWhenOpenOrSelected,
  TOGGLE_LOWER_CASE: validSettingsOrElseToggleLowerCaseWhenOpen,
  TOGGLE_NUMBERS: validSettingsOrElseToggleLowerCaseWhenOpen,
  TOGGLE_UPPER_CASE: validSettingsOrElseToggleLowerCaseWhenOpen,
  TOGGLE_SYMBOLS: validSettingsOrElseToggleLowerCaseWhenOpen
})(reducer)
