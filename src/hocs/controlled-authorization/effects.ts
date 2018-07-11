/**
 * Clément Bonet
 */
//

import { createActionFactory, StandardAction } from "basic-fsa-factories"
import {
  catchError,
  concat,
  distinctUntilChanged,
  filter,
  map,
  pluck,
  sample,
  switchMap,
  takeUntil,
  tap,
  withLatestFrom
} from "rxjs/operators"
import { Observable, of as observable } from 'rxjs'
import authorize from '../../../stubs/stubs_service'

export { StandardAction}

const onServerToken = createActionFactory("SERVER_TOKEN")
const onServerError = createActionFactory("SERVER_ERROR")
const onServerDone = createActionFactory("SERVER_DONE")
const authenticationError = createActionFactory("AUTH_ERROR")

const log = (label: string) => console.log.bind(console, label)

function getTokenOnClickFromInit(event$, state$: Observable<{}>) {

  const authenticating$ = event$.pipe(
    filter(ofType('PASSWORD')),
    pluck('payload')
  )

  return authenticating$.pipe(
    switchMap(authorizeUntilCancel)
  )

  function authorizeUntilCancel (password) {
    const cancel$ = event$.pipe(
      filter(ofType('CLICK')),
      withLatestFrom(state$),
      pluck('1', 'state'),
      filter(isEqual('authorizing'))
    )

    return authorize(password).pipe(
      takeUntil(cancel$),
      map(onServerToken),
      concat(observable(onServerDone())),
      catchError(dealWithError)
    )
  }
}

function dealWithError(err) {
  const err$ = observable(err && err.message)
  return err$.pipe(err.status === 401
    ? map(authenticationError)
    : map(onServerError))
}

function isEqual(ref) {
  return function(val) {
    return ref === val
  }
}

function ofType(type) {
  return function(action) {
    return action.type === type
  }
}

export default [getTokenOnClickFromInit]
