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
  ComponentClass,
  SFC,
  connect,
  redux
} from 'component-from-events'
import { createActionDispatchers } from 'basic-fsa-factories'

export {
  ComponentClass,
  SFC
}

export interface CopyButtonProps {
  value?: string
  timeout?: number
  icons?: {
    disabled: string
    enabled: string
  }
  [attr: string]: any
}

const DEFAULT_PROPS: Partial<CopyButtonProps> = {
  value: '',
  timeout: 500, // ms
  icons: {
    disabled: 'fa-check',
    enabled: 'fa-copy'
  }
}

interface CopyButtonState {
  props: CopyButtonProps
  state: 'disabled' | 'enabled'
}

function mapStateToProps ({ props, state }: CopyButtonState) {
  const disabled = state === 'disabled'
  const icon = props && props.icons && props.icons[state]
  return { ...props, disabled, icon }
}

export interface ButtonProps {
  icon?: string
  disabled?: boolean
  onClick: (event: MouseEvent) => void
  [prop: string]: any
}

export default function <P extends ButtonProps>(
  Button: SFC<P>
): ComponentClass<CopyButtonProps> {
  const CopyButton = componentFromEvents<CopyButtonProps,P>(
    Button,
    redux(reducer, ...effects),
    connect(mapStateToProps, createActionDispatchers({ onClick: 'CLICK' }))
  )

  CopyButton.defaultProps = DEFAULT_PROPS

  return CopyButton
}
