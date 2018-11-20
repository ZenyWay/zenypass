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
import reducer, { AutomataState } from './reducer'
import {
  callChangeHandlerOnDebounceOrBlurWhenIsChange,
  debounceInputWhenDebounce
} from './effects'
import componentFromEvents, {
  ComponentClass,
  Rest,
  SFC,
  connect,
  redux
} from 'component-from-events'
import { createActionDispatchers } from 'basic-fsa-factories'
import { callHandlerOnEvent /*, shallowEqual */ } from 'utils'
// import { /* distinctUntilChanged,*/ tap } from 'rxjs/operators'
// const log = label => console.log.bind(console, label)

export type ControlledInputProps<P extends InputProps> =
ControlledInputControllerProps & Rest<P, InputProps>

export interface ControlledInputControllerProps {
  value?: string
  debounce?: string | number
  autocorrect?: 'off' | 'on' | '' | false
  autocomplete?: 'off' | 'on' | '' | false
  onChange?: (value: string, item?: HTMLElement) => void
}

export interface InputProps extends InputHandlerProps {
  value?: string
  autocorrect?: 'off' | 'on' | '' | false
  autocomplete?: 'off' | 'on' | '' | false
}

export interface InputHandlerProps {
  onBlur?: (event: TextEvent) => void
  onInput?: (event: TextEvent) => void
}

const DEFAULT_PROPS: ControlledInputProps<InputProps> = {
  value: '',
  autocomplete: 'off', // autocomplete should be 'off' for proper operation
  autocorrect: 'off' // ibid
}

interface ControlledInputState {
  props: Partial<ControlledInputProps<InputProps>>
  state: AutomataState
  value?: string
}

function mapStateToProps (
  {
    props,
    value
  }: ControlledInputState
): Rest<InputProps, InputHandlerProps> {
  const { debounce, onChange, ...attrs } = props
  return { ...attrs, value }
}

const mapDispatchToProps:
(dispatch: (event: any) => void) => InputHandlerProps =
createActionDispatchers({
  onBlur: 'BLUR', // https://github.com/infernojs/inferno/issues/1361
  onInput: 'INPUT'
})

export function controlledInput <P extends InputProps> (
  Input: SFC<P>
): ComponentClass<ControlledInputProps<P>> {
  const ControlledInput = componentFromEvents<ControlledInputProps<P>,P>(
    Input,
    // () => tap(log('controlled-input:EVENT:')),
    redux(
      reducer,
      callHandlerOnEvent('onBlur', 'BLUR'),
      debounceInputWhenDebounce,
      callChangeHandlerOnDebounceOrBlurWhenIsChange
    ),
    // () => tap(log('controlled-input:STATE:')),
    connect<ControlledInputState,InputProps>(
      mapStateToProps,
      mapDispatchToProps
    )
    // () => distinctUntilChanged(shallowEqual),
    // () => tap(log('controlled-input:PROPS:'))
  )

  ControlledInput.defaultProps = DEFAULT_PROPS as ControlledInputProps<P>

  return ControlledInput
}
