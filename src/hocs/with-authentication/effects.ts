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
import { StandardAction } from 'basic-fsa-factories'
import { Observable, Observer, throwError, of as observable, merge } from 'rxjs'
import {
  defaultIfEmpty,
  filter,
  first,
  ignoreElements,
  last,
  map,
  switchAll,
  takeUntil,
  tap
} from 'rxjs/operators'
import { newStatusError, ERROR_STATUS } from 'utils'

// const log = (label: string) => console.log.bind(console, label)

const CANCELLED_ERROR = newStatusError(ERROR_STATUS.CLIENT_CLOSED_REQUEST)

export function plugResponse (
  event$: Observable<StandardAction<any>>,
  state$: Observable<any>
) {
  const err$$ = event$.pipe(
    filter(({ type }) => type === 'AUTHENTICATION_REJECTED'),
    map(() => throwError(CANCELLED_ERROR))
  )
  const res$$ = event$.pipe(
    filter(({ type }) => type === 'AUTHENTICATION_RESOLVED'),
    map(({ payload }) => observable(payload))
  )
  // result$$ completes when component unmounts
  const result$$ = merge(err$$, res$$).pipe(
    takeUntil(state$.pipe(last()))
  )

  return event$.pipe(
    filter(({ type }) => type === 'AUTHENTICATION_REQUESTED'),
    tap(
      ({ payload: result$ }) => plug(result$$, result$, throwError(CANCELLED_ERROR))
    ),
    ignoreElements()
  )
}

function plug <T> (
  source$$: Observable<Observable<T>>, // assumption: hot Observable
  sink$: Observer<T>,
  alt: Observable<T>
) {
  // unsubscribe when source errors or completes
  source$$.pipe(defaultIfEmpty(alt), first(), switchAll()).subscribe(sink$)
}
