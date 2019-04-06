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
import { AuthorizationPage } from '../../authorization-page'
import { AgentAuthorizationsPage } from '../../agent-authorizations-page'
import { HomePage, MenuSpecs, DropdownItemSpec } from '../../home-page'
import { SigninPage } from '../../signin-page'
import { SignupPage } from '../../signup-page'
import { SignupDonePage } from '../signup-done-page'
import { ErrorPage } from '../error-page'
import { InfoModal } from '../info-modal'
import { newStatusError } from 'utils'
import { Observer } from 'component-from-props'
import createL10ns from 'basic-l10n'
const l10ns = createL10ns(require('./locales.json'))

export interface RouterProps extends CoreRouterProps {
  info: boolean
  onCloseInfo: (event?: MouseEvent) => void
}

export interface CoreRouterProps {
  locale: string
  path?: string
  menu?: MenuSpecs
  email?: string
  session?: string
  error?: any
  onboarding?: boolean
  children?: any
  onAuthenticationRequest?: (res$: Observer<string>) => void
  onAuthorize?: () => void
  onAuthorized?: () => void
  onClose: (event?: MouseEvent) => void
  onEmailChange?: (email?: string) => void
  onError?: (error?: any) => void
  onSignedIn?: (session?: string) => void
  onSignedUp?: () => void
  onSignin?: () => void
  onSignup?: () => void
  onSelectMenuItem?: (target: HTMLElement) => void
  onUpdateSetting?: (key?: string, value?: any) => void
}

export function Router ({
  locale,
  info,
  onCloseInfo,
  ...attrs
}: RouterProps & { [prop: string]: unknown }) {
  const t = l10ns[locale]
  return (
    <Fragment>
      <InfoModal
        locale={locale}
        expanded={info}
        title={t('Info')}
        onCancel={onCloseInfo}
      >
        <p>
          {t('ZenyPass Help is hosted on Medium')}:<br />
          {t('a dedicated window will open')}
        </p>
      </InfoModal>
      <CoreRouter locale={locale} {...attrs} />
    </Fragment>
  )
}

function CoreRouter ({
  locale,
  email,
  session,
  path,
  menu,
  onboarding,
  error,
  children = null,
  onAuthenticationRequest,
  onAuthorize,
  onClose,
  onEmailChange,
  onError,
  onAuthorized,
  onSignedIn,
  onSignedUp,
  onSignin,
  onSignup,
  onSelectMenuItem,
  onUpdateSetting,
  attrs
}: CoreRouterProps & { [prop: string]: unknown }) {
  switch (path) {
    case '/':
      return (
        <HomePage
          locale={locale}
          session={session}
          menu={menu}
          onboarding={onboarding}
          onAuthenticationRequest={onAuthenticationRequest}
          onError={onError}
          onSelectMenuItem={onSelectMenuItem}
          onUpdateSetting={onUpdateSetting}
        />
      )
    case '/authorize':
      return (
        <AuthorizationPage
          locale={locale}
          locales={menu as DropdownItemSpec[]}
          email={email}
          onEmailChange={onEmailChange}
          onError={onError}
          onAuthorized={onAuthorized}
          onSelectLocale={onSelectMenuItem}
          onSignedIn={onSignedIn}
          onSignin={onSignin}
          onSignup={onSignup}
        />
      )
    case '/authorizations':
      return (
        <AgentAuthorizationsPage
          locale={locale}
          session={session}
          onAuthenticationRequest={onAuthenticationRequest}
          onClose={onClose}
          onError={onError}
        />
      )
    case '/signup':
      return (
        <SignupPage
          locale={locale}
          locales={menu as DropdownItemSpec[]}
          email={email}
          onAuthorize={onAuthorize}
          onEmailChange={onEmailChange}
          onError={onError}
          onSignedUp={onSignedUp}
          onSelectLocale={onSelectMenuItem}
          onSignin={onSignin}
        />
      )
    case '/signup/done':
      return <SignupDonePage locale={locale} onClose={onClose} />
    case '/signin':
      return (
        <SigninPage
          locale={locale}
          locales={menu as DropdownItemSpec[]}
          email={email}
          onAuthorize={onAuthorize}
          onEmailChange={onEmailChange}
          onError={onError}
          onSelectLocale={onSelectMenuItem}
          onSignedIn={onSignedIn}
          onSignup={onSignup}
        />
      )
    case '/fatal':
    default:
      return (
        <ErrorPage
          locale={locale}
          error={error || newStatusError(404)}
          {...attrs as any}
        >
          {path === '/fatal' ? null : <p>path: {path}</p>}
          {children}
        </ErrorPage>
      )
  }
}
