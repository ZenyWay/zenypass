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
import withL10n from 'zenyway-storybook-addon-l10n'
import { AgentAuthorizationCardSFC as AgentAuthorizationCard } from 'components'

const TOKEN = 'JJJJ JJJJ JJJJ'
const attrs = {
  onClick: action('CLICK')
}

storiesOf('AgentAuthorizationCard (SFC)', module)
  .addDecorator(withL10n({ locales: ['fr', 'en'] }))
  .add('default', () => ({ locale }) => (
    <AgentAuthorizationCard locale={locale} {...attrs} />
  ))
  .add('pending', () => ({ locale }) => (
    <AgentAuthorizationCard locale={locale} pending {...attrs} />
  ))
  .add('authorizing', () => ({ locale }) => (
    <AgentAuthorizationCard locale={locale} pending token={TOKEN} {...attrs} />
  ))
  .add('error', () => ({ locale }) => (
    <AgentAuthorizationCard
      locale={locale}
      error='Something went wrong'
      {...attrs}
    />
  ))
