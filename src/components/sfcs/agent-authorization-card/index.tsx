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
import { Card, CardProps, CardBody, CardFooter, CardHeader } from 'bootstrap'
import { AuthenticationModal } from '../../authentication-modal'
import { IconButton } from '../icon'
import createL10ns from 'basic-l10n'
const debug = (process.env.NODE_ENV !== 'production') && require('debug')('zenypass:components:access-authorization:')
const l10ns = createL10ns(require('./locales.json'), { debug })

export interface AgentAuthorizationCardProps extends CardProps {
  authenticate?: boolean
  error?: string
  pending?: boolean
  token?: string
  locale: string
  onClick?: (event: MouseEvent) => void
  onCancel?: (err?: any) => void
  onAuthenticated?: (sessionID: string) => void
}

export function AgentAuthorizationCard ({
  authenticate,
  error,
  locale,
  onClick,
  onCancel,
  onAuthenticated,
  pending,
  token,
  ...attrs
}: AgentAuthorizationCardProps) {

  const t = l10ns[locale]

  const txt = pending && token ? t('Access authorization token:') : '...'
  const buttonTxt = pending ? t('Cancel') : t('Authorize a new access')

  return (
    <Card
      align='center'
      border={error ? 'danger' : pending && 'info'}
      {...attrs}
    >
      <CardHeader bg='transparent' className='border-0' />
      <CardBody>
        {pending ? (
          <div>
            <p className='mb-2'>{txt}</p>
            <p className='mb-2'>{token}</p>
          </div>
        ) : null}
        <IconButton
          color='info'
          icon={authenticate && 'fa-spinner fa-spin'}
          onClick={onClick}
          className={pending && 'btn-outline-info'}
          disabled={authenticate}
        >
          {buttonTxt}
        </IconButton>
      </CardBody>
      <CardFooter bg='transparent' text={error && 'danger'} className='border-0' >
        {error}
      </CardFooter>
      <AuthenticationModal
        open={authenticate}
        locale={locale}
        onCancel={onCancel}
        onAuthenticated={onAuthenticated}
      />
    </Card>
  )
}
