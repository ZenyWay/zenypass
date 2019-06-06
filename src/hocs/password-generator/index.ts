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

import reducer, {
  HoistedPasswordGeneratorHocProps,
  PasswordGeneratorFsm,
  PasswordGeneratorHocProps
} from './reducer'
import {
  callOnChangeAndToggleGeneratorOnSelected,
  generatePasswordOnPending,
  clearClipboardAndCloseOnClearingClipboard
} from './effects'
import componentFromEvents, {
  ComponentConstructor,
  Rest,
  SFC,
  connect,
  logger,
  redux
} from 'component-from-events'
import {
  createActionDispatchers,
  createActionFactories
} from 'basic-fsa-factories'
import compose from 'basic-compose'
import {
  always,
  callHandlerOnEvent,
  focus,
  pluck,
  shallowEqual,
  tapOnEvent
} from 'utils'
import { distinctUntilChanged } from 'rxjs/operators'
const log = logger('password-generator')

export type PasswordGeneratorProps<
  P extends PasswordGeneratorSFCProps
> = PasswordGeneratorHocProps & Rest<P, PasswordGeneratorSFCProps>

export interface PasswordGeneratorSFCProps
  extends PasswordGeneratorSFCHandlerProps {
  cleartext?: boolean
  length?: number
  lowercase?: boolean
  numbers?: boolean
  open?: boolean
  original?: string
  pending?: boolean
  symbols?: boolean
  uppercase?: boolean
  value?: string
}

export interface PasswordGeneratorSFCHandlerProps {
  innerRef?: (ref: HTMLElement) => void
  onClickMinus?: (event?: MouseEvent) => void
  onClickPlus?: (event?: MouseEvent) => void
  onCopied?: (success: boolean, target?: HTMLElement) => void
  onClosed?: () => void
  onDefaultActionButtonRef?: (element: HTMLElement) => void
  onInput?: (event?: Event) => void
  onBlurInput?: (event?: Event) => void
  onRefresh?: (event?: MouseEvent) => void
  onSelect?: (event?: MouseEvent) => void
  onToggleCleartext?: (event?: Event) => void
  onToggleGenerator?: (event?: Event) => void
  onToggleLowerCase?: (event?: MouseEvent) => void
  onToggleNumbers?: (event?: MouseEvent) => void
  onToggleSymbols?: (event?: MouseEvent) => void
  onToggleUpperCase?: (event?: MouseEvent) => void
}

interface PasswordGeneratorState extends HoistedPasswordGeneratorHocProps {
  attrs: Pick<
    PasswordGeneratorProps<PasswordGeneratorSFCProps>,
    Exclude<
      keyof PasswordGeneratorProps<PasswordGeneratorSFCProps>,
      keyof HoistedPasswordGeneratorHocProps
    >
  >
  state: PasswordGeneratorFsm
  cleartext?: boolean
  clipboardDirty?: boolean
  length?: number
  lowercase?: boolean
  numbers?: boolean
  symbols?: boolean
  uppercase?: boolean
  value?: string
  defaultActionButtonRef?: HTMLElement
  ref?: HTMLElement
}

function mapStateToProps ({
  attrs: { value: original, ...attrs },
  cleartext,
  length,
  lowercase,
  numbers,
  state,
  symbols,
  uppercase,
  value
}: PasswordGeneratorState): Rest<
  PasswordGeneratorSFCProps,
  PasswordGeneratorSFCHandlerProps
> {
  const pending = state === PasswordGeneratorFsm.Pending
  return {
    ...attrs,
    cleartext,
    length,
    lowercase,
    numbers,
    open: state !== PasswordGeneratorFsm.Closed,
    original,
    pending,
    symbols,
    uppercase,
    value
  }
}

const mapDispatchToProps: (
  dispatch: (event: any) => void
) => PasswordGeneratorSFCHandlerProps = createActionDispatchers({
  innerRef: 'INNER_REF',
  onBlurInput: 'BLUR_INPUT',
  onClickMinus: ['ADD', always(-1)],
  onClickPlus: ['ADD', always(1)],
  onCopied: 'PASSWORD_COPIED',
  onClosed: 'CLOSED',
  onDefaultActionButtonRef: 'DEFAULT_ACTION_BUTTON_REF',
  onInput: ['INPUT', ({ currentTarget: { value } }) => parseInt(value, 10)],
  onRefresh: 'REFRESH',
  onSelect: 'SELECT',
  onToggleCleartext: 'TOGGLE_CLEARTEXT',
  onToggleGenerator: 'TOGGLE_GENERATOR',
  onToggleLowerCase: 'TOGGLE_LOWER_CASE',
  onToggleNumbers: 'TOGGLE_NUMBERS',
  onToggleUpperCase: 'TOGGLE_UPPER_CASE',
  onToggleSymbols: 'TOGGLE_SYMBOLS'
})

export function passwordGenerator<P extends PasswordGeneratorSFCProps> (
  SigninPageSFC: SFC<P>
): ComponentConstructor<PasswordGeneratorProps<P>> {
  return componentFromEvents(
    SigninPageSFC,
    log('event'),
    redux(
      reducer,
      tapOnEvent(
        'PASSWORD',
        compose.into(0)(focus, pluck('1', 'defaultActionButtonRef'))
      ),
      generatePasswordOnPending,
      callOnChangeAndToggleGeneratorOnSelected,
      clearClipboardAndCloseOnClearingClipboard,
      callHandlerOnEvent('INNER_REF', 'innerRef'),
      callHandlerOnEvent('ERROR', 'onError')
    ),
    log('state'),
    connect<PasswordGeneratorState, PasswordGeneratorSFCProps>(
      mapStateToProps,
      mapDispatchToProps
    ),
    () => distinctUntilChanged(shallowEqual),
    log('view-props')
  )
}
