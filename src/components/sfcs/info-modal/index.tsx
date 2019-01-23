/**
 * Copyright 2018 ZenyWay S.A.S., Stephane M. Catala
 * @author Stephane M. Catala
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
  ProgressBar,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader
} from 'bootstrap'
import createL10ns from 'basic-l10n'
const l10ns = createL10ns(require('./locales.json'))

export interface InfoModalProps {
  locale: string
  expanded?: boolean
  progress?: '25' | '50' | '75' | '100' | 'auto' | '' | false
  children?: any
  onCancel?: (event: MouseEvent) => void
  onConfirm?: (event: MouseEvent) => void
  [prop: string]: unknown
}

export function InfoModal ({
  locale,
  expanded,
  progress,
  children,
  onCancel,
  onConfirm,
  ...attrs
}: InfoModalProps) {
  const t = l10ns[locale]

  return (
    <Modal isOpen={expanded} toggle={onCancel}>
      <ModalHeader toggle={onCancel} className='bg-info text-white'>
        {t(onConfirm ? 'Please confirm' : progress ? 'Please wait' : 'Info')}...
      </ModalHeader>
      <ModalBody {...attrs}>
        {children}
        {!progress ? null : (
          <ProgressBar ratio={progress} animated striped bg='info' />
        )}
      </ModalBody>
      {!onConfirm && !onCancel ? null : (
        <ModalFooter className='bg-light'>
          {!onConfirm ? null : (
            <Button color='info' outline onClick={onConfirm}>
              {t('Yes')}
            </Button>
          )}
          <Button color='info' onClick={onCancel}>
            {t(!onConfirm ? 'Ok' : 'No')}
          </Button>
        </ModalFooter>
      )}
    </Modal>
  )
}
