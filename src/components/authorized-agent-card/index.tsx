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
import { Card, CardBody, CardFooter, CardHeader } from 'reactstrap'
import createL10n from 'basic-l10n'

const debug = (process.env.NODE_ENV !== 'production') && require('debug')('zenypass:components:access-browser:')
const l10n = createL10n(require('./locales.json'), { debug, locale: 'fr' })

export interface AuthorizedAgentProps {
  date: Date,
  agent: string,
  locale: string
}

export default function ({ agent, date, locale }: Partial<AuthorizedAgentProps>) {

  l10n.locale = locale || l10n.locale

  return (
    <Card className='mb-2'>
      <CardHeader className='border-0 bg-white'> <h5>{agent}</h5> </CardHeader>
      <CardBody>
        <p className='mb-2'>{l10n('Access authorized since:')}</p>
        <p>{date.toLocaleString()}</p>
      </CardBody>
      <CardFooter className='border-0 bg-white' />
    </Card>
  )
}
