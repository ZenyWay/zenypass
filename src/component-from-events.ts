/**
 * @license
 * Copyright 2018 Stephane M. Catala
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
import redux, { connect as _connect } from 'component-from-stream-redux'
import componentFromStream, {
  Component,
  ComponentFromStreamConstructor,
  Children,
  Operator,
  OperatorFactory
} from './component-from-props'
import { map } from 'rxjs/operators'
import { createActionFactory, StandardAction } from 'basic-fsa-factories'
import compose from 'basic-compose'

export {
  Children,
  Component,
  ComponentFromStreamConstructor,
  componentFromStream,
  OperatorFactory,
  redux
}

export function connect <S={},P={}>(
  mapStateToProps: (state: S) => Partial<P>,
  mapDispatchToProps: (dispatch: (...args: any[]) => void) => Partial<P>
): OperatorFactory<any,S,P> {
  return compose.into(0)(map, _connect(mapStateToProps, mapDispatchToProps))
}

export default function <Q = {}, P = any>(
  render: (props: Q) => Children,
  factory: OperatorFactory<StandardAction<P>, any, any>,
  ...factories: OperatorFactory<StandardAction<P>, any, any>[]
) {
  return componentFromStream(
    render,
    createActionFactory('PROPS'),
    factory,
    ...factories
  )
}
