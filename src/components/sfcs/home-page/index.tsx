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
import { SearchField } from '../search-field'
import { NavbarMenu, MenuSpecs, DropdownItemSpec } from '../../navbar-menu'
import {
  FilteredRecordCards,
  FilteredRecordCardsProps,
  Record
} from '../filtered-record-cards'
import { InfoModal } from '../info-modal'
import { ProgressBar } from 'bootstrap'
import { classes } from 'utils'
import createL10ns from 'basic-l10n'
const l10ns = createL10ns(require('./locales.json'))

export { Record, MenuSpecs, DropdownItemSpec }

export interface HomePageProps extends FilteredRecordCardsProps {
  locale: string
  menu: MenuSpecs
  records?: Record[]
  busy?: boolean
  error?: string
  filter?: string[]
  tokens?: string[]
  debounce?: string | number
  className?: string
  onSelectMenuItem?: (target: HTMLElement) => void
  onSearchFieldRef?: (ref: HTMLElement) => void
  onTokensChange?: (tokens: string[]) => void
  onTokensClear?: (event: MouseEvent) => void
  onCloseModal?: (event: MouseEvent) => void
}

export function HomePage ({
  locale,
  menu,
  records = [],
  busy,
  error,
  filter,
  tokens,
  debounce,
  className,
  onSelectMenuItem,
  onSearchFieldRef,
  onTokensChange,
  onTokensClear,
  onCloseModal,
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
      >
        <p>
          {t(busy ? 'Creating new card' : 'Sorry, something went wrong')}...
          <br />
          {busy ? null : error}
        </p>
        <ProgressBar ratio={busy && '100'} animated striped bg='info' />
      </InfoModal>
      <header className='sticky-top'>
        <NavbarMenu menu={menu} onSelectItem={onSelectMenuItem} />
        <div className='container'>
          <div className='row justify-content-center'>
            <SearchField
              innerRef={onSearchFieldRef}
              className='col-12 col-xl-6 px-0 mt-1 bg-white'
              tokens={tokens}
              debounce={debounce}
              onChange={onTokensChange}
              onClear={onTokensClear}
            />
          </div>
        </div>
      </header>
      <section className='container'>
        <div className={classes('row align-items-start', className)}>
          <FilteredRecordCards
            locale={locale}
            records={records}
            filter={filter}
            {...attrs}
          />
        </div>
      </section>
    </Fragment>
  )
}
