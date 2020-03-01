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
  logger,
  redux
} from 'component-from-events'
import { createActionDispatchers } from 'basic-fsa-factories'
import { isString } from 'utils'
const log = logger('copy-button')

export type CopyButtonProps<P extends ButtonProps> = CopyButtonControllerProps &
  Rest<P, ButtonProps>

export interface CopyButtonControllerProps {
  value?: string
  timeout?: number
  icons?: {
    disabled: string | IconProps
    enabled: string | IconProps
  }
  onClick?: (event: MouseEvent) => void
  onCopied?: (success: boolean, target?: HTMLElement) => void
}

export interface ButtonProps extends ButtonHandlerProps, IconProps {
  disabled?: boolean
}

export interface IconProps {
  icon?: string
  regular?: boolean
}

export interface ButtonHandlerProps {
  onClick?: (event: MouseEvent) => void
}

const DEFAULT_PROPS: Partial<CopyButtonProps<ButtonProps>> = {
  value: '',
  timeout: 500, // ms
  icons: {
    disabled: 'check',
    enabled: { icon: 'copy', regular: true }
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
  const { value, timeout, icons, onCopied, onClick, ...attrs } = props
  const iconProps = toIconProps(icons && icons[state])
  return { ...attrs, disabled, ...iconProps }
}

function toIconProps (icon: string | IconProps): IconProps {
  return isString(icon) ? { icon } : icon
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
    log('event'),
    redux(reducer, timeoutAfterDisabled, copyToClipboardAndCallOnClickOnClick),
    log('state'),
    connect<CopyButtonState, ButtonProps>(mapStateToProps, mapDispatchToProps),
    log('view-props')
  )
  ;(CopyButton as any).defaultProps = DEFAULT_PROPS as CopyButtonProps<P>

  return CopyButton
}
