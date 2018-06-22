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
import effects from './effects'
import componentFromEvents, {
  Children,
  Component,
  ComponentFromStreamConstructor,
  connect,
  redux
} from 'component-from-events'
import { createActionDispatchers } from 'basic-fsa-factories'

export {
  Children,
  Component,
  ComponentFromStreamConstructor
}

export interface ControlledInputProps {
  type: string // TODO union type
  value: string,
  autocorrect: 'off'|'on'
  autocomplete: 'off'|'on'
  [prop: string]: any
}

const DEFAULT_PROPS: Partial<ControlledInputProps> = {
  type: 'text',
  value: '',
  autocorrect: 'off',
  autocomplete: 'off'
}

interface ControlledInputState {
  props: Partial<ControlledInputProps>
  value: string
}

function mapStateToProps({ props, value }: ControlledInputState) {
  return { ...props, value }
}

const mapDispatchToProps = createActionDispatchers({
  onChange: 'CHANGE',
  onInput: 'INPUT'
})

export interface InputProps {
  type: string // TODO union type
  value: string
  autocorrect: 'off'|'on'
  autocomplete: 'off'|'on'
  onChange: (event: TextEvent) => void
  onInput: (event: TextEvent) => void
}

export default function (
  Input: (props: InputProps) => Children
): ComponentFromStreamConstructor<Component<Partial<ControlledInputProps>,{}>, Children> {
  const ControlledInput = componentFromEvents(
    Input,
    redux(reducer, ...effects),
    connect(mapStateToProps, mapDispatchToProps)
  )

  ;(ControlledInput as any).defaultProps = DEFAULT_PROPS

  return ControlledInput
}
