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
import {
  createElement,
  ComponentConstructor,
  Fragment,
  SFC
} from 'create-element'
import { AuthenticationModal } from '../authentication-modal'
import { Observer } from 'component-from-props'

export interface AuthenticationProviderProps {
  locale: string
  authenticate?: boolean
  session?: string
  onAuthenticationRequest?: (res$: Observer<string>) => void
  onAuthenticationResolved?: () => void
  onAuthenticationRejected?: () => void
}

export interface AuthenticationConsumerProps {
  locale: string
  session?: string
  onAuthenticationRequest?: (res$: Observer<string>) => void
  [prop: string]: unknown
}

export type Rest<T extends U, U extends {} = {}> = Pick<
  T,
  Exclude<keyof T, keyof U>
>

export function withAuthenticationModal<
  P extends AuthenticationConsumerProps = AuthenticationConsumerProps
> (
  GenericPrivilegedComponent: ComponentConstructor<P> | SFC<P>
): SFC<AuthenticationProviderProps & Rest<P, AuthenticationConsumerProps>> {
  const PrivilegedComponent = GenericPrivilegedComponent as ComponentConstructor<
    AuthenticationConsumerProps
  >
  return function ({
    locale,
    authenticate,
    session,
    onAuthenticationResolved,
    onAuthenticationRejected,
    onAuthenticationRequest,
    ...attrs
  }: AuthenticationProviderProps) {
    return (
      <Fragment>
        <AuthenticationModal
          locale={locale}
          authenticate={authenticate}
          session={session}
          onCancelled={onAuthenticationRejected}
          onAuthenticated={onAuthenticationResolved}
        />
        <PrivilegedComponent
          locale={locale}
          session={session}
          onAuthenticationRequest={onAuthenticationRequest}
          {...attrs}
        />
      </Fragment>
    )
  }
}
