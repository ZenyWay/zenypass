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
const log = label => console.log.bind(console, label)

export type SignupProps<P extends SignupSFCProps> =
  Rest<P, SignupSFCProps>

export interface SignupHocProps {
  onAccountCreated?: () => void
}

export interface SignupSFCProps
extends SignupSFCHandlerProps {
  email?: string
  password?: string
  confirm?: string
  cleartext?: boolean
}

export interface SignupSFCHandlerProps {
  onChange?: (value: string, target: HTMLElement) => void
  onSubmit?: (event: Event) => void
  onToggleFocus?: (event: Event) => void
}

interface SignupState {
  props: SignupProps<SignupSFCProps>
}

function mapStateToProps (
  { props }: SignupState
): Rest<SignupSFCProps, SignupSFCHandlerProps> {
  return props
}

const mapDispatchToProps:
(dispatch: (event: any) => void) => SignupSFCHandlerProps =
createActionDispatchers({
  onChange: 'CHANGE',
  onSubmit: ['SUBMIT', preventDefault],
  onToggleFocus: 'TOGGLE_FOCUS'
})

export function signup <P extends SignupSFCProps> (
  SignupSFC: SFC<P>
): ComponentClass<SignupProps<P>> {
  return componentFromEvents<SignupProps<P>, P>(
    SignupSFC,
    () => tap(log('signup:event:')),
    redux(
      reducer
    ),
    () => tap(log('signup:state:')),
    connect<SignupState, SignupSFCProps>(
      mapStateToProps,
      mapDispatchToProps
    ),
    () => tap(log('signup:view-props:'))
  )
}
