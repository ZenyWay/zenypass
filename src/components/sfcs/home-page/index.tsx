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
import { FAIconButton } from '../fa-icon'
import {
  FilteredRecordCards,
  FilteredRecordCardsProps,
  FilteredRecordEntry,
  Record
} from '../filtered-record-cards'
import { Onboarding } from '../onboarding'
import { InfoModal } from '../info-modal'
import { ProgressBar, Row } from 'bootstrap'
import { style } from 'typestyle'
import { classes } from 'utils'
import createL10ns from 'basic-l10n'
const l10ns = createL10ns(require('./locales.json'))

export { FilteredRecordEntry, Record, MenuSpecs, DropdownItemSpec }

const DEFAULT_DEBOUNCE = 300 // ms

const ERRORS = {
  limit:
    "You have reached the website storage limit of your ZenyPass account: you can purchase additional storage from the 'storage' menu.",
  offline:
    'This device seems to be offline. The ZenyPass server cannot be reached. Please check your connection and try again.'
}

export interface HomePageProps
  extends Pick<
    FilteredRecordCardsProps,
    Exclude<keyof FilteredRecordCardsProps, 'unrestricted'>
  > {
  locale: string
  menu: MenuSpecs
  records?: FilteredRecordEntry[]
  unrestricted?: number
  busy?: BusyState
  error?: string
  tokens?: string[]
  onboarding?: boolean
  debounce?: string | number
  className?: string
  onCancelCountDown?: (event?: Event) => void
  onSelectMenuItem?: (target: HTMLElement) => void
  onSearchFieldRef?: (ref: HTMLElement) => void
  onTokensChange?: (tokens: string[]) => void
  onCloseOnboarding?: (event?: MouseEvent) => void
  onCloseModal?: (event: MouseEvent) => void
  onModalToggled?: () => void
}

export enum BusyState {
  CreatingNewRecord = 'creating-new-record',
  LoadingRecords = 'loading-records'
}

const countdownButtonStyle = classes(
  'p-1',
  style({ width: '2.5rem', lineHeight: '0.75rem' })
)

export function HomePage ({
  locale,
  menu,
  records = [],
  unrestricted,
  busy,
  error,
  tokens,
  onboarding,
  debounce = DEFAULT_DEBOUNCE,
  className,
  onCancelCountDown,
  onSelectMenuItem,
  onSearchFieldRef,
  onTokensChange,
  onCloseOnboarding,
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
        ) : error in ERRORS ? (
          <p>{t(ERRORS[error])}</p>
        ) : (
          <p>
            {t('Sorry, something went wrong')!}
            <br />
            {t(error)}
          </p>
        )}
      </InfoModal>
      <section>
        <header className='sticky-top'>
          <NavbarMenu
            menu={menu}
            onSelectItem={onSelectMenuItem}
            className='shadow'
          >
            {!unrestricted ? null : (
              <FAIconButton
                icon={'unlock'}
                color='light'
                outline
                className={countdownButtonStyle}
                onClick={onCancelCountDown}
              >
                <small>
                  <br />
                  {unrestricted}s
                </small>
              </FAIconButton>
            )}
          </NavbarMenu>
          <div className='container-fluid bg-transparent'>
            <Row className='justify-content-center px-1'>
              <IconLabelInputGroup
                icon='search'
                className='col-12 col-sm-10 col-md-8 col-lg-6 col-xl-4 mt-1 px-0 shadow'
              >
                <SerializedInput
                  innerRef={onSearchFieldRef}
                  type='csv'
                  className='form-control'
                  value={tokens}
                  debounce={debounce}
                  autoFocus
                  onChange={onTokensChange}
                />
              </IconLabelInputGroup>
            </Row>
          </div>
        </header>
        <main className='container-fluid mt-1'>
          <Row
            className={classes(
              'align-items-start justify-content-center',
              className
            )}
          >
            <FilteredRecordCards
              locale={locale}
              records={records}
              unrestricted={!!unrestricted}
              {...attrs}
            />
          </Row>
          <Row
            className={classes(
              'justify-content-center',
              !onboarding && 'd-none'
            )}
          >
            <Onboarding locale={locale} onClose={onCloseOnboarding} />
          </Row>
        </main>
      </section>
    </Fragment>
  )
}
