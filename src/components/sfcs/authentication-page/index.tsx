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
import { ControlledInput } from '../../controlled-input'
import { Dropdown, DropdownItemSpec } from '../../dropdown'
import { FAIcon } from '../fa-icon'
import {
  Button,
  CardBody,
  CardTitle,
  InputGroup,
  InputGroupPrepend,
  InputGroupText,
  Row
} from 'bootstrap'
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
}

export interface EmailDropdownProps {
  emails?: DropdownItemSpec[]
  onSelectEmail?: (item?: HTMLElement) => void
}

export interface AuthenticationFormProps {
  locale: string
  email?: string
  password?: string
  cleartext?: boolean
  onChange?: (value: string, target: HTMLElement) => void
  onSubmit?: (event: Event) => void
  onToggleFocus?: (event: Event) => void
}

export function AuthenticationPage (
  props: AuthenticationPageProps & { [prop: string]: unknown }
) {
  const {
    locale,
    locales,
    signup,
    emails,
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
    ...attrs
  } = props
  const t = l10ns[locale]
  const Form = signup ? SignupForm : SigninForm
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
            <Form id='authentication-form' {...props} />
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
  email,
  password,
  cleartext,
  onChange,
  onSubmit,
  onToggleFocus,
  onSelectEmail,
  ...attrs
}: AuthenticationFormProps & EmailDropdownProps & { [prop: string]: unknown }) {
  const t = l10ns[locale]
  return (
    <form {...attrs} onSubmit={onSubmit}>
      <InputGroup className='mb-2' >
        {
          emails && emails.length
          ? (
            <Dropdown
              icon='fa fa-user'
              inputGroup='prepend'
              outline
              items={emails}
              onSelectItem={onSelectEmail}
            />
          )
          : (
            <InputGroupPrepend>
              <InputGroupText>
                <FAIcon icon='user' fw className='mx-1' />
              </InputGroupText>
            </InputGroupPrepend>
          )
        }
        <ControlledInput
          type='email'
          blurOnEnterKey
          value={email}
          data-id='email'
          onBlur={onToggleFocus}
          onChange={onChange}
          onFocus={onToggleFocus}
          placeholder={t('Enter your email')}
          className='form-control'
        />
      </InputGroup>
      <PassiveRecordField
        type={cleartext ? 'text' : 'password'}
        blurOnEnterKey
        id='password'
        className='mb-2'
        icon='lock mx-1'
        placeholder={t('Enter your password')}
        value={password}
        dataId='password'
        onBlur={onToggleFocus}
        onChange={onChange}
        onFocus={onToggleFocus}
        locale={locale}
      />
    </form>
  )
}

function SignupForm ({
  locale,
  email,
  password,
  confirm,
  cleartext,
  onChange,
  onSubmit,
  onToggleFocus,
  ...attrs
}: SignupFormProps & { [prop: string]: unknown }) {
  const t = l10ns[locale]
  return (
    <form {...attrs} onSubmit={onSubmit}>
      <PassiveRecordField
        type='email'
        id='email'
        blurOnEnterKey
        className='mb-2'
        icon='user'
        placeholder={t('Enter your email')}
        value={email}
        dataId='email'
        onBlur={onToggleFocus}
        onChange={onChange}
        onFocus={onToggleFocus}
        locale={locale}
      />
      <PassiveRecordField
        type={cleartext ? 'text' : 'password'}
        id='password'
        blurOnEnterKey
        className='mb-2'
        icon='lock'
        placeholder={t('Enter your password')}
        value={password}
        dataId='password'
        onBlur={onToggleFocus}
        onChange={onChange}
        onFocus={onToggleFocus}
        locale={locale}
      />
      <PassiveRecordField
        type={cleartext ? 'text' : 'password'}
        id='confirm-password'
        blurOnEnterKey
        className='mb-2'
        icon='lock'
        placeholder={t('Confirm your password')}
        value={confirm}
        dataId='confirm'
        onBlur={onToggleFocus}
        onChange={onChange}
        onFocus={onToggleFocus}
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
    </form>
  )
}
