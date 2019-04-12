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
import reducer, {
  ControlledInputFsmState,
  ControlledInputHocProps,
  HoistedControlledInputProps
} from './reducer'
import { debounceInputWhenDebounce } from './effects'
import componentFromEvents, {
  ComponentConstructor,
  Rest,
  SFC,
  connect,
  redux
} from 'component-from-events'
import {
  createActionDispatchers,
  StandardAction,
  createActionFactory,
  createActionFactories
} from 'basic-fsa-factories'
import compose from 'basic-compose'
import {
  applyHandlerOnEvent,
  callHandlerOnEvent,
  focus,
  pluck,
  shallowEqual,
  tapOnEvent
} from 'utils'
import {
  distinctUntilChanged
  // tap
} from 'rxjs/operators'
// const log = label => console.log.bind(console, label)

export type ControlledInputProps<
  P extends InputProps
> = ControlledInputHocProps & Rest<P, InputProps>

export interface InputProps extends InputHandlerProps {
  value?: string
  autoFocus?: boolean
  autocorrect?: 'off' | 'on' | '' | false
  autocomplete?: 'off' | 'on' | '' | false
  spellcheck?: 'true' | 'false' | '' | false
}

export interface InputHandlerProps {
  inputRef?: (ref: HTMLElement) => void
  clearIconRef?: (ref: HTMLElement) => void
  onBlur?: (event: TextEvent) => void
  onClickClear?: (event?: MouseEvent) => void
  onInput?: (event: TextEvent) => void
  onKeyDown?: (event: KeyboardEvent) => void
}

const DEFAULT_PROPS: ControlledInputProps<InputProps> = {
  value: '',
  autocomplete: 'off', // autocomplete should be 'off' for proper operation
  autocorrect: 'off', // ibid
  spellcheck: 'false'
}

interface ControlledInputState extends HoistedControlledInputProps {
  attrs: Partial<
    Rest<ControlledInputProps<InputProps>, HoistedControlledInputProps>
  >
  state: ControlledInputFsmState
  value?: string
  icon?: HTMLElement
  input?: HTMLElement
}

function mapStateToProps ({
  attrs,
  value
}: ControlledInputState): Rest<InputProps, InputHandlerProps> {
  return { ...attrs, value }
}

const keyDown = createActionFactory('KEY_DOWN')
const SPECIAL_KEY_ACTIONS = createActionFactories({
  Escape: 'ESCAPE_KEY',
  Enter: 'ENTER_KEY'
})

const mapDispatchToProps: (
  dispatch: (event: any) => void
) => InputHandlerProps = createActionDispatchers({
  inputRef: 'INPUT_REF',
  clearIconRef: 'CLEAR_ICON_REF',
  onBlur: 'BLUR', // https://github.com/infernojs/inferno/issues/1361
  onClickClear: 'CLEAR',
  onInput: 'INPUT',
  onKeyDown (event: KeyboardEvent) {
    const { key } = event
    if (key === 'Escape') event.stopImmediatePropagation()
    const action = SPECIAL_KEY_ACTIONS[event.key] || keyDown
    return action(event)
  }
})

export function controlledInput<P extends InputProps> (
  Input: SFC<P>
): ComponentConstructor<ControlledInputProps<P>> {
  const ControlledInput = componentFromEvents<ControlledInputProps<P>, P>(
    Input,
    // () => tap(log('controlled-input:event:')),
    redux(
      reducer,
      applyHandlerOnEvent(
        isDirtyAndChangeTriggerEventOrControlledInputBlur,
        'onChange',
        ({ value, input }) => [value, input]
      ),
      callHandlerOnEvent(isControlledInputBlur, 'onBlur'),
      callHandlerOnEvent(['KEY_DOWN', 'ESCAPE_KEY', 'ENTER_KEY'], 'onKeyDown'),
      tapOnEvent(
        ['ESCAPE_KEY', 'CLEAR'],
        compose.into(0)(focus, pluck('1', 'input'))
      ),
      tapOnEvent(
        ({ props }, { type }) => props.autoFocus && type === 'INPUT_REF',
        focus
      ),
      callHandlerOnEvent('INPUT_REF', 'innerRef'),
      debounceInputWhenDebounce
    ),
    // () => tap(log('controlled-input:state:')),
    connect<ControlledInputState, InputProps>(
      mapStateToProps,
      mapDispatchToProps
    ),
    () => distinctUntilChanged(shallowEqual)
    // () => tap(log('controlled-input:view-props:'))
  )
  ;(ControlledInput as any).defaultProps = DEFAULT_PROPS as ControlledInputProps<
    P
  >

  return ControlledInput
}

const CHANGE_TRIGGER_EVENTS = ['DEBOUNCE', 'CLEAR', 'ESCAPE_KEY', 'ENTER_KEY']

function isDirtyAndChangeTriggerEventOrControlledInputBlur (
  state: ControlledInputState,
  event: StandardAction<FocusEvent>
): boolean {
  return (
    state.attrs.value !== state.value &&
    (CHANGE_TRIGGER_EVENTS.indexOf(event.type) >= 0 ||
      isControlledInputBlur(state, event))
  )
}

function isControlledInputBlur (
  { input, icon }: ControlledInputState,
  { type, payload: { relatedTarget } }: StandardAction<FocusEvent>
): boolean {
  return type === 'BLUR' && relatedTarget !== input && relatedTarget !== icon
}
