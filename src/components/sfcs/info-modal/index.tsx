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
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'bootstrap'
import createL10ns from 'basic-l10n'
const l10ns = createL10ns(require('./locales.json'))

export interface InfoModalProps {
  locale: string
  expanded?: boolean
  title?: string
  cancel?: string
  confirm?: string
  pending?: boolean
  id?: string
  tag?: string
  children?: any
  onCancel?: (event: MouseEvent) => void
  onConfirm?: (event: MouseEvent) => void
  onOpened?: () => void
  onClosed?: () => void
  onDefaultActionButtonRef?: (element: HTMLElement) => void
  [prop: string]: unknown
}

export function InfoModal ({
  locale,
  expanded,
  title,
  cancel,
  confirm,
  pending,
  id,
  tag,
  onCancel,
  onConfirm,
  onOpened,
  onClosed,
  onDefaultActionButtonRef,
  ...attrs
}: InfoModalProps) {
  const t = l10ns[locale]
  const isForm = tag === 'form'
  const _id = id || (isForm ? `form_${title || confirm}` : void 0)
  const onClickConfirm = onConfirm || onCancel

  return (
    <Modal
      isOpen={expanded}
      toggle={onCancel}
      fade={false}
      onOpened={onOpened}
      onClosed={onClosed}
    >
      {!title ? null : (
        <ModalHeader tag='h5' toggle={onCancel} className='bg-info text-white'>
          {title}
        </ModalHeader>
      )}
      <ModalBody
        tag={tag}
        id={_id}
        onSubmit={isForm ? onClickConfirm : void 0}
        {...attrs}
      />
      {!onConfirm && !onCancel ? null : (
        <ModalFooter className='bg-light'>
          {!onConfirm ? null : (
            <Button color='info' outline disabled={pending} onClick={onCancel}>
              {cancel || t('No')}
            </Button>
          )}
          <Button
            type={isForm ? 'submit' : void 0}
            form={isForm ? _id : void 0}
            color='info'
            innerRef={onDefaultActionButtonRef}
            disabled={pending}
            onClick={!isForm ? onClickConfirm : void 0}
          >
            {!onConfirm ? cancel || t('Ok') : confirm || t('Yes')}
          </Button>
        </ModalFooter>
      )}
    </Modal>
  )
}
