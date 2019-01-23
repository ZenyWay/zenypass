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
  timeoutAfterDisabled,
  copyToClipboardAndCallOnClickOnClick
} from './effects'
import componentFromEvents, {
  ComponentConstructor,
  Rest,
  SFC,
  connect,
  redux
} from 'component-from-events'
import { createActionDispatchers } from 'basic-fsa-factories'
// import { tap } from 'rxjs/operators'
// const log = label => console.log.bind(console, label)

export type CopyButtonProps<P extends ButtonProps> = CopyButtonControllerProps &
  Rest<P, ButtonProps>

export interface CopyButtonControllerProps {
  value?: string
  timeout?: number
  icons?: {
    disabled: string
    enabled: string
  }
  onClick?: (event: MouseEvent) => void
  onCopied?: (success: boolean) => void
}

export interface ButtonProps extends ButtonHandlerProps {
  icon?: string
  disabled?: boolean
}

export interface ButtonHandlerProps {
  onClick?: (event: MouseEvent) => void
}

const DEFAULT_PROPS: Partial<CopyButtonProps<ButtonProps>> = {
  value: '',
  timeout: 500, // ms
  icons: {
    disabled: 'check',
    enabled: 'copy'
  }
}

interface CopyButtonState {
  props: CopyButtonProps<ButtonProps>
  state: AutomataState
}

function mapStateToProps ({
  props,
  state
}: CopyButtonState): Rest<ButtonProps, ButtonHandlerProps> {
  const disabled = state === 'disabled'
  const icon = props && props.icons && props.icons[state]
  const { value, timeout, icons, onCopied, onClick, ...attrs } = props
  return { ...attrs, disabled, icon }
}

const mapDispatchToProps: (
  dispatch: (event: any) => void
) => ButtonHandlerProps = createActionDispatchers({
  onClick: 'CLICK'
})

export function copyButton<P extends ButtonProps> (
  Button: SFC<P>
): ComponentConstructor<CopyButtonProps<P>> {
  const CopyButton = componentFromEvents<CopyButtonProps<P>, P>(
    Button,
    // () => tap(log('copy-button:event:')),
    redux(reducer, timeoutAfterDisabled, copyToClipboardAndCallOnClickOnClick),
    // () => tap(log('copy-button:state:')),
    connect<CopyButtonState, ButtonProps>(
      mapStateToProps,
      mapDispatchToProps
    )
    // () => tap(log('copy-button:props:'))
  )
  ;(CopyButton as any).defaultProps = DEFAULT_PROPS as CopyButtonProps<P>

  return CopyButton
}
