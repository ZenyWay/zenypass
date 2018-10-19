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
import { ZenypassRecord } from 'services'
import reducer, { RecordAutomataState } from './reducer'
// import {} from './effects'
import componentFromEvents, {
  ComponentClass,
  Rest,
  SFC,
  connect,
  redux
} from 'component-from-events'
import { createActionDispatchers } from 'basic-fsa-factories'
import { indexedPayload /*, preventDefault */ } from 'utils'
import { tap } from 'rxjs/operators'
const log = (label: string) => console.log.bind(console, label)

export type RecordsProps<P extends RecordsSFCProps> =
RecordsHocProps & Rest<P, RecordsSFCProps>

export interface RecordsHocProps {
  session: string
}

export interface RecordsSFCProps
extends RecordsSFCHandlerProps {
  records?: RecordSFCProps[]
}

export interface RecordSFCProps {
  record: ZenypassRecord
  disabled: boolean
  pending: 'cleartext' | 'edit' | 'save' | 'delete' | 'connect'
  cleartext?: boolean
  error?: string
}

export interface RecordsSFCHandlerProps {
  onConnectRequest?: (index: string | number, event: MouseEvent) => void
  onToggleCleartext?: (index: string | number, event: MouseEvent) => void
  onNewRecordRequest?: (event: MouseEvent) => void
  onEditRecordRequest?: (index: string | number, event: MouseEvent) => void
  onChange?: (
    index: string | number,
    field: keyof ZenypassRecord,
    value: string[] | string
  ) => void
  onCancelEditRecord?: (index: string | number, event: MouseEvent) => void
  onUpdateRecordRequest?: (index: string | number, event: MouseEvent) => void
  onDeleteRecordRequest?: (index: string | number, event: MouseEvent) => void
}

interface RecordsState {
  props: RecordsProps<RecordsSFCProps>
  records?: RecordState[] // public records (without password)
}

interface RecordState {
  record?: ZenypassRecord // original (read-only) record
  edits?: Partial<ZenypassRecord> // changes to cleartext record while in edit
  state: RecordAutomataState
  cleartext?: boolean
  error?: string
}

function mapStateToProps (
  { props, records }: RecordsState
): Rest<RecordsSFCProps,RecordsSFCHandlerProps> {
  const { session, ...attrs } = props
  return {
    ...attrs,
    records: records.map(mapRecordStateToProps)
  }
}

const PENDING_REGEXP = /^pending:(w)$/i
const EMPTY_LIST = []

function mapRecordStateToProps ({
  record,
  state,
  cleartext,
  edits,
  error
}: RecordState): RecordSFCProps {
  const pending = (PENDING_REGEXP.exec(state) || EMPTY_LIST)[1]
  const disabled = state !== 'edit'
  return {
    disabled,
    pending,
    cleartext,
    error,
    record:
      state !== 'public'
      ? (state === 'edit') && edits ? { ...record, ...edits } : record
      : void 0
  }
}

const mapDispatchToProps:
(dispatch: (event: any) => void) => RecordsSFCHandlerProps =
createActionDispatchers({
  onConnectRequest: ['CONNECT_REQUESTED', indexedPayload()],
  onToggleCleartext: ['TOGGLE_CLEARTEXT', indexedPayload()],
  onNewRecordRequest: 'NEW_RECORD_REQUESTED',
  onEditRecordRequest: ['EDIT_RECORD_REQUESTED', indexedPayload()],
  onChange: [
    'CHANGE',
    indexedPayload(
      function (
        field: keyof ZenypassRecord,
        value: string[] | string
      ): Partial<ZenypassRecord> {
        return { [field]: value }
      }
    )
  ],
  onCancelEditRecord: ['CANCEL_EDIT_RECORD', indexedPayload()],
  onUpdateRecordRequest: ['UPDATE_RECORD_REQUESTED', indexedPayload()],
  onDeleteRecordRequest: ['DELETE_RECORD_REQUESTED', indexedPayload()]
})

export function records <P extends RecordsSFCProps> (
  ZenypassRecordsSFC: SFC<P>
): ComponentClass<RecordsProps<P>> {
  return componentFromEvents<RecordsProps<P>,P>(
    ZenypassRecordsSFC,
    () => tap(log('controlled-connection-modal:event:')),
    redux(
      reducer
      // TODO: effects
    ),
    () => tap(log('controlled-connection-modal:state:')),
    connect<RecordsState,RecordsSFCProps>(
      mapStateToProps,
      mapDispatchToProps
    ),
    () => tap(log('controlled-connection-modal:view-props:'))
  )
}
