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
import reducer from '../controlled-input/reducer'
import effects from './effects'
import componentFromEvents, {
  Children,
  Component,
  ComponentClass,
  ComponentFromStreamConstructor,
  SFC,
  connect,
  redux
} from '../../component-from-events'
import { createActionDispatchers } from 'basic-fsa-factories'

export {
  Children,
  Component,
  ComponentFromStreamConstructor
}

export interface ControlledModalProps {
  value?: string
  onSubmit?: (event: Event) => void
  [prop: string]: any
}

function mapStateToProps ({ props, value }) {
  return { ...props, value }
}

const mapDispatchToProps = createActionDispatchers({
  onInput: 'INPUT',
  onSubmit: ['SUBMIT', preventDefault]
})

function preventDefault (event: Event) {
  event.preventDefault()
  return event
}

export interface ModalProps {
  value?: string
  onInput?: (event: TextEvent) => void
  onSubmit?: (event: Event) => void
}

export default function <P extends ModalProps>(
  Modal: SFC<P>
): ComponentClass<
  ControlledModalProps & { [K in Exclude<keyof P, 'onInput'>]: P[K] }
> {
  const ControlledInput = componentFromEvents<
    ControlledModalProps & { [K in Exclude<keyof P, 'onInput'>]: P[K] },
    P
>(
    Modal,
    // () => tap(console.log.bind(console, 'controlled-modal:EVENT:')),
    redux(reducer, ...effects),
    // () => tap(console.log.bind(console, 'controlled-modal:STATE:')),
    connect(mapStateToProps, mapDispatchToProps)
    // () => tap(console.log.bind(console, 'controlled-modal:PROPS:'))
  )

  return ControlledInput
}
