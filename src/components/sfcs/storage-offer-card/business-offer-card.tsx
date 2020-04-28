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
import { Card, CardBody, CardFooter, CardHeader, CardTitle } from 'bootstrap'
import { FAIcon, FAIconButton } from '../fa-icon'
import { QuantityInput } from '../quantity-input'
import { Currency, classes, localizePrice } from 'utils'
import { style } from 'typestyle'
import createL10ns from 'basic-l10n'
const l10ns = createL10ns(require('./locales.json'))

const ZP_BUSINESS_PRICE = 200 // Euro-cents

interface BusinessOfferCardProps {
  locale: string
  currency: Currency
  email: string
  emailing?: boolean
  onContact?: (event?: MouseEvent) => void
  className?: string
  [props: string]: unknown
}

const mh_3_rem = style({
  minHeight: '3rem'
})

export function BusinessOfferCard ({
  locale,
  currency,
  email,
  emailing,
  onContact,
  className,
  ...attrs
}: BusinessOfferCardProps) {
  const t = l10ns[locale]
  const title = t('ZenyPass Business')
  return (
    <article
      className={classes('col-12 col-sm-6 col-lg-4 col-xl-3 p-1', className)}
      {...attrs}
    >
      <Card className='rounded text-center' bg='white'>
        <CardHeader className='bg-transparent border-0 px-1'>
          <CardTitle>{title}</CardTitle>
          <QuantityInput value={1} disabled={true} invisible={true} />
        </CardHeader>
        <CardBody className='py-0'>
          <FAIcon
            className='mb-3'
            icon='building'
            regular
            size='2x'
            color='info'
          />
          <p>{t('Unlimited storage for you and your team')}</p>
          <p className={mh_3_rem}>
            {localizePrice(locale, currency, ZP_BUSINESS_PRICE)}
            &nbsp;
            {t('per month per user')}
          </p>
        </CardBody>
        <CardFooter className='bg-transparent border-0'>
          <FAIconButton
            icon={emailing ? 'spinner' : 'envelope'}
            animate={emailing && 'spin'}
            disabled={emailing}
            color='info'
            href={`mailto:?${toSearchParams({
              to: 'contact@zenyway.com',
              subject: t('ZenyPass Business'),
              body: `${t(
                'I wish to be contacted regarding "ZenyPass Business"'
              )}.\n\n${t('Company')}: \n\n${t('Number of users')}: \n\n${t(
                'Contact details'
              )}: ${email}`
            })}`}
            onClick={onContact}
          >
            &nbsp;{t('Email us')}
          </FAIconButton>
        </CardFooter>
      </Card>
    </article>
  )
}

function toSearchParams (obj: { [key: string]: string }): string {
  const keys = Object.keys(obj)
  let params = new Array(keys.length)
  for (const i in keys) {
    const key = keys[i]
    params[i] = `${key}=${encodeURIComponent(obj[key])}`
  }
  return params.join('&')
}
