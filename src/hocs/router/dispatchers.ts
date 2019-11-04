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

const MENU_ACTIONS = createActionFactories({
  authorizations: 'AUTHORIZATIONS',
  storage: 'STORAGE',
  import: 'IMPORT',
  locale: ['UPDATE_QUERY_PARAM', lang => ['lang', lang]],
  help: 'HELP',
  logout: 'LOGOUT'
})
const externalLink = createActionFactory('EXTERNAL_LINK')
const internalLink = createActionFactory('INTERNAL_LINK')
const selectMenuItem = createActionFactory('SELECT_MENU_ITEM')
const fatalError = createActionFactory('FATAL_ERROR')

export function actionFromMenuItem (item: HTMLElement) {
  return !isLinkMenuItem(item)
    ? actionFromNonLinkMenuItem(item)
    : isExternalLinkItem(item)
    ? externalLink(item)
    : internalLink(item)
}

/**
 * assert that item.href is a different URL than item.baseURI with an empty hash.
 */
function isLinkMenuItem (item: any): item is HTMLAnchorElement {
  if (!item || !(item as any).href) return false
  const baseURL = new URL(item.baseURI)
  baseURL.hash = ''
  return item.href !== baseURL.href + '#'
}

function isExternalLinkItem (item: HTMLAnchorElement): boolean {
  return item.origin !== new URL(item.baseURI).origin
}

const MENU_ITEM_REGEX = /^([\w-]+)(?:\/([\w-]+))?$/

function actionFromNonLinkMenuItem (item: HTMLElement): StandardAction<any> {
  const { id } = item.dataset
  const [_, type, param] = MENU_ITEM_REGEX.exec(id) || ([] as string[])
  const action = type && MENU_ACTIONS[type]
  return action ? action(param) : selectMenuItem(item)
}

export function actionFromError (error?: any): StandardAction<any> {
  const action = isUnauthorizedOrClosed(error)
    ? MENU_ACTIONS.logout
    : fatalError
  return action(error)
}

const UNAUTHORIZED_OR_CLOSED_CODES = [401, 403, 499]

function isUnauthorizedOrClosed (error) {
  return error && UNAUTHORIZED_OR_CLOSED_CODES.indexOf(error.status) >= 0
}
