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
import {
  Form,
  InputGroup,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader
} from 'bootstrap'
import { FAIconButton } from '../fa-icon'
import { ControlledInput } from '../../controlled-input'
import createL10ns from 'basic-l10n'
const debug =
  process.env.NODE_ENV !== 'production' &&
  require('debug')('zenypass:components:access-authorization:')
const l10ns = createL10ns(require('./locales.json'), { debug })

export interface AuthenticationModalProps {
  open?: boolean
  value?: string
  error?: boolean
  pending?: boolean
  locale: string
  onChange?: (value: string) => void
  onCancel?: (event: Event) => void
  onPasswordInputRef?: (target: HTMLElement) => void
  onSubmit?: (event: Event) => void
}

export function AuthenticationModal ({
  open,
  value,
  pending,
  error,
  locale,
  onChange,
  onSubmit,
  onPasswordInputRef,
  onCancel
}: AuthenticationModalProps) {
  const t = l10ns[locale]

  return (
    <Modal isOpen={open} toggle={onCancel}>
      <ModalHeader toggle={onCancel} className='bg-info text-white'>
        {t('Authorization')}
      </ModalHeader>
      <ModalBody>
        <Form id='PasswordModalForm' onSubmit={onSubmit}>
          <Label>{t('Please enter your ZenyPass password')}</Label>
          <InputGroup>
            <ControlledInput
              placeholder={t('ZenyPass password')}
              type='password'
              className={`border-${
                error ? 'danger' : 'info'
              } rounded form-control`}
              value={value}
              onChange={onChange}
              innerRef={onPasswordInputRef}
              blurOnEnterKey
              autoFocus
            />
          </InputGroup>
        </Form>
        {error ? <p className='text-danger'>{t('Invalid password')}</p> : null}
      </ModalBody>
      <ModalFooter className='bg-light'>
        <FAIconButton
          type='submit'
          pending={pending}
          form='PasswordModalForm'
          color='info'
        >
          {t('Authorize')}
        </FAIconButton>
      </ModalFooter>
    </Modal>
  )
}
