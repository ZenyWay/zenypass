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

import createComponentFromStreamFactory, {
  ComponentFromStreamConstructor,
  ComponentFromStreamFactory,
  Operator as GenericOperator,
  OperatorFactory as GenericOperatorFactory
} from 'component-from-stream'
import {
  Component,
  ComponentConstructor,
  ComponentType,
  Node,
  SFC
} from 'create-element'
import { Observable, from } from 'rxjs'

export {
  Component,
  ComponentConstructor,
  ComponentFromStreamConstructor,
  ComponentFromStreamFactory,
  ComponentType,
  Node,
  SFC
}
export type Operator<I= {},O= I> = GenericOperator<I,O,Observable<I>,Observable<O>>
export type OperatorFactory<A= void,I= {},O= I> =
  GenericOperatorFactory<A,I,O,Observable<I>,Observable<O>>

const componentFromStream = createComponentFromStreamFactory(Component, from) as ComponentFromStreamFactory<Component<any, any>, Node>

export default componentFromStream
