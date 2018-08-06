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
//
import { createElement } from 'create-element'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { RecordCard } from 'components'
import controlledRecordCard from '../src/hocs/controlled-record-card'
import Wrapper from './helpers/card-wrapper'

const ControlledRecordCard = controlledRecordCard(RecordCard)

const record = {
  id: '123456',
  mail: 'john.doe@example.com',
  name: 'Github',
  url: 'https://example.com',
  username: 'JohnDoe',
  keywords: ['comma', 'separated', 'values'],
  comments: '42 is *'
}

const attrs = {
  record,
  locale: 'fr',
  onChange: action('CHANGE')
}

storiesOf('ControlledRecordCard', module)
  .add('default', () => (
    <Wrapper>
      <ControlledRecordCard {...attrs} />
    </Wrapper>
  ))
