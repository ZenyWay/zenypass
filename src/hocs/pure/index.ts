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
import componentFromStream, {
  ComponentConstructor,
  SFC
} from 'component-from-props'
import compose from 'basic-compose'
import { shallowEqual } from 'utils'
import { distinctUntilChanged, tap } from 'rxjs/operators'
const log = (label: string) => console.log.bind(console, label)

/**
 * similar to React's `PureComponent`:
 * only update the given SFC when props change.
 * note that the denomination `pure` may be misleading:
 * the given SFC is not expected to be free of side-effects.
 * its return value, i.e. the resulting virtual node,
 * should however only depend on its input props:
 * purity here refers only to the referential integrity of returned value
 * vs. input props.
 */
export function pure <P extends {} = {}> (
  SFC: SFC<P>,
  equals = shallowEqual
): ComponentConstructor<P> {
  return componentFromStream(
    SFC,
    () => compose.into(0)(
      tap(log('bound:view-props:')),
      distinctUntilChanged(equals),
      tap(log('bound:props:'))
    )
  )
}
