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
import { ModalBody, ModalFooter } from 'reactstrap'
import { Button, CopyButton } from '..'
import Modal from '../modal'
import createL10n from 'basic-l10n'
const debug = (process.env.NODE_ENV !== 'production') && require('debug')('zenypass:components:access-authorization:')
const l10n = createL10n(require('./locales.json'), { debug, locale: 'fr' })

export interface Record {
  id: string
  name: string
  url: string
  username: string
  password: string
  keywords: string[]
  comments: string
  login: boolean
}

export interface RecordModalProps {
  open: boolean,
  onCancel: () => void,
  [prop: string]: any,
  record: Record,
  onCopy: () => void
  onWebsite: () => void
  step: 1 | 2
}

export default function ({
  locale,
  onCancel,
  onCopy,
  open,
  onWebsite,
  password,
  record,
  step
}: Partial<RecordModalProps>) {

  l10n.locale = locale || l10n.locale

  return (
    <Modal isOpen={open} title={l10n(`Login: Step ${step}/2`)} onCancel={onCancel} >
      <ModalBody>
        <h5>{record.name ? record.name : l10n('Missing url!')}</h5>
        <div className='d-flex justify-content-left'>
          <span className='p-2'>
            <i className='fa fa-fw fa-user'></i>
          </span>
          {record.username ? record.username : l10n('Missing username!')}
        </div>
      </ModalBody>
      <ModalFooter className='bg-light'>
        { step === 1 ?
          <div className='d-flex justify-content-between'>
            <CopyButton
              color='info'
              icon = 'fa-copy fa-fw'
              value={password}
              onCopy={onCopy}
              className='mx-2'
            >
              {l10n('Copy password')}
            </CopyButton>
            { record.url &&
              <div>
                <span>{l10n('or')}</span>
                <CopyButton
                  color='info'
                  icon='fa-external-link fa-fw'
                  onCopy={onWebsite}
                  className='mx-2'
                  value={password}
                >
                  {l10n('Copy and Open website')}
                </CopyButton>
              </div>
            }
          </div>
        :
          <div>
          { record.username ?
            <CopyButton
              color='info'
              icon='fa-copy fa-fw'
              value={record.username}
              onCopy={onCopy}
            >
              {l10n('Copy username')}
            </CopyButton>
          :
            <Button
              color='info'
              icon='fa-times fa-fw'
              onClick={onCancel}
            >
              {l10n('Close')}
            </Button>
          }
          </div>
        }
      </ModalFooter>
    </Modal>
  )
}
