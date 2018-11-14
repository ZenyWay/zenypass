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
import { HomePage, HomePageProps } from '../home-page'
import { ErrorPage } from './error-page'
import { newStatusError } from 'utils'

export interface RouterProps {
  locale: string
  path?: string
  params?: { [prop: string]: unknown }
}

export function Router ({
  locale,
  path,
  params
}: RouterProps & { [prop: string]: unknown }) {
  switch (path) {
    case '/':
      return <HomePage locale={locale} {...params as HomePageProps} />
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
