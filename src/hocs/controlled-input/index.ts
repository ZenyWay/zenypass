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
import reducer from './reducer'
import { callChangeHandlerOnBlurWhenIsChange } from './effects'
import componentFromEvents, {
  Children,
  Component,
  ComponentClass,
  ComponentFromStreamConstructor,
  SFC,
  connect,
  redux
} from 'component-from-events'
import { createActionDispatchers } from 'basic-fsa-factories'
import { /* distinctUntilChanged,*/ tap } from 'rxjs/operators'
// import { shallowEqual } from 'utils'

export {
  Children,
  Component,
  ComponentFromStreamConstructor
}

export interface ControlledInputProps {
  type?: string // TODO union type
  value?: string,
  autocorrect?: 'off' | 'on'
  autocomplete?: 'off' | 'on'
  onChange?: (value: string) => void
  [prop: string]: any
}

const DEFAULT_PROPS: Partial<ControlledInputProps> = {
  type: 'text',
  value: '',
  autocorrect: 'off',
  autocomplete: 'off'
}

export interface InputProps {
  type?: string // TODO union type
  value?: string
  autocorrect?: 'off' | 'on'
  autocomplete?: 'off' | 'on'
  onBlur?: (event: TextEvent) => void
  onInput?: (event: TextEvent) => void
}

interface ControlledInputState {
  props: Partial<ControlledInputProps>
  value: string
}

function mapStateToProps ({ props, value }: ControlledInputState) {
  const { onChange, ...attrs } = props
  return { ...attrs, value }
}

const mapDispatchToProps = createActionDispatchers({
  onBlur: 'BLUR', // https://github.com/infernojs/inferno/issues/1361
  onInput: 'INPUT'
})

export default function <P extends InputProps>(
  Input: SFC<P>
): ComponentClass<ControlledInputProps> {
  const ControlledInput = componentFromEvents<ControlledInputProps,P>(
    Input,
    // () => tap(console.log.bind(console, 'controlled-input:EVENT:')),
    redux(reducer, callChangeHandlerOnBlurWhenIsChange),
    // () => tap(console.log.bind(console, 'controlled-input:STATE:')),
    connect(mapStateToProps, mapDispatchToProps)
    // () => distinctUntilChanged(shallowEqual),
    // () => tap(console.log.bind(console, 'controlled-input:PROPS:'))
  )

  ControlledInput.defaultProps = DEFAULT_PROPS

  return ControlledInput
}
