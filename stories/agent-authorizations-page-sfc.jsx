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
import {
  AgentAuthorizationsPageSFC as PrivilegedAgentAuthorizationsPage,
  withAuthenticationModal
} from 'components'
import { withAuthentication } from 'hocs'
import withL10n from 'zenyway-storybook-addon-l10n'
import { USERNAME } from '../stubs/zenypass-service'

const AgentAuthorizationsPage = withAuthentication(
  withAuthenticationModal(PrivilegedAgentAuthorizationsPage)
)

const DATE = '2018-07-27'
const AGENTS = [
  'Firefox',
  'Opera',
  'Chrome',
  'Chromium',
  'Safari',
  'Edge',
  'Explorer',
  'Opera Neon',
  'Opera Linux'
].map((agent, index) => ({ _id: `${index}`, agent, date: new Date(DATE) }))

const attrs = {
  session: USERNAME,
  agents: AGENTS,
  onClose: action('CLOSE')
}

storiesOf('AgentAuthorizationsPage (SFC)', module)
  .addDecorator(withL10n({ locales: ['fr', 'en'] }))
  .add('default', () => ({ locale }) => (
    <AgentAuthorizationsPage locale={locale} {...attrs} />
  ))
  .add('error', () => ({ locale }) => (
    <AgentAuthorizationsPage locale={locale} error='ERROR' {...attrs} />
  ))
  .add('authenticate', () => ({ locale }) => (
    <AgentAuthorizationsPage locale={locale} authenticate {...attrs} />
  ))
