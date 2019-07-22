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
  getStorageInfo$(): Observable<StorageInfo>
  username: string
  meta: DocVault
  records: ZenypassRecordService
  payments: PaymentService
}
export interface StorageInfo {
  docs: number
  maxdocs: number
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
  newRecord(
    props?: Partial<Rest<ZenypassRecord, PouchDoc>>
  ): Promise<ZenypassRecord>
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
export interface PaymentService {
  url: any // not used
  getPricing(opts?: Partial<PricingSpec>): Promise<Pricing>
  checkout(
    document: Document,
    locale: Locale,
    lang: string,
    spec: PaymentSpec
  ): Promise<void>
  getPaymentNotification$(): any // not used
}
export interface Pricing {
  ucid: string
  i18nkey: string
  getCountrySpec(): CountrySpec
  getPaymentSpec(uiid: string, quantity: number): PaymentSpec
}
export interface PaymentSpec extends PricingSpec {
  quantity: number
  price: number
}
export interface PricingSpec {
  country: string
  currency: 'EUR'
  uiid: string
  ucid: string
}
export interface CountrySpec {
  country: string
  currency: 'EUR'
  vat: number
}
export interface Locale {
  localize(
    lang: Exclude<keyof LocaleMap, number>,
    currency: string,
    cents: number
  ): string
  localize(
    lang: Exclude<keyof LocaleMaps, number>,
    key: Exclude<keyof LocaleMap, number>
  ): string
}
export declare type LocaleMaps = { [lang: string]: LocaleMap }
export declare type LocaleMap = { [key: string]: string }
export type IndexedMap<V> = { [key: string]: V }
export type Rest<T extends U, U extends {} = {}> = Pick<
  T,
  Exclude<keyof T, keyof U>
>
