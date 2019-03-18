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
import { always, forType, mapPayload, pluck } from 'utils'

export enum RouteAutomataState {
  Authorize = '/authorize',
  Signup = '/signup',
  Signin = '/signin',
  SignedIn = '/signin;signed-in',
  SigningOut = '/;signing-out',
  Homepage = '/',
  Devices = '/devices',
  Storage = '/storage',
  Fatal = '/fatal'
}

export enum LinkAutomataState {
  Idle = 'idle',
  Info = 'info'
}

const mapPayloadIntoError = into('error')(mapPayload())
const mapPayloadIntoEmail = into('email')(mapPayload())
const clearSession = into('session')(always())

const routeAutomata: AutomataSpec<RouteAutomataState> = {
  [RouteAutomataState.Authorize]: {
    // AUTHORIZED: // TODO add state for Signin from Authorized
    SIGNIN: RouteAutomataState.Signin,
    SIGNUP: RouteAutomataState.Signup,
    EMAIL: mapPayloadIntoEmail,
    FATAL: RouteAutomataState.Fatal
  },
  [RouteAutomataState.Signup]: {
    // SIGNED_UP: // TODO add state for Signin from Signup
    AUTHORIZE: RouteAutomataState.Authorize,
    SIGNIN: RouteAutomataState.Signin,
    EMAIL: mapPayloadIntoEmail,
    FATAL: RouteAutomataState.Fatal
  },
  [RouteAutomataState.Signin]: {
    SIGNED_IN: [RouteAutomataState.SignedIn, into('session')(mapPayload())],
    AUTHORIZE: RouteAutomataState.Authorize,
    SIGNUP: RouteAutomataState.Signup,
    EMAIL: mapPayloadIntoEmail,
    FATAL: RouteAutomataState.Fatal
  },
  [RouteAutomataState.SigningOut]: {
    SIGNED_OUT: [RouteAutomataState.Signin, clearSession],
    // UNAUTHORIZED: RouteAutomataState.Signin,
    FATAL: RouteAutomataState.Fatal
  },
  [RouteAutomataState.SignedIn]: {
    EMAIL: RouteAutomataState.SigningOut,
    FATAL: RouteAutomataState.Fatal,
    HOMEPAGE: RouteAutomataState.Homepage
  },
  [RouteAutomataState.Homepage]: {
    // TODO remove comments when corresponding pages are available
    // DEVICES: '/devices',
    // STORAGE: '/storage',
    EMAIL: RouteAutomataState.SigningOut,
    FATAL: RouteAutomataState.Fatal,
    LOGOUT: RouteAutomataState.SigningOut
  },
  [RouteAutomataState.Devices]: {
    EMAIL: RouteAutomataState.SigningOut,
    HOMEPAGE: RouteAutomataState.Homepage,
    FATAL: RouteAutomataState.Fatal
  },
  [RouteAutomataState.Storage]: {
    EMAIL: RouteAutomataState.SigningOut,
    HOMEPAGE: RouteAutomataState.Homepage,
    FATAL: RouteAutomataState.Fatal
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

export default compose.into(0)(
  createAutomataReducer(routeAutomata, RouteAutomataState.Signin, 'path'),
  createAutomataReducer(linkAutomata, LinkAutomataState.Idle, 'info'),
  forType('FATAL_ERROR')(into('error')(mapPayload())),
  forType('ONBOARDING')(into('onboarding')(mapPayload())),
  forType('LOCALE')(into('locale')(mapPayload())),
  forType('PROPS')(into('props')(mapPayload()))
)
