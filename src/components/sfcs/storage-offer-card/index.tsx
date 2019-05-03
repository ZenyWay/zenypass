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
import { QuantityInput } from './quantity-input'
import { Card, CardBody, CardFooter, CardHeader, CardTitle } from 'bootstrap'
import { FAIconButton } from '../fa-icon'
import { style } from 'typestyle'
import { ZENYPASS_PREMIUM_SVG, ZENYPASS_A_LA_CARTE_SVG } from 'static'
import createL10ns from 'basic-l10n'
import { Currency, classes, localizePrice } from 'utils'

const l10ns = createL10ns(require('./locales.json'))

export { Currency }

export interface StorageOfferCardProps extends StorageOfferSpec {
  locale: string
  editable?: boolean
  offline?: boolean
  processing?: boolean
  className?: string
  onCheckout?: (event?: MouseEvent) => void
  onClickMinus?: (event?: MouseEvent) => void
  onClickPlus?: (event?: MouseEvent) => void
  onInput?: (event?: Event) => void
}

export interface StorageOfferSpec {
  uiid?: Uiid
  currency?: Currency
  quantity?: number
  price?: number
}

export enum Uiid {
  Premium = 'PREM',
  Unit = 'UNIT'
}

const mh_4_5_rem = style({
  minHeight: '4.5rem'
})

export function StorageOfferCard ({
  locale,
  uiid = Uiid.Premium,
  quantity,
  price,
  currency = Currency.Euro,
  editable,
  offline,
  processing,
  className,
  onCheckout,
  onClickMinus,
  onClickPlus,
  onInput,
  ...attrs
}: StorageOfferCardProps) {
  const t = l10ns[locale]
  const premium = uiid === Uiid.Premium
  const disabled = offline || processing
  const title = t(premium ? 'ZenyPass Premium' : 'ZenyPass "A-la-Carte"')

  return (
    <article
      className={classes('col-12 col-sm-6 col-lg-4 col-xl-3 p-1', className)}
      {...attrs}
    >
      <Card className='rounded text-center' bg='white'>
        <CardHeader className='bg-transparent border-0 px-1'>
          <CardTitle>{title}</CardTitle>
          <QuantityInput
            value={quantity}
            disabled={!editable}
            invisible={premium}
            onClickMinus={onClickMinus}
            onClickPlus={onClickPlus}
            onInput={onInput}
          />
        </CardHeader>
        <CardBody className='py-0'>
          <img
            height='40'
            className='mx-2 mb-2'
            src={premium ? ZENYPASS_PREMIUM_SVG : ZENYPASS_A_LA_CARTE_SVG}
            alt={t(
              premium ? 'Zenypass Premium Logo' : 'Zenypass A-la-Carte Logo'
            )}
          />
          <p>
            {t(
              premium
                ? t('Unlimited storage')
                : editable
                ? 'Tailored storage'
                : 'Express checkout'
            )}
          </p>
          <p className={mh_4_5_rem}>
            {premium
              ? `${t(
                  'Unlimited storage space for adding websites without constraint'
                )}.`
              : Number.isNaN(quantity)
              ? t('Enter the amount of additional storage space required')
              : `${t(
                  'Additional storage space to add'
                )} ${t`${quantity} websites`}.`}
          </p>
        </CardBody>
        <CardFooter className='bg-transparent border-0'>
          <FAIconButton
            icon={
              disabled
                ? offline
                  ? 'pause'
                  : 'spinner'
                : price
                ? 'shopping-cart'
                : 'star'
            }
            animate={disabled && !offline && 'spin'}
            disabled={disabled}
            color='info'
            className={classes(Number.isNaN(price) && 'invisible')}
            onClick={onCheckout}
          >
            &nbsp;
            {disabled
              ? t(offline ? 'Disconnected' : 'Processing')
              : !price
              ? `${t('Activate')} ${title}`
              : `${t('Buy for')} ${localizePrice(locale, currency, price)}`}
          </FAIconButton>
        </CardFooter>
      </Card>
    </article>
  )
}
