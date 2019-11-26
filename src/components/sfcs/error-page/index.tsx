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
import { FAIcon } from '../fa-icon'
import { SplashCard } from '../splash-card'
import { Row } from 'bootstrap'
import createL10ns from 'basic-l10n'
import { newStatusError } from 'utils'
import { style } from 'typestyle'
import { classes } from 'utils'
const l10ns = createL10ns(require('./locales.json'))

export interface ErrorPageProps {
  locale: string
  error?: any
  children?: any
}

const ERROR_TYPES = {
  400: 'BAD REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT FOUND',
  408: 'REQUEST TIMEOUT',
  409: 'CONFLICT',
  499: 'CLIENT CLOSED REQUEST',
  500: 'INTERNAL SERVER ERROR'
}

const INTERNAL_SERVER_ERROR = newStatusError(500)

const BROWSER_COLORS = {
  chrome: '#4587F3',
  firefox: '#e66000',
  opera: '#cc0f16',
  safari: '#1B88CA'
}

const BROWSER_LOGOS = Object.keys(BROWSER_COLORS).map(browser => (
  <i
    class={classes(
      `fab fa-2x fa-${browser}`,
      style({ color: BROWSER_COLORS[browser] }),
      'pr-3'
    )}
  />
))

const BOMBS = [0, 1, 2].map(() => <FAIcon icon='bomb' />)

export function ErrorPage ({
  locale,
  error = INTERNAL_SERVER_ERROR,
  children,
  ...attrs
}: ErrorPageProps & { [prop: string]: unknown }) {
  const t = l10ns[locale]
  const { status = INTERNAL_SERVER_ERROR.status, message = null } = error
  const type = ERROR_TYPES[status] || null
  return (
    <section className='container' {...attrs}>
      <Row className='justify-content-center'>
        <SplashCard>
          <p className='text-center'>
            {t('ZenyPass cannot run properly in this browser')}...
          </p>
          <p className='text-left'>
            {t('Please ensure that')}:
            <ul>
              <li>{t('ZenyPass is not in a Private-Browsing window')},</li>
              <li>{t('this device is not running out of storage space')}.</li>
            </ul>
          </p>
          <p className='text-center'>
            <a
              href={t('help-config-link')}
              target='_blank'
              rel='noopener noreferer'
              className='text-info text-center'
            >
              {BROWSER_LOGOS}
              <br />
              {t('Please click here')}
            </a>
            <br />
            {t('to learn how to configure your browser')}.
          </p>
          <p className='text-center'>
            {t('Feel free to contact us if needed')}:{' '}
            <a href='mailto:contact@zenyway.com'>contact@zenyway.com</a>.
          </p>
          <p className='text-center'>
            {t('Please reload this page to restart ZenyPass')}.
          </p>
          <hr />
          <div>
            <p>
              {BOMBS} {status} {type}
              <br />
              {message}
            </p>
            {children}
          </div>
        </SplashCard>
      </Row>
    </section>
  )
}
