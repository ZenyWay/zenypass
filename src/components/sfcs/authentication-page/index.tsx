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
import {
  AuthenticationPageType,
  AuthenticationForm,
  AuthenticationFormError
} from './authentication-form'
import { ConsentsModal } from './consents-modal'
import { SplashCard, SplashFooterCard } from '../splash-card'
import { InfoModal } from '../info-modal'
import { Dropdown, DropdownItemSpec } from '../../dropdown'
import { FAIcon } from '../fa-icon'
import { Button, CardBody, CardTitle, Row } from 'bootstrap'
import createL10ns from 'basic-l10n'
const l10ns = createL10ns(require('./locales.json'))

export { AuthenticationPageType }

export interface AuthenticationPageProps {
  locale: string
  locales?: DropdownItemSpec[]
  type?: AuthenticationPageType
  consents?: boolean
  created?: boolean
  cleartext?: boolean
  emails?: DropdownItemSpec[]
  email?: string
  password?: string
  confirm?: string
  token?: string
  terms?: boolean
  news?: boolean
  pending?: boolean
  retry?: boolean
  error?: AuthenticationFormError
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
  enabled?: boolean
  onCancel?: (event: MouseEvent) => void
  onChange?: (value: string, target: HTMLElement) => void
  onSelectEmail?: (item?: HTMLElement) => void
  onSelectLocale?: (item?: HTMLElement) => void
  onSubmit?: (event: Event) => void
  onToggleConsent?: (event: Event) => void
  onTogglePageType?: (event: Event) => void
  onConfirmInputRef?: (target: HTMLElement) => void
  onEmailInputRef?: (target: HTMLElement) => void
  onPasswordInputRef?: (target: HTMLElement) => void
  onTokenInputRef?: (target: HTMLElement) => void
}

export type UnknownProps = { [prop: string]: unknown }

const TITLES: { [key in AuthenticationPageType]: string } = {
  signin: 'Login to your ZenyPass account',
  signup: 'Create your ZenyPass account',
  authorize: 'Authorize access to your ZenyPass account'
}

const SUBMIT_ACTIONS: { [key in AuthenticationPageType]: string } = {
  signin: 'Login',
  signup: 'Create your account',
  authorize: 'Authorize this device'
}

export function AuthenticationPage ({
  locale,
  locales,
  type = AuthenticationPageType.Signin,
  consents,
  created,
  emails,
  email,
  password,
  confirm,
  token,
  terms,
  news,
  cleartext,
  pending,
  enabled,
  retry,
  error,
  onCancel,
  onChange,
  onSelectLocale,
  onSelectEmail,
  onSubmit,
  onToggleConsent,
  onTogglePageType,
  onEmailInputRef,
  onPasswordInputRef,
  onConfirmInputRef,
  onTokenInputRef,
  ...attrs
}: AuthenticationPageProps & UnknownProps) {
  const t = l10ns[locale]
  const title = t(TITLES[type])
  const isSignup = type === 'signup'
  const question = t(
    isSignup ? 'Already have an account' : "You don't have an account"
  )
  return (
    <Fragment>
      <ConsentsModal
        locale={locale}
        display={consents}
        terms={terms}
        news={news}
        onCancel={onCancel}
        onSubmit={onSubmit}
        onToggle={onToggleConsent}
      />
      <InfoModal
        locale={locale}
        title={t('Unrecognized password')}
        confirm={t('Authorize this browser')}
        cancel={t('Retry')}
        expanded={retry}
        onCancel={onCancel}
        onConfirm={onSubmit}
      >
        <p>
          {t('Typo')} ? {t('Try again')}.<br />
          <br />
          {t('No typo')} ?{' '}
          {t('Try to authorize this browser to access your account')}.
        </p>
      </InfoModal>
      <section className='container' {...attrs}>
        <Row className='justify-content-center'>
          <SplashCard>
            <CardTitle className='mt-3'>{title}</CardTitle>
            <CardBody className='px-0'>
              <AuthenticationForm
                id='authentication-form'
                type={type}
                email={email}
                password={password}
                confirm={confirm}
                token={token}
                cleartext={cleartext}
                created={created}
                error={error}
                enabled={!pending}
                locale={locale}
                onChange={onChange}
                onEmailInputRef={onEmailInputRef}
                onPasswordInputRef={onPasswordInputRef}
                onConfirmInputRef={onConfirmInputRef}
                onTokenInputRef={onTokenInputRef}
                onSubmit={onSubmit}
              />
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
                disabled={!enabled || pending}
                className='float-right'
              >
                {!pending ? null : (
                  <FAIcon icon='spinner' animate='spin' className='mr-1' />
                )}
                {t(SUBMIT_ACTIONS[type])}
              </Button>
            </CardBody>
          </SplashCard>
        </Row>
        <Row className='justify-content-center'>
          <a
            href={t('help-link')}
            target='_blank'
            rel='noopener noreferer'
            className='text-info'
          >
            <small>{t('Online-help')}</small>
          </a>
        </Row>
        <Row className='justify-content-center'>
          <SplashFooterCard>
            <CardBody>
              <p>
                <small>{question} ?</small>
              </p>
              <Button
                color='info'
                onClick={onTogglePageType}
                disabled={pending}
              >
                {t(isSignup ? 'Login' : 'Create your account')}
              </Button>
            </CardBody>
          </SplashFooterCard>
        </Row>
      </section>
    </Fragment>
  )
}
