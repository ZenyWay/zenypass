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
/** @jsx createElement */
import { createElement } from 'create-element'
import { CardHeader } from 'reactstrap'
import createL10n from 'basic-l10n'
import { RecordField } from '..'

const debug = (process.env.NODE_ENV !== 'production') && require('debug')('zenypass:components:access-browser:')
const l10n = createL10n(require('./locales.json'), { debug, locale: 'fr' })

export interface Record {
  id: string
  name: string
  url: string
  username: string
  keywords: string[]
  comments: string
  login: boolean
  mail: string
}

export interface RecordExpandedCardProps {
  locale: string
  attrs: any
  edit?: boolean
  record: Record
  onChange: (field: Exclude<keyof Record, number>, value: string[] | string) => void
}

export default function ({
    locale,
    edit,
    record,
    onChange,
  ...attrs
}: Partial<RecordExpandedCardProps>) {

  l10n.locale = locale || l10n.locale

  return (
    <CardHeader className='border-0 bg-white'>
    { !edit ?
      record.url ?
        <a href={record.url} target='_blank'>
          <h4>{record.name ? record.name : 'Adresse Web'}</h4>
        </a>
        :
        <h4>{record.name ? record.name : 'Adresse Web'}</h4>
    : <RecordField
        placeholder= {record.name}
        size='lg'
        onChange={edit && onChange.bind(void 0, 'name')}
        type='mail' // type mail ? (erreur au niveau des icons)
        value={record.name}
     />
    }
  </CardHeader>
  )
}
