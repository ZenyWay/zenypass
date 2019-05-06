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
//
export interface StatusError extends Error {
  status: ERROR_STATUS
}

export enum ERROR_STATUS {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  REQUEST_TIMEOUT = 408,
  CONFLICT = 409,
  CLIENT_CLOSED_REQUEST = 499,
  INTERNAL_SERVER_ERROR = 500,
  GATEWAY_TIMEOUT = 504
}

export function newStatusError (
  status = ERROR_STATUS.INTERNAL_SERVER_ERROR,
  message = ''
) {
  const err = new Error(message) as StatusError
  err.status = status
  return err
}

export function stringifyError (err?: any): string {
  const str = err && err.toString()
  const status = err && err.status
  return status ? `${str} (${status})` : str
}
