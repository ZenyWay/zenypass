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
import { putRecord, deleteRecord, getRecord } from '../../../stubs/stubs_service'
import {
  requestCleartextOnToggleCleartextFromPublic,
  requestEditOnEditFromPublic,
  requestSaveOnSaveFromEdit,
  requestDeleteOnDeleteFromEdit,
  requestPasswordToLogin,
  requestSaveOnToggleFromEdit,
  requestToggleExpandFromEdit,
  requestToggleExpandFromPublic
} from './effects'
import componentFromEvents, { redux, connect, SFC, ComponentClass } from '../../component-from-events'
import { createActionDispatchers } from 'basic-fsa-factories'
import { tap } from 'rxjs/operators'

export interface ControlledRecordExpandedCardProps {
  [prop: string]: any
}

function mapStateToProps ({
  props,
  state,
  auth,
  error,
  password,
  cleartext,
  pendingToggle,
  record
}) {
  return {
    ...props,
    edit:
      state === 'edit' ||
      state === 'pending:save' ||
      state === 'pending:delete' ||
      state === 'loginModal:edit',
    disabled:
      state !== 'edit' &&
      state !== 'pending:save' &&
      state !== 'pending:delete',
    cleartext: cleartext,
    authenticate: auth === 'authenticating',
    pendingEdit: state === 'pending:edit',
    pendingPassword: state === 'pending:private',
    pendingTrash: state === 'pending:delete',
    pendingSave: state === 'pending:save',
    error,
    login: state === 'loginModal:public',
    pendingLogin: state === 'pending:login:public',
    pendingToggle,
    record: record
    ? { ...props.record, password, ...record }
    : { ...props.record, password }
  }
}

const mapDispatchToProps = createActionDispatchers({
  onSave: 'SAVE_REQUESTED',
  onDelete: 'DELETE_REQUESTED',
  onEdit: 'EDIT_REQUESTED',
  onToggleCleartext: 'TOGGLE_CLEARTEXT',
  onToggleRequest: 'TOGGLE_REQUESTED',
  onAuthenticationCancel: 'AUTHENTICATION_REJECTED',
  onAuthenticated: 'AUTHENTICATION_RESOLVED',
  onLoginExpand: 'LOGIN_REQUESTED',
  onCancel: 'CANCEL',
  onCancelEdit: 'CANCEL_EDIT',
  onCopyDone: 'COPY_DONE',
  onChange: ['CHANGE', (field, value) => ({ [field]: value })]
})

const services = { getRecord, putRecord, deleteRecord }

export default function<P>(
  RecordExpandedCard
): ComponentClass<ControlledRecordExpandedCardProps> {
  const ControlledRecordExpandedCard = componentFromEvents<ControlledRecordExpandedCardProps,P>(
    RecordExpandedCard,
    () => tap(console.log.bind(console,'controlled-record-expanded-card:event:')),
    redux(reducer,
      requestCleartextOnToggleCleartextFromPublic(services),
      requestEditOnEditFromPublic(services),
      requestSaveOnSaveFromEdit(services),
      requestSaveOnToggleFromEdit(services),
      requestDeleteOnDeleteFromEdit(services),
      requestPasswordToLogin(services),
      requestToggleExpandFromEdit,
      requestToggleExpandFromPublic),
    () => tap(console.log.bind(console,'controlled-record-expanded-card:state:')),
    connect(mapStateToProps, mapDispatchToProps),
    () => tap(console.log.bind(console,'controlled-record-expanded-card:view-props:'))
  )

  return ControlledRecordExpandedCard
}
