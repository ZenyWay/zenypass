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

export interface ZenypassServiceAccess {
  /**
   * @return Promise that resolves to `uuid`
   */
  signup (creds: Credentials, opts?: Partial<SignupSpec>): Promise<string>
  /**
   * @return Promise that resolves to `uuid`
   */
  requestAccess (creds: Credentials, secret: string): Promise<string>
  /**
   * TODO split v1 implementation into signin & getService
   * @return Promise that resolves to the accessed session id
   */
  signin (creds: Credentials, opts?: Partial<SigninSpec>): Promise<string>
  /**
   * @return Promise that resolves to the accessed session id
   */
  getService (session: string): ZenypassService
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
  unlock (passphrase: string): Promise<string>
  authorize (passphrase: string, secret: string): Promise<AuthorizationDoc>
  cancelAuthorization (): void
  getAuthToken (length?: number): string
  getAgentInfo$ (): Observable<AuthorizationDoc>
  getStorageInfo$ (): Observable<StorageInfo>
  username: string
  meta: DocVault
  records: ZenypassRecordService
  payments: PaymentService
}

export interface ZenypassRecordService {
  records$: Observable<KVMap<ZenypassRecord>>
  newRecord (): Promise<ZenypassRecord>
  putRecord (record: ZenypassRecord): Promise<ZenypassRecord>
  getRecord (ref: PouchDoc): Promise<ZenypassRecord>
  getDocCount (): Promise<number>
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

export interface StorageInfo {
  docs: number
  maxdocs: number
}

export interface AuthorizationDoc extends PouchDoc, AgentInfo {
  secret?: string
}

export interface AgentInfo {
  identifier: string
  certified: number
}

export interface DocVault {
  upsert <D extends PouchDoc> (doc: D): Promise<D>
  put <D extends PouchDoc> (doc: D): Promise<D>
  get <D extends PouchDoc> (ref: string | PouchDoc): Promise<D>
  getChange$ <D extends PouchDoc> (
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
  filter: <D extends PouchDoc> (doc: D) => boolean
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

export interface PouchDoc extends PouchDocId {
  _rev?: string
  _deleted?: boolean
}

export interface PouchDocId {
  _id: string
}

export interface PaymentService {
  url: string
  getPricing (opts?: Partial<PricingSpec>): Promise<Pricing>
  getPaymentNotification$ (): Observable<PaymentNotification>
  checkout (
    document: Document,
    localize: Locale,
    lang: string,
    spec: PaymentSpec
  ): Promise<void>
}

export interface Pricing {
  ucid: string
  i18nkey: string
  getCountrySpec (): CountrySpec
  getPaymentSpec (uiid: string, quantity: number): PaymentSpec
}

export interface CountrySpec {
  country: string
  currency: 'EUR'
  vat: number
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

export interface PaymentNotification {
  charged: boolean
}

export interface Locale {
  langs: string[]
  currency: 'EUR'
  localize (lang: keyof LocaleMap, currency: string, cents: number): string
  localize (lang: keyof LocaleMaps, key: keyof LocaleMap): string
  lang (lang: keyof LocaleMap): keyof LocaleMap
  set (key: string, locales: KVMap<string>): Locale
}

export type LocaleMaps = { [ lang: string ]: LocaleMap }

export type LocaleMap = { [ key: string]: string }

export type KVMap<V> = { [key: string]: V }
