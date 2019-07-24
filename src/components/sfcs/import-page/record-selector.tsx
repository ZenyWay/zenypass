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
import { Button, Row } from 'bootstrap'
import { CsvRecordItem, CsvRecord } from '../../csv-record-item'
import { FAIconButton } from '../fa-icon'
import { classes } from 'utils'
import createL10ns from 'basic-l10n'
import { isNumber } from 'utils'
const l10ns = createL10ns(require('./locales.json'))

export interface RecordSelectorProps {
  locale: string
  entries: RecordSelectorEntry[]
  max?: number
  className?: string
  onAddStorage?: (event?: MouseEvent) => void
  onSubmit?: (event?: MouseEvent) => void
  onToggleSelect?: (id?: string) => void
}

export interface RecordSelectorEntry {
  id: string
  record: Partial<CsvRecord>
  selected?: boolean
}

export function RecordSelector ({
  locale,
  entries = [],
  max,
  className,
  onAddStorage,
  onSubmit,
  onToggleSelect
}: RecordSelectorProps) {
  const t = l10ns[locale]
  let i = entries.length
  if (!i) return null
  const items = new Array<JSX.Element>(i)
  while (i--) {
    const { id, record, selected } = entries[i]
    items[i] = (
      <li className='list-group-item'>
        <CsvRecordItem
          id={id}
          record={record}
          selected={selected}
          onToggleSelect={onToggleSelect}
        />
      </li>
    )
  }
  const importBtn = (
    <FAIconButton
      icon='download'
      color='info'
      disabled={max === 0}
      onClick={onSubmit}
    >
      &nbsp;{t('Import selection')}
    </FAIconButton>
  )
  return (
    <div className={classes('text-center', className)}>
      <h3 className='text-info'>
        <strong>{t('Select which items to import')}</strong>
      </h3>
      {!isNumber(max) ? (
        <div className='pb-2'>{importBtn}</div>
      ) : (
        <Fragment>
          <p>
            {t`At most ${max}`} {t('of the')} {t`${entries.length} items`}{' '}
            {t('in this CSV file')} {t`${max} may be imported`}{' '}
            {t('into the available space of your ZenyPass Vault')}.
          </p>
          <Row>
            <div className='col-12 col-sm-6 pb-2'>
              <Button color='info' outline onClick={onAddStorage}>
                {t('Add storage')}
              </Button>
            </div>
            <div className='col-12 col-sm-6 pb-2'>{importBtn}</div>
          </Row>
        </Fragment>
      )}
      <ul className='list-group text-left'>{items}</ul>
    </div>
  )
}
