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
import { always } from 'utils'

export type MenuSpec = (MenuItemSpec[] | MenuItemSpec)[]

export interface MenuItemSpec {
  'data-id'?: string
  label?: string
  icon?: string[] | string
  href?: string
  disabled?: boolean
}

export function localizeMenu (
  l10ns: KVs<L10nTag>,
  menu: MenuSpec,
  exclude: (locale: string, item: MenuItemSpec) => boolean = always(false)
): KVs<MenuSpec> {
  return Object.keys(l10ns).reduce(
    function (specs: KVs<MenuSpec>, locale: string) {
      const t = l10ns[locale]
      specs[locale] = menu
        .filter(item => Array.isArray(item) || !exclude(locale, item))
        .map(localizeItem)
      return specs

      function localizeItem (item: MenuItemSpec[] | MenuItemSpec) {
        return Array.isArray(item)
          ? item.map(localizeItem)
          : {
              ...item,
              label: t(item.label),
              href: t(item.href)
            }
      }
    },
    {} as KVs<MenuSpec>
  )
}

export function mergeLocalizedMenus (
  menu: KVs<MenuSpec>,
  ...menus: KVs<MenuSpec>[]
): KVs<MenuSpec> {
  const result = {} as KVs<MenuSpec>
  for (const lang of Object.keys(menu)) {
    result[lang] = menu[lang]
    for (const other of menus) {
      result[lang] = mergeMenus(menu[lang], other[lang])
    }
  }
  return result
}

export function mergeMenus (dst: MenuSpec, src: MenuSpec): MenuSpec {
  return src.reduce(mergeItemIntoMenu, dst)
}

function mergeItemIntoMenu (
  menu: MenuSpec,
  item: MenuItemSpec[] | MenuItemSpec
) {
  const index = findItemIndex(menu, item)
  return index < 0 ? [item].concat(menu) : mergeItemIntoIndex(menu, item, index)
}

function mergeItemIntoIndex (
  menu: MenuSpec,
  item: MenuItemSpec[] | MenuItemSpec,
  index: number
) {
  const result = menu.slice()
  result[index] = mergeItems(menu[index], item)
  return result
}

function mergeItems (
  dst: MenuItemSpec[] | MenuItemSpec,
  src: MenuItemSpec[] | MenuItemSpec
): MenuItemSpec[] | MenuItemSpec {
  return !Array.isArray(dst) || !Array.isArray(src)
    ? src
    : src.concat(dst.slice(1))
}

function findItemIndex (menu: MenuSpec, item: MenuItemSpec[] | MenuItemSpec) {
  const itemId = getItemId(item)
  let i = menu.length
  while (i--) {
    const entry = menu[i]
    if (getItemId(entry) === itemId) return i
  }
  return -1
}

function getItemId (item: MenuItemSpec[] | MenuItemSpec) {
  return !Array.isArray(item) ? item['data-id'] : getItemId(item[0])
}
