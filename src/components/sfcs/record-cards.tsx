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
import { RecordCard } from '../record-card'
import { Record } from './record-card'
import { Observer } from 'rxjs'
import { classes } from 'utils'

export { Record }
export interface RecordCardsProps {
  locale: string
  session: string
  records: Record[]
  className?: string
  onAuthenticationRequest?: (res$: Observer<string>) => void
  [prop: string]: unknown
}

export function RecordCards ({
  locale,
  session,
  records,
  className,
  onAuthenticationRequest,
  ...attrs
}: RecordCardsProps) {
  let i = records.length
  const cards = new Array(i)
  const classNames = classes(
    'pl-0',
    className
  )
  while (i--) {
    const record = records[i]
    cards[i] = (
      <RecordCard
        key={record._id}
        locale={locale}
        session={session}
        record={records[i]}
        onAuthenticationRequest={onAuthenticationRequest}
      />
    )
  }
  return <ul {...attrs} className={classNames} >{cards}</ul>
}
