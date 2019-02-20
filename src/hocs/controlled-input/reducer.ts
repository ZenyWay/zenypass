/**
 * @license
 * Copyright 2018 Stephane M. Catala
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
import { into } from 'basic-cursors'
import compose from 'basic-compose'
import createAutomataReducer, { AutomataSpec } from 'automata-reducer'
import { always, exclude, forType, mapPayload, pluck } from 'utils'

export enum ControlledInputFsmState {
  Pristine = 'PRISTINE',
  Dirty = 'DIRTY'
}

const intoProps = into('props')
const intoValue = into('value')
const mapInputValueIntoValue = intoValue(
  mapPayload(pluck('currentTarget', 'value'))
)

const automata: AutomataSpec<ControlledInputFsmState> = {
  [ControlledInputFsmState.Pristine]: {
    PROPS: intoValue(mapPayload(pluck('value'))),
    INPUT: [ControlledInputFsmState.Dirty, mapInputValueIntoValue]
  },
  [ControlledInputFsmState.Dirty]: {
    INPUT: mapInputValueIntoValue,
    BLUR: ControlledInputFsmState.Pristine
  }
}

export default compose.into(0)(
  createAutomataReducer(automata, ControlledInputFsmState.Pristine),
  forType('ESCAPE_KEY')(intoValue(always(''))),
  forType('PROPS')(
    compose.into(0)(
      intoProps(
        mapPayload(
          exclude(
            'debounce',
            'blurOnEnterKey',
            'innerRef',
            'onChange',
            'onKeyPress'
          )
        )
      ),
      into('debounce')(mapPayload(pluck('debounce'))),
      into('blurOnEnterKey')(mapPayload(pluck('blurOnEnterKey'))),
      into('innerRef')(mapPayload(pluck('innerRef'))),
      into('onChange')(mapPayload(pluck('onChange'))),
      into('onKeyPress')(mapPayload(pluck('onKeyPress')))
    )
  ),
  forType('INPUT_REF')(into('input')(mapPayload())),
  forType('CLEAR_ICON_REF')(into('icon')(mapPayload()))
)
