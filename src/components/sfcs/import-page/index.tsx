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
import { createElement, Fragment } from 'create-element'
import { ProgressBar } from 'bootstrap'
import { ImportSelector } from './import-selector'
import { BulkEditAlert, BulkEditAlertProps } from './bulk-edit-alert'
import { RecordSelector, RecordSelectorEntry } from './record-selector'
import { InfoModal } from '../info-modal'
import createL10ns from 'basic-l10n'
const l10ns = createL10ns(require('./locales.json'))

export interface ImportPageProps {
  locale: string
  alert?: Alert
  comments?: string
  configs?: string[]
  entries?: RecordSelectorEntry[]
  index?: number
  keywords?: string[]
  max?: number
  selected?: number
  onAddStorage?: (event?: MouseEvent) => void
  onChange?: (value: string[] | string, target?: HTMLElement) => void
  onClose?: (event?: MouseEvent) => void
  onCloseInfo?: (event?: MouseEvent) => void
  onDefaultActionButtonRef?: (element: HTMLElement) => void
  onDeselectAll?: (event?: MouseEvent) => void
  onSelectAll?: (event?: MouseEvent) => void
  onSelectFile?: (event?: Event) => void
  onSubmit?: (event?: MouseEvent) => void
  onToggleSelect?: (id?: string) => void
}

export type Alert = 'edit' | 'import' | 'offline' | 'pending' | 'storage'

export function ImportPage ({
  locale,
  alert,
  comments,
  configs = [],
  entries = [],
  index,
  keywords,
  max,
  selected,
  onAddStorage,
  onChange,
  onClose,
  onCloseInfo,
  onDefaultActionButtonRef,
  onDeselectAll,
  onSelectAll,
  onSelectFile,
  onSubmit,
  onToggleSelect
}: ImportPageProps) {
  const total = entries.length
  return (
    <Fragment>
      {!alert ? null : (
        <AlertModal
          alert={alert}
          comments={comments}
          index={index}
          keywords={keywords}
          locale={locale}
          max={max}
          total={total}
          onDefaultActionButtonRef={onDefaultActionButtonRef}
          onAddStorage={onAddStorage}
          onChange={onChange}
          onClose={onClose}
          onCloseInfo={onCloseInfo}
          onSubmit={onSubmit}
        />
      )}
      {!configs || !configs.length ? null : (
        <ImportSelector
          locale={locale}
          className='my-2'
          configs={configs}
          onClose={onClose}
          onSelect={onSelectFile}
        />
      )}
      {!entries || !total ? null : (
        <RecordSelector
          locale={locale}
          className='my-2'
          entries={entries}
          max={max}
          selected={selected}
          onAddStorage={onAddStorage}
          onClose={onClose}
          onDeselectAll={onDeselectAll}
          onSelectAll={onSelectAll}
          onSubmit={onSubmit}
          onToggleSelect={onToggleSelect}
        />
      )}
    </Fragment>
  )
}

interface AlertModalProps
  extends ImportingAlertProps,
    BulkEditAlertProps,
    OfflineAlertProps,
    PendingAlertProps,
    NoStorageAlertProps,
    InsufficientStorageAlertProps {
  alert: Alert
}

function AlertModal ({
  alert,
  comments,
  index,
  keywords,
  locale,
  max,
  total,
  onAddStorage,
  onChange,
  onClose,
  onCloseInfo,
  onDefaultActionButtonRef,
  onSubmit
}: AlertModalProps) {
  switch (alert) {
    case 'edit':
      return (
        <BulkEditAlert
          locale={locale}
          comments={comments}
          keywords={keywords}
          onChange={onChange}
          onCloseInfo={onCloseInfo}
          onDefaultActionButtonRef={onDefaultActionButtonRef}
          onSubmit={onSubmit}
        />
      )
    case 'import':
      return <ImportingAlert locale={locale} index={index} total={total} />
    case 'offline':
      return (
        <OfflineAlert
          locale={locale}
          onClose={onClose}
          onDefaultActionButtonRef={onDefaultActionButtonRef}
        />
      )
    case 'pending':
      return <PendingAlert locale={locale} />
    case 'storage':
      return max === 0 ? (
        <NoStorageAlert
          locale={locale}
          onClose={onClose}
          onAddStorage={onAddStorage}
          onDefaultActionButtonRef={onDefaultActionButtonRef}
        />
      ) : (
        <InsufficientStorageAlert
          locale={locale}
          max={max}
          total={total}
          onAddStorage={onAddStorage}
          onCloseInfo={onCloseInfo}
          onDefaultActionButtonRef={onDefaultActionButtonRef}
        />
      )
    default:
      return <InfoModal locale={locale} />
  }
}

