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
/** @jsx createElement */
import { createElement } from 'create-element'
import { pure } from 'hocs'
import { Record, RecordCard } from './record-card'

export interface RecordCardsProps extends RecordCardHandlerProps {
  locale: string,
  records?: Rest<RecordCardProps, RecordCardHandlerProps>[]
  className?: string
  [prop: string]: unknown
}

export interface RecordCardProps extends RecordCardHandlerProps {
  record: Record
  expanded?: boolean
  disabled?: boolean,
  pending?: 'cleartext' | 'edit' | 'save' | 'delete'
  cleartext?: boolean
  error?: string
}

export interface RecordCardHandlerProps {
  onConnectRequest?: (event: MouseEvent) => void
  onToggleExpand?: (event: MouseEvent) => void
  onToggleCleartext?: (event: MouseEvent) => void
  onEditRecordRequest?: (event: MouseEvent) => void
  onChange?: (field: keyof Record, value: string[] | string) => void
  onCancelEditRecord?: (event: MouseEvent) => void
  onUpdateRecordRequest?: (event: MouseEvent) => void
  onDeleteRecordRequest?: (event: MouseEvent) => void
}

export type Rest<T extends U,U extends {} = {}> = Pick<T,Exclude<keyof T, keyof U>>

export function RecordCards ({
  locale,
  records,
  onConnectRequest,
  onToggleExpand,
  onToggleCleartext,
  onEditRecordRequest,
  onChange,
  onCancelEditRecord,
  onUpdateRecordRequest,
  ...attrs
}: RecordCardsProps) {
  const handlers = {
    onConnectRequest,
    onToggleExpand,
    onToggleCleartext,
    onEditRecordRequest,
    onChange,
    onCancelEditRecord,
    onUpdateRecordRequest
  }
  let i = records.length
  const cards = new Array(i)
  while (i--) {
    cards[i] = (
      <RecordCardItem
        index={i}
        locale={locale}
        record={records[i]}
        {...handlers}
      />
    )
  }
  return <ul {...attrs}>{cards}</ul>
}

interface RecordCardItemProps extends RecordCardProps {
  index: string | number,
  locale: string
}

const RecordCardItem = pure(function ({ // pure: only update when props change
  index,
  onConnectRequest,
  onToggleExpand,
  onToggleCleartext,
  onEditRecordRequest,
  onChange,
  onCancelEditRecord,
  onUpdateRecordRequest,
  onDeleteRecordRequest,
  ...attrs
}: RecordCardItemProps) {
  return (
    <li>
      <RecordCard
        key={attrs.record._id}
        {...attrs}
        onConnectRequest={onConnectRequest.bind(void 0, index)}
        onToggleExpand={onToggleExpand.bind(void 0, index)}
        onToggleCleartext={onToggleCleartext.bind(void 0, index)}
        onEditRecordRequest={onEditRecordRequest.bind(void 0, index)}
        onChange={onChange.bind(void 0, index)}
        onCancelEditRecord={onCancelEditRecord.bind(void 0, index)}
        onUpdateRecordRequest={onUpdateRecordRequest.bind(void 0, index)}
        onDeleteRecordRequest={onDeleteRecordRequest.bind(void 0, index)}
      />
    </li>
  )
})
