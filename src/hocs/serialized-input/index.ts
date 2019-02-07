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
import { into } from 'basic-cursors'
import { csv } from './serializers'
import componentFromEvents, {
  ComponentConstructor,
  Rest,
  SFC,
  connect,
  redux
} from 'component-from-events'
import { createActionDispatchers } from 'basic-fsa-factories'
import { applyHandlerOnEvent, forType, mapPayload, shallowEqual } from 'utils'
import { distinctUntilChanged /*, tap */ } from 'rxjs/operators'
// const log = label => console.log.bind(console, label)

export type SerializedInputProps<
  P extends ControlledInputProps
> = SerializedInputHocProps & Rest<P, ControlledInputProps>

export interface SerializedInputHocProps {
  type?: string // TODO union type
  value?: string[] | string
  onChange?: (value: string[] | string, target?: HTMLElement) => void
}

export interface ControlledInputProps extends InputHandlerProps {
  type?: string // TODO union type
  value?: string
}

export interface InputHandlerProps {
  onChange?: (value: string[] | string, target: HTMLElement) => void
}

interface SerializedInputState {
  props: SerializedInputProps<ControlledInputProps>
}

function mapStateToProps ({
  props
}: SerializedInputState): Rest<ControlledInputProps, InputHandlerProps> {
  const { type, onChange, ...attrs } = props
  return {
    ...attrs,
    type: type === 'csv' ? 'text' : type,
    value:
      type === 'csv'
        ? csv.stringify(props.value as string[])
        : (props.value as string)
  }
}

const mapDispatchToProps: (
  dispatch: (event: any) => void
) => InputHandlerProps = createActionDispatchers({
  onChange: [
    'CHANGE',
    (value: string, target: HTMLElement) => ({ value, target })
  ]
})

export function serializedInput<P extends ControlledInputProps> (
  ControlledInput: SFC<P>
): ComponentConstructor<SerializedInputProps<P>> {
  return componentFromEvents<SerializedInputProps<P>, P>(
    ControlledInput,
    // () => tap(log('serialized-input:EVENT:')),
    redux(
      forType('PROPS')(into('props')(mapPayload())),
      applyHandlerOnEvent(
        'CHANGE',
        ['props', 'onChange'],
        ({ props: { type } }, { payload: { value, target } }) => [
          type === 'csv' ? csv.parse(value) : value,
          target
        ]
      )
    ),
    // () => tap(log('serialized-input:STATE:')),
    connect<SerializedInputState, ControlledInputProps>(
      mapStateToProps,
      mapDispatchToProps
    ),
    () => distinctUntilChanged(shallowEqual)
    // () => tap(log('serialized-input:VIEW_PROPS:'))
  )
}
