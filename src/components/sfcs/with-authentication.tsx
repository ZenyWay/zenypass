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
import { createElement, ComponentClass, SFC } from 'create-element'
import { AuthenticationModal } from '../authentication-modal'
import { Observer } from 'rxjs'

export interface AuthenticationProviderProps {
  locale: string
  authenticate?: boolean
  onAuthenticationRequest?: (result$: Observer<string>) => void
  onAuthenticationResolved?: () => void
  onAuthenticationRejected?: () => void
}

export function withAuthenticationModal <
  P extends { [prop: string]: unknown }
> (
  PrivilegedComponent: ComponentClass<P> | SFC<P>
): SFC<AuthenticationProviderProps & P> {
  return function ({
      locale,
      authenticate,
      onAuthenticationResolved,
      onAuthenticationRejected,
      ...attrs
    }: AuthenticationProviderProps) {
    // TODO replace <div> with <Fragment>
    return (
      <div>
        <AuthenticationModal
          locale={locale}
          authenticate={authenticate}
          onCancelled={onAuthenticationRejected}
          onAuthenticated={onAuthenticationResolved}
        />
        <PrivilegedComponent locale={locale} {...attrs} />
      </div>
    )
  }
}
