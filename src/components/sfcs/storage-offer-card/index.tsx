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
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  InputGroup,
  InputGroupPrepend,
  InputGroupAppend
} from 'bootstrap'
import { FAIconButton } from '../fa-icon'
import { style } from 'typestyle'
import { ZENYPASS_PREMIUM_SVG, ZENYPASS_A_LA_CARTE_SVG } from 'static'
import { classes } from 'utils'
import createL10ns from 'basic-l10n'
const l10ns = createL10ns(require('./locales.json'))

export interface StorageOfferCardProps extends StorageOffer {
  locale: string
  ucid?: string
  country?: string
  currency?: Currency
  offline?: boolean
  processing?: boolean
  className?: string
  onCheckout?: (event?: MouseEvent) => void
  onClickMinus?: (event?: MouseEvent) => void
  onClickPlus?: (event?: MouseEvent) => void
  onInput?: (event?: Event) => void
}

export interface StorageOffer {
  uiid?: Uiid
  quantity?: number
  price?: number
  editable?: boolean
}

export enum Uiid {
  Premium = 'PREM',
  Unit = 'UNIT'
}

export enum Currency {
  Euro = 'EUR'
}

export function StorageOfferCard ({
  locale,
  uiid = Uiid.Premium,
  quantity,
  price,
  ucid,
  country,
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
  const disabled = offline || processing || !ucid

  return (
    <article
      className={classes('col-12 col-sm-6 col-lg-4 col-xl-3 p-1', className)}
      {...attrs}
    >
      <Card className='rounded text-center' bg='white'>
        <CardHeader className='bg-transparent border-0 px-1'>
          <CardTitle>
            {t(premium ? 'ZenyPass Premium' : 'ZenyPass "A-la-Carte"')}
          </CardTitle>
          {premium ? null : (
            <QuantityInput
              value={quantity}
              editable={editable}
              onClickMinus={onClickMinus}
              onClickPlus={onClickPlus}
              onInput={onInput}
            />
          )}
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
          <p>
            {premium
              ? t(
                  'Unlimited storage space for adding websites without constraint'
                )
              : `${t(
                  'Additional storage space to add'
                )} ${t`${quantity} websites`}`
            // TODO quantity input
            }
            .
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
            onClick={onCheckout}
          >
            &nbsp;
            {disabled
              ? t(offline ? 'Disconnected' : 'Processing')
              : !price
              ? `${t('Activate')} ${t(uiid)}`
              : `${t('Buy for')} ${price}` // TODO localize price
            }
          </FAIconButton>
        </CardFooter>
      </Card>
    </article>
  )
}

const hideSpinButtons = style({
  $nest: {
    '&::-webkit-inner-spin-button': {
      '-webkit-appearance': 'none',
      margin: '0'
    },
    '&::-webkit-outer-spin-button': {
      '-webkit-appearance': 'none',
      margin: '0'
    }
  }
})

const customQuantityInputClassName = classes(
  'form-control border-info text-center font-weight-bold',
  hideSpinButtons,
  style({
    maxWidth: '3rem',
    $nest: {
      '&:focus': { boxShadow: 'unset' }
    }
  })
)

interface CustomQuantityInputProps {
  value: number
  editable?: boolean
  onClickMinus?: (event?: MouseEvent) => void
  onClickPlus?: (event?: MouseEvent) => void
  onInput?: (event?: Event) => void
}

function QuantityInput ({
  value,
  editable,
  onClickMinus,
  onClickPlus,
  onInput
}: CustomQuantityInputProps) {
  return (
    <InputGroup className='justify-content-center'>
      {!editable ? null : (
        <InputGroupPrepend>
          <FAIconButton
            icon='minus'
            color='info'
            outline
            onClick={onClickMinus}
          />
        </InputGroupPrepend>
      )}
      <Input
        type='number'
        value={'' + value}
        readOnly={!editable}
        autoCorrect='off'
        autoComplete='off'
        className={customQuantityInputClassName}
        onInput={onInput}
      />
      {!editable ? null : (
        <InputGroupAppend>
          <FAIconButton
            icon='plus'
            color='info'
            outline
            onClick={onClickPlus}
          />
        </InputGroupAppend>
      )}
    </InputGroup>
  )
}
