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
import { UnknownProps } from 'bootstrap/types'
import { IconButton } from '../icon'
import ControlledInput from '../controlled-input'
import Modal from '../modal'
import createL10ns from 'basic-l10n'
const debug = (process.env.NODE_ENV !== 'production') && require('debug')('zenypass:components:access-authorization:')
const l10ns = createL10ns(require('./locales.json'), { debug })

export interface AuthenticationModalProps {
  open: boolean
  value: string
  error: boolean
  pending: boolean
  locale: string
  onChange: (value: string) => void
  onCancel: () => void
  onSubmit: (event: Event) => void
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
}: Partial<AuthenticationModalProps> & UnknownProps) {

  const t = l10ns[locale]

  return (
    <Modal isOpen={open} title={t('Authorization')} onCancel={onCancel} >
      <ModalBody>
        <Form id='PasswordModalForm' onSubmit={onSubmit}>
          <Label>{t('Please enter your ZenyPass password')}</Label>
          <ControlledInput
            placeholder={t('ZenyPass password')}
            type='password'
            className={`border-${error ? 'danger' : 'info'} rounded form-control`}
            value={value}
            onChange={onChange}
            blurOnEnterKey
            autoFocus
          />
        </Form>
        {error ? <p className='text-danger'>{t('Invalid password')}</p> : null}
      </ModalBody>
      <ModalFooter className='bg-light'>
        <IconButton
          type='submit'
          icon={pending && 'fa-spinner fa-spin'}
          form='PasswordModalForm'
          color='info'
          disabled={pending}
        >
          {t('Authorize')}
        </IconButton>
      </ModalFooter>
    </Modal>
  )
}
