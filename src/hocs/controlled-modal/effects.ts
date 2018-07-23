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
  ignoreElements,
  filter,
  map,
  sample
} from 'rxjs/operators'

function callOnSubmit (event$, state$) {
  const submit$ = event$.pipe(filter(ofType('SUBMIT')))

  return state$.pipe(
    sample(submit$), // TODO check if sample triggers on blur$ complete
    filter(hasSubmitHandler),
    map(callSubmitHandler),
    ignoreElements()
  )
}

function hasSubmitHandler ({ props }) {
  return !!props.onSubmit
}

function ofType (type) {
  return function (event) {
    return event.type === type
  }
}

function callSubmitHandler ({ props, value }) {
  props.onSubmit(value)
}

export default [callOnSubmit]
