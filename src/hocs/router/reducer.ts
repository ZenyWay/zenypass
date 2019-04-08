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

import createAutomataReducer, { AutomataSpec } from 'automata-reducer'
import { into } from 'basic-cursors'
import compose from 'basic-compose'
import { createActionFactories } from 'basic-fsa-factories'
import { always, forType, noop, mapPayload, withEventGuards } from 'utils'

export const enum RouteAutomataState {
  Authorizations = '/authorizations',
  Authorize = '/authorize',
  Fatal = '/fatal',
  Homepage = '/',
  Signin = '/signin',
  SigningOut = '/signin;signing-out',
  Signup = '/signup',
  SignupDone = '/signup/done',
  Storage = '/storage'
}

const paths = createActionFactories({
  [RouteAutomataState.Authorizations]: 'AUTHORIZATIONS',
  [RouteAutomataState.Authorize]: 'AUTHORIZE',
  [RouteAutomataState.Fatal]: 'FATAL',
  [RouteAutomataState.Homepage]: 'HOMEPAGE',
  [RouteAutomataState.Signin]: 'SIGNIN',
  [RouteAutomataState.Signup]: 'SIGNUP',
  [RouteAutomataState.Storage]: 'STORAGE'
})

export enum LinkAutomataState {
  Idle = 'idle',
  Info = 'info'
}

const clearSession = into('session')(always())

const routeAutomata: AutomataSpec<RouteAutomataState> = {
  [RouteAutomataState.Authorize]: {
    AUTHORIZED: RouteAutomataState.Signin,
    SIGNED_IN: [RouteAutomataState.Homepage, into('session')(mapPayload())],
    SIGNIN: RouteAutomataState.Signin,
    SIGNUP: RouteAutomataState.Signup,
    FATAL_ERROR: RouteAutomataState.Fatal
  },
  [RouteAutomataState.Signup]: {
    SIGNED_UP: RouteAutomataState.SignupDone,
    AUTHORIZE: RouteAutomataState.Authorize,
    SIGNIN: RouteAutomataState.Signin,
    FATAL_ERROR: RouteAutomataState.Fatal
  },
  [RouteAutomataState.SignupDone]: {
    CLOSE: RouteAutomataState.Signin
  },
  [RouteAutomataState.Signin]: {
    SIGNED_IN: [RouteAutomataState.Homepage, into('session')(mapPayload())],
    AUTHORIZE: RouteAutomataState.Authorize,
    SIGNUP: RouteAutomataState.Signup,
    FATAL_ERROR: RouteAutomataState.Fatal
  },
  [RouteAutomataState.SigningOut]: {
    SIGNED_OUT: [RouteAutomataState.Signin, clearSession],
    // UNAUTHORIZED: RouteAutomataState.Signin,
    FATAL_ERROR: RouteAutomataState.Fatal
  },
  [RouteAutomataState.Homepage]: {
    AUTHORIZATIONS: RouteAutomataState.Authorizations,
    STORAGE: RouteAutomataState.Storage,
    LOGOUT: RouteAutomataState.SigningOut,
    EMAIL: RouteAutomataState.SigningOut,
    FATAL_ERROR: RouteAutomataState.Fatal
  },
  [RouteAutomataState.Authorizations]: {
    CLOSE: RouteAutomataState.Homepage,
    EMAIL: RouteAutomataState.SigningOut,
    HOMEPAGE: RouteAutomataState.Homepage,
    FATAL_ERROR: RouteAutomataState.Fatal
  },
  [RouteAutomataState.Storage]: {
    CLOSE: RouteAutomataState.Homepage,
    EMAIL: RouteAutomataState.SigningOut,
    HOMEPAGE: RouteAutomataState.Homepage,
    FATAL_ERROR: RouteAutomataState.Fatal
  },
  [RouteAutomataState.Fatal]: {
    // DEAD-END
  }
}

const linkAutomata: AutomataSpec<LinkAutomataState> = {
  [LinkAutomataState.Idle]: {
    LINK: [LinkAutomataState.Info, into('link')(mapPayload())]
  },
  [LinkAutomataState.Info]: {
    CLOSE_INFO: LinkAutomataState.Idle
  }
}

const reducer = compose.into(0)(
  createAutomataReducer(routeAutomata, RouteAutomataState.Signin, 'path'),
  createAutomataReducer(linkAutomata, LinkAutomataState.Idle, 'info'),
  forType('FATAL_ERROR')(into('error')(mapPayload())),
  forType('ONBOARDING')(into('onboarding')(mapPayload())),
  forType('LOCALE')(into('locale')(mapPayload())),
  forType('EMAIL')(into('email')(mapPayload())),
  forType('PROPS')(into('props')(mapPayload()))
)

export default withEventGuards({
  URL_PATH_UPDATE: (update, { path }: any) =>
    update !== path && (paths[update] || noop)()
})(reducer)
