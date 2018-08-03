/* eslint-env jasmine */
/**
 * Copyright 2018 ZenyWay S.A.S., Stephane M. Catala
 * @author Stephane M. Catala
 * @author Clement Bonet
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
import { Observable, of as observable, throwError } from 'rxjs'
import { TestScheduler } from 'rxjs/testing'
import { concat, ignoreElements, take } from 'rxjs/operators'
import { getAgentsOnAuthenticated } from '../../src/hocs/controlled-authorization-page/effects'
import { event, assertDeepEqual } from '../helpers'

let scheduler: TestScheduler
beforeEach(() => {
  scheduler = new TestScheduler(assertDeepEqual)
})

describe('effect: getAgentsOnAuthenticated:', () => {
  let fut: Function
  let getAuthorizations$: jasmine.Spy
  let SESSION_ID: string
  beforeEach(() => {
    getAuthorizations$ = jasmine.createSpy('getAuthorizations$')
    SESSION_ID = SESSION_ID
  })

  beforeEach(() => {
    fut = getAgentsOnAuthenticated({ getAuthorizations$ })
  })

  describe('on a `AUTHENTICATED` event:', () => {
    let SERVER_ERROR: string
    let onServerError: Function
    let AUTHENTICATED: string
    let authenticated: Function
    let UNAUTHORIZED: string
    let AGENTS: string
    let agents: Function
    let authenticationError: Function
    let AUTHENTICATING: string
    let DEFAULT: string

    beforeEach(() => {
      SERVER_ERROR = 'SERVER_ERROR'
      onServerError = event(SERVER_ERROR)
      AGENTS = 'AGENTS'
      AUTHENTICATED = 'AUTHENTICATED'
      authenticated = event(AUTHENTICATED)
      AGENTS = 'AGENTS'
      agents = event(AGENTS)
      UNAUTHORIZED = 'UNAUTHORIZED'
      authenticationError = event(UNAUTHORIZED)
      AUTHENTICATING = 'authenticating'
      DEFAULT = 'default'
    })

    it('should call `getAuthorization$` with that sessionID', () => {
      scheduler.run(({ cold, hot, expectObservable }) => {
        const event$ = hot('^--s', { s: authenticated(SESSION_ID) })
        const state$ = hot('^-')
        getAuthorizations$
          .and.returnValue(cold('--a', { a: 'AGENTS' }))
        const result$ = fut(event$, state$).pipe(ignoreElements())
        expectObservable(result$).toBe('-')
      })
      expect(getAuthorizations$).toHaveBeenCalledTimes(1)
      expect(getAuthorizations$).toHaveBeenCalledWith(SESSION_ID)
    })

    it('should call `getAuthorization$` on each `AUTHENTICATED` event', () => {
      scheduler.run(({ cold, hot, expectObservable }) => {
        const event$ = hot('^--s--s', { s: authenticated(SESSION_ID) })
        const state$ = hot('^-')
        getAuthorizations$
          .and.returnValue(cold('--a', { a: 'AGENTS' }))
        const result$ = fut(event$, state$).pipe(ignoreElements())
        expectObservable(result$).toBe('-')
      })
      expect(getAuthorizations$).toHaveBeenCalledTimes(2)
    })

    describe('when the sessionId is valid', () => {
      it('should emit a `SERVER_TOKEN` event', () => {
        scheduler.run(({ cold, hot, expectObservable }) => {
          const event$ = hot('^--s', { s: authenticated(SESSION_ID) })
          const state$ = hot('^-')
          getAuthorizations$
            .and.returnValue(cold('--a', { a: 'AGENTS' }))
          const result$ = fut(event$, state$).pipe(take(1))
          expectObservable(result$).toBe('-----(a|)', { a: agents('AGENTS') })
        })
      })
    })

    describe('when the sessionId is invalid', () => {
      let err: Error & { status?: number }
      beforeEach(() => {
        err = new Error('UNAUTHORIZED')
        err.status = 401
      })
      it('should emit a `UNAUTHORIZED` event', () => {
        scheduler.run(({ expectObservable, cold, hot }) => {
          const event$ = hot('^--s', { s: authenticated(SESSION_ID) })
          const state$ = hot('^-')
          getAuthorizations$.and.returnValue(cold('--#', void 0, err))
          const result$ = fut(event$,state$)
          expectObservable(result$).toBe('-----e',
          { e: authenticationError('UNAUTHORIZED') })
        })
      })
    })

    describe('on an error from the authorization service or wrong sessionId', () => {
      let err: Error & { status?: number }
      beforeEach(() => {
        err = new Error(/* malformed error */)
        err.status = 402
      })
      it('should emit a well-formed `SERVER_ERROR` event', () => {
        scheduler.run(({ expectObservable, cold, hot }) => {
          const event$ = hot('^--s', { s: authenticated(SESSION_ID) })
          const state$ = hot('^-')
          getAuthorizations$.and.returnValue(cold('--#', void 0, err))
          const result$ = fut(event$,state$)
          expectObservable(result$).toBe('-----e',
          { e: onServerError('ERROR 402') })
        })
      })
    })

    describe('when the state$ stream completes', () => {
      it('should complete', () => {
        scheduler.run(({ expectObservable, cold, hot }) => {
          const event$ = hot('^s', { s: authenticated(SESSION_ID) })
          const state$ = hot('^-d----|', { d: { state: DEFAULT } })
          getAuthorizations$.and.returnValue(cold('--a',
            { a: 'AGENTS' }))
          const result$ = fut(event$,state$)
          expectObservable(result$).toBe('---a---|',
          { a: agents('AGENTS') })
        })
      })
    })

    describe('when getAuthorization$ completes', () => {
      it('should not complete before state$ completes', () => {
        scheduler.run(({ expectObservable, cold, hot }) => {
          const event$ = hot('^s', { s: authenticated(SESSION_ID) })
          const state$ = hot('^-d-----|', { d: { state: DEFAULT } })
          getAuthorizations$.and.returnValue(cold('--a-|',
            { a: 'AGENTS' }))
          const result$ = fut(event$,state$)
          expectObservable(result$).toBe('---a----|',
          { a: agents('AGENTS') })
        })
      })
    })

  })
})
