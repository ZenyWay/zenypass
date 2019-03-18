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

import createAutomataReducer, { AutomataSpec } from 'automata-reducer'
import { createActionFactory } from 'basic-fsa-factories'
import { into, propCursor } from 'basic-cursors'
import compose from 'basic-compose'
import {
  always,
  isInvalidEmail,
  forType,
  mapEvents,
  mapPayload,
  mergePayload,
  not,
  omit,
  pick,
  mapEventOn
} from 'utils'

export interface SignupPageHocProps {
  email?: string
  onAuthorize?: () => void
  onEmailChange?: (email?: string) => void
  onError?: (error?: any) => void
  onSignedUp?: () => void
  onSignin?: () => void
}

export enum ValidityFsm {
  Invalid = 'INVALID',
  InvalidEmail = 'INVALID_EMAIL',
  InvalidPassword = 'INVALID_PASSWORD',
  Tbc = 'TBC',
  Confirmed = 'CONFIRMED',
  Consents = 'CONSENTS',
  Submittable = 'SUBMITTABLE'
}

export enum SignupFsm {
  Idle = 'IDLE',
  Pending = 'PENDING',
  Error = 'ERROR'
}

const MIN_PASSWORD_LENGTH = 4
const isInvalidPassword = ({ password }) =>
  !password || password.length < MIN_PASSWORD_LENGTH
const isInvalidConfirm = ({ password, confirm }) =>
  !password || confirm !== password
const isEmailChange = (state, { payload }) =>
  (payload && payload.email) !== (state && state.email)
const error = createActionFactory<any>('ERROR')
const mapPayloadIntoPassword = into('password')(mapPayload())
const clearPassword = propCursor('password')(always(''))
const mapPayloadIntoConfirm = into('confirm')(mapPayload())
const clearConfirm = propCursor('confirm')(always(''))
const toggleNews = propCursor('news')(not())

const validityFsm: AutomataSpec<ValidityFsm> = {
  [ValidityFsm.Invalid]: {
    VALID_EMAIL: ValidityFsm.InvalidPassword,
    VALID_PASSWORD: ValidityFsm.InvalidEmail
  },
  [ValidityFsm.InvalidEmail]: {
    INVALID_PASSWORD: ValidityFsm.Invalid,
    VALID_EMAIL: ValidityFsm.Tbc
  },
  [ValidityFsm.InvalidPassword]: {
    INVALID_EMAIL: [ValidityFsm.Invalid, clearConfirm],
    VALID_EMAIL: clearPassword,
    clearConfirm,
    VALID_PASSWORD: ValidityFsm.Tbc
  },
  [ValidityFsm.Tbc]: {
    INVALID_EMAIL: [ValidityFsm.InvalidEmail, clearConfirm],
    INVALID_PASSWORD: ValidityFsm.InvalidPassword,
    VALID_EMAIL: clearConfirm,
    VALID_CONFIRM: ValidityFsm.Confirmed
  },
  [ValidityFsm.Confirmed]: {
    INVALID_EMAIL: [ValidityFsm.InvalidEmail, clearConfirm],
    INVALID_PASSWORD: ValidityFsm.InvalidPassword,
    INVALID_CONFIRM: ValidityFsm.Tbc,
    VALID_EMAIL: [ValidityFsm.Tbc, clearConfirm],
    VALID_PASSWORD: ValidityFsm.Tbc,
    SUBMIT: ValidityFsm.Consents
  },
  [ValidityFsm.Consents]: {
    TOGGLE_NEWS: toggleNews,
    TOGGLE_TERMS: ValidityFsm.Submittable
  },
  [ValidityFsm.Submittable]: {
    TOGGLE_NEWS: toggleNews,
    TOGGLE_TERMS: ValidityFsm.Consents,
    ERROR: [ValidityFsm.Tbc, clearConfirm],
    SIGNED_UP: [ValidityFsm.InvalidPassword, clearPassword, clearConfirm]
  }
}

const signupFsm: AutomataSpec<SignupFsm> = {
  [SignupFsm.Idle]: {
    ERROR: SignupFsm.Error,
    SIGNING_UP: SignupFsm.Pending
  },
  [SignupFsm.Pending]: {
    ERROR: SignupFsm.Error,
    SIGNED_UP: SignupFsm.Idle
  },
  [SignupFsm.Error]: {
    SIGNING_UP: SignupFsm.Pending
  }
}

const SELECTED_PROPS: (keyof SignupPageHocProps)[] = [
  'email',
  'onAuthorize',
  'onEmailChange',
  'onError',
  'onSignedUp',
  'onSignin'
]

export const reducer = compose.into(0)(
  compose(
    createAutomataReducer(validityFsm, ValidityFsm.Invalid, { key: 'valid' }),
    mapEvents({
      CHANGE_CONFIRM: [isInvalidConfirm, 'INVALID_CONFIRM', 'VALID_CONFIRM'],
      CHANGE_PASSWORD: [
        isInvalidPassword,
        'INVALID_PASSWORD',
        'VALID_PASSWORD'
      ],
      PROPS: [
        ({ email }) => isInvalidEmail(email),
        'INVALID_EMAIL',
        'VALID_EMAIL'
      ]
    })
  ),
  createAutomataReducer(signupFsm, SignupFsm.Idle, { key: 'signup' }),
  forType('CHANGE_PASSWORD')(
    compose.into(0)(clearConfirm, mapPayloadIntoPassword)
  ),
  forType('CHANGE_CONFIRM')(mapPayloadIntoConfirm),
  forType('INPUT_REF')(propCursor('inputs')(mergePayload())),
  forType('PROPS')(
    compose.into(0)(
      mergePayload(pick(SELECTED_PROPS)),
      into('attrs')(mapPayload(omit(SELECTED_PROPS))),
      compose(
        forType('CHANGE_EMAIL')(clearConfirm),
        mapEventOn(isEmailChange)('CHANGE_EMAIL')
      )
    )
  )
)
