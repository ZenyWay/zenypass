/**
 * Copyright 2018 ZenyWay S.A.S
 * @author Stephane M. Catala
 * @license Apache 2.0
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

import { USERNAME, PASSWORD } from './zenypass-service'
import zenypass, { getService as _getService } from '../src/zenypass-service'
export {
  AuthorizationDoc,
  PouchDoc,
  PouchVaultChange,
  SingleRunCountdownSpec,
  ZenypassRecord,
  ZenypassService,
  ZenypassServiceFactory
} from '../src/zenypass-service'

export default zenypass

export function getService (username: string) {
  return _getService(username).catch(err =>
    err && err.status === 404 && username === USERNAME
      ? zenypass.then(({ signin }) => signin(username, PASSWORD))
      : Promise.reject(err)
  )
}
