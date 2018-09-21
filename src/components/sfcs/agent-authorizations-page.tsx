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
import { Col, Container, Row } from 'reactstrap' // TODO replace
import { UnknownProps } from 'bootstrap/types'
import { AuthorizedAgentCard } from './authorized-agent-card'
import { AuthenticationModal } from '../authentication-modal'
import { AgentAuthorizationCard } from '../agent-authorization-card'
import { classes } from 'utils'

export interface AgentAuthorizationsPageProps {
  agents: AuthorizedAgentInfo[]
  authenticate: boolean
  error: string
  className: string
  locale: string
  onCancel: (err?: any) => void
  onAuthenticated: (sessionId: string) => void
}

export interface AuthorizedAgentInfo {
  agent: string
  date: Date
  key: string
}

export function AgentAuthorizationsPage ({
    authenticate,
    error,
    agents = [],
    onAuthenticated,
    onCancel,
    className,
    locale,
    ...attrs
}: Partial<AgentAuthorizationsPageProps> & UnknownProps) {
  return (
    <Container>
      { error &&
      <Row className='text-danger text-center border border-danger rounded my-3 py-2'>
        <Col sm='12'>
          {error}
        </Col>
      </Row> }
      <Row className={classes('align-items-center', className)} mb={2} {...attrs}>
        <Colonne>
          <AgentAuthorizationCard locale={locale} />
        </Colonne>
        { agents.map(({ agent, date, key }) => (
            <Colonne key={key}>
              <AuthorizedAgentCard agent={agent} date={date} locale={locale} />
            </Colonne>
          ))
        }
      </Row>
      <AuthenticationModal
        open={authenticate}
        locale={locale}
        onCancel={onCancel}
        onAuthenticated={onAuthenticated}
      />
    </Container>
  )
}

const Colonne = ({ children }) => (
  <Col xl='4' md='6' className='text-center rounded'>
    {children}
  </Col>
)
