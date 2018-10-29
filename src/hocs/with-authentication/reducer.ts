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
//
import { propCursor, into } from 'basic-cursors'
import { always, forType, mapPayload } from 'utils'
import compose from 'basic-compose'

export default compose.into(0)(
  forType('AUTHENTICATION_REQUESTED')(into('authenticate')(always(true))),
  forType('AUTHENTICATION_REJECTED')(into('authenticate')(always(false))),
  forType('AUTHENTICATION_RESOLVED')(
    compose.into(0)(
      into('authenticate')(always(false)),
      into('session')(mapPayload())
    )
  ),
  forType('PROPS')(propCursor('props')(mapPayload()))
)
