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
  Homepage = '/',
  Signup = '/signup',
  Signin = '/signin',
  Authorize = '/authorize',
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

const routeAutomata: AutomataSpec<RouteAutomataState> = {
  [RouteAutomataState.Homepage]: {
    // TODO remove comments when corresponding pages are available
    // DEVICES: '/devices',
    // STORAGE: '/storage',
    SIGNED_OUT: [RouteAutomataState.Signin, into('session')(always())],
    FATAL: [RouteAutomataState.Fatal, mapPayloadIntoError]
  },
  [RouteAutomataState.Signup]: {
    SIGNIN: RouteAutomataState.Signin,
    EMAIL: mapPayloadIntoEmail,
    FATAL: [RouteAutomataState.Fatal, mapPayloadIntoError]
  },
  [RouteAutomataState.Signin]: {
    AUTHORIZE: RouteAutomataState.Authorize,
    SIGNUP: RouteAutomataState.Signup,
    EMAIL: mapPayloadIntoEmail,
    AUTHENTICATED: [RouteAutomataState.Homepage, into('session')(mapPayload())],
    FATAL: [RouteAutomataState.Fatal, mapPayloadIntoError]
  },
  [RouteAutomataState.Authorize]: {
    SIGNUP: RouteAutomataState.Signup,
    EMAIL: mapPayloadIntoEmail,
    FATAL: [RouteAutomataState.Fatal, mapPayloadIntoError]
  },
  [RouteAutomataState.Devices]: {
    CLOSE: RouteAutomataState.Homepage,
    FATAL: [RouteAutomataState.Fatal, mapPayloadIntoError]
  },
  [RouteAutomataState.Storage]: {
    CLOSE: RouteAutomataState.Homepage,
    FATAL: [RouteAutomataState.Fatal, mapPayloadIntoError]
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
  forType('ONBOARDING')(into('onboarding')(mapPayload())),
  forType('LOCALE')(into('locale')(mapPayload())),
  forType('PROPS')(into('props')(mapPayload()))
)
