/**
 * Copyright 2018 ZenyWay S.A.S., Stephane M. Catala
 * @author Stephane M. Catala
 * @license Apache Version 2.0
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

import { reducer } from './reducer'
import componentFromEvents, {
  ComponentClass,
  Rest,
  SFC,
  connect,
  redux
} from 'component-from-events'
import { createActionDispatchers } from 'basic-fsa-factories'
import { preventDefault } from 'utils'
import { tap } from 'rxjs/operators'
import createL10ns from 'basic-l10n'
const l10ns = createL10ns(require('./locales.json'))
const log = label => console.log.bind(console, label)

export type SigninProps<P extends SigninSFCProps> =
  Rest<P, SigninSFCProps>

export interface SigninHocProps {
  onAuthenticated?: (sessionId: string) => void
}

export interface SigninSFCProps
extends SigninSFCHandlerProps {
  emails?: DropdownItemSpec[]
  email?: string
  password?: string
  cleartext?: boolean
}

export interface DropdownItemSpec {
  label?: string
  icon?: string[] | string
  [key: string]: unknown
}

export interface SigninSFCHandlerProps {
  onChange?: (value: string, target: HTMLElement) => void
  onSelectEmail?: (item?: HTMLElement) => void
  onSubmit?: (event: Event) => void
  onToggleFocus?: (event: Event) => void
}

interface SigninState {
  props: SigninProps<SigninSFCProps>
}

function mapStateToProps (
  { props }: SigninState
): Rest<SigninSFCProps, SigninSFCHandlerProps> {
  return props
}

const mapDispatchToProps:
(dispatch: (event: any) => void) => SigninSFCHandlerProps =
createActionDispatchers({
  onChange: 'CHANGE',
  onSelectEmail: 'SELECT_EMAIL',
  onSubmit: ['SUBMIT', preventDefault],
  onToggleFocus: 'TOGGLE_FOCUS'
})

export function signin <P extends SigninSFCProps> (
  SigninSFC: SFC<P>
): ComponentClass<SigninProps<P>> {
  return componentFromEvents<SigninProps<P>, P>(
    SigninSFC,
    () => tap(log('signin:event:')),
    redux(
      reducer
    ),
    () => tap(log('signin:state:')),
    connect<SigninState, SigninSFCProps>(
      mapStateToProps,
      mapDispatchToProps
    ),
    () => tap(log('signin:view-props:'))
  )
}
