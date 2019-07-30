/**
 * Copyright 2019 ZenyWay S.A.S., Stephane M. Catala
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
import { createElement, Fragment } from 'create-element'
import { InfoModal } from '../info-modal'
import { RecordField } from '../record-field'
import { SerializedRecordField } from '../../serialized-record-field'
import createL10ns from 'basic-l10n'
const l10ns = createL10ns(require('./locales.json'))

export interface BulkEditAlertProps {
  locale: string
  comments: string
  keywords: string[]
  onChange: (value: string[] | string, target?: HTMLElement) => void
  onCloseInfo: (event?: MouseEvent) => void
  onDefaultActionButtonRef?: (element: HTMLElement) => void
  onSubmit?: (event?: MouseEvent) => void
}

export function BulkEditAlert ({
  locale,
  comments,
  keywords,
  onChange,
  onCloseInfo,
  onDefaultActionButtonRef,
  onSubmit
}: BulkEditAlertProps) {
  const t = l10ns[locale]
  return (
    <InfoModal
      locale={locale}
      expanded
      title={t('Add keywords and comments')}
      cancel={t('Cancel')}
      confirm={t('Import')}
      onCancel={onCloseInfo}
      onConfirm={onSubmit}
      onDefaultActionButtonRef={onDefaultActionButtonRef}
    >
      <small>
        <p>
          {t(
            'You may enter keywords and comments that will be added to all imported items'
          )}
          . {t('This is optional')}.
        </p>
        <p>
          {t('By default, the comments include the origin and date of import')}.{' '}
          {t('You may delete or extend this information')}.
        </p>
      </small>
      <SerializedRecordField
        type='csv'
        id='edit-import-keywords'
        className='mb-2'
        icon='tags'
        placeholder={t('Keywords')}
        value={keywords}
        data-id='keywords'
        onChange={onChange}
        locale={locale}
      />
      <RecordField
        type='textarea'
        id='edit-import-comments'
        className='mb-2'
        icon='sticky-note'
        placeholder={t('Comments')}
        value={comments}
        rows='3'
        data-id='comments'
        onChange={onChange}
        locale={locale}
      />
    </InfoModal>
  )
}
