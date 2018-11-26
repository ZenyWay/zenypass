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
import { AutoformatRecordField } from '../../autoformat-record-field'
import { Dropdown, DropdownItemSpec } from '../../dropdown'
import { Button, CardBody, CardTitle, Row
} from 'bootstrap'
import { classes } from 'utils'
import createL10ns from 'basic-l10n'
const l10ns = createL10ns(require('./locales.json'))

export interface AuthenticationPageProps
extends SignupFormProps, EmailDropdownProps {
  locales?: DropdownItemSpec[]
  signup?: boolean
  onSelectLocale?: (item?: HTMLElement) => void
  onToggleSignup?: (event: Event) => void
}

export interface SignupFormProps extends AuthenticationFormProps {
  confirm?: string
  onConfirmInputRef?: (target: HTMLElement) => void
}

export interface EmailDropdownProps {
  emails?: DropdownItemSpec[]
  onSelectEmail?: (item?: HTMLElement) => void
}

export interface AuthenticationFormProps extends EmailFieldProps {
  valid?: boolean
  password?: string
  cleartext?: boolean
  onSubmit?: (event: Event) => void
  onPasswordInputRef?: (target: HTMLElement) => void
}

export interface EmailFieldProps {
  locale: string
  email?: string
  onChange?: (value: string, target: HTMLElement) => void
  onToggleFocus?: (event: Event) => void
  onEmailInputRef?: (target: HTMLElement) => void
}

export function AuthenticationPage ({
  locale,
  locales,
  signup,
  emails,
  valid,
  email,
  password,
  confirm,
  cleartext,
  onChange,
  onSelectLocale,
  onSelectEmail,
  onSubmit,
  onToggleFocus,
  onToggleSignup,
  onEmailInputRef,
  onPasswordInputRef,
  onConfirmInputRef,
  ...attrs
}: AuthenticationPageProps & { [prop: string]: unknown }) {
  const formProps = {
    id: 'authentication-form',
    locale,
    valid,
    email,
    password,
    cleartext,
    onChange,
    onSubmit,
    onToggleFocus,
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
      <Row className='justify-content-center' >
        <SplashCard >
          <CardTitle className='mt-3'>
            {title}
          </CardTitle>
          <CardBody className='px-0' >
            {
              signup
              ? (
                <SignupForm
                  {...formProps}
                  confirm={confirm}
                  onConfirmInputRef={onConfirmInputRef}
                />
              )
              : (
                <SigninForm
                  {...formProps}
                  emails={emails}
                  onSelectEmail={onSelectEmail}
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
              className='float-right'
            >
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
            <Button color='info' onClick={onToggleSignup} >
              {t(signup ? 'Login' : 'Create your account')}
            </Button>
          </CardBody>
        </SplashFooterCard>
      </Row>
    </section>
  )
}

function SigninForm ({
  locale,
  emails,
  valid,
  email,
  password,
  cleartext,
  onChange,
  onSubmit,
  onToggleFocus,
  onSelectEmail,
  onEmailInputRef,
  onPasswordInputRef,
  onConfirmInputRef,
  ...attrs
}: AuthenticationFormProps & EmailDropdownProps & { [prop: string]: unknown }) {
  const t = l10ns[locale]
  const dropdown = emails && emails.length
  return (
    <form {...attrs} onSubmit={onSubmit}>
      <AutoformatRecordField
        type='email'
        id='email'
        blurOnEnterKey
        className='mb-2'
        options={emails}
        icon={dropdown ? 'fa fa-user' : 'user'}
        placeholder={t('Enter your email')}
        value={email}
        data-id='email'
        onBlur={onToggleFocus}
        onChange={onChange}
        onFocus={onToggleFocus}
        onSelectEmail={onSelectEmail}
        locale={locale}
        innerRef={onEmailInputRef}
      />
      <PassiveRecordField
        type={cleartext ? 'text' : 'password'}
        blurOnEnterKey
        id='password'
        className='mb-2'
        icon={classes('lock', dropdown && 'mx-1')}
        placeholder={valid && t('Enter your password')}
        value={password}
        data-id='password'
        onBlur={onToggleFocus}
        onChange={onChange}
        onFocus={onToggleFocus}
        locale={locale}
        disabled={!valid}
        innerRef={onPasswordInputRef}
      />
    </form>
  )
}

function SignupForm ({
  locale,
  valid,
  email,
  password,
  confirm,
  cleartext,
  onChange,
  onSubmit,
  onToggleFocus,
  onEmailInputRef,
  onPasswordInputRef,
  onConfirmInputRef,
  ...attrs
}: SignupFormProps & { [prop: string]: unknown }) {
  const t = l10ns[locale]
  return (
    <form {...attrs} onSubmit={onSubmit}>
      <AutoformatRecordField
        type='email'
        id='email'
        blurOnEnterKey
        className='mb-2'
        icon='user'
        placeholder={t('Enter your email')}
        value={email}
        data-id='email'
        onBlur={onToggleFocus}
        onChange={onChange}
        onFocus={onToggleFocus}
        locale={locale}
        innerRef={onEmailInputRef}
      />
      <PassiveRecordField
        type={cleartext ? 'text' : 'password'}
        id='password'
        blurOnEnterKey
        className='mb-2'
        icon='lock'
        placeholder={valid && t('Enter your password')}
        value={password}
        data-id='password'
        onBlur={onToggleFocus}
        onChange={onChange}
        onFocus={onToggleFocus}
        locale={locale}
        disabled={!valid}
        innerRef={onPasswordInputRef}
      />
      <PassiveRecordField
        type={cleartext ? 'text' : 'password'}
        id='confirm-password'
        blurOnEnterKey
        className='mb-2'
        icon='lock'
        placeholder={valid && t('Confirm your password')}
        value={confirm}
        data-id='confirm'
        onBlur={onToggleFocus}
        onChange={onChange}
        onFocus={onToggleFocus}
        locale={locale}
        disabled={!valid}
        innerRef={onConfirmInputRef}
      />
      <p>
        <small>
          {t('security-info')}.<br/>
          <a href={t('info-link')} target='_blank' className='text-info'>
            {t('More information')}...
          </a>
        </small>
      </p>
    </form>
  )
}
