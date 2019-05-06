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
import { FAIcon } from '../fa-icon'
import createL10ns from 'basic-l10n'
import { newStatusError, StatusError } from 'utils'
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
    <section {...attrs}>
      <h3>
        <FAIcon icon='bomb' /> <FAIcon icon='bomb' /> <FAIcon icon='bomb' />
      </h3>
      <p>
        {t('Sorry, an unrecoverable error occurred')}...
        <br />
        {t('Please reload this page to restart ZenyPass')}.
      </p>
      <div>
        <p>
          {status} {type}
          <br />
          {message}
        </p>
      </div>
      {children}
    </section>
  )
}
