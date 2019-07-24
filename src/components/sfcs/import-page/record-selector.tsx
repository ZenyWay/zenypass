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
import { Button } from 'bootstrap'
import { CsvRecordItem, CsvRecord } from '../../csv-record-item'
import { FAIconButton } from '../fa-icon'
import { classes } from 'utils'
import createL10ns from 'basic-l10n'
const l10ns = createL10ns(require('./locales.json'))

export interface RecordSelectorProps extends RecordsListProps {
  locale: string
  max?: number
  selected?: number
  className?: string
  onAddStorage?: (event?: MouseEvent) => void
  onDeselectAll?: (event?: MouseEvent) => void
  onSelectAll?: (event?: MouseEvent) => void
  onSubmit?: (event?: MouseEvent) => void
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
  selected,
  className,
  onAddStorage,
  onDeselectAll,
  onSelectAll,
  onSubmit,
  onToggleSelect
}: RecordSelectorProps) {
  const t = l10ns[locale]
  const isLimited = isFinite(max)
  const isAllSelected = selected === (isLimited ? max : entries.length)
  const isNoneSelected = !selected
  return (
    <div className={classes('text-center', className)}>
      <h3 className='text-info'>
        <strong>{t('Select which items to import')}</strong>
      </h3>
      {!isLimited ? null : (
        <p>
          {t`At most ${max}`} {t('of the')} {t`${entries.length} items`}{' '}
          {t('in this CSV file')} {t`${max} may be imported`}{' '}
          {t('into the available space of your ZenyPass Vault')}.
        </p>
      )}
      <div className='btn-toolbar justify-content-around'>
        {!isLimited ? null : (
          <Button color='info' outline onClick={onAddStorage} className='mb-2'>
            {t('Add storage')}
          </Button>
        )}
        <FAIconButton
          icon='download'
          color={isNoneSelected ? 'secondary' : 'info'}
          disabled={isNoneSelected}
          className='mb-2'
          onClick={onSubmit}
        >
          &nbsp;{t('Import selection')}
        </FAIconButton>
      </div>
      <div className='btn-toolbar justify-content-around'>
        <FAIconButton
          icon='square'
          regular
          color={isNoneSelected ? 'secondary' : 'info'}
          outline
          disabled={isNoneSelected}
          className='mb-2'
          onClick={onDeselectAll}
        >
          &nbsp;{t('Deselect all')}
        </FAIconButton>
        <FAIconButton
          icon='check-square'
          regular
          color={isAllSelected ? 'secondary' : 'info'}
          outline
          disabled={isAllSelected}
          className='mb-2'
          onClick={onSelectAll}
        >
          &nbsp;{t('Select all')}
        </FAIconButton>
      </div>
      <RecordsList entries={entries} onToggleSelect={onToggleSelect} />
    </div>
  )
}

export interface RecordsListProps {
  entries: RecordSelectorEntry[]
  onToggleSelect?: (id?: string) => void
}

function RecordsList ({ entries, onToggleSelect }: RecordsListProps) {
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
  return <ul className='list-group text-left'>{items}</ul>
}
