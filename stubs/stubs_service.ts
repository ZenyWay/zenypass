/*
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
import { interval, NEVER, of as observable, Observable, throwError } from 'rxjs'
import { concat, takeUntil, delay } from 'rxjs/operators'

const TOKEN_DELAY = 1000 // ms
const AUTH_DELAY = 10000 // ms

/**
 * stub for authorize method of ZP service
 */
export default function authorize (password: string): Observable<string> {
  const complete$ = interval(AUTH_DELAY)
  const error$ = throwError(errorPassword({ 'name': 'erroor','message': 'errOOR','status': 401 })).pipe(delay(50))

  return observable('BCDE FGHI JKLN').pipe(
    delay(TOKEN_DELAY),
    concat(NEVER),
    takeUntil(complete$)
  )
 /*test erreur 401
  return error$.pipe(
    concat(observable('KKKK LLLL MMMM')),
    concat(NEVER),
    takeUntil(complete$)
  )// */
}

interface StatusError extends Error {
  status: number
}

function errorPassword (status: StatusError) {
  return status
}
