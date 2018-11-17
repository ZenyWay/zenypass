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

import { KVs, L10nTag } from 'basic-l10n'

export type MenuSpec = (MenuItemSpec[] | MenuItemSpec)[]

export interface MenuItemSpec {
  label?: string
  icon?: string[] | string
  href?: string
  disabled?: boolean
}

export function localizeMenu (l10ns: KVs<L10nTag>, menu: MenuSpec): KVs<MenuSpec> {
  return Object.keys(l10ns).reduce(
    function (specs: KVs<MenuSpec>, locale: string) {
      const t = l10ns[locale]
      specs[locale] = menu.map(localizeItem)
      return specs

      function localizeItem (item: MenuItemSpec[] | MenuItemSpec) {
        return Array.isArray(item)
          ? item.map(localizeItem)
          : {
            ...item,
            label: t(item.label),
            href: t(item.href) }
      }
    },
    {} as KVs<MenuSpec>
  )
}
