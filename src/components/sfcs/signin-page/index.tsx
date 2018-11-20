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
import { SplashCard, SplashFooterCard } from '../splash-card'
import { AutoformatRecordField } from '../../autoformat-record-field'
import { RecordField as PassiveRecordField } from '../record-field'
import { LangDropdown } from '../lang-dropdown'
import { Button, CardBody, CardTitle, Row } from 'bootstrap'
import createL10ns from 'basic-l10n'
const l10ns = createL10ns(require('./locales.json'))

export interface SigninPageProps {
  locale: string
  email?: string
  password?: string
  cleartext?: boolean,
  onChange?: (id: string, field: SigninPageFields, value: string) => void
  onSignup?: (event: Event) => void
  onSelectItem?: (item?: HTMLElement) => void
  onSubmit?: (event: Event) => void
}

export type SigninPageFields = 'email' | 'password'

export function SigninPage ({
  locale,
  email,
  password,
  confirm,
  cleartext,
  onChange,
  onSignup,
  onSelectItem,
  onSubmit,
  ...attrs
}: SigninPageProps & { [prop: string]: unknown }) {
  const t = l10ns[locale]

  return (
    <section className='container bg-light' {...attrs}>
      <Row className='justify-content-center' >
        <SplashCard tag='form' onSubmit={onSubmit} >
          <CardTitle className='mt-3'>
            {t('Login to your ZenyPass account')}
          </CardTitle>
          <CardBody className='px-0' >
            <PassiveRecordField
              type='email'
              id='email'
              className='mb-2'
              icon='user'
              placeholder={t('Your email address')}
              value={email}
              onChange={onChange.bind(void 0, 'email')}
              locale={locale}
            />
            <PassiveRecordField
              type={cleartext ? 'text' : 'password'}
              id='password'
              className='mb-2'
              icon='lock'
              placeholder={t('Your password')}
              value={password}
              onChange={onChange.bind(void 0, 'password')}
              locale={locale}
            />
            <LangDropdown
              locale={locale}
              className='float-left'
              onSelectItem={onSelectItem}
            />
            <Button type='submit' color='info' className='float-right' >
              {t('Login')}
            </Button>
          </CardBody>
        </SplashCard>
      </Row>
      <Row className='justify-content-center' >
        <a
          href={t('help-link')}
          target='_blank'
          className='text-info'
        >
          <small>{t('Online-help')}</small>
        </a>
      </Row>
      <Row className='justify-content-center' >
        <SplashFooterCard>
          <CardBody>
            <p>
              <small>{t('You don\'t have an account')} ?</small>
            </p>
            <Button color='info' onClick={onSignup} >
              {t('Create your account')}
            </Button>
          </CardBody>
        </SplashFooterCard>
      </Row>
    </section>
  )
}
