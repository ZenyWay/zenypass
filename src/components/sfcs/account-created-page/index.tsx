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
import { SplashCard } from '../splash-card'
import { Button, CardBody, Row, CardFooter } from 'bootstrap'
import createL10ns from 'basic-l10n'
const l10ns = createL10ns(require('./locales.json'))

export interface AccountCreatedPageProps {
  locale: string
  onClick: (event: Event) => void
}

export interface UnknownProps { [prop: string]: unknown }

export function AccountCreatedPage ({
  locale,
  onClick,
  ...attrs
}: AccountCreatedPageProps & UnknownProps) {
  const t = l10ns[locale]
  return (
    <section className='container bg-light' {...attrs}>
      <Row className='justify-content-center' >
        <SplashCard >
          <CardBody className='px-0'>
            <p>
              {t('An account validation email was just sent to you')}.
            </p>
            <p>
              {t('To finalize the creation of your account, please follow the link in that email')}.
            </p>
            <p>
              <small>
                {t('If you haven\'t received the validation email, please check your spam folder')}.<br/>
                {t('The validation email is sent from the address info@zenyway.com')}.
              </small>
            </p>
          </CardBody>
          <CardFooter bg='transparent' border='none'>
            <Button type='submit' color='info' onClick={onClick}>
              {t('ok')}
            </Button>
          </CardFooter>
        </SplashCard>
      </Row>
    </section>
  )
}
