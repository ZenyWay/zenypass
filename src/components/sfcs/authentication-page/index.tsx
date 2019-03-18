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
  enabled?: boolean
  onAuthorize?: (event: Event) => void
  onCancel?: (event: MouseEvent) => void
  onChange?: (value: string, target: HTMLElement) => void
  onSelectEmail?: (item?: HTMLElement) => void
  onSelectLocale?: (item?: HTMLElement) => void
  onSubmit?: (event: Event) => void
  onToggleConsent?: (event: Event) => void
  onSignin?: (event: Event) => void
  onSignup?: (event: Event) => void
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
  onAuthorize,
  onCancel,
  onChange,
  onSelectLocale,
  onSelectEmail,
  onSignin,
  onSignup,
  onSubmit,
  onToggleConsent,
  onEmailInputRef,
  onPasswordInputRef,
  onConfirmInputRef,
  onTokenInputRef,
  ...attrs
}: AuthenticationPageProps & UnknownProps) {
  const t = l10ns[locale]
  const title = t(TITLES[type])
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
        cancel={t('Try again')}
        expanded={retry}
        onCancel={onCancel}
        onConfirm={onAuthorize}
      >
        <p>
          {t(
            'Please verify your email address and your password, or if necessary, authorize this browser to access your account'
          )}
          .
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
        <TogglePageCards
          locale={locale}
          type={type}
          disabled={pending}
          onAuthorize={onAuthorize}
          onSignin={onSignin}
          onSignup={onSignup}
        />
      </section>
    </Fragment>
  )
}

const TOGGLE_PAGE_CARD_TYPES: AuthenticationPageType[] = [
  AuthenticationPageType.Authorize,
  AuthenticationPageType.Signin,
  AuthenticationPageType.Signup
]

const TOGGLE_PAGE_CARD_HANDLERS: {
  [type in AuthenticationPageType]: string
} = {
  [AuthenticationPageType.Authorize]: 'onAuthorize',
  [AuthenticationPageType.Signin]: 'onSignin',
  [AuthenticationPageType.Signup]: 'onSignup'
}

interface TogglePageCardsProps {
  locale: string
  type?: AuthenticationPageType
  disabled?: boolean
  onAuthorize?: (event: Event) => void
  onSignin?: (event: Event) => void
  onSignup?: (event: Event) => void
}

function TogglePageCards ({
  locale,
  type,
  disabled,
  ...handlers
}: TogglePageCardsProps) {
  const cards = []
  for (const _type of TOGGLE_PAGE_CARD_TYPES) {
    if (_type !== type) {
      const card = (
        <Row className='justify-content-center'>
          <TogglePageCard
            locale={locale}
            type={_type as AuthenticationPageType}
            disabled={disabled}
            onClick={handlers[TOGGLE_PAGE_CARD_HANDLERS[_type]]}
          />
        </Row>
      )
      cards.push(card)
    }
  }
  return <Fragment>{...cards}</Fragment>
}

interface TogglePageCardProps {
  locale: string
  type?: AuthenticationPageType
  disabled?: boolean
  onClick?: (event: Event) => void
}

const TOGGLE_PAGE_CARD_TEXT: {
  [key in AuthenticationPageType]: { question: string; title: string }
} = {
  [AuthenticationPageType.Authorize]: {
    question: 'This browser is not authorized to access your account',
    title: 'Authorize this browser'
  },
  [AuthenticationPageType.Signin]: {
    question: 'Already have an account',
    title: 'Login'
  },
  [AuthenticationPageType.Signup]: {
    question: "You don't have an account",
    title: 'Create your account'
  }
}

function TogglePageCard ({
  locale,
  type,
  disabled,
  onClick
}: TogglePageCardProps) {
  const t = l10ns[locale]
  const { question, title } = TOGGLE_PAGE_CARD_TEXT[type]
  return (
    <SplashFooterCard>
      <CardBody>
        <p>
          <small>{t(question)} ?</small>
        </p>
        <Button color='info' onClick={onClick} disabled={disabled}>
          {t(title)}
        </Button>
      </CardBody>
    </SplashFooterCard>
  )
}
