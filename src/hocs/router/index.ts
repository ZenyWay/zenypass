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

import reducer, { RouteAutomataState, LinkAutomataState } from './reducer'
import { actionFromMenuItem, actionFromError } from './dispatchers'
import {
  urlPathUpdateAndQsParamActionsFromLocationHash,
  signoutOnSigningOut,
  replaceLocationHashQueryParam,
  replaceLocationHashPathOnUrlPathUpdateOrPathState
} from './effects'
import MENUS, { DEFAULT_LOCALE } from './options'
import componentFromEvents, {
  ComponentConstructor,
  Rest,
  SFC,
  connect,
  logger,
  redux
} from 'component-from-events'
import { createActionDispatchers } from 'basic-fsa-factories'
import compose from 'basic-compose'
import { MenuSpec, openItemLink, pluck, shallowEqual, tapOnEvent } from 'utils'
import { distinctUntilChanged } from 'rxjs/operators'
const log = logger('router')

export type RouterProps<P extends RouterSFCProps> = Rest<P, RouterSFCProps>

export interface RouterSFCProps extends RouterSFCHandlerProps {
  locale: string
  path?: string
  email?: string
  session?: string
  menu?: MenuSpec
  error?: string
  onboarding?: boolean
  info?: boolean
  params?: { [prop: string]: unknown }
}

export interface RouterSFCHandlerProps {
  onAuthorize?: () => void
  onAuthorized?: () => void
  onClose?: (event?: MouseEvent) => void
  onCloseInfo?: (event?: MouseEvent) => void
  onEmailChange?: (email?: string) => void
  onError?: (error?: any) => void
  onLogout?: (error?: any) => void
  onSelectMenuItem?: (target: HTMLElement) => void
  onSignedIn?: (session?: string) => void
  onSignedUp?: () => void
  onSignin?: () => void
  onSignup?: () => void
  onStorage?: () => void
  onUpdateSetting?: (key?: string, value?: any) => void
}

interface RouterState {
  props: RouterProps<RouterSFCProps>
  locale: string
  email?: string
  session?: string
  path: RouteAutomataState
  info: LinkAutomataState
  onboarding?: boolean
  error?: any
  link?: HTMLLinkElement
}

function mapStateToProps ({
  props,
  locale,
  path: _path,
  info,
  email,
  session,
  onboarding,
  error
}: RouterState): Rest<RouterSFCProps, RouterSFCHandlerProps> {
  const path = _path.split(/[;?]/)[0]
  const menu = MENUS[path]
  const lang = locale || DEFAULT_LOCALE
  return {
    ...props,
    locale: lang,
    path,
    menu: menu && menu[lang],
    info: info === 'info',
    email,
    session,
    onboarding: !!onboarding,
    error
  }
}

const UPDATE_QUERY_PARAM_PAYLOADS = {
  locale: locale => ['lang', locale],
  onboarding: onboarding => ['onboarding', onboarding]
}

const mapDispatchToProps: (
  dispatch: (event: any) => void
) => RouterSFCHandlerProps = createActionDispatchers({
  onAuthorize: 'AUTHORIZE',
  onAuthorized: 'AUTHORIZED',
  onClose: 'CLOSE',
  onCloseInfo: 'CLOSE_INFO',
  onEmailChange: ['UPDATE_QUERY_PARAM', email => ['email', email]],
  onError: actionFromError,
  onLogout: 'LOGOUT',
  onSelectMenuItem: actionFromMenuItem,
  onSignedIn: 'SIGNED_IN',
  onSignedUp: 'SIGNED_UP',
  onSignin: 'SIGNIN',
  onSignup: 'SIGNUP',
  onStorage: 'STORAGE',
  onUpdateSetting: [
    'UPDATE_QUERY_PARAM',
    (key, val) => UPDATE_QUERY_PARAM_PAYLOADS[key](val)
  ]
})

export function router<P extends RouterSFCProps> (
  RouterSFC: SFC<P>
): ComponentConstructor<RouterProps<P>> {
  return componentFromEvents<RouterProps<P>, P>(
    RouterSFC,
    log('event'),
    redux(
      reducer,
      urlPathUpdateAndQsParamActionsFromLocationHash,
      replaceLocationHashPathOnUrlPathUpdateOrPathState,
      tapOnEvent('UPDATE_QUERY_PARAM', ([key, value]) =>
        replaceLocationHashQueryParam(key, value)
      ),
      tapOnEvent('INTERNAL_LINK', openItemLink),
      tapOnEvent(
        'CLOSE_INFO',
        compose.into(0)(openItemLink, pluck('1', 'link'))
      ),
      tapOnEvent('SIGNED_IN', () =>
        // only added on first signin, subsequent requests are ignored
        // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Multiple_identical_event_listeners
        window.addEventListener('beforeunload', beforeUnload)
      ),
      signoutOnSigningOut
    ),
    log('state'),
    connect<RouterState, RouterSFCProps>(mapStateToProps, mapDispatchToProps),
    () => distinctUntilChanged(shallowEqual),
    log('view-props')
  )
}

/**
 * warning on unwanted/unsolicited redirect
 */
function beforeUnload (event: Event) {
  event.preventDefault()
  event.returnValue = false
}
