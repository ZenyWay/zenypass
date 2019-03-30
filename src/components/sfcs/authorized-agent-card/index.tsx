/**
 * Copyright 2018 ZenyWay S.A.S., Stephane M. Catala
 * @author Stephane M. Catala
 * @author Clement Bonet
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
import { style } from 'typestyle'
import { Card, CardBody, CardFooter, CardHeader, CardProps } from 'bootstrap'
import { classes } from 'utils'
import createL10ns from 'basic-l10n'
const l10ns = createL10ns(require('./locales.json'))

export interface AuthorizedAgentCardProps extends CardProps {
  certified?: number
  identifier?: string
  locale: string
}

const DATE_OPTIONS = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}

const formaters = Object.keys(l10ns).reduce(function (formaters, locale) {
  formaters[locale] = new Intl.DateTimeFormat(locale, DATE_OPTIONS)
  return formaters
}, {})

const shadowOnHover = style({
  transition: 'box-shadow .2s',
  $nest: {
    '&:hover': {
      boxShadow: '0 0.5rem 1rem rgba(0,0,0,.15)!important' // bootstrap4 'shadow' class
    }
  }
})

const cardClassNames = `px-0 shadow-sm ${shadowOnHover}`

export function AuthorizedAgentCard ({
  identifier,
  certified,
  locale,
  className,
  ...attrs
}: AuthorizedAgentCardProps) {
  const t = l10ns[locale]

  return (
    <article
      className={classes('col-12 col-sm-6 col-lg-4 col-xl-3 p-1', className)}
    >
      <Card align='center' bg='white' className={cardClassNames} {...attrs}>
        <CardHeader bg='transparent' className='border-0'>
          <strong>{identifier}</strong>
        </CardHeader>
        <CardBody className='py-0'>
          <p className='mb-2'>{t('Access authorized since:')}</p>
          <p>{formaters[locale].format(new Date(certified))}</p>
        </CardBody>
        <CardFooter bg='transparent' className='border-0' />
      </Card>
    </article>
  )
}
