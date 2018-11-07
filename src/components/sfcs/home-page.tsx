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
/** @jsx createElement */
import { createElement } from 'create-element'
import { Button } from 'bootstrap'
import { FAIconButton } from './fa-icon'
import { NavbarMenu, MenuSpecs } from '../navbar-menu'
import { FilteredRecordCards, Record } from '../filtered-record-cards'
import { Observer } from 'rxjs'

export interface HomePageProps {
  locale: string
  menu: MenuSpecs
  records: Record[]
  filter?: boolean
  session?: string
  onAuthenticationRequest?: (res$: Observer<string>) => void
  onSelectMenuItem?: (event: MouseEvent) => void
  onToggleFilter?: (event: MouseEvent) => void
  [prop: string]: unknown
}

export function HomePage ({
  locale,
  menu,
  records,
  filter,
  session,
  onAuthenticationRequest,
  onSelectMenuItem,
  onToggleFilter,
  ...attrs
}: HomePageProps) {
  return (
    <section {...attrs}>
      <NavbarMenu
        menu={menu}
        onClickItem={onSelectMenuItem}
      >
        {
          filter ? null : (
            <FAIconButton
              icon='search'
              color='info'
              onClick={onToggleFilter}
            />
          )
        }
      </NavbarMenu>
      <FilteredRecordCards
        locale={locale}
        records={records}
        filter={filter}
        session={session}
        onAuthenticationRequest={onAuthenticationRequest}
        onFilterCancel={onToggleFilter}
      />
    </section>
  )
}
