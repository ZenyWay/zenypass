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
import { SigninForm, SigninFormField } from './signin-form'
import { SignupForm, SignupFormField } from './signup-form'
import { ConsentsModal } from './consents-modal'
import { SplashCard, SplashFooterCard } from '../splash-card'
import { Dropdown, DropdownItemSpec } from '../../dropdown'
import { FAIcon } from '../fa-icon'
import { Button, CardBody, CardTitle, Row } from 'bootstrap'
import createL10ns from 'basic-l10n'
const l10ns = createL10ns(require('./locales.json'))

export interface AuthenticationPageProps {
  locale: string
  locales?: DropdownItemSpec[]
  signup?: boolean
  consents?: boolean
  created?: boolean
  emails?: DropdownItemSpec[]
  email?: string
  password?: string
  confirm?: string
  terms?: boolean
  news?: boolean
  pending?: boolean
  error?: SignupFormField | 'unauthorized' | false
  /**
   * email: email field enabled; password, confirm and submit disabled
   *
   * password: (signup only)
   * email and password field enabled; confirm and submit disabled
   *
   * true: all enabled
   *
   * false: all disabled
   */
  enabled?: SigninFormField | boolean
  onCancelConsents: (event: MouseEvent) => void
  onChange?: (value: string, target: HTMLElement) => void
  onConfirmInputRef?: (target: HTMLElement) => void
  onEmailInputRef?: (target: HTMLElement) => void
  onPasswordInputRef?: (target: HTMLElement) => void
  onSelectEmail?: (item?: HTMLElement) => void
  onSelectLocale?: (item?: HTMLElement) => void
  onSignin?: (event: Event) => void
  onSignup?: (event: Event) => void
  onToggleConsent?: (event: Event) => void
  onToggleSignup?: (event: Event) => void
}

export type UnknownProps = { [prop: string]: unknown }

export function AuthenticationPage ({
  locale,
  locales,
  signup,
  consents,
  created,
  emails,
  email,
  password,
  confirm,
  terms,
  news,
  cleartext,
  pending,
  enabled,
  error,
  onCancelConsents,
  onChange,
  onSelectLocale,
  onSelectEmail,
  onSignup,
  onSignin,
  onToggleConsent,
  onToggleSignup,
  onEmailInputRef,
  onPasswordInputRef,
  onConfirmInputRef,
  ...attrs
}: AuthenticationPageProps & UnknownProps) {
  const formProps = {
    id: 'authentication-form',
    locale,
    email,
    password,
    cleartext,
    onChange,
    onEmailInputRef,
    onPasswordInputRef
  }
  const t = l10ns[locale]
  const title = t(
    signup ? 'Create your ZenyPass account' : 'Login to your ZenyPass account'
  )
  const question = t(
    signup ? 'Already have an account' : 'You don\'t have an account'
  )
  return (
    <section className='container bg-light' {...attrs}>
      <ConsentsModal
        locale={locale}
        display={consents}
        terms={terms}
        news={news}
        onCancel={onCancelConsents}
        onSubmit={onSignup}
        onToggle={onToggleConsent}
      />
      <Row className='justify-content-center' >
        <SplashCard >
          <CardTitle className='mt-3'>
            {title}
          </CardTitle>
          <CardBody className='px-0' >
            {
              !created ? null : (
                <div>
                  <p>
                    {t('An email was just sent to you')}:<br/>
                    {t('follow the instructions in that email to validate your account, then login below')}.
                  </p>
                  <p className='text-muted'>
                    <small>
                      {t('If you haven\'t received the validation email, sent from the address info@zenyway.com, please check your spam folder')}.
                    </small>
                  </p>
                </div>
              )
            }
            {
              signup
              ? (
                <SignupForm
                  {...formProps}
                  confirm={confirm}
                  error={error as SignupFormField | false}
                  enabled={enabled}
                  onConfirmInputRef={onConfirmInputRef}
                  onSignup={onSignup}
                />
              )
              : (
                <SigninForm
                  {...formProps}
                  emails={emails}
                  error={error as SigninFormField | 'unauthorized' | false}
                  enabled={enabled as 'email' | boolean}
                  onSelectEmail={onSelectEmail}
                  onSignin={onSignin}
                />
              )
            }
            <Dropdown
              icon={locales[0].icon}
              outline
              items={locales.slice(1)}
              onSelectItem={onSelectLocale}
              className='float-left'
            />
            <Button
              type='submit'
              form='authentication-form'
              color='info'
              disabled={
                !enabled || (enabled === 'email')
                || (signup && enabled === 'password')
              }
              className='float-right'
            >
              {
                !pending ? null : (
                  <FAIcon icon='spinner' animate='spin' className='mr-1'/>
                )
              }
              {t(signup ? 'Create your account' : 'Login')}
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
            <p><small>{question} ?</small></p>
            <Button color='info' onClick={onToggleSignup} disabled={pending} >
              {t(signup ? 'Login' : 'Create your account')}
            </Button>
          </CardBody>
        </SplashFooterCard>
      </Row>
    </section>
  )
}
