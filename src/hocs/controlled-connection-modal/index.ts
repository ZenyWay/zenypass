/**
 * Copyright 2018 ZenyWay S.A.S., Stephane M. Catala
 * @author Stephane M. Catala
 * @author Clement Bonet
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
//
import reducer, { AutomataState } from './reducer'
import {
  callOnCancelOnCancelling,
  clearClipboardOnClearingClipboard,
  openWindowOnClickCopy
} from './effects'
import componentFromEvents, { redux, connect, SFC, ComponentClass } from 'component-from-events'
import { createActionDispatchers, createActionFactory, createActionFactories } from 'basic-fsa-factories'
import { preventDefault, shallowEqual } from 'utils'
import { distinctUntilChanged, tap } from 'rxjs/operators'
const log = (label: string) => console.log.bind(console, label)

export interface ControlledConnectionModalProps {
  display: boolean
  name: string
  url: string
  username: string
  password: string
  onCancel: () => void
}

interface ControlledConnectionModalState {
  props: ControlledConnectionModalProps
  manual: boolean
  cleartext: boolean
  error: boolean
  state: AutomataState
  windowref: any
}

const STATE_TO_COPY_PROP = {
  'copy-any': 'all',
  'copying-any': 'all',
  'copy-password': 'password',
  'copying-password': 'password',
  'copy-username': 'username',
  'copying-username': 'username'
}

function mapStateToProps ({
  props,
  manual,
  cleartext,
  error,
  state
}: Partial<ControlledConnectionModalState>) {
  const copy = STATE_TO_COPY_PROP[state]
  return { ...props, manual, cleartext, error, copy }
}

const copied = createActionFactories({
  'username': 'USERNAME_COPIED',
  'password': 'PASSWORD_COPIED'
})

const copyError = createActionFactory('COPY_ERROR')

const mapDispatchToProps = createActionDispatchers({
  onCancel: 'CANCEL',
  onToggleManual: 'TOGGLE_MANUAL',
  onToggleCleartext: 'TOGGLE_CLEARTEXT',
  onClickCopy: ['CLICK_COPY', preventDefault],
  onUsernameCopied: onFieldCopied('username'),
  onPasswordCopied: onFieldCopied('password')
})

function onFieldCopied (field: 'username' | 'password') {
  return function (success: boolean) {
    return success ? copied[field]() : copyError(field)
  }
}

export interface ConnectionModalProps {
  name: string
  username: string
  password: string
  manual: boolean
  cleartext: boolean
  error: boolean
  copy: 'all' | 'password' | 'username' | '' | false
  onCancel: () => void
  onToggleManual: (event: MouseEvent) => void
  onToggleCleartext: (event: MouseEvent) => void
  onClickCopy: (event: MouseEvent) => void
  onUsernameCopied: (success: boolean) => void
  onPasswordCopied: (success: boolean) => void
}

export default function <P extends ConnectionModalProps> (
  ConnectionModal: SFC<P>
): ComponentClass<ControlledConnectionModalProps> {
  const ControlledRecordModal = componentFromEvents<ControlledConnectionModalProps,P>(
    ConnectionModal,
    () => tap(log('controlled-connection-modal:event:')),
    redux(
      reducer,
      callOnCancelOnCancelling,
      clearClipboardOnClearingClipboard,
      openWindowOnClickCopy
    ),
    () => tap(log('controlled-connection-modal:state:')),
    connect(mapStateToProps, mapDispatchToProps),
    () => distinctUntilChanged(shallowEqual),
    () => tap(log('controlled-connection-modal:view-props:'))
  )

  return ControlledRecordModal
}
