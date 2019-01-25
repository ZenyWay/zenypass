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
  cleartextOnPendingCleartextOrConnect,
  validateRecordOnChangeOrThumbnail,
  saveRecordOnPendingSaveOrDeleteRecord
} from './effects'
import componentFromEvents, {
  ComponentConstructor,
  Rest,
  SFC,
  connect,
  redux
} from 'component-from-events'
import { callHandlerOnEvent, preventDefault } from 'utils'
import { createActionDispatchers } from 'basic-fsa-factories'
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
  error: boolean
}

export type PendingState =
  | 'cleartext'
  | 'edit'
  | 'cancel'
  | 'save'
  | 'delete'
  | 'connect'

export interface RecordCardSFCHandlerProps {
  onToggleConnect?: (event: MouseEvent) => void
  onToggleCleartext?: (event: MouseEvent) => void
  onEditRecordRequest?: (event: MouseEvent) => void
  onChange?: (value: string[] | string, target: HTMLElement) => void
  onSaveRecordRequest?: (event: MouseEvent) => void
  onDeleteRecordRequest?: (event: MouseEvent) => void
}

interface RecordCardState {
  props: RecordCardProps<RecordCardSFCProps>
  state: RecordFsmState
  connect: ConnectFsmState
  password?: string
  changes?: Partial<ZenypassRecord>
}

const RECORD_FSM_STATE_TO_RECORD_CARD_SFC_STATE: {
  [state in RecordFsmState]: Partial<RecordCardSFCState>
} = {
  [RecordFsmState.Thumbnail]: {},
  [RecordFsmState.ReadonlyConcealed]: { expanded: true },
  [RecordFsmState.ReadonlyCleartext]: { expanded: true, cleartext: true },
  [RecordFsmState.EditConcealed]: { expanded: true, edit: true },
  [RecordFsmState.EditConcealedError]: {
    expanded: true,
    edit: true,
    error: true
  },
  [RecordFsmState.EditCleartext]: {
    expanded: true,
    edit: true,
    cleartext: true
  },
  [RecordFsmState.EditCleartextError]: {
    expanded: true,
    edit: true,
    cleartext: true,
    error: true
  },
  [RecordFsmState.PendingCleartext]: { expanded: true, pending: 'cleartext' },
  [RecordFsmState.PendingEdit]: { expanded: true, pending: 'edit' },
  [RecordFsmState.PendingCancel]: {
    expanded: true,
    edit: true,
    pending: 'cancel'
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
  [ConnectFsmState.Locked]: {},
  [ConnectFsmState.Connect]: { connect: true },
  [ConnectFsmState.Pending]: { pending: 'connect' }
}

function mapStateToProps ({
  props,
  password,
  changes,
  state: recordFsm,
  connect: connectFsm
}: RecordCardState): RecordCardSFCProps {
  const { record, session, onAuthenticationRequest, ...attrs } = props
  const sfcState = {
    ...RECORD_FSM_STATE_TO_RECORD_CARD_SFC_STATE[recordFsm],
    ...CONNECT_FSM_STATE_TO_RECORD_CARD_SFC_STATE[connectFsm]
  }
  const { cleartext, edit } = sfcState
  return {
    ...attrs,
    ...sfcState,
    record: !edit && !cleartext ? record : { ...record, password, ...changes }
  }
}

const mapDispatchToProps: (
  dispatch: (event: any) => void
) => RecordCardSFCHandlerProps = createActionDispatchers({
  onToggleConnect: 'TOGGLE_CONNECT',
  onToggleCleartext: 'TOGGLE_CLEARTEXT',
  onToggleExpanded: 'TOGGLE_EXPANDED',
  onEditRecordRequest: 'EDIT_RECORD_REQUESTED',
  onChange: [
    'CHANGE',
    (value: string[] | string, input: HTMLElement) => ({
      [input.dataset.id]: value
    })
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
      cleartextOnPendingCleartextOrConnect,
      validateRecordOnChangeOrThumbnail,
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
