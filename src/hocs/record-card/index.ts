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
//
import { ZenypassRecord } from 'zenypass-service'
import reducer, { ConnectFsmState, RecordFsmState } from './reducer'
import {
  clearClipboardOnDirtyConnectCancelOrClearClipboard,
  validateRecordOnThumbnail,
  validateChangeOnChange,
  cleartextOnPendingCleartextOrConnect,
  timeoutCleartextOnReadonlyCleartext,
  saveRecordOnPendingSaveOrDeleteRecord
} from './effects'
import componentFromEvents, {
  ComponentConstructor,
  Rest,
  SFC,
  connect,
  redux
} from 'component-from-events'
import { callHandlerOnEvent, preventDefault, tapOnEvent } from 'utils'
import {
  createActionDispatchers,
  createActionFactories
} from 'basic-fsa-factories'
import { Observer } from 'rxjs'
import { tap } from 'rxjs/operators'
const log = (label: string) => console.log.bind(console, label)

export type RecordCardProps<P extends RecordCardSFCProps> = RecordCardHocProps &
  Rest<P, RecordCardSFCProps>

export interface RecordCardHocProps {
  record: Partial<ZenypassRecord>
  session: string
  onAuthenticationRequest?: (res$: Observer<string>) => void
  onError?: (error: any) => void
}

export interface RecordCardSFCProps
  extends Partial<RecordCardSFCState>,
    RecordCardSFCHandlerProps {
  record: Partial<ZenypassRecord>
}

export interface RecordCardSFCState {
  edit: boolean
  connect: boolean
  pending: PendingState
  expanded: boolean
  cleartext: boolean
  errors: Partial<RecordCardSFCErrors>
}

export type RecordCardSFCErrors = {
  [key in Exclude<
    keyof ZenypassRecord,
    | '_id'
    | '_rev'
    | '_deleted'
    | 'unrestricted'
    | 'favicon'
    | 'login'
    | 'timestamp'
  >]: boolean
}

export type PendingState =
  | 'cleartext'
  | 'edit'
  | 'confirm-cancel'
  | 'confirm-delete'
  | 'save'
  | 'delete'
  | 'connect'
  | 'clear-clipboard'

export interface RecordCardSFCHandlerProps {
  onClearClipboard?: (event: MouseEvent) => void
  onConnectRequest?: (event: MouseEvent) => void
  onConnectClose?: (dirty: boolean) => void
  onCopied?: (success: boolean, target?: HTMLElement) => void
  onDefaultActionButtonRef?: (element: HTMLElement) => void
  onToggleCleartext?: (event: MouseEvent) => void
  onEditRecordRequest?: (event: MouseEvent) => void
  onChange?: (value: string[] | string, target: HTMLElement) => void
  onToggleCheckbox?: (event?: Event) => void
  onSaveRecordRequest?: (event: MouseEvent) => void
  onDeleteRecordRequest?: (event: MouseEvent) => void
}

interface RecordCardState {
  props: RecordCardProps<RecordCardSFCProps>
  state: RecordFsmState
  connect: ConnectFsmState
  password?: string
  changes?: Partial<ZenypassRecord>
  error?: string
  errors?: Partial<RecordCardSFCErrors>
}

const RECORD_FSM_STATE_TO_RECORD_CARD_SFC_STATE: {
  [state in RecordFsmState]: Partial<RecordCardSFCState>
} = {
  [RecordFsmState.Thumbnail]: {},
  [RecordFsmState.ReadonlyConcealed]: { expanded: true },
  [RecordFsmState.ReadonlyCleartext]: { expanded: true, cleartext: true },
  [RecordFsmState.EditConcealed]: { expanded: true, edit: true },
  [RecordFsmState.EditCleartext]: {
    expanded: true,
    edit: true,
    cleartext: true
  },
  [RecordFsmState.PendingCleartext]: { expanded: true, pending: 'cleartext' },
  [RecordFsmState.PendingEdit]: { expanded: true, pending: 'edit' },
  [RecordFsmState.PendingConfirmCancel]: {
    expanded: true,
    edit: true,
    pending: 'confirm-cancel'
  },
  [RecordFsmState.PendingConfirmDelete]: {
    expanded: true,
    edit: true,
    pending: 'confirm-delete'
  },
  [RecordFsmState.PendingSave]: { expanded: true, edit: true, pending: 'save' },
  [RecordFsmState.PendingDelete]: {
    expanded: true,
    edit: true,
    pending: 'delete'
  }
}

