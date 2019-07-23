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
import { RecordSelector, RecordSelectorEntry } from './record-selector'
import { InfoModal } from '../info-modal'
import { NavbarMenu } from '../navbar-menu'
import createL10ns from 'basic-l10n'
const l10ns = createL10ns(require('./locales.json'))

export interface ImportPageProps {
  locale: string
  alert?: boolean
  configs?: string[]
  entries?: RecordSelectorEntry[]
  index?: number
  max?: number
  offline?: boolean
  pending?: boolean
  selected?: number
  onAddStorage?: (event?: MouseEvent) => void
  onClose: (event?: MouseEvent) => void
  onCloseInfo: (event?: MouseEvent) => void
  onSelectFile?: (event?: Event) => void
  onImport?: (event?: MouseEvent) => void
  onToggleSelect?: (id?: string) => void
}

export function ImportPage ({
  locale,
  alert,
  configs = [],
  entries = [],
  index,
  max,
  offline,
  pending,
  selected,
  onAddStorage,
  onClose,
  onCloseInfo,
  onSelectFile,
  onImport,
  onToggleSelect
}: ImportPageProps) {
  const t = l10ns[locale]
  const total = entries.length
  return (
    <Fragment>
      {alert ? (
        pending ? (
          <PendingAlert locale={locale} />
        ) : offline ? (
          <OfflineAlert locale={locale} onClose={onClose} />
        ) : selected ? (
          <ImportingAlert locale={locale} index={index} total={selected} />
        ) : max === 0 ? (
          <NoStorageAlert
            locale={locale}
            onClose={onClose}
            onAddStorage={onAddStorage}
          />
        ) : max < total ? (
          <InsufficientStorageAlert
            locale={locale}
            max={max}
            total={total}
            onCloseInfo={onCloseInfo}
            onAddStorage={onAddStorage}
          />
        ) : (
          <InfoModal locale={locale} />
        )
      ) : (
        <InfoModal locale={locale} />
      )}
      <section>
        <header className='sticky-top'>
          <NavbarMenu onClickToggle={onClose} className='shadow' />
        </header>
        <main className='container'>
          {!configs || !configs.length ? null : (
            <ImportSelector
              locale={locale}
              className='my-2'
              configs={configs}
              onSelect={onSelectFile}
            />
          )}
          {!entries || !total ? null : (
            <RecordSelector
              locale={locale}
              className='my-2'
              entries={entries}
              max={max}
              onAddStorage={onAddStorage}
              onImport={onImport}
              onToggleSelect={onToggleSelect}
            />
          )}
        </main>
      </section>
    </Fragment>
  )
}

interface PendingAlertProps {
  locale: string
}

function PendingAlert ({ locale }: PendingAlertProps) {
  const t = l10ns[locale]
  return (
    <InfoModal locale={locale} expanded title={t('Please wait')}>
      <p>{t('Checking the available storage space of your ZenyPass Vault')}</p>
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
  const ratio = (Math.ceil((4 * index) / total) * 25).toString() as
    | '25'
    | '50'
    | '75'
    | '100'
  return (
    <InfoModal locale={locale} expanded title={t('Please wait')}>
      <p>
        {t('Import in progress')}: {`${index}/${total}`}
      </p>
      <ProgressBar ratio={ratio} animated striped bg='info' />
    </InfoModal>
  )
}

interface OfflineAlertProps {
  locale: string
  onClose?: (event?: MouseEvent) => void
}

function OfflineAlert ({ locale, onClose }: OfflineAlertProps) {
  const t = l10ns[locale]
  return (
    <InfoModal
      locale={locale}
      expanded
      title={t('Connection error')}
      onCancel={onClose}
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
  onClose?: (event?: MouseEvent) => void
  onAddStorage?: (event?: MouseEvent) => void
}

function NoStorageAlert ({
  locale,
  onClose,
  onAddStorage
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
  max?: number
  total?: number
  onCloseInfo?: (event?: MouseEvent) => void
  onAddStorage?: (event?: MouseEvent) => void
}

function InsufficientStorageAlert ({
  locale,
  max,
  total,
  onCloseInfo,
  onAddStorage
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
    >
      <p>
        {t`At most ${max}`} {t('of the')} {t`${total} items`}{' '}
        {t('in this CSV file')} {t`${max} may be imported`}{' '}
        {t('into the available space of your ZenyPass Vault')}.
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
