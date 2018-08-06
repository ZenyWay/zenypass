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
import { Card, CardHeader, Col, Row } from 'reactstrap'
import { Button } from './'
import ControlledAuthenticationModal from './controlled-authentication-modal'
import ControlledRecordModal from './controlled-record-modal'

export interface Record {
  id: string
  name: string
  url: string
  username: string
  keywords: string[]
  comments: string
  login: boolean
}

export interface RecordCollapsedCardProps {
  locale: string,
  attrs: any,
  record: Record,
  pending: boolean,
  onToggleExpand: () => void,
  onCopyDone: () => void,
  onEdit: () => void,
  onLogin: () => void
  onCancel: () => void
  onAuthenticationCancel: () => void
  onAuthenticated: (sessionID: string) => void
  authenticate: boolean,
  login: boolean
}

export default function ({
  authenticate,
  locale,
  login,
  onAuthenticated,
  onAuthenticationCancel,
  onCancel,
  onCopyDone,
  onToggleExpand,
  onLogin,
  onEdit,
  record,
  pending,
  ...attrs
}: Partial<RecordCollapsedCardProps>) {

  return (
    <Card className='mb-2'>
      <CardHeader className='border-0 bg-white'>
        {
          record.url ?
            <a href={record.url} target='_blank'><h4>{record.name}</h4></a>
          :
            <h4>{record.name}</h4>
        }
          <div>
            <div className='d-flex justify-content-left'>
              <span className='p-2'>
                <i className='fa fa-fw fa-user'></i>
              </span>
              {record.username}
            </div>
            <Row>
              <Col sm='8'className='d-flex justify-content-left'>
                <span className='p-2'><i className='fa fa-fw fa-lock'></i></span>
                <Button
                  color='light'
                  className='border-secondary'
                  icon={pending ? 'fa-spinner fa-spin' : 'fa-external-link fa-fw'}
                  onClick={onLogin}
                >
                </Button>
              </Col>
              <Col sm='4'>
                <Button
                  icon='fa-caret-down'
                  className='close'
                  onClick={onToggleExpand}
                >
                </Button>
              </Col>
            </Row>
          </div>
      </CardHeader>

      <ControlledAuthenticationModal
        open={authenticate}
        onCancel={onAuthenticationCancel}
        onAuthenticated={onAuthenticated}
      />
      <ControlledRecordModal
        open={login}
        onCancel={onCancel}
        onCopy={onCopyDone}
        record={record}
        {...attrs}
      />

    </Card>
  )
}
