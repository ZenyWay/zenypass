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
import { ControlledAuthorizationCard, ControlledAuthenticationModal, AuthorizedAgentCard } from 'components'
import { Col, Container, Row } from 'reactstrap'
import { classes } from 'utils'

export interface AuthorizationPageProps {
  agents?: AuthorizedAgentInfo[]
  authenticate?: boolean
  error?: string
  className?: string
  onCancel?: (err?: any) => void
  onAuthenticated?: (sessionId: string) => void
  [prop: string]: any
}

export interface AuthorizedAgentInfo {
  agent: string
  date: Date
  key: string
}

export default function ({
    authenticate,
    error,
    agents = [],
    onAuthenticated,
    onCancel,
    className,
    ...attrs
}: AuthorizationPageProps) {
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
          <ControlledAuthorizationCard />
        </Colonne>
        { agents.map(({ agent, date, key }) => (
            <Colonne key={key}>
              <AuthorizedAgentCard agent={agent} date={date} />
            </Colonne>
          ))
        }
      </Row>
      <ControlledAuthenticationModal
        open={authenticate}
        onCancel={onCancel}
        onAuthenticated={onAuthenticated}
      />
    </Container>
  )
}

const Colonne = ({ children }) => (
  <Col xl='4' md='6' sm='12' className='text-center rounded'>
    {children}
  </Col>
)
