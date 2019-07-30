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

import { isString, localizeMenu, MenuItemSpec } from 'utils'
import createL10ns from 'basic-l10n'
const l10ns = createL10ns(require('./locales.json'))
const locale = require('./locale.json')
const LOCALE_REGEXP = /^locale\/(\w+)$/
const LOCALE_MENU = localizeMenu(l10ns, locale, excludeCurrentLocale)

export const LOCALES = Object.keys(l10ns)
export const DEFAULT_LOCALE = LOCALES[0]

export default {
  '/': localizeMenu(
    l10ns,
    assemble(require('./homepage.json'), {
      locale,
      storage: require('./storage.json'),
      help: require('./help.json')
    }),
    excludeCurrentLocale
  ),
  '/authorize': LOCALE_MENU,
  '/signup': LOCALE_MENU,
  '/signin': LOCALE_MENU
}

function assemble<T> (
  root: (T | string)[],
  branches: { [key: string]: T[] }
): (T[] | T)[] {
  return root.map(entry => (isString(entry) ? branches[entry] : entry))
}

function excludeCurrentLocale (locale: string, item: MenuItemSpec) {
  const match = LOCALE_REGEXP.exec(item['data-id'])
  return match && match[1] === locale
}
