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
import { UnknownProps } from 'bootstrap/types'
import { tap } from 'rxjs/operators'

export {
  ComponentClass,
  SFC
}

export interface CopyButtonProps {
  value: string
  timeout: number
  icons: {
    disabled: string
    enabled: string
  }
  onClick: (event: MouseEvent) => void
  onCopied: (success: boolean) => void
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
  const { onCopied, onClick, ...attrs } = props
  return { ...attrs, disabled, icon }
}

const mapDispatchToProps = createActionDispatchers({
  onClick: 'CLICK'
})

export interface ButtonProps {
  icon?: string
  disabled?: boolean
  onClick: (event: MouseEvent) => void
}

export default function <P extends ButtonProps>(
  Button: SFC<P>
): ComponentClass<Partial<CopyButtonProps> & UnknownProps> {
  const CopyButton = componentFromEvents<Partial<CopyButtonProps> & UnknownProps,P>(
    Button,
    // () => tap(console.log.bind(console,'copy-button:event:')),
    redux(reducer, ...effects),
    // () => tap(console.log.bind(console,'copy-button:state:')),
    connect(mapStateToProps, mapDispatchToProps)
    // () => tap(console.log.bind(console,'copy-button:props:'))
  )

  CopyButton.defaultProps = DEFAULT_PROPS

  return CopyButton
}
