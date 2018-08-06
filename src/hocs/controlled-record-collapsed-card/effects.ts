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
import {
  filter,
  pluck
} from 'rxjs/operators'
import { from } from 'rxjs'
import { serviceRequestOnEventFromState } from '../../utils/service-request'

const log = (label: string) => console.log.bind(console, label)
const ofType = type => filter(isOfType(type))

const restricted = ({ props }) => !props.record.unrestricted

export const requestPassword =
  serviceRequestOnEventFromState({
    state: 'pending',
    event: 'LOGIN',
    request: getPassword,
    restricted
  })

function getPassword ({ getRecord }) {
  return function ({ props, sessionId }) {
    return from(getRecord(sessionId, props.record)).pipe(pluck('password'))
  }
}

function isOfType (type) {
  return function (event) {
    return event.type === type
  }
}
