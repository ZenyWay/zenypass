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
import { RecordField } from '../record-field'
import createL10ns from 'basic-l10n'
const l10ns = createL10ns(require('./locales.json'))

export interface ConnectionModalProps {
  name: string
  url: string
  username: string
  password: string
  locale: string
  comments?: string
  open?: boolean
  manual?: boolean
  copy?: 'all' | 'username' | 'password' | '' | false
  error?: boolean
  cleartext?: boolean
  onCancel?: () => void
  onToggleManual?: (event: MouseEvent) => void
  onToggleCleartext?: (event: MouseEvent) => void
  onClickCopy?: (event: MouseEvent) => void
  onClickLink?: (event: MouseEvent) => void
  onUsernameCopied?: (success: boolean) => void
  onPasswordCopied?: (success: boolean) => void
  onDefaultActionButtonRef?: (element?: HTMLElement | null) => void
  [prop: string]: unknown
}

const DEFAULT_COPY_BUTTON_ICONS = {
  disabled: 'check',
  enabled: 'external-link-alt'
}

export function ConnectionModal ({
  open,
  manual: _manual,
  name,
  url,
  username,
  password,
  comments,
  copy,
  error,
  cleartext,
  locale,
  onCancel,
  onToggleManual,
  onToggleCleartext,
  onClickCopy,
  onClickLink,
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
    <Modal isOpen={open} toggle={onCancel} fade={false} {...attrs}>
      <ModalHeader toggle={onCancel} className='bg-info text-white'>
        {t('Login')}
      </ModalHeader>
      <ModalBody>
        <Button
          href={url}
          target='_blank'
          rel='noopener noreferer'
          size='lg'
          color='light'
          disabled={!url}
          className='text-truncate mw-100 mb-3'
          onClick={!manual && onClickLink}
        >
          {name}
        </Button>
        {!username ? null : (
          <RecordField
            id='connection-modal-username-field'
            locale={locale}
            type='email'
            className='mb-2'
            icon='user'
            value={username}
            disabled
          >
            {!copy || copy === 'password' ? null : (
              <InputGroupAppend>
                <CopyButton
                  href={href}
                  target='_blank'
                  rel='noopener noreferer'
                  icons={icons}
                  value={username}
                  color={copyUsername ? 'info' : 'secondary'}
                  fw
                  outline={!copyUsername}
                  onClick={onClickCopy}
                  onCopied={onUsernameCopied}
                  innerRef={copyUsername && onDefaultActionButtonRef}
                >
                  {copyButtonLabel}
                </CopyButton>
              </InputGroupAppend>
            )}
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
                rel='noopener noreferer'
                icons={icons}
                value={password}
                color='info'
                fw
                onClick={onClickCopy}
                onCopied={onPasswordCopied}
                innerRef={onDefaultActionButtonRef}
              >
                {copyButtonLabel}
              </CopyButton>
            </InputGroupAppend>
          </RecordField>
        )}
        {!comments ? null : (
          <RecordField
            id='connection-modal-comments-field'
            locale={locale}
            type='textarea'
            className='mb-2'
            icon='sticky-note'
            value={comments}
            rows='3'
            disabled
          />
        )}
        {!url || !copy || (!!username && copy !== 'all') ? null : (
          <FormGroup check onChange={onToggleManual}>
            <Label check>
              <Input
                type='checkbox'
                className='form-check-input'
                value='automatic'
                defaultChecked={!manual}
              />
              {t('Open Website on Copy')}
            </Label>
          </FormGroup>
        )}
        {!error ? null : (
          <p class='bg-danger text-white text-center'>ERROR: {error} !</p>
        )}
      </ModalBody>
      {copy !== 'all' ? null : (
        <ModalFooter className='justify-content-start'>
          <small>
            {t('Tip')}:{' '}
            {t('If possible, copy your password before your username')}.
          </small>
        </ModalFooter>
      )}
    </Modal>
  )
}
