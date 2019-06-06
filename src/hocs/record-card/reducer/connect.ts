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
import createAutomataReducer, { AutomataSpec } from 'automata-reducer'
import { createActionFactory } from 'basic-fsa-factories'
import { propCursor, into } from 'basic-cursors'
import compose from 'basic-compose'
import { Reducer, alt, always, mapPayload, withEventGuards } from 'utils'

/**
 * type                           url   identifier   password   action after decrypting password   example
 * note                           no    no           no         no action
 * access code                    no    no           yes        open connection modal              wifi password, tablet or smartphone password, code for a vault or facility access
 * ???                            no    yes          no         no action
 * credentials                    no    yes          yes        open connection modal              credit card, desktop app
 * bookmark                       yes   no           no         no action
 * ???                            yes   no           yes        open connection modal
 * password-less online account   yes   yes          no         open connection modal              medium
 * standard online account        yes   yes          yes        open connection modal
 */
export enum ConnectFsmState {
  Idle = 'IDLE',
  Connecting = 'CONNECTING',
  PendingConnect = 'PENDING_CONNECT',
  PendingClearClipboard = 'PENDING_CLEAR_CLIPBOARD'
}

const inChanges = prop =>
  compose<Reducer<any>>(
    propCursor('changes'),
    propCursor(prop)
  )

const clearPassword = inChanges('password')(always(void 0))
const mapPayloadToPassword = inChanges('password')(mapPayload(alt()('')))
const mapPayloadToError = into('error')(mapPayload())

const connectAutomata: AutomataSpec<ConnectFsmState> = {
  [ConnectFsmState.Idle]: {
    CONNECT: ConnectFsmState.PendingConnect,
    PASSWORD_COPIED: ConnectFsmState.PendingClearClipboard
  },
  [ConnectFsmState.Connecting]: {
    CLEAN_CONNECT_CANCEL: [ConnectFsmState.Idle, clearPassword],
    CLEAN_CONNECT_CLOSE: [ConnectFsmState.Idle, clearPassword],
    DIRTY_CONNECT_CLOSE: [ConnectFsmState.PendingClearClipboard, clearPassword],
    CLIPBOARD_CLEARED: [ConnectFsmState.Idle, clearPassword],
    CLIPBOARD_COPY_ERROR: [ConnectFsmState.PendingClearClipboard, clearPassword]
  },
  [ConnectFsmState.PendingConnect]: {
    CLEARTEXT_REJECTED: [ConnectFsmState.Idle, mapPayloadToError],
    CLEARTEXT_RESOLVED: [ConnectFsmState.Connecting, mapPayloadToPassword]
  },
  [ConnectFsmState.PendingClearClipboard]: {
    CLIPBOARD_CLEARED: ConnectFsmState.Idle,
    CLIPBOARD_COPY_ERROR: ConnectFsmState.Idle // TODO
  }
}

const reducer = createAutomataReducer(connectAutomata, ConnectFsmState.Idle, {
  key: 'connect'
})

const connect = createActionFactory('CONNECT')
const open = createActionFactory('OPEN')

export default withEventGuards({
  CONNECT_REQUEST: (_, { props: { record: { password } = {} as any } }) =>
    (password || password === '' ? open : connect)()
})(reducer)
