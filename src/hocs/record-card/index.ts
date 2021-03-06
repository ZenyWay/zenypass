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
  openBookmarkAndCopyUsernameOnConnectRequestWhenBookmark,
  cleartextOnPendingCleartextOrConnect,
  timeoutCleartextOnReadonlyCleartext,
  saveRecordOnPendingSaveOrDeleteRecord
} from './effects'
import componentFromEvents from 'component-from-events'
import {
  ComponentConstructor,
  Rest,
  SFC,
  connect,
  logger,
  redux
} from 'component-from-events'
import {
  callHandlerOnEvent,
  isString,
  focus,
  preventDefault,
  stopPropagation,
  tapOnEvent
} from 'utils'
import {
  createActionDispatchers,
  createActionFactories,
  createActionFactory
} from 'basic-fsa-factories'
import { Observer } from 'rxjs'
const log = logger('record-card')

export type RecordCardProps<P extends RecordCardSFCProps> = RecordCardHocProps &
  Rest<P, RecordCardSFCProps>

export interface RecordCardHocProps {
  record: Partial<ZenypassRecord>
  pending?: boolean
  session?: string
  unrestricted?: boolean
  onAuthenticationRequest?: (res$: Observer<string>) => void
  onError?: (error: any) => void
}

export interface RecordCardSFCProps
  extends Partial<RecordCardSFCState>,
    Partial<RecordCardSFCHandlerProps> {
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
  | 'record'
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
  onError?: (error?: any) => void
  onToggleCleartext?: (event: MouseEvent) => void
  onEditRecordRequest?: (event: MouseEvent) => void
  onChange?: (value: string[] | string, target: HTMLElement) => void
  onToggleCheckbox?: (event?: Event) => void
  onSaveRecordRequest?: (event: MouseEvent) => void
  onDeleteRecordRequest?: (event: MouseEvent) => void
}

interface RecordCardState {
  props: Pick<
    RecordCardProps<RecordCardSFCProps>,
    Exclude<keyof RecordCardProps<RecordCardSFCProps>, 'pending'>
  >
  state: RecordFsmState
  connect: ConnectFsmState
  changes?: Partial<ZenypassRecord>
  csprp?: string // password from csprpg
  password?: string // original cleartext password from current record
  rev?: string
  error?: string
  errors?: Partial<RecordCardSFCErrors>
}

const RECORD_FSM_STATE_TO_RECORD_CARD_SFC_STATE: {
  [state in RecordFsmState]: Partial<RecordCardSFCState>
} = {
  [RecordFsmState.PendingRecord]: { pending: 'record' },
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
  props: { record, session, onAuthenticationRequest, ...attrs },
  changes = {},
  password,
  errors,
  state: recordFsmState,
  connect: connectFsmState
}: RecordCardState): RecordCardSFCProps {
  const sfcState = {
    ...RECORD_FSM_STATE_TO_RECORD_CARD_SFC_STATE[recordFsmState],
    ...CONNECT_FSM_STATE_TO_RECORD_CARD_SFC_STATE[connectFsmState]
  }
  const { cleartext, edit } = sfcState
  const connect = connectFsmState === ConnectFsmState.Connecting
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

const change = createActionFactory('CHANGE')
const csprpg = createActionFactory('CSPRPG')

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
  onError: 'ERROR',
  onToggleCleartext: 'TOGGLE_CLEARTEXT',
  onToggleExpanded: ['TOGGLE_EXPANDED', stopPropagation],
  onEditRecordRequest: 'EDIT_RECORD_REQUESTED',
  onChange: (value: string[] | string, { dataset: { id } }: HTMLElement) =>
    id === 'csprpg' ? csprpg(value) : change([id, value]),
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
  return componentFromEvents(
    RecordCardSFC,
    log('event'),
    redux(
      reducer,
      callHandlerOnEvent('ERROR', ['props', 'onError']),
      tapOnEvent('DEFAULT_ACTION_BUTTON_REF', focus),
      clearClipboardOnDirtyConnectCancelOrClearClipboard,
      openBookmarkAndCopyUsernameOnConnectRequestWhenBookmark,
      cleartextOnPendingCleartextOrConnect,
      timeoutCleartextOnReadonlyCleartext,
      saveRecordOnPendingSaveOrDeleteRecord
    ),
    log('state'),
    connect<RecordCardState, RecordCardSFCProps>(
      mapStateToProps,
      mapDispatchToProps
    ),
    log('view-props')
  )
}
