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

const INVALID_EMAIL = /^(?:[^@]*|@.*|.*@|[^@]+@[^@]*@.*|.*\.|.*@\.[^@]+|.*@[^@.]+|.*[\n(){}\/\\<>]+.*)$/m

/**
 * an email is considered invalid when at least one of the following applies:
 * - it does not include a `@` character
 * - it starts or ends with a `@`
 * - it includes more than one `@`
 * - it ends with a dot
 * - a dot immediately follows the last `@`
 * - no dot follows the last `@`
 * note that if none of the above apply,
 * the email might still be invalid...
 */
export function isInvalidEmail(email: string) {
  return INVALID_EMAIL.test(email)
}
