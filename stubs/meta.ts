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

import { first, map } from 'rxjs/operators'
import { Subject, EMPTY } from 'rxjs'
import { DocVault, PouchDoc } from './@zenyway/zenypass-service'
import { NOT_FOUND } from './status-error'

const meta = {
  // TODO
  getChange$,
  get,
  put
} as DocVault

export default meta

const change$ = new Subject<any>()

function getChange$ ({ live }) {
  return !live ? EMPTY : change$.pipe(map(doc => ({ doc })))
}

function get<D extends PouchDoc> (ref: string | PouchDoc): Promise<D> {
  return Promise.reject(NOT_FOUND)
}

function put<D extends PouchDoc> (doc: D): Promise<D> {
  const res = change$.pipe(first()).toPromise()
  change$.next(doc)
  return res
}
