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
import { Form, Label, ModalBody, ModalFooter } from 'reactstrap'
import { Button } from '..'
import { ControlledInput } from 'components'
import Modal from '../modal'
import createL10n from 'basic-l10n'
const debug = (process.env.NODE_ENV !== 'production') && require('debug')('zenypass:components:access-authorization:')
const l10n = createL10n(require('./locales.json'), { debug, locale: 'fr' })

export interface AuthenticationModalProps {
  open: boolean,
  value: string,
  error: boolean,
  pending: boolean,
  onChange: (value: string) => void,
  onCancel: () => void,
  onSubmit: (event: Event) => void,
  [prop: string]: any
}

export default function ({
  value,
  pending,
  error,
  locale,
  onChange,
  onSubmit,
  onCancel,
  open
}: Partial<AuthenticationModalProps>) {

  l10n.locale = locale || l10n.locale

  return (
    <Modal isOpen={open} title={l10n('Authorization')} onCancel={onCancel} >
      <ModalBody>
        <Form id='PasswordModalForm' onSubmit={onSubmit}>
          <Label>{l10n('Please enter your ZenyPass password:')}</Label>
          <ControlledInput
            placeholder={l10n('ZenyPass password')}
            type='password'
            className={`border-${error ? 'danger' : 'info'} rounded form-control`}
            value={value}
            onChange={onChange}
            blurOnEnterKey
            autoFocus
          />
        </Form>
        {error ? <p className='text-danger'>{l10n('Invalid password')}</p> : null}
      </ModalBody>
      <ModalFooter className='bg-light'>
        <Button
          type='submit'
          form='PasswordModalForm'
          color='info'
          icon = {pending && 'fa-spinner fa-spin'}
          disabled={pending}
        >
          {l10n('Authorize')}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