interface PendingAlertProps {
  locale: string
}

function PendingAlert ({ locale }: PendingAlertProps) {
  const t = l10ns[locale]
  return (
    <InfoModal locale={locale} expanded title={t('Please wait')}>
      <p>{t('Checking the available storage space of your ZenyPass vault')}</p>
      <ProgressBar ratio={'100'} animated striped bg='info' />
    </InfoModal>
  )
}

interface ImportingAlertProps {
  locale: string
  index: number
  total: number
}

function ImportingAlert ({ locale, index, total }: ImportingAlertProps) {
  const t = l10ns[locale]
  const count = index + 1
  const ratio = (Math.ceil((4 * count) / total) * 25).toString() as
    | '25'
    | '50'
    | '75'
    | '100'
  return (
    <InfoModal locale={locale} expanded title={t('Please wait')}>
      <p>
        {t('Import in progress')}: {`${count}/${total}`}
      </p>
      <ProgressBar ratio={ratio} animated striped bg='info' />
    </InfoModal>
  )
}

interface OfflineAlertProps {
  locale: string
  onDefaultActionButtonRef?: (element: HTMLElement) => void
  onClose: (event?: MouseEvent) => void
}

function OfflineAlert ({
  locale,
  onClose,
  onDefaultActionButtonRef
}: OfflineAlertProps) {
  const t = l10ns[locale]
  return (
    <InfoModal
      locale={locale}
      expanded
      title={t('Connection error')}
      onCancel={onClose}
      onDefaultActionButtonRef={onDefaultActionButtonRef}
    >
      <p>
        {t('Disconnected from the ZenyPass server')}:<br />
        {t('please verify that your device is online and try again')}
      </p>
    </InfoModal>
  )
}

interface NoStorageAlertProps {
  locale: string
  onClose: (event?: MouseEvent) => void
  onAddStorage: (event?: MouseEvent) => void
  onDefaultActionButtonRef?: (element: HTMLElement) => void
}

function NoStorageAlert ({
  locale,
  onClose,
  onAddStorage,
  onDefaultActionButtonRef
}: NoStorageAlertProps) {
  const t = l10ns[locale]
  return (
    <InfoModal
      locale={locale}
      expanded
      title={t('Insufficient storage space')}
      confirm={t('Add storage')}
      cancel={t('Cancel')}
      onConfirm={onAddStorage}
      onCancel={onClose}
      onDefaultActionButtonRef={onDefaultActionButtonRef}
    >
      <p>
        {t('Your ZenyPass vault is full')}:<br />
        {t('Add storage space to your vault to import more items')}.
      </p>
    </InfoModal>
  )
}

interface InsufficientStorageAlertProps {
  locale: string
  max: number
  total: number
  onAddStorage: (event?: MouseEvent) => void
  onCloseInfo: (event?: MouseEvent) => void
  onDefaultActionButtonRef?: (element: HTMLElement) => void
}

function InsufficientStorageAlert ({
  locale,
  max,
  total,
  onAddStorage,
  onCloseInfo,
  onDefaultActionButtonRef
}: InsufficientStorageAlertProps) {
  const t = l10ns[locale]
  return (
    <InfoModal
      locale={locale}
      expanded
      title={t('Insufficient storage space')}
      confirm={t('Add storage')}
      cancel={t('Continue')}
      onConfirm={onAddStorage}
      onCancel={onCloseInfo}
      onDefaultActionButtonRef={onDefaultActionButtonRef}
    >
      <p>
        {t`At most ${max}`} {t('of the')} {t`${total} items`}{' '}
        {t('in this CSV file')} {t`${max} may be imported`}{' '}
        {t('into the available space of your ZenyPass vault')}.
      </p>
      <p>
        {t('You may chose to')}:
        <ul>
          <li>
            {t('continue and select at most')} {t`${max} items`}{' '}
            {t('that you wish to import')}
          </li>
          <li>{t('or add storage space to your vault to import more')}</li>
        </ul>
      </p>
    </InfoModal>
  )
}
