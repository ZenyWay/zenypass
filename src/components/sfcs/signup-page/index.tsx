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
import { RecordField as PassiveRecordField } from '../record-field'
import { Button, CardBody, CardTitle, Row } from 'bootstrap'
import { Dropdown, DropdownItemSpec } from '../../dropdown'
import createL10ns from 'basic-l10n'
const l10ns = createL10ns(require('./locales.json'))

export interface SignupPageProps {
  locale: string
  locales?: DropdownItemSpec[]
  email?: string
  password?: string
  confirm?: string
  cleartext?: boolean,
  onChange?: (id: string, field: SignupPageFields, value: string) => void
  onLogin?: (event: Event) => void
  onSelectItem?: (item?: HTMLElement) => void
  onSubmit?: (event: Event) => void
}

export type SignupPageFields = 'email' | 'password' | 'confirm-password'

export function SignupPage ({
  locale,
  locales,
  email,
  password,
  confirm,
  cleartext,
  onChange,
  onLogin,
  onSelectItem,
  onSubmit,
  ...attrs
}: SignupPageProps & { [prop: string]: unknown }) {
  const t = l10ns[locale]

  return (
    <section className='container bg-light' {...attrs}>
      <Row className='justify-content-center' >
        <SplashCard tag='form' onSubmit={onSubmit} >
          <CardTitle className='mt-3'>
            {t('Create your ZenyPass account')}
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
            <PassiveRecordField
              type={cleartext ? 'text' : 'password'}
              id='confirm-password'
              className='mb-2'
              icon='lock'
              placeholder={t('Confirm your password')}
              value={confirm}
              onChange={onChange.bind(void 0, 'confirm-password')}
              locale={locale}
            />
            <p>
              <small>
                {t('security-info')}.<br/>
                <a href={t('info-link')} target='_blank' className='text-info'>
                  {t('More information')}...
                </a>
              </small>
            </p>
            <Dropdown
              {...locales[0]}
              outline
              items={locales.slice(1)}
              onSelectItem={onSelectItem}
              className='float-left'
            />
            <Button type='submit' color='info' className='float-right' >
              {t('Create an account')}
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
              <small>{t('Already have an account')} ?</small>
            </p>
            <Button color='info' onClick={onLogin} >{t('Login')}</Button>
          </CardBody>
        </SplashFooterCard>
      </Row>
    </section>
  )
}
