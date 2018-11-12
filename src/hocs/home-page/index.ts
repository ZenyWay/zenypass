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

import { MenuSpec } from './menu'
import reducer, { AutomataState } from './reducer'
import { createRecordOnSelectNewRecordMenuItem } from './effects'
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
import { callHandlerOnEvent } from 'utils'
const log = label => console.log.bind(console, label)

export type HomePageProps<P extends HomePageSFCProps> =
  HomePageHocProps & Rest<P, HomePageSFCProps>

export interface HomePageHocProps {
  locale: string
  menu: MenuSpec
  records: Partial<ZenypassRecord>[] // TODO remove and get from service in effect
  onSelectMenuItem?: (target: HTMLElement) => void
}

export interface HomePageSFCProps extends HomePageSFCHandlerProps {
  locale: string
  menu: MenuSpec
  records: Partial<ZenypassRecord>[]
  busy?: boolean
  error?: string
}

export interface HomePageSFCHandlerProps {
  onSelectMenuItem?: (target: HTMLElement) => void
  onCancel?: (event?: MouseEvent) => void
}

interface HomePageState {
  props: HomePageProps<HomePageSFCProps>
  menu: MenuSpec
  state: AutomataState
  error?: string
}

function mapStateToProps (
  { props, state, menu, error }: HomePageState
): Rest<HomePageSFCProps, HomePageSFCHandlerProps> {
  return {
    ...props, // menu and onSelectMenuItem from props are both overwritten
    menu,
    busy: state === 'busy',
    error
  }
}

const mapDispatchToProps:
(dispatch: (event: any) => void) => HomePageSFCHandlerProps =
createActionDispatchers({
  onSelectMenuItem: 'SELECT_MENU_ITEM',
  onCancel: 'CANCEL'
})

export function homePage <P extends HomePageSFCProps> (
  HomePageSFC: SFC<P>
): ComponentClass<HomePageProps<P>> {
  return componentFromEvents<HomePageProps<P>, P>(
    HomePageSFC,
    () => tap(log('home-page:event:')),
    redux(
      reducer,
      createRecordOnSelectNewRecordMenuItem,
      callHandlerOnEvent('onSelectMenuItem', 'SELECT_MENU_ITEM')
    ),
    () => tap(log('home-page:state:')),
    connect<HomePageState, HomePageSFCProps>(
      mapStateToProps,
      mapDispatchToProps
    ),
    () => tap(log('home-page:view-props:'))
  )
}