const CONNECT_FSM_STATE_TO_RECORD_CARD_SFC_STATE: {
  [state in ConnectFsmState]: Partial<RecordCardSFCState>
} = {
  [ConnectFsmState.Idle]: {},
  [ConnectFsmState.Connecting]: { pending: 'connect', connect: true },
  [ConnectFsmState.PendingConnect]: { pending: 'connect' },
  [ConnectFsmState.PendingClearClipboard]: { pending: 'clear-clipboard' }
}

function mapStateToProps ({
  props,
  password: _password,
  changes,
  errors,
  state: recordFsm,
  connect: connectFsm
}: RecordCardState): RecordCardSFCProps {
  const { record, session, onAuthenticationRequest, ...attrs } = props
  const sfcState = {
    ...RECORD_FSM_STATE_TO_RECORD_CARD_SFC_STATE[recordFsm],
    ...CONNECT_FSM_STATE_TO_RECORD_CARD_SFC_STATE[connectFsm]
  }
  const { cleartext, edit } = sfcState
  const connect = connectFsm === ConnectFsmState.Connecting
  const password = _password === void 0 ? record.password : _password
  return {
    ...attrs,
    ...sfcState,
    errors,
    record: !edit
      ? !connect && !cleartext
        ? record
        : { ...record, password }
      : { ...record, password, ...changes }
  }
}

const CONNECT_CLOSE_ACTIONS = {
  cancel: createActionFactories({
    pristine: 'CLEAN_CONNECT_CANCEL',
    dirty: 'DIRTY_CONNECT_CANCEL'
  }),
  close: createActionFactories({
    pristine: 'CLEAN_CONNECT_CLOSE',
    dirty: 'DIRTY_CONNECT_CLOSE'
  })
}
const COPIED_ACTIONS = {
  success: createActionFactories({
    username: 'USERNAME_COPIED',
    password: 'PASSWORD_COPIED'
  }),
  error: createActionFactories({
    username: 'USERNAME_COPY_ERROR',
    password: 'PASSWORD_COPY_ERROR'
  })
}

const mapDispatchToProps: (
  dispatch: (event: any) => void
) => RecordCardSFCHandlerProps = createActionDispatchers({
  onClearClipboard: 'CLEAR_CLIPBOARD',
  onConnectRequest: 'CONNECT_REQUEST',
  onConnectClose: (cancel, dirty) =>
    CONNECT_CLOSE_ACTIONS[cancel ? 'cancel' : 'close'][
      dirty ? 'dirty' : 'pristine'
    ](),
  onDefaultActionButtonRef: 'DEFAULT_ACTION_BUTTON_REF',
  onToggleCleartext: 'TOGGLE_CLEARTEXT',
  onToggleExpanded: 'TOGGLE_EXPANDED',
  onEditRecordRequest: 'EDIT_RECORD_REQUESTED',
  onChange: [
    'CHANGE',
    (value: string[] | string, input: HTMLElement) => [input.dataset.id, value]
  ],
  onCopied: (success: boolean, btn: HTMLElement) =>
    COPIED_ACTIONS[success ? 'success' : 'error'][btn.dataset.id](),
  onToggleCheckbox: [
    'TOGGLE_CHECKBOX',
    (event: Event) => (event.currentTarget as HTMLElement).dataset.id
  ],
  onSaveRecordRequest: ['UPDATE_RECORD_REQUESTED', preventDefault],
  onDeleteRecordRequest: 'DELETE_RECORD_REQUESTED'
})

export function recordCard<P extends RecordCardSFCProps> (
  RecordCardSFC: SFC<P>
): ComponentConstructor<RecordCardProps<P>> {
  return componentFromEvents<RecordCardProps<P>, P>(
    RecordCardSFC,
    () => tap(log('record-card:event:')),
    redux(
      reducer,
      callHandlerOnEvent('ERROR', ['props', 'onError']),
      tapOnEvent('DEFAULT_ACTION_BUTTON_REF', btn => btn && btn.focus()),
      clearClipboardOnDirtyConnectCancelOrClearClipboard,
      validateRecordOnThumbnail,
      validateChangeOnChange,
      cleartextOnPendingCleartextOrConnect,
      timeoutCleartextOnReadonlyCleartext,
      saveRecordOnPendingSaveOrDeleteRecord
    ),
    () => tap(log('record-card:state:')),
    connect<RecordCardState, RecordCardSFCProps>(
      mapStateToProps,
      mapDispatchToProps
    ),
    () => tap(log('record-card:view-props:'))
  )
}
