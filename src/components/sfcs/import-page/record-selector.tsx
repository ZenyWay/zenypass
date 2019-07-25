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
import { NavbarMenu } from '../navbar-menu'
import createL10ns from 'basic-l10n'
const l10ns = createL10ns(require('./locales.json'))

export interface RecordSelectorProps extends RecordsListProps {
  locale: string
  max?: number
  selected?: number
  className?: string
  onAddStorage?: (event?: MouseEvent) => void
  onClose?: (event?: MouseEvent) => void
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
  onAddStorage,
  onClose,
  onDeselectAll,
  onSelectAll,
  onSubmit,
  onToggleSelect,
  ...attrs
}: RecordSelectorProps) {
  const t = l10ns[locale]
  const isLimited = isFinite(max)
  const isAllSelected = selected === (isLimited ? max : entries.length)
  const isNoneSelected = !selected
  const footer = !isLimited ? null : (
    <Row>
      <div className='col-12'>
        <div className='clearfix d-sm-flex p-2'>
          <small className='align-self-center'>
            {t`At most ${max}`} {t('of the')} {t`${entries.length} items`}{' '}
            {t('in this CSV file')} {t`${max} may be imported`}{' '}
            {t('into the available space of your ZenyPass vault')}.
          </small>
          <Button
            color='info'
            outline
            className='float-right flex-shrink-0 ml-auto h-100 align-self-center'
            onClick={onAddStorage}
          >
            {t('Add storage')}
          </Button>
        </div>
      </div>
    </Row>
  )
  return (
    <section>
      <header className='sticky-top shadow-sm'>
        <NavbarMenu onClickToggle={onClose} />
        <div className='container bg-light text-center py-2'>
          <Row>
            <div className='col-12'>
              <h4 className='text-info'>
                <strong>{t('Select which items to import')}</strong>
              </h4>
              <div className='btn-toolbar justify-content-start'>
                <FAIconButton
                  icon='square'
                  regular
                  color={isNoneSelected ? 'secondary' : 'info'}
                  outline
                  disabled={isNoneSelected}
                  className='mr-2'
                  onClick={onDeselectAll}
                >
                  <small className='d-none d-sm-inline'>
                    {' '}
                    {t('Deselect all')}
                  </small>
                </FAIconButton>
                <FAIconButton
                  icon='check-square'
                  regular
                  color={isAllSelected ? 'secondary' : 'info'}
                  outline
                  disabled={isAllSelected}
                  className='mr-auto'
                  onClick={onSelectAll}
                >
                  <small className='d-none d-sm-inline'>
                    {' '}
                    {t('Select all')}
                  </small>
                </FAIconButton>
                <Button
                  color={isNoneSelected ? 'secondary' : 'info'}
                  disabled={isNoneSelected}
                  onClick={onSubmit}
                >
                  {' '}
                  {t('Import selection')}
                </Button>
              </div>
            </div>
          </Row>
        </div>
      </header>
      <main className='container'>
        <Row {...attrs}>
          <div className='col-12'>
            <RecordsList entries={entries} onToggleSelect={onToggleSelect} />
          </div>
        </Row>
      </main>
      {!isLimited ? null : (
        <Fragment>
          <footer className='container invisible'>
            {footer /* required as padding below fixed-bottom footer */}
          </footer>
          <footer className='container fixed-bottom bg-light border rounded shadow-sm'>
            {footer}
          </footer>
        </Fragment>
      )}
    </section>
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
      <li className='pb-2'>
        <CsvRecordItem
          id={id}
          record={record}
          selected={selected}
          onToggleSelect={onToggleSelect}
        />
      </li>
    )
  }
  return <ul className='list-unstyled text-left mb-0'>{items}</ul>
}
