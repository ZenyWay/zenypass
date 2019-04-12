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
import {
  Input,
  InputGroup,
  InputGroupPrepend,
  InputGroupText,
  ProgressBar,
  Row
} from 'bootstrap'
import { FAIcon } from '../fa-icon'
import { InfoModal } from '../info-modal'
import { NavbarMenu } from '../navbar-menu'
import {
  StorageOfferCard,
  Currency,
  StorageOfferSpec
} from '../../storage-offer-card'
import { classes } from 'utils'
import createL10ns from 'basic-l10n'
const l10ns = createL10ns(require('./locales.json'))

export interface StoragePageProps {
  locale: string
  docs: number
  maxdocs: number
  code?: string
  offers?: StorageOfferSpec[]
  value?: string
  country?: string
  currency?: Currency
  offline?: boolean
  init?: boolean
  session?: string
  className?: string
  onClose?: (event?: MouseEvent) => void
  onError?: (error?: any) => void
  onInput?: (event?: KeyboardEvent) => void
  onToggleOffline?: () => void
  inputRef?: (target?: HTMLElement | null) => void
}

export function StoragePage ({
  locale,
  docs,
  maxdocs,
  code,
  offers = [],
  value,
  country,
  currency,
  offline,
  init,
  session,
  className,
  onClose,
  onError,
  onInput,
  onToggleOffline,
  inputRef,
  ...attrs
}: StoragePageProps) {
  const t = l10ns[locale]
  const premium = maxdocs && !Number.isFinite(maxdocs)
  return (
    <section>
      <header className='sticky-top'>
        <NavbarMenu onClickToggle={onClose} className='shadow' />
      </header>
      <InfoModal locale={locale} title={t('Please wait')} expanded={init}>
        <p>{t('Updating storage offers')}</p>
        <ProgressBar ratio={'100'} animated striped bg='info' />
      </InfoModal>
      <main className='container-fluid'>
        <h3 className='text-info text-center'>
          <strong>{t('Pay once, use forever')}</strong>
        </h3>
        <p className='text-center lead'>
          {premium
            ? t('Unlimited storage')
            : `${t('Remaining space')}: ${
                !maxdocs ? '...' : `${maxdocs - docs}/${maxdocs}`
              }`}
        </p>
        {premium ? (
          t('')
        ) : (
          <Fragment>
            <Row className='justify-content-center px-1'>
              <InputGroup className='col-12 col-sm-10 col-md-8 col-lg-6 col-xl-4 mt-1 px-0 shadow-sm'>
                <InputGroupPrepend>
                  <InputGroupText>
                    <FAIcon icon='percent' />
                  </InputGroupText>
                </InputGroupPrepend>
                <Input
                  innerRef={inputRef}
                  type='text'
                  placeholder={t('Enter your promotional code')}
                  value={value}
                  className='form-control'
                  onInput={onInput}
                />
              </InputGroup>
            </Row>
            <p className='text-center lead'>{t(code)}</p>
            <Row
              className={classes(
                'align-items-center justify-content-center',
                className
              )}
              mb='2'
              {...attrs}
            >
              <StorageOfferCards
                locale={locale}
                offers={offers}
                onToggleOffline={onToggleOffline}
              />
            </Row>
          </Fragment>
        )}
      </main>
    </section>
  )
}

interface StorageOfferCardsProps {
  locale: string
  offers?: StorageOfferSpec[]
  onToggleOffline?: () => void
}

function StorageOfferCards ({
  locale,
  offers,
  onToggleOffline
}: StorageOfferCardsProps) {
  let i = offers.length
  const cards = new Array(i)
  while (i--) {
    const offer = offers[i]
    const id = `card_${offer.uiid}_${offer.quantity}`
    cards[i] = (
      <StorageOfferCard
        key={id}
        id={id}
        locale={locale}
        {...offer}
        onToggleOffline={onToggleOffline}
      />
    )
  }
  return <Fragment>{cards}</Fragment>
}
