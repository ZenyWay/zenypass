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
import { Button, FormGroup, Input, InputGroupAppend, Label } from 'bootstrap'
import { UnknownProps } from 'bootstrap/types'
import CopyButton from '../copy-button'
import IconLabelInputFormGroup from '../icon-label-form-group'
import RecordField from '../record-field'
import Modal from '../modal'
import { ModalBody, ModalFooter } from 'reactstrap'
import createL10n from 'basic-l10n'
const debug = (process.env.NODE_ENV !== 'production') && require('debug')('zenypass:components:access-authorization:')
const l10n = createL10n(require('./locales.json'), { debug, locale: 'fr' })

export interface ConnectionModalProps {
  display: boolean
  manual: boolean
  name: string
  username: string
  password: string
  copy: 'all' | 'username' | 'password' | '' | false
  error: boolean
  cleartext: boolean
  locale: string
  onCancel: () => void
  onToggleManual: (event: MouseEvent) => void
  onToggleCleartext: (event: MouseEvent) => void
  onCopy: (field: string, success: boolean) => void
}

const DEFAULT_COPY_BUTTON_ICONS = {
  disabled: 'fa-check',
  enabled: 'fa-external-link'
}

export default function ({
  display,
  manual,
  name,
  username,
  password,
  copy,
  error,
  cleartext,
  locale,
  onCancel,
  onToggleManual,
  onToggleCleartext,
  onCopy,
  ...attrs
}: Partial<ConnectionModalProps> & UnknownProps) {

  l10n.locale = locale || l10n.locale
  const icons = !manual ? DEFAULT_COPY_BUTTON_ICONS : void 0
  const copyButtonLabel = l10n('Copy')
  const copyUsername = copy === 'username'
  return (
    <Modal isOpen={display} title={l10n(`Login`)} onCancel={onCancel} {...attrs}>
      <ModalBody>
        <IconLabelInputFormGroup value={name} size='lg' plaintext />
        {!copy || (copy === 'password')
        ? (
          <IconLabelInputFormGroup value={username} icon='fa-user' plaintext />
        )
        : (
          <RecordField
            type='email'
            className='mb-2'
            icon='fa-user'
            value={username}
            disabled
          >
            <InputGroupAppend>
              <CopyButton
                icons={icons}
                value={username}
                color={copyUsername ? 'info' : 'secondary' }
                outline={!copyUsername}
                onCopy={onCopy.bind(void 0, 'username')}
              >
                {copyButtonLabel}
              </CopyButton>
            </InputGroupAppend>
          </RecordField>
        )}
        {!copy || (copy === 'username') ? null : (
          <RecordField
            type={cleartext ? 'text' : 'password'}
            className='mb-2'
            icon={cleartext ? 'fa-eye-slash' : 'fa-eye'}
            titleIcon={l10n('Show the password')}
            value={cleartext ? password : '*****'}
            onIconClick={onToggleCleartext}
            disabled
          >
            <InputGroupAppend>
              <CopyButton
                icons={icons}
                value={password}
                color='info'
                onCopy={onCopy.bind(void 0, 'password')}
              >
                {copyButtonLabel}
              </CopyButton>
            </InputGroupAppend>
          </RecordField>
        )}
        {!copy ? null : (
          <FormGroup check onInput={copy === 'all' ? onToggleManual : void 0}>
            <Label check>
              <Input
                type='checkbox'
                className='form-check-input'
                value='automatic'
                checked={!manual}
                disabled={copy !== 'all'}
              />
              {l10n('Open Website on Copy')}
            </Label>
          </FormGroup>
        )}
        {!error ? null : (
          <p class='bg-danger text-white text-center'>ERROR: {error} !</p>
        )}
      </ModalBody>
      {copy ? null : (
        <ModalFooter>
          <small class='text-center'>
            {l10n('Close this dialog box to flush your password from the clipboard')}
          </small>
          <Button color='info' onClick={onCancel}>{l10n('Close')}</Button>
        </ModalFooter>
      )}
    </Modal>
  )
}
