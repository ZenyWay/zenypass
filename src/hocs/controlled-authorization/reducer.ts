/**
 * Clément Bonet
 */
//
import createAutomataReducer from 'automata-reducer'
import { propCursor, into } from 'basic-cursors'
import compose from 'basic-compose'
import { forType, mapPayload } from '../../utils'

const inProps = propCursor('props')
const intoToken = into('token')
const intoError = into('error')
const intoErrorPassword = into('errorPassword')
const mapPayloadIntoError = intoError(mapPayload())

const automata = {
  init: {
    CLICK: 'authenticating'
  },
  authenticating: {
    CANCEL: ['init', intoErrorPassword(mapPayload((x) => null))],
    PASSWORD: 'auth_request'
  },
  auth_request: {
    SERVER_TOKEN: ['authorizing', intoToken(mapPayload())],
    SERVER_ERROR: ['init', mapPayloadIntoError],
    AUTH_ERROR: ['authenticating', intoErrorPassword(mapPayload())]
  },
  authorizing: {
    SERVER_DONE: 'init',
    SERVER_ERROR: ['init', mapPayloadIntoError]
  }
}

export default compose.into(0)(
  createAutomataReducer(automata, 'init'),
  forType('PROPS')(inProps(mapPayload()))
)
