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
import { getTokenOnClickFromInit } from '../../src/hocs/controlled-authorization/effects'
import { event, assertDeepEqual } from '../helpers'

let scheduler: TestScheduler
beforeEach(() => {
  scheduler = new TestScheduler(assertDeepEqual)
})

describe('effect: getTokenOnClickFromInit:', () => {
  let fut: Function
  let authorize: jasmine.Spy
  let sessionId: string
  beforeEach(() => {
    authorize = jasmine.createSpy('authorize')
    sessionId = '42'
  })

  beforeEach(() => {
    fut = getTokenOnClickFromInit({ authorize })
  })

  it('exampe of marble test', () => {
    scheduler.run(({ cold, hot, expectObservable }) => {
      const one$ = cold('x-x|', { x: 'foo' })
      const two$ = cold('-y|', { y: 42 })
      expectObservable(one$.pipe(concat(two$))).toBe('a-a-b|', {
        a: 'foo',
        b: 42
      })
    })
  })

  describe('on a `AUTHENTICATED` event:', () => {
    let AUTHENTICATING: string
    let AUTHORIZING: string
    let SERVER_ERROR: string
    let onServerError: Function
    let SERVER_DONE: string
    let onServerDone: Function
    let AUTHENTICATED: string
    let TOKEN: string
    let sessionId: Function
    let token: Function
    let CLICK: string
    let click: Function

    beforeEach(() => {
      SERVER_ERROR = 'SERVER_ERROR'
      onServerError = event(SERVER_ERROR)
      AUTHENTICATING = 'authenticating'
      AUTHORIZING = 'authorizing'
      SERVER_DONE = 'SERVER_DONE'
      onServerDone = event(SERVER_DONE)
      TOKEN = 'SERVER_TOKEN'
      token = event(TOKEN)
      AUTHENTICATED = 'AUTHENTICATED'
      sessionId = event(AUTHENTICATED)
      CLICK = 'CLICK'
      click = event(CLICK)
    })

    it('should call `authorize` with that sessionID', () => {
      scheduler.run(({ cold, hot, expectObservable }) => {
        const event$ = hot('^--s', { s: sessionId('42') })
        const state$ = hot('^-')
        authorize
          .and.returnValue(cold('--t', { t: 'RANDOM_TOKEN' }))
        const result$ = fut(event$, state$).pipe(ignoreElements())
        expectObservable(result$).toBe('-')
      })
      expect(authorize).toHaveBeenCalledTimes(1)
      expect(authorize).toHaveBeenCalledWith('42')
    })

    it('should call `authorize` on each `AUTHENTICATED` event', () => {
      scheduler.run(({ cold, hot, expectObservable }) => {
        const event$ = hot('^--s--s', { s: sessionId('42') })
        const state$ = hot('^-')
        authorize
          .and.returnValue(cold('--t', { t: 'RANDOM_TOKEN' }))
        const result$ = fut(event$, state$).pipe(ignoreElements())
        expectObservable(result$).toBe('-')
      })
      expect(authorize).toHaveBeenCalledTimes(2)
    })

    it('should call `authorize` even after a `CANCEL` event', () => {
      scheduler.run(({ cold, hot, expectObservable }) => {
        const event$ = hot('^--s-c-s', { s: sessionId('42'), c: click() })
        const state$ = hot('^-ab-a-b', { a: AUTHENTICATING, b: AUTHORIZING })
        authorize
          .and.returnValue(cold('-'))
        const result$ = fut(event$, state$).pipe(ignoreElements())
        expectObservable(result$).toBe('-')
      })
      expect(authorize).toHaveBeenCalledTimes(2)
    })

    describe('when the sessionId is valid', () => {
      it('should emit a `SERVER_TOKEN` event', () => {
        scheduler.run(({ cold, hot, expectObservable }) => {
          const event$ = hot('^--s', { s: sessionId('42') })
          const state$ = hot('^-')
          authorize
            .and.returnValue(cold('--t', { t: 'RANDOM_TOKEN' }))
          const result$ = fut(event$, state$).pipe(take(1))
          expectObservable(result$).toBe('-----(t|)', { t: token('RANDOM_TOKEN') })
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
          const event$ = hot('^--s', { s: sessionId('42') })
          const state$ = hot('^-')
          authorize.and.returnValue(cold('--#', void 0, err))
          const result$ = fut(event$,state$)
          expectObservable(result$).toBe('-----e',
          { e: onServerError('ERROR 402') })
        })
      })
    })

    describe('on a cancel event', () => {
      it('should emit a `SERVER_DONE` event', () => {
        scheduler.run(({ expectObservable, cold, hot }) => {
          const event$ = hot('^--s---c', { s: sessionId('42'), c: click() })
          const state$ = hot('^--a-b-', { a: { state: AUTHENTICATING },
            b: { state: AUTHORIZING } })
          authorize.and.returnValue(cold('--t',
          { t: 'RANDOM_TOKEN' }))
          const result$ = fut(event$,state$)
          expectObservable(result$).toBe('-----t-d',
          { d: onServerDone(), t: token('RANDOM_TOKEN') })
        })
      })
    })

    describe('when the state$ stream completes', () => {
      it('should complete', () => {
        scheduler.run(({ expectObservable, cold, hot }) => {
          const event$ = hot('^s', { s: sessionId('42') })
          const state$ = hot('^b------|', { b: { state: AUTHENTICATING } })
          authorize.and.returnValue(cold('--t',
            { t: 'RANDOM_TOKEN' }))
          const result$ = fut(event$,state$)
          expectObservable(result$).toBe('---t----(d|)',
          { t: token('RANDOM_TOKEN'),d: onServerDone() })
        })
      })
    })

    describe('when authorize completes', () => {
      it('should not complete before state$ completes', () => {
        scheduler.run(({ expectObservable, cold, hot }) => {
          const event$ = hot('^s', { s: sessionId('42') })
          const state$ = hot('^b------|', { b: { state: AUTHENTICATING } })
          authorize.and.returnValue(cold('--t-|',
            { t: 'RANDOM_TOKEN' }))
          const result$ = fut(event$,state$)
          expectObservable(result$).toBe('---t-d--|',
          { t: token('RANDOM_TOKEN'),d: onServerDone() })
        })
      })
    })

  })
})
