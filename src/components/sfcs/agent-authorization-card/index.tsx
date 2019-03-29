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
import { Card, CardProps, CardBody, CardFooter, CardHeader } from 'bootstrap'
import { FAIconButton } from '../fa-icon'
import { classes } from 'utils'
import createL10ns from 'basic-l10n'
const l10ns = createL10ns(require('./locales.json'))

export interface AgentAuthorizationCardProps extends CardProps {
  error?: string
  pending?: boolean
  token?: string
  locale: string
  onClick?: (event: MouseEvent) => void
}

const shadowOnHover = style({
  transition: 'box-shadow .2s',
  $nest: {
    '&:hover': {
      boxShadow: '0 0.5rem 1rem rgba(0,0,0,.25)!important' // bootstrap4 'shadow' class
    }
  }
})

const cardClassNames = `px-0 shadow-sm ${shadowOnHover}`

export function AgentAuthorizationCard ({
  error,
  locale,
  pending,
  token,
  className,
  onClick,
  ...attrs
}: AgentAuthorizationCardProps) {
  const t = l10ns[locale]
  const authorizing = pending && !!token
  return (
    <article
      className={classes(
        'col-12 col-sm-6 col-lg-4 col-xl-3 py-1 px-0 px-1',
        className
      )}
    >
      <Card
        align='center'
        bg='white'
        border={error ? 'danger' : pending && 'info'}
        className={cardClassNames}
        {...attrs}
      >
        <CardHeader bg='transparent' className='border-0 px-3' />
        <CardBody className={classes('px-3', authorizing && 'py-0')}>
          {!authorizing ? null : (
            <p>
              {t('Access authorization code')}:<br />
              {token}
            </p>
          )}
          <FAIconButton
            color='info'
            outline={pending}
            pending={pending && !token}
            onClick={onClick}
          >
            {authorizing ? t('Cancel') : t('Authorize a new access')}
          </FAIconButton>
        </CardBody>
        <CardFooter
          bg='transparent'
          text={error && 'danger'}
          className='border-0 px-3'
        >
          {error}
        </CardFooter>
      </Card>
    </article>
  )
}
