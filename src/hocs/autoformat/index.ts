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
import reducer from './reducer'
import effects from './effects'
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
import { tap } from 'rxjs/operators'
import { Either } from 'utils'

export {
  Children,
  Component,
  ComponentFromStreamConstructor
}

export interface AutoformatProps {
  type?: string // TODO union type
  value?: string[]|string
  format?: (value: string) => Either<string>
  onChange: (value: string) => void
  [attr: string]: any
}

const DEFAULT_PROPS: Partial<ControlledInputProps> = {
  type: 'text',
  value: ''
}

interface AutoformatState {
  props: AutoformatProps
  state: 'invalid'|'valid'
  value: string[]|string
}

function mapStateToProps ({ props, state, value }: AutoformatState) {
  const { onChange, type, ...attrs } = props // drop onChange
  const csv = type === 'csv'
  const _value = csv && Array.isArray(value) ? value.join(',') : value
  const invalid = state === 'invalid'
  return { ...attrs, type: csv ? 'text' : type, invalid, value: _value }
}

const mapDispatchToProps = createActionDispatchers({
  onChange: 'CHANGE'
})

export interface ControlledInputProps {
  type?: string // TODO union type
  value?: string
  onChange: (value: string) => void
  [prop: string]: any
}

export default function <P extends ControlledInputProps>(
  Input: SFC<P>
): ComponentClass<AutoformatProps> {
  const AutoformatControlledInput = componentFromEvents<AutoformatProps,P>(
    Input,
    () => tap(console.log.bind(console, 'autoformat:EVENT:')),
    redux(reducer, ...effects),
    () => tap(console.log.bind(console, 'autoformat:STATE:')),
    connect(mapStateToProps, mapDispatchToProps),
    () => tap(console.log.bind(console, 'autoformat:PROPS:'))
  )

  AutoformatControlledInput.defaultProps = DEFAULT_PROPS

  return AutoformatControlledInput
}
