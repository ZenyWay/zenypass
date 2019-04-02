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
import { into, propCursor } from 'basic-cursors'
import compose from 'basic-compose'
import { forType, mapPayload, mergePayload, omit, pick } from 'utils'
import { Observer } from 'rxjs'
import { IndexedAgentEntry } from '.'

export interface AgentAuthorizationsHocProps {
  session?: string
  onAuthenticationRequest?: (res$: Observer<string>) => void
  onError?: (error: any) => void
}

export enum AgentAuthorizationsFsm {
  Init = 'INIT',
  Idle = 'IDLE'
}

const automata: AutomataSpec<AgentAuthorizationsFsm> = {
  [AgentAuthorizationsFsm.Init]: {
    DEBOUNCE: AgentAuthorizationsFsm.Idle
  },
  [AgentAuthorizationsFsm.Idle]: {
    // dead-end
  }
}

const SELECTED_PROPS: (keyof AgentAuthorizationsHocProps)[] = [
  'session',
  'onAuthenticationRequest',
  'onError'
]

export default compose.into(0)(
  createAutomataReducer(automata, AgentAuthorizationsFsm.Init),
  forType('AGENT')(
    propCursor('agents')(
      (
        agents: IndexedAgentEntry[] = [],
        { payload: { _id, identifier, certified } }
      ) => agents.concat({ _id, agent: { _id, identifier, certified } })
    )
  ),
  forType('PROPS')(
    compose.into(0)(
      mergePayload(pick(SELECTED_PROPS)),
      into('attrs')(mapPayload(omit(SELECTED_PROPS)))
    )
  )
)
