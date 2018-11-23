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

const mapPayloadIntoError = into('error')(mapPayload())

const routeAutomata: AutomataSpec<RouteAutomataState> = {
  '/': {
    // TODO remove comments when corresponding pages are available
    // DEVICES: '/devices',
    // STORAGE: '/storage',
    LOGOUT: ['/signin', into('session')(always())],
    FATAL: ['/fatal', mapPayloadIntoError]
  },
  '/signup': {
    EXIT: '/signin',
    FATAL: ['/fatal', mapPayloadIntoError]
  },
  '/signin': {
    EXIT: '/signup',
    LOGIN_RESOLVED: ['/', into('session')(mapPayload())],
    FATAL: ['/fatal', mapPayloadIntoError]
  },
  '/devices': {
    CLOSE: '/',
    FATAL: ['/fatal', mapPayloadIntoError]
  },
  '/storage': {
    CLOSE: '/',
    FATAL: ['/fatal', mapPayloadIntoError]
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
  createAutomataReducer(routeAutomata, '/signup', 'path'),
  createAutomataReducer(linkAutomata, 'idle', 'info'),
  forType('LOCALE')(into('locale')(mapPayload(pluck('param')))),
  forType('PROPS')(into('props')(mapPayload()))
)
