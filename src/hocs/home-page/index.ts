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

import menu, { MenuSpec } from './menu'
import reducer from './reducer'
import { convertMenuEvents } from './effects'
import componentFromEvents, {
  ComponentClass,
  Rest,
  SFC,
  connect,
  redux
} from 'component-from-events'
import { ZenypassRecord } from 'services'
import { createActionDispatchers } from 'basic-fsa-factories'
import { tap } from 'rxjs/operators'
import { callHandlerOnEvent, preventDefault } from 'utils'
const log = label => console.log.bind(console, label)

export type HomePageProps<P extends HomePageSFCProps> =
  HomePageHocProps & Rest<P, HomePageSFCProps>

export interface HomePageHocProps {
  locale: string
  records: Partial<ZenypassRecord>[]
  onSelectRoute?: (route: string) => void // TODO replace with route object, incl. params
  onSelectLocale?: (locale: string) => void
}

export interface HomePageSFCProps extends HomePageSFCHandlerProps {
  locale: string
  menu: MenuSpec
  records: Partial<ZenypassRecord>[]
}

export interface HomePageSFCHandlerProps {
  onSelectMenuItem?: (target: HTMLElement) => void
}

interface HomePageState {
  props: HomePageProps<HomePageSFCProps>
}

function mapStateToProps (
  { props }: HomePageState
): Rest<HomePageSFCProps, HomePageSFCHandlerProps> {
  return { ...props, menu: menu[props.locale] }
}

const mapDispatchToProps:
(dispatch: (event: any) => void) => HomePageSFCHandlerProps =
createActionDispatchers({
  onSelectMenuItem: 'SELECT_MENU_ITEM',
  onToggleFilter: 'TOGGLE_FILTER'
})

export function homePage <P extends HomePageSFCProps> (
  HomePageSFC: SFC<P>
): ComponentClass<HomePageProps<P>> {
  return componentFromEvents<HomePageProps<P>, P>(
    HomePageSFC,
    () => tap(log('controlled-authentication-modal:event:')),
    redux(
      reducer,
      convertMenuEvents,
      callHandlerOnEvent('onSelectLocale', 'SELECT_LOCALE'),
      callHandlerOnEvent('onSelectRoute', 'SELECT_ROUTE')
    ),
    () => tap(log('controlled-authentication-modal:state:')),
    connect<HomePageState, HomePageSFCProps>(
      mapStateToProps,
      mapDispatchToProps
    ),
    () => tap(log('controlled-authentication-modal:view-props:'))
  )
}
