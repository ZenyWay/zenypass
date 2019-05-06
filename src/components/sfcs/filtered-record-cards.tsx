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
import { createElement, Fragment } from 'create-element'
import { RecordCard, Record, RecordCardProps } from '../record-card'
import { classes } from 'utils'

export { Record }

export interface FilteredRecordCardsProps
  extends Pick<RecordCardProps, Exclude<keyof RecordCardProps, 'record'>> {
  records?: FilteredRecordEntry[]
  className?: string
}

export interface FilteredRecordEntry {
  _id: string
  exclude?: boolean
  record?: Partial<Record>
}

export function FilteredRecordCards ({
  records = [],
  filter,
  className,
  ...attrs
}: FilteredRecordCardsProps & { [prop: string]: unknown }) {
  let i = records.length
  if (!i) return null
  const cards = new Array<JSX.Element>(i)
  while (i--) {
    const { _id, record, exclude } = records[i]
    const classNames = exclude ? classes('d-none', className) : className
    cards[i] = (
      <RecordCard
        key={_id}
        className={classNames}
        record={record || { _id }}
        pending={!record}
        {...attrs}
      />
    )
  }
  return <Fragment>{cards}</Fragment>
}
