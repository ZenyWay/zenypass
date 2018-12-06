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

export type RouteAutomataState =
  '/' | '/signup' | '/signin' | '/devices' | '/storage' | '/fatal'
export type LinkAutomataState = 'idle' | 'info'

const mapPayloadIntoParamsError = into('params')(mapPayload(error => ({ error })))
const mapPayloadIntoParamsEmail = into('params')(mapPayload(email => ({ email })))

const routeAutomata: AutomataSpec<RouteAutomataState> = {
  '/': {
    // TODO remove comments when corresponding pages are available
    // DEVICES: '/devices',
    // STORAGE: '/storage',
    LOGOUT: ['/signin', into('session')(always())],
    FATAL: ['/fatal', mapPayloadIntoParamsError]
  },
  '/signup': {
    SIGNIN: '/signin',
    ACCOUNT_CREATED: '/signin', // TODO account creation confirmation screen
    EXIT: '/signin',
    EMAIL: mapPayloadIntoParamsEmail,
    FATAL: ['/fatal', mapPayloadIntoParamsError]
  },
  '/signin': {
    SIGNUP: '/signup',
    EXIT: '/signup',
    EMAIL: mapPayloadIntoParamsEmail,
    AUTHENTICATED: ['/', into('session')(mapPayload())],
    FATAL: ['/fatal', mapPayloadIntoParamsError]
  },
  '/devices': {
    CLOSE: '/',
    FATAL: ['/fatal', mapPayloadIntoParamsError]
  },
  '/storage': {
    CLOSE: '/',
    FATAL: ['/fatal', mapPayloadIntoParamsError]
  },
  '/fatal': {
    // DEAD-END
  }
}

const linkAutomata: AutomataSpec<LinkAutomataState> = {
  'idle': {
    LINK: ['info', into('link')(mapPayload())]
  },
  'info': {
    CLOSE_INFO: 'idle'
  }
}

export default compose.into(0)(
  createAutomataReducer(routeAutomata, '/signin', 'path'),
  createAutomataReducer(linkAutomata, 'idle', 'info'),
  forType('LOCALE')(into('locale')(mapPayload())),
  forType('PROPS')(into('props')(mapPayload()))
)
