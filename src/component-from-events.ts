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
import redux, {
  connect as _connect,
  Reducer
} from 'component-from-stream-redux'
import componentFromStream, {
  Component,
  ComponentConstructor,
  ComponentFromStreamConstructor,
  ComponentType,
  OperatorFactory,
  SFC
} from './component-from-props'
import { map, tap } from 'rxjs/operators'
import { createActionFactory, StandardAction } from 'basic-fsa-factories'
import compose from 'basic-compose'

export {
  Component,
  ComponentConstructor,
  ComponentFromStreamConstructor,
  componentFromStream,
  ComponentType,
  OperatorFactory,
  SFC,
  redux,
  Reducer
}

export type Rest<T extends U, U extends {} = {}> = Pick<
  T,
  Exclude<keyof T, keyof U>
>

export function connect<S = {}, P = {}> (
  mapStateToProps: (state: S) => Partial<P>,
  mapDispatchToProps = (() => void 0) as (
    dispatch: (...args: any[]) => void
  ) => Partial<P>
): OperatorFactory<any, S, P> {
  return compose.into(0)(map, _connect(mapStateToProps, mapDispatchToProps))
}

const dev = process.env.NODE_ENV !== 'production'
export function logger (label) {
  return function (...args: any[]) {
    const log = console.log.bind(console, label, ...args)
    return dev && (() => tap(log))
  }
}

export default function<P, Q> (
  render: SFC<Q>,
  factory: OperatorFactory<StandardAction<P>, any, any>,
  ...factories: OperatorFactory<StandardAction<P>, any, any>[]
): ComponentConstructor<P> {
  const definedFactories = [factory].concat(factories).filter(Boolean)
  if (!definedFactories.length)
    throw new Error('component-from-events: INVALID ARGUMENTS')
  return componentFromStream(
    render,
    createActionFactory('PROPS'),
    definedFactories[0],
    ...definedFactories.slice(1)
  )
}
