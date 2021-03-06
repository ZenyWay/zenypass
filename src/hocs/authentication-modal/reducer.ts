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
import { always, forType, mapPayload, mergePayload, omit, pick } from 'utils'
import compose from 'basic-compose'

export interface AuthenticationModalHocProps {
  authenticate?: boolean
  session?: string
  onError?: (error: any) => void
  onCancelled?: () => void
  onAuthenticated?: (sessionId: string) => void
}

export enum AuthenticationFsmState {
  Idle = 'IDLE',
  Authenticating = 'AUTHENTICATING'
}

const mapPayloadIntoPassphrase = into('passphrase')(mapPayload())
const clearPassphrase = into('passphrase')(always(void 0))
const clearError = into('error')(always(void 0))

const automata: AutomataSpec<AuthenticationFsmState> = {
  [AuthenticationFsmState.Idle]: {
    CANCEL: [clearPassphrase, clearError],
    CHANGE: [clearError, mapPayloadIntoPassphrase],
    SUBMIT: AuthenticationFsmState.Authenticating
  },
  [AuthenticationFsmState.Authenticating]: {
    UNAUTHORIZED: [AuthenticationFsmState.Idle, into('error')(mapPayload())],
    AUTHENTICATED: [AuthenticationFsmState.Idle, clearPassphrase]
  }
}

const SELECTED_PROPS: (keyof AuthenticationModalHocProps)[] = [
  'authenticate',
  'session',
  'onAuthenticated',
  'onCancelled',
  'onError'
]

export default compose.into(0)(
  createAutomataReducer(automata, AuthenticationFsmState.Idle),
  forType('INPUT_REF')(into('input')(mapPayload())),
  forType('PROPS')(
    compose.into(0)(
      mergePayload(pick(SELECTED_PROPS)),
      into('attrs')(mapPayload(omit(SELECTED_PROPS)))
    )
  )
)
