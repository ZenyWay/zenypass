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
import AuthorizationPage from '../src/components/authorization-page'

const agents = [{
  browser: 'Firefox',
  date: '2018-07-27',
  key: 0
},
{
  browser: 'Opera',
  date: '2018-07-27',
  key: 1
},
{
  browser: 'Chrome',
  date: '2018-07-27',
  key: 2
},
{
  browser: 'Chromium',
  date: '2018-07-27',
  key: 3
},
{
  browser: 'Safari',
  date: '2018-07-27',
  key: 4
},
{
  browser: 'Edge',
  date: '2018-07-27',
  key: 5
},
{
  browser: 'Explorer',
  date: '2018-07-27',
  key: 6
},
{
  browser: 'Opera Neon',
  date: '2018-07-27',
  key: 7
},
{
  browser: 'Opera Linux',
  date: '2018-07-27',
  key: 8
}
].map((agent) => (
  {...agent, date: new Date(agent.date)}
))

const attrs = {
  agents
}

storiesOf('AuthorizationPage', module)
  .add('default', () => (
    <AuthorizationPage {...attrs} />
  ))
  .add('error', () => (
    <AuthorizationPage {...attrs} error='ERROR' />
  ))
  .add('authenticate', () => (
    <AuthorizationPage {...attrs} authenticate />
  ))
