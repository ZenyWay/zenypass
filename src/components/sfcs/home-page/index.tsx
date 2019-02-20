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
import { IconLabelInputGroup } from '../icon-label-input-group'
import { SerializedInput } from '../../serialized-input'
import { NavbarMenu, MenuSpecs, DropdownItemSpec } from '../../navbar-menu'
import {
  FilteredRecordCards,
  FilteredRecordCardsProps,
  FilteredRecordEntry,
  Record
} from '../filtered-record-cards'
import { InfoModal } from '../info-modal'
import { ProgressBar, InputGroup } from 'bootstrap'
import { classes } from 'utils'
import createL10ns from 'basic-l10n'
const l10ns = createL10ns(require('./locales.json'))

export { FilteredRecordEntry, Record, MenuSpecs, DropdownItemSpec }

const DEFAULT_DEBOUNCE = 300 // ms

export interface HomePageProps extends FilteredRecordCardsProps {
  locale: string
  menu: MenuSpecs
  records?: FilteredRecordEntry[]
  busy?: BusyState
  error?: string
  tokens?: string[]
  debounce?: string | number
  className?: string
  onSelectMenuItem?: (target: HTMLElement) => void
  onSearchFieldRef?: (ref: HTMLElement) => void
  onTokensChange?: (tokens: string[]) => void
  onCloseModal?: (event: MouseEvent) => void
  onModalToggled?: () => void
}

export enum BusyState {
  CreatingNewRecord = 'creating-new-record',
  LoadingRecords = 'loading-records'
}

export function HomePage ({
  locale,
  menu,
  records = [],
  busy,
  error,
  tokens,
  debounce = DEFAULT_DEBOUNCE,
  className,
  onSelectMenuItem,
  onSearchFieldRef,
  onTokensChange,
  onCloseModal,
  onModalToggled,
  ...attrs
}: HomePageProps & { [prop: string]: unknown }) {
  const t = l10ns[locale]
  return (
    <Fragment>
      <InfoModal
        locale={locale}
        title={t(busy ? 'Please wait' : 'Error')}
        expanded={!!error || !!busy}
        onCancel={!busy && onCloseModal}
        onOpened={onModalToggled}
        onClosed={onModalToggled}
      >
        {busy ? (
          <Fragment>
            <p>{t(busy)}</p>
            <ProgressBar ratio={'100'} animated striped bg='info' />
          </Fragment>
        ) : (
          <p>
            {t('Sorry, something went wrong')}
            <br />
            {error}
          </p>
        )}
      </InfoModal>
      <section>
        <header className='sticky-top'>
          <NavbarMenu
            menu={menu}
            onSelectItem={onSelectMenuItem}
            className='shadow'
          />
          <div className='container-fluid bg-light'>
            <div className='row justify-content-center'>
              <IconLabelInputGroup
                icon='search'
                className='col-12 col-sm-10 col-md-8 col-lg-6 col-xl-4 px-0 mt-1 shadow-sm'
              >
                <SerializedInput
                  innerRef={onSearchFieldRef}
                  type='csv'
                  className='form-control'
                  value={tokens}
                  debounce={debounce}
                  onChange={onTokensChange}
                />
              </IconLabelInputGroup>
            </div>
          </div>
        </header>
        <div className='container-fluid mt-1'>
          <div
            className={classes(
              'row align-items-start justify-content-center',
              className
            )}
          >
            <FilteredRecordCards locale={locale} records={records} {...attrs} />
          </div>
        </div>
      </section>
    </Fragment>
  )
}
