/**
 * Clément Bonet
 */
/** @jsx createElement */
//
import { createElement } from 'create-element'
import { Card, CardBody, CardFooter, CardHeader } from 'reactstrap'
import createL10n from 'basic-l10n'

const debug = (process.env.NODE_ENV !== 'production') && require('debug')('zenypass:components:access-browser:')
const l10n = createL10n(require('./locales.json'), { debug, locale: 'fr' })

export interface AuthorizedBrowserCardProps {
  date: string,
  browser: string,
  locale: string
}

export default function ({ browser, date, locale }: Partial<AuthorizedBrowserCardProps>) {

  l10n.locale = locale || l10n.locale

  return (
    <Card className='mb-2'>
      <CardHeader className='border-0 bg-white'> <h5>{browser}</h5> </CardHeader>
      <CardBody>
        <p className='mb-2'>{l10n('Access authorized since:')}</p>
        <p>{date}</p>
      </CardBody>
      <CardFooter className='border-0 bg-white' />
    </Card>
  )
}
