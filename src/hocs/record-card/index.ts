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
import reducer, { ConnectAutomataState, RecordAutomataState } from './reducer'
import {
  cleartextOnPendingCleartextOrConnect,
  editRecordOnPublicAndNoRecordName,
  updateRecordOnPendingUpdateRecord
} from './effects'
import componentFromEvents, {
  ComponentConstructor,
  Rest,
  SFC,
  connect,
  redux
} from 'component-from-events'
import { callHandlerOnEvent } from 'utils'
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

export interface RecordCardSFCProps extends RecordCardSFCHandlerProps {
  record: Partial<ZenypassRecord>
  disabled?: boolean
  connect?: boolean
  pending?: PendingState
  expanded?: boolean
  cleartext?: boolean
  error?: string
}

export type PendingState =
  | 'cleartext'
  | 'cancel'
  | 'edit'
  | 'save'
  | 'delete'
  | 'connect'

export interface RecordCardSFCHandlerProps {
  onToggleConnect?: (event: MouseEvent) => void
  onToggleCleartext?: (event: MouseEvent) => void
  onEditRecordRequest?: (event: MouseEvent) => void
  onChange?: (value: string[] | string, target: HTMLElement) => void
  onUpdateRecordRequest?: (event: MouseEvent) => void
  onDeleteRecordRequest?: (event: MouseEvent) => void
}

interface RecordCardState {
  props: RecordCardProps<RecordCardSFCProps>
  state: RecordAutomataState
  connect: ConnectAutomataState
  password?: string
  changes?: Partial<ZenypassRecord>
  expanded?: boolean
  cleartext?: boolean
  error?: string
}

function mapStateToProps({
  props,
  password,
  changes,
  state,
  connect,
  expanded,
  cleartext,
  error
}: RecordCardState): RecordCardSFCProps {
  const { record, session, onAuthenticationRequest, ...attrs } = props
  const pending = toPendingProp(connect) || toPendingProp(state)
  return {
    ...attrs,
    disabled: state !== 'edit',
    connect: connect === 'connect',
    pending,
    expanded,
    cleartext,
    error,
    record:
      !changes && !cleartext
        ? record
        : { ...record, password: cleartext && password, ...changes }
  }
}

const PENDING_REGEXP = /^pending:(\w+)$/i
function toPendingProp(state: RecordAutomataState | ConnectAutomataState) {
  const match = PENDING_REGEXP.exec(state)
  return match ? (match[1] as PendingState) : void 0
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
  onUpdateRecordRequest: 'UPDATE_RECORD_REQUESTED',
  onDeleteRecordRequest: 'DELETE_RECORD_REQUESTED'
})

export function recordCard<P extends RecordCardSFCProps>(
  RecordCardSFC: SFC<P>
): ComponentConstructor<RecordCardProps<P>> {
  return componentFromEvents<RecordCardProps<P>, P>(
    RecordCardSFC,
    () => tap(log('record-card:event:')),
    redux(
      reducer,
      callHandlerOnEvent('ERROR', ['props', 'onError']),
      cleartextOnPendingCleartextOrConnect,
      editRecordOnPublicAndNoRecordName,
      updateRecordOnPendingUpdateRecord
    ),
    () => tap(log('record-card:state:')),
    connect<RecordCardState, RecordCardSFCProps>(
      mapStateToProps,
      mapDispatchToProps
    ),
    () => tap(log('record-card:view-props:'))
  )
}
