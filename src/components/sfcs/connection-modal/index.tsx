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
  Button,
  FormGroup,
  Input,
  InputGroupAppend,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader
} from 'bootstrap'
import { CopyButton } from '../../copy-button'
import { IconLabelInputFormGroup } from '../icon-label-form-group'
import { RecordField } from '../record-field'
import createL10ns from 'basic-l10n'
import { Fragment } from 'inferno'
const debug =
  process.env.NODE_ENV !== 'production' &&
  require('debug')('zenypass:components:access-authorization:')
const l10ns = createL10ns(require('./locales.json'), { debug })

export interface ConnectionModalProps {
  name: string
  url: string
  username: string
  password: string
  locale: string
  open?: boolean
  manual?: boolean
  copy?: 'all' | 'username' | 'password' | '' | false
  error?: boolean
  cleartext?: boolean
  onCancel?: () => void
  onToggleManual?: (event: MouseEvent) => void
  onToggleCleartext?: (event: MouseEvent) => void
  onClickCopy?: (event: MouseEvent) => void
  onUsernameCopied?: (success: boolean) => void
  onPasswordCopied?: (success: boolean) => void
  onDefaultActionButtonRef?: (element?: HTMLElement | null) => void
  [prop: string]: unknown
}

const DEFAULT_COPY_BUTTON_ICONS = {
  disabled: 'check',
  enabled: 'external-link'
}

export function ConnectionModal ({
  open,
  manual: _manual,
  name,
  url,
  username,
  password,
  copy,
  error,
  cleartext,
  locale,
  onCancel,
  onToggleManual,
  onToggleCleartext,
  onClickCopy,
  onUsernameCopied,
  onPasswordCopied,
  onDefaultActionButtonRef,
  ...attrs
}: ConnectionModalProps) {
  const t = l10ns[locale]
  const manual = !url || _manual
  const icons = !manual ? DEFAULT_COPY_BUTTON_ICONS : void 0
  const copyButtonLabel = t('Copy')
  const copyUsername = copy === 'username'
  const href = copy ? url : void 0

  return (
    <Modal isOpen={open} toggle={onCancel} {...attrs}>
      <ModalHeader toggle={onCancel} className='bg-info text-white'>
        {t('Login')}
      </ModalHeader>
      <ModalBody>
        <IconLabelInputFormGroup value={name} size='lg' plaintext />
        {!username ? null : !copy || copy === 'password' ? (
          <IconLabelInputFormGroup value={username} icon='user' plaintext />
        ) : (
          <RecordField
            id='connection-modal-username-field'
            locale={locale}
            type='email'
            className='mb-2'
            icon='user'
            value={username}
            disabled
          >
            <InputGroupAppend>
              <CopyButton
                href={href}
                target='_blank'
                rel='noopener'
                icons={icons}
                value={username}
                color={copyUsername ? 'info' : 'secondary'}
                outline={!copyUsername}
                onClick={onClickCopy}
                onCopied={onUsernameCopied}
                innerRef={copyUsername && onDefaultActionButtonRef}
              >
                {copyButtonLabel}
              </CopyButton>
            </InputGroupAppend>
          </RecordField>
        )}
        {!copy || copy === 'username' ? null : (
          <RecordField
            id='connection-modal-password-field'
            locale={locale}
            type={cleartext ? 'text' : 'password'}
            className='mb-2'
            icon={cleartext ? 'eye-slash' : 'eye'}
            buttonTitle={t('Show the password')}
            value={cleartext ? password : '*****'}
            onIconClick={onToggleCleartext}
            disabled
          >
            <InputGroupAppend>
              <CopyButton
                href={href}
                target='_blank'
                rel='noopener'
                icons={icons}
                value={password}
                color='info'
                onClick={onClickCopy}
                onCopied={onPasswordCopied}
                innerRef={onDefaultActionButtonRef}
              >
                {copyButtonLabel}
              </CopyButton>
            </InputGroupAppend>
          </RecordField>
        )}
        {!url || !copy || (!!username && copy !== 'all') ? null : (
          <FormGroup check onChange={onToggleManual}>
            <Label check>
              <Input
                type='checkbox'
                className='form-check-input'
                value='automatic'
                checked={!manual}
              />
              {t('Open Website on Copy')}
            </Label>
          </FormGroup>
        )}
        {!error ? null : (
          <p class='bg-danger text-white text-center'>ERROR: {error} !</p>
        )}
      </ModalBody>
    </Modal>
  )
}
