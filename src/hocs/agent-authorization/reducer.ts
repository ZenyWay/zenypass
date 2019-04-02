/**
 * Copyright 2018 ZenyWay S.A.S., Stephane M. Catala
 * @author Stephane M. Catala
 * @author Clement Bonet
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
//
import createAutomataReducer, { AutomataSpec } from 'automata-reducer'
import { into } from 'basic-cursors'
import compose from 'basic-compose'
import { always, forType, mapPayload, mergePayload, omit, pick } from 'utils'
import { Observer } from 'rxjs'

export interface AgentAuthorizationHocProps {
  session?: string
  onAuthenticationRequest?: (res$: Observer<string>) => void
  onAuthorization?: (pending?: boolean) => void
  onError?: (error: any) => void
}

const SELECTED_PROPS: (keyof AgentAuthorizationHocProps)[] = [
  'session',
  'onAuthenticationRequest',
  'onAuthorization',
  'onError'
]

export enum AgentAuthorizationFsm {
  Idle = 'IDLE',
  PendingToken = 'PENDING_TOKEN',
  PendingAuthorization = 'PENDING_AUTHORIZATION',
  Authorizing = 'AUTHORIZING',
  Error = 'ERROR'
}

const mapPayloadIntoError = into('error')(mapPayload())
const clearError = into('error')(always())
const clearToken = into('token')(always())

const automata: AutomataSpec<AgentAuthorizationFsm> = {
  [AgentAuthorizationFsm.Idle]: {
    CLICK: AgentAuthorizationFsm.PendingToken
  },
  [AgentAuthorizationFsm.PendingToken]: {
    ERROR: [AgentAuthorizationFsm.Error, mapPayloadIntoError],
    TOKEN: [
      AgentAuthorizationFsm.PendingAuthorization,
      into('token')(mapPayload())
    ]
  },
  [AgentAuthorizationFsm.PendingAuthorization]: {
    CANCEL: AgentAuthorizationFsm.Idle,
    ERROR: [AgentAuthorizationFsm.Error, mapPayloadIntoError],
    AUTHORIZING: AgentAuthorizationFsm.Authorizing
  },
  [AgentAuthorizationFsm.Authorizing]: {
    AUTHORIZATION_RESOLVED: [AgentAuthorizationFsm.Idle, clearToken],
    AUTHORIZATION_REJECTED: [
      AgentAuthorizationFsm.Error,
      clearToken,
      mapPayloadIntoError
    ],
    CANCEL: [AgentAuthorizationFsm.Idle, clearToken],
    ERROR: [AgentAuthorizationFsm.Error, clearToken]
  },
  [AgentAuthorizationFsm.Error]: {
    CLICK: [AgentAuthorizationFsm.PendingToken, clearError]
  }
}

export default compose.into(0)(
  createAutomataReducer(automata, AgentAuthorizationFsm.Idle),
  forType('PROPS')(
    compose.into(0)(
      mergePayload(pick(SELECTED_PROPS)),
      into('attrs')(mapPayload(omit(SELECTED_PROPS)))
    )
  )
)
