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
  authRequest: boolean,
  authenticate: boolean,
  authorizing: boolean,
  error?: string,
  errorPassword?: string,
  init: boolean,
  locale?: string,
  token?: string,
  onClick: (event: MouseEvent) => void
  onPasswordSubmit: (event: Event) => void
  onCancel: () => void
}

export default function ({
  authRequest,
  authenticate,
  authorizing,
  error,
  errorPassword,
  init,
  locale,
  onClick,
  onCancel,
  onPasswordSubmit,
  token
}: Partial<AuthorizationCardProps>) {

  l10n.locale = locale || l10n.locale

  const txt = authorizing ? l10n('Access authorization token:') : ''
  const buttonTxt = init || authRequest || authenticate ? l10n('Authorize a new access') : l10n('Cancel')

  return (
    <div>
    <Card className='mb-2'>
      <CardHeader className='border-0 bg-white' />
      <CardBody>
        {authorizing ? (
          <div>
            <p className='mb-2'>{txt}</p>
            <p className='mb-2'>{token}</p>
          </div>
        ) : null}
        <Button
          color='info'
          onClick={onClick}
          className={authorizing && 'btn-outline-info'}
          icon={authRequest && 'fa-spinner fa-spin'}
          disabled={authRequest}
        >
          {buttonTxt}
        </Button>
      </CardBody>
      <CardFooter className='border-0 bg-white'>{error}</CardFooter>
    </Card>

    <ControlledAuthenticationModal
      open={authenticate}
      onSubmit={onPasswordSubmit}
      onCancel={onCancel}
      authRequest={authRequest}
      errorPassword={errorPassword}
    />
    </div>
  )
}
