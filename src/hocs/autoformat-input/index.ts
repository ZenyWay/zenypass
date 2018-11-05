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
import { callChangeHandlerOnValidChange } from './effects'
import { Formatter } from './formatters'
import componentFromEvents, {
  ComponentClass,
  Rest,
  SFC,
  connect,
  redux
} from 'component-from-events'
import { createActionDispatchers } from 'basic-fsa-factories'
// import { tap } from 'rxjs/operators'
// const log = label => console.log.bind(console, label)

export type AutoformatInputProps<P extends ControlledInputProps> =
  AutoformatInputControllerProps & Rest<P,ControlledInputProps>

export interface AutoformatInputControllerProps {
  type?: string // TODO union type
  value?: string[] | string
  format?: Formatter<string>
  onChange?: (value: string[] | string) => void
}

export interface ControlledInputProps extends InputHandlerProps {
  type?: string // TODO union type
  value?: string
  error?: string
}

export interface InputHandlerProps {
  onChange?: (value: string) => void
}

const DEFAULT_PROPS: Partial<AutoformatInputProps<ControlledInputProps>> = {
  type: 'text',
  value: ''
}

interface AutoformatInputState {
  props: AutoformatInputProps<ControlledInputProps>
  value: string[] | string
  error?: string
}

function mapStateToProps (
  { props, value, error }: AutoformatInputState
): Rest<ControlledInputProps,InputHandlerProps> {
  const { type, format, onChange, ...attrs } = props
  const csv = type === 'csv'
  return {
    ...attrs,
    type: csv ? 'text' : type,
    value: csv && Array.isArray(value) ? value.join(' ') : value as string,
    error
  }
}

const mapDispatchToProps:
(dispatch: (event: any) => void) => InputHandlerProps =
createActionDispatchers({
  onChange: 'CHANGE'
})

export function autoformatInput <P extends ControlledInputProps> (
  ControlledInput: SFC<P>
): ComponentClass<AutoformatInputProps<P>> {
  const AutoformatInput =
  componentFromEvents<AutoformatInputProps<P>,P>(
    ControlledInput,
    // () => tap(log('autoformat:EVENT:')),
    redux(reducer, callChangeHandlerOnValidChange),
    // () => tap(log('autoformat:STATE:')),
    connect<AutoformatInputState,ControlledInputProps>(
      mapStateToProps,
      mapDispatchToProps
    )
    // let props through, even if same as previous:
    // might need to refresh content of ControlledInput,
    // e.g. if formatting resets value from changed to previous.
    // () => tap(log('autoformat:VIEW_PROPS:'))
  )

  AutoformatInput.defaultProps = DEFAULT_PROPS as Partial<AutoformatInputProps<P>>

  return AutoformatInput
}
