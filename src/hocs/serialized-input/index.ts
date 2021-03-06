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
import serializers from './serializers'
import componentFromEvents, {
  ComponentConstructor,
  Rest,
  SFC,
  connect,
  // logger,
  redux
} from 'component-from-events'
import { createActionDispatchers } from 'basic-fsa-factories'
import { applyHandlerOnEvent, forType, mapPayload } from 'utils'
// const log = logger('serialized-input')

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
  const serializer = serializers[type]
  return {
    ...attrs,
    type: serializer ? serializer.type : type,
    value: serializer
      ? serializer.stringify(props.value)
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
    // log('event'),
    redux(
      forType('PROPS')(into('props')(mapPayload())),
      applyHandlerOnEvent(
        'CHANGE',
        ['props', 'onChange'],
        ({ props: { type } }, { payload: { value, target } }) => [
          serializers[type] ? serializers[type].parse(value) : value,
          target
        ]
      )
    ),
    // log('state'),
    // () => tap(log('serialized-input:STATE:')),
    connect<SerializedInputState, ControlledInputProps>(
      mapStateToProps,
      mapDispatchToProps
    )
    // pass all updates, otherwise user input that yields an unchanged parsed value
    // hence an unchanged stringified output is not overwritten.
    // log('view-props')
  )
}
