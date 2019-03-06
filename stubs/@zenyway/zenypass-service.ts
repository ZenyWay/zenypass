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
import { Observable } from 'rxjs'

const getZenypassServiceAccess: ZenypassServiceAccessFactory = function (
  opts?: any
) {
  return Promise.resolve<any>(void 0)
}
export default getZenypassServiceAccess

export type ZenypassServiceAccessFactory = (
  opts?: any
) => Promise<ZenypassServiceAccess>
export interface ZenypassServiceAccess {
  signup(creds: Credentials, opts?: Partial<SignupSpec>): Promise<string>
  signin(
    creds: Credentials,
    opts?: Partial<SigninSpec>
  ): Promise<ZenypassService>
  requestAccess(creds: Credentials, secret: string): Promise<string>
}
export interface SignupSpec {
  lang: string
  newsletter: boolean
}
export interface SigninSpec {}
export interface Credentials {
  username: string
  passphrase: string
}
export interface ZenypassService {
  signout(): void
  unlock(passphrase: string): Promise<string>
  authorize(passphrase: string, secret: string): Promise<AuthorizationDoc>
  cancelAuthorization(): void
  getAuthToken(length?: number): string
  getAgentInfo$(): Observable<AuthorizationDoc>
  // getStorageInfo$(): Observable<StorageInfo>;
  username: string
  meta: DocVault
  records: ZenypassRecordService
  // payments: PaymentService;
}
export interface DocVault {
  upsert<D extends PouchDoc>(doc: D): Promise<D>
  put<D extends PouchDoc>(doc: D): Promise<D>
  get<D extends PouchDoc>(ref: string | PouchDoc): Promise<D>
  getChange$<D extends PouchDoc>(
    opts?: Partial<PouchChangesSpec>
  ): Observable<PouchVaultChange<D>>
}
export interface PouchChangesSpec extends PouchFilterSpec {
  include_docs: boolean
  return_docs: boolean
  live: boolean
  since: 'now' | number
}
export interface PouchFilterSpec {
  doc_ids: string[]
  filter: <D extends PouchDoc>(doc: D) => boolean
}
export interface PouchVaultChange<D extends PouchDoc> extends PouchDbChange<D> {
  live: boolean
}
export interface PouchDbChange<D extends PouchDoc> {
  seq: number
  id: string
  changes: { rev: string }[]
  deleted?: boolean
  doc?: D
}
export interface ZenypassRecordService {
  records$: Observable<IndexedMap<ZenypassRecord>>
  newRecord(): Promise<ZenypassRecord>
  putRecord(record: ZenypassRecord): Promise<ZenypassRecord>
  getRecord(ref: PouchDoc): Promise<ZenypassRecord>
  getDocCount(): Promise<number>
}
export interface ZenypassRecord extends PouchDoc {
  name: string
  keywords: string[]
  url: string
  username: string
  password: string
  favicon: string
  comments: string
  login: boolean
  unrestricted: boolean
  timestamp: number
}
export interface AuthorizationDoc extends PouchDoc, AgentInfo {
  secret?: string
}
export interface AgentInfo {
  identifier: string
  certified: number
}
export interface PouchDoc extends PouchDocId {
  _rev?: string
  _deleted?: boolean
}
export interface PouchDocId {
  _id: string
}
export type IndexedMap<V> = { [key: string]: V }
