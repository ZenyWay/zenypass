/**
 * Clément Bonet
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
  auth_request: boolean,
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
  auth_request,
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
  const buttonTxt = init || auth_request || authenticate ? l10n('Authorize a new access') : l10n('Cancel')

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
          icon={auth_request && 'fa-spinner fa-spin'}
          disabled={auth_request}
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
      auth_request={auth_request}
      errorPassword={errorPassword}
    />
    </div>
  )
}
