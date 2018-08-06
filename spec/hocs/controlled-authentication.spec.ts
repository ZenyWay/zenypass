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
import { authenticateOnSubmit } from '../../src/hocs/controlled-authentication-modal/effects'
import { event, assertDeepEqual } from '../helpers'

let scheduler: TestScheduler
beforeEach(() => {
  scheduler = new TestScheduler(assertDeepEqual)
})

describe('effect: authenticateOnSubmit:', () => {
  let fut: Function
  let authenticate: jasmine.Spy
  let onAuthenticated: jasmine.Spy
  let PASSWORD: string
  let sessionId: string
  beforeEach(() => {
    authenticate = jasmine.createSpy('authenticate')
    PASSWORD = 'p@ssw0rd!'
    onAuthenticated = jasmine.createSpy('onAuthenticated')
  })

  beforeEach(() => {
    fut = authenticateOnSubmit({ authenticate })
  })

  describe('on a `SUBMIT` event:', () => {
    let submit: Function
    let SUBMIT: string
    let props: object
    let DONE: string
    let done: Function
    let AUTHENTICATION_DONE: string
    let AUTHENTICATED: string
    let sessionId: Function
    let UNAUTHORIZED: string
    let authenticationError: Function
    let SERVER_ERROR: string
    let onServerError: Function
    let CANCEL: string
    let cancel: Function

    beforeEach(() => {
      SUBMIT = 'SUBMIT'
      submit = event(SUBMIT)
      props = { onAuthenticated }
      AUTHENTICATION_DONE = 'AUTHENTICATION_DONE'
      done = event(AUTHENTICATION_DONE)
      AUTHENTICATED = 'AUTHENTICATED'
      sessionId = event(AUTHENTICATED)
      UNAUTHORIZED = 'UNAUTHORIZED'
      authenticationError = event(UNAUTHORIZED)
      SERVER_ERROR = 'SERVER_ERROR'
      onServerError = event(SERVER_ERROR)
      CANCEL = 'CANCEL'
      cancel = event(CANCEL)
    })

    it('should call `authenticate` with that password', () => {
      scheduler.run(({ cold, hot, expectObservable }) => {
        const event$ = hot('^--s', { s: submit() })
        const state$ = hot('^-s-', { s: { value: PASSWORD, props } })
        authenticate
          .and.returnValue(cold('-'))
        const result$ = fut(event$, state$).pipe(ignoreElements())
        expectObservable(result$).toBe('-')
      })
      expect(authenticate).toHaveBeenCalledTimes(1)
      expect(authenticate).toHaveBeenCalledWith(PASSWORD)
    })

    it('should call `authenticate` on each SUBMIT event', () => {
      scheduler.run(({ cold, hot, expectObservable }) => {
        const event$ = hot('^--s--s', { s: submit() })
        const state$ = hot('^-s-', { s: { value: PASSWORD, props } })
        authenticate
          .and.returnValue(cold('-'))
        const result$ = fut(event$, state$).pipe(ignoreElements())
        expectObservable(result$).toBe('-')
      })
      expect(authenticate).toHaveBeenCalledTimes(2)
    })

    describe('when the password is valid', () => {
      it('should emit a `AUTHENTICATION_DONE` event', () => {
        scheduler.run(({ cold, hot, expectObservable }) => {
          const event$ = hot('^--s', { s: submit() })
          const state$ = hot('^-s', { s: { value: PASSWORD, props } })
          authenticate
            .and.returnValue(cold('--s', { s: '42' }))
          const result$ = fut(event$, state$)
          expectObservable(result$).toBe('-----d',
            { d: done() })
        })
      })
    })

    describe('when the password is invalid', () => {
      let err: Error & { status?: number }
      beforeEach(() => {
        err = new Error('UNAUTHORIZED')
        err.status = 401
      })
      it('should emit a `UNAUTHORIZED` event', () => {
        scheduler.run(({ expectObservable, cold, hot }) => {
          const event$ = hot('^--s', { s: submit() })
          const state$ = hot('^-s', { s: { value: PASSWORD, props } })
          authenticate.and.returnValue(cold('--#', void 0, err))
          const result$ = fut(event$,state$)
          expectObservable(result$).toBe('-----e',
          { e: authenticationError('UNAUTHORIZED') })
        })
      })
    })

    describe('when there is a service error', () => {
      let err: Error & { status?: number }
      beforeEach(() => {
        err = new Error()
        err.status = 402
      })
      it('should emit a `SERVER_ERROR` event', () => {
        scheduler.run(({ expectObservable, cold, hot }) => {
          const event$ = hot('^--s', { s: submit() })
          const state$ = hot('^-s', { s: { value: PASSWORD, props } })
          authenticate.and.returnValue(cold('--#', void 0, err))
          const result$ = fut(event$,state$)
          expectObservable(result$).toBe('-----e',
          { e: onServerError('ERROR 402') })
        })
      })
    })

    describe('when state$ completes', () => {
      it('should complete', () => {
        scheduler.run(({ expectObservable, cold, hot }) => {
          const event$ = hot('^--s', { s: submit() })
          const state$ = hot('^-s-------|', { s: { value: PASSWORD, props } })
          authenticate.and.returnValue(cold('--s', { s: '42' }))
          const result$ = fut(event$,state$)
          expectObservable(result$).toBe('-----d----|', { d: done() })
        })
      })
    })

    describe('when authenticate completes', () => {
      it('should not complete before state$ completes', () => {
        scheduler.run(({ expectObservable, cold, hot }) => {
          const event$ = hot('^-s', { s: submit() })
          const state$ = hot('^s---|', { s: { value: PASSWORD, props } })
          authenticate.and.returnValue(cold('--s-|', { s: '42' }))
          const result$ = fut(event$,state$)
          expectObservable(result$).toBe('----d|', { d: done() })
        })
      })
    })

    it('should call `authenticate` even after a `CANCEL` event', () => {
      scheduler.run(({ cold, hot, expectObservable }) => {
        const event$ = hot('^--s-c-s', { s: submit(), c: cancel() })
        const state$ = hot('^s-----', { s: { value: PASSWORD, props } })
        authenticate
          .and.returnValue(cold('-'))
        const result$ = fut(event$, state$).pipe(ignoreElements())
        expectObservable(result$).toBe('-')
      })
      expect(authenticate).toHaveBeenCalledTimes(2)
    })

  })
})
