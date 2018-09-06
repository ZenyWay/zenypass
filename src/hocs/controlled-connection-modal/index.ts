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
import reducer from './reducer'
import {
  callOnCancelOnTransitionToClean,
  clearClipboardOnDecontaminating,
  openWindowOnCopiedWhenEnabled
} from './effects'
import componentFromEvents, { redux, connect, SFC, ComponentClass } from '../../component-from-events'
import { createActionDispatchers, createActionFactory, createActionFactories } from 'basic-fsa-factories'
import { tap } from 'rxjs/operators'
const log = (label: string) => console.log.bind(console, label)

export interface ControlledConnectionModalProps {
  name: string
  url: string
  username: string
  password: string
}

interface ControlledConnectionModalState {
  props: ControlledConnectionModalProps
  manual: boolean
  cleartext: boolean
  error: boolean
  state: 'clean' | 'danger' | 'contaminated'
  windowref: any
}

const WARNINGS = {
  dirty: 'password-first',
  contaminated: 'clipboard-contaminated'
}

function mapStateToProps ({
  props,
  manual,
  cleartext,
  error,
  state
}: Partial<ControlledConnectionModalState>) {
  const warning = WARNINGS[state]
  return { ...props, manual, cleartext, error, warning }
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
  onCopy (field: string, success: boolean) {
    return success
    ? (copied[field] || createActionFactory(`${field.toUpperCase()}_COPIED`))()
    : copyError(field)
  }
})

export interface ConnectionModalProps {
  name: string
  username: string
  password: string
  manual: boolean
  cleartext: boolean
  warning: boolean
  error: boolean
}

export default function <P extends ConnectionModalProps> (
  ConnectionModal: SFC<P>
): ComponentClass<ControlledConnectionModalProps> {
  const ControlledRecordModal = componentFromEvents<ControlledConnectionModalProps,P>(
    ConnectionModal,
    () => tap(log('controlled-connection-modal:event:')),
    redux(
      reducer,
      callOnCancelOnTransitionToClean,
      clearClipboardOnDecontaminating,
      openWindowOnCopiedWhenEnabled
    ),
    () => tap(log('controlled-connection-modal:state:')),
    connect(mapStateToProps, mapDispatchToProps),
    () => tap(log('controlled-connection-modal:view-props:'))
  )

  return ControlledRecordModal
}
