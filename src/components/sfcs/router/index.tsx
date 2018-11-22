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
import { HomePage, HomePageProps, MenuSpecs, DropdownItemSpec } from '../../home-page'
import { SignupPage, SignupPageProps } from '../../signup-page'
import { SigninPage, SigninPageProps } from '../../signin-page'
import { ErrorPage } from '../error-page'
import { InfoModal } from '../info-modal'
import { newStatusError } from 'utils'
import { Observer } from 'component-from-props'
import createL10ns from 'basic-l10n'
const l10ns = createL10ns(require('./locales.json'))

export interface RouterProps extends CoreRouterProps {
  info: boolean
  onCloseInfo: (event: MouseEvent) => void
}

export interface CoreRouterProps {
  locale: string
  path?: string
  menu?: MenuSpecs
  params?: { [prop: string]: unknown }
  session?: string
  onAuthenticationRequest?: (res$: Observer<string>) => void
  onError?: (error?: any) => void
  onSelectMenuItem?: (target: HTMLElement) => void
}

export function Router ({
  locale,
  info,
  onCloseInfo,
  ...attrs
}: RouterProps & { [prop: string]: unknown }) {
  const t = l10ns[locale]
  return (
    <div>
      <InfoModal locale={locale} expanded={info} onCancel={onCloseInfo} >
        <p>{t('ZenyPass Help is hosted on Medium')}:<br/>
        {t('a dedicated window will open')}</p>
      </InfoModal>
      <CoreRouter locale={locale} {...attrs} />
    </div>
  )
}

function CoreRouter ({
  locale,
  session,
  path,
  menu,
  params,
  onAuthenticationRequest,
  onError,
  onSelectMenuItem
}: CoreRouterProps & { [prop: string]: unknown }) {
  switch (path) {
    case '/':
      return (
        <HomePage
          locale={locale}
          session={session}
          menu={menu}
          onAuthenticationRequest={onAuthenticationRequest}
          onError={onError}
          onSelectMenuItem={onSelectMenuItem}
          {...params as HomePageProps}
        />
      )
    case '/signup':
      return (
        <SignupPage
          locale={locale}
          locales={menu as DropdownItemSpec[]}
          signup
          onSelectLocale={onSelectMenuItem}
          {...params as SignupPageProps}
        />
      )
    case '/signin':
      return (
        <SigninPage
          locale={locale}
          locales={menu as DropdownItemSpec[] }
          onSelectLocale={onSelectMenuItem}
          {...params as SigninPageProps}
        />
      )
    case '/fatal':
    default:
      const {
        error = newStatusError(404),
        children = null,
        ...attrs
      } = params as any || {}
      return (
        <ErrorPage locale={locale} error={error} {...attrs} >
          {path === '/fatal' ? null : <p>path: {path}</p>}
          {children}
        </ErrorPage>
      )
  }
}
