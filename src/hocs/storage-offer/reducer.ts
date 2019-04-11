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
import { always, forType, mapPayload, mergePayload, omit, pick } from 'utils'

export interface StorageOfferHocProps {
  ucid?: string
  quantity?: number
}

export enum StorageOfferAutomataState {
  Idle = 'IDLE'
}

const automata: AutomataSpec<StorageOfferAutomataState> = {
  [StorageOfferAutomataState.Idle]: {}
}

const SELECTED_PROPS: (keyof StorageOfferHocProps)[] = []

export default compose.into(0)(
  createAutomataReducer(automata, StorageOfferAutomataState.Idle),
  forType('PROPS')(
    compose.into(0)(
      mergePayload(pick(SELECTED_PROPS)),
      into('attrs')(mapPayload(omit(SELECTED_PROPS)))
    )
  )
)
