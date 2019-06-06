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
import { createElement, Fragment } from 'create-element'
import { Observer } from 'component-from-props'
import { ProgressBar, Row } from 'bootstrap'
import { UnknownProps } from 'bootstrap/types'
import { AuthorizedAgentCard } from '../authorized-agent-card'
import { AgentAuthorizationCard } from '../../agent-authorization-card'
import { InfoModal } from '../info-modal'
import { NavbarMenu } from '../navbar-menu'
import { classes } from 'utils'
import createL10ns from 'basic-l10n'
const l10ns = createL10ns(require('./locales.json'))

export interface AgentAuthorizationsPageProps {
  locale: string
  agents?: IndexedAgentEntry[]
  init?: boolean
  session?: string
  className?: string
  onAuthenticationRequest?: (res$: Observer<string>) => void
  onClose?: (event?: MouseEvent) => void
  onError?: (error: any) => void
}

export interface IndexedAgentEntry {
  _id: string
  agent: AuthorizedAgentInfo
}

export interface AuthorizedAgentInfo {
  _id: string
  identifier?: string
  certified?: number
}

export function AgentAuthorizationsPage ({
  locale,
  agents = [],
  init,
  session,
  className,
  onAuthenticationRequest,
  onClose,
  onError,
  ...attrs
}: Partial<AgentAuthorizationsPageProps> & UnknownProps) {
  const t = l10ns[locale]
  const authId = agentId('_auth')
  return (
    <section>
      <header className='sticky-top'>
        <NavbarMenu onClickToggle={onClose} className='shadow' />
      </header>
      <InfoModal
        locale={locale}
        id='agent-authorizations-page-decryption-progress-modal'
        title={t('Please wait')}
        expanded={init}
      >
        <p>{t('Decrypting your authorizations')}</p>
        <ProgressBar ratio={'100'} animated striped bg='info' />
      </InfoModal>
      <main className='container-fluid'>
        <Row
          className={classes(
            'align-items-center justify-content-center',
            className
          )}
          mb='2'
          {...attrs}
        >
          <AgentAuthorizationCard
            key={authId}
            id={authId}
            locale={locale}
            session={session}
            onAuthenticationRequest={onAuthenticationRequest}
            onError={onError}
          />
          <AgentAuthorizations locale={locale} agents={agents} />
        </Row>
      </main>
    </section>
  )
}

interface AgentAuthorizationsProps {
  locale: string
  agents?: IndexedAgentEntry[]
}

function AgentAuthorizations ({ locale, agents }: AgentAuthorizationsProps) {
  let i = agents.length
  const cards = new Array(i)
  while (i--) {
    const {
      _id,
      agent: { identifier, certified }
    } = agents[i]
    const id = agentId(_id)
    cards[i] = (
      <AuthorizedAgentCard
        key={id}
        id={id}
        identifier={identifier}
        certified={certified}
        locale={locale}
      />
    )
  }
  return <Fragment>{cards}</Fragment>
}

function agentId (_id: string) {
  return `agent_${_id}`
}
