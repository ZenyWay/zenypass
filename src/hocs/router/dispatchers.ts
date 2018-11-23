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

import {
  createActionFactories,
  createActionFactory,
  StandardAction
} from 'basic-fsa-factories'

const actions = createActionFactories({
  devices: 'DEVICES',
  storage: 'STORAGE',
  locale: 'LOCALE',
  help: 'HELP',
  logout: 'LOGOUT'
})
const link = createActionFactory('LINK')
const selectMenuItem = createActionFactory('SELECT_MENU_ITEM')
const fatal = createActionFactory('FATAL')

export function actionFromMenuItem (item: HTMLElement) {
  return isLinkItem(item) ? link(item) : actionFromNonLinkMenuItem(item)
}

function isLinkItem (item: any): item is HTMLLinkElement {
  const { baseURI, href } = item || {} as HTMLLinkElement
  return href && (href.indexOf(baseURI) < 0)
}

const MENU_ITEM_REGEX = /^([\w-]+)(?:\/([\w-]+))?$/

function actionFromNonLinkMenuItem (item: HTMLElement): StandardAction<any> {
  const { id } = item.dataset
  const [_, type, param] = MENU_ITEM_REGEX.exec(id) || [] as string[]
  const action = type && actions[type]
  return action ? action(param) : selectMenuItem(item)
}

export function actionFromError (error?: any): StandardAction<any> {
  const action = isUnauthorizedOrClosed(error) ? actions.logout : fatal
  return action(error)
}

const UNAUTHORIZED_OR_CLOSED_CODES = [401, 403, 499]

function isUnauthorizedOrClosed (error) {
  return error && UNAUTHORIZED_OR_CLOSED_CODES.indexOf(error.status) >= 0
}
