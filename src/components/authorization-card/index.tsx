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
//
import { createElement } from 'create-element'
import { Button } from '..'
import { Card, CardBody, CardFooter, CardHeader } from 'reactstrap'
import ControlledAuthenticationModal from '../controlled-authentication-modal'
import createL10n from 'basic-l10n'
const debug = (process.env.NODE_ENV !== 'production') && require('debug')('zenypass:components:access-authorization:')
const l10n = createL10n(require('./locales.json'), { debug, locale: 'fr' })

export interface AuthorizationCardProps {
  authenticate: boolean,
  error?: string,
  locale?: string,
  pending?: boolean,
  token?: string,
  onClick: (event: MouseEvent) => void
  onCancel: () => void
  onAuthenticated: (sessionID: string) => void
}

export default function ({
  authenticate,
  error,
  locale,
  onClick,
  onCancel,
  onAuthenticated,
  pending,
  token
}: Partial<AuthorizationCardProps>) {

  l10n.locale = locale || l10n.locale

  const txt = pending && token ? l10n('Access authorization token:') : '...'
  const buttonTxt = pending ? l10n('Cancel') : l10n('Authorize a new access')

  return (
    <div>
    <Card mb={2}>
      <CardHeader className='border-0 bg-white' />
      <CardBody>
        {pending ? (
          <div>
            <p className='mb-2'>{txt}</p>
            <p className='mb-2'>{token}</p>
          </div>
        ) : null}
        <Button
          color='info'
          onClick={onClick}
          className={pending && 'btn-outline-info'}
          icon={authenticate && 'fa-spinner fa-spin'}
          disabled={authenticate}
        >
          {buttonTxt}
        </Button>
      </CardBody>
      <CardFooter className='border-0 bg-white'>{error}</CardFooter>
    </Card>

    <ControlledAuthenticationModal
      open={authenticate}
      onCancel={onCancel}
      onAuthenticated={onAuthenticated}
    />
    </div>
  )
}
