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
import {
  Button,
  CardBody,
  CardTitle,
  InputGroup,
  Row
} from 'bootstrap'
import createL10ns from 'basic-l10n'
const l10ns = createL10ns(require('./locales.json'))

export interface AuthenticationPageProps
extends SignupFormProps, EmailDropdownProps {
  locales?: DropdownItemSpec[]
  signup?: boolean
  onSubmit?: (event: Event) => void
  onTogglePage?: (event: Event) => void
}

export interface SignupFormProps extends AuthenticationFormProps {
  confirm?: string
}

export interface EmailDropdownProps {
  emails?: DropdownItemSpec[]
  onSelectItem?: (item?: HTMLElement) => void
}

export interface AuthenticationFormProps {
  locale: string
  email?: string
  password?: string
  cleartext?: boolean,
  onChange?: (value: string, target: HTMLElement) => void
  onToggleFocus?: (event: Event) => void
}

export function AuthenticationPage (props: AuthenticationPageProps & { [prop: string]: unknown }) {
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
    onSelectItem,
    onSubmit,
    onToggleFocus,
    onTogglePage,
    ...attrs
  } = props
  const t = l10ns[locale]

  return (
    <section className='container bg-light' {...attrs}>
      <Row className='justify-content-center' >
        <SplashCard tag='form' onSubmit={onSubmit} >
          <CardTitle className='mt-3'>
            {
              t(
                signup
                ? 'Create your ZenyPass account'
                : 'Login to your ZenyPass account'
              )
            }
          </CardTitle>
          <CardBody className='px-0' >
            {
              signup
              ? <SignupFields {...props} />
              : <SigninFields {...props} />
            }
            <Dropdown
              {...locales[0]}
              outline
              items={locales.slice(1)}
              onSelectItem={onSelectItem}
              className='float-left'
            />
            <Button type='submit' color='info' className='float-right' >
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
            <p>
              <small>{
                t(
                  signup
                  ? 'Already have an account'
                  : 'You don\'t have an account'
                )
              } ?</small>
            </p>
            <Button color='info' onClick={onTogglePage} >
              {t(signup ? 'Login' : 'Create your account')}
            </Button>
          </CardBody>
        </SplashFooterCard>
      </Row>
    </section>
  )
}

function SigninFields ({
  locale,
  emails,
  email,
  password,
  cleartext,
  onChange,
  onToggleFocus,
  onSelectItem
}: AuthenticationFormProps & EmailDropdownProps) {
  const t = l10ns[locale]
  return (
    <form>
      <InputGroup className='mb-2' >
        <Dropdown
          icon='fa fa-user'
          inputGroup='prepend'
          outline
          items={emails}
          onSelectItem={onSelectItem}
        />
        <ControlledInput
          type='email'
          value={email}
          data-id='email'
          debounce='300'
          onBlur={onToggleFocus}
          onChange={onChange}
          onFocus={onToggleFocus}
          placeholder={t('Enter your email')}
          className='form-control'
        />
      </InputGroup>
      <PassiveRecordField
        type={cleartext ? 'text' : 'password'}
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

function SignupFields ({
  locale,
  email,
  password,
  confirm,
  cleartext,
  onChange,
  onToggleFocus
}: SignupFormProps) {
  const t = l10ns[locale]
  return (
    <form>
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
