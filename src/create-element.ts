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
import { IComponentConstructor, Refs } from 'inferno'

export {
  render,
  Component,
  Fragment,
  IComponentConstructor as ComponentConstructor,
  InfernoNode as Node
} from 'inferno'

// temporary work-around for
// https://github.com/infernojs/inferno-typescript-example/issues/13
export type ComponentType<P extends {} = {}> = SFC<P> | IComponentConstructor<P>

export interface SFC<P extends {} = {}> {
  (props: P & Refs<P>, context?: any): JSX.Element | null
  defaultProps?: Partial<P>
  defaultHooks?: Refs<P>
}

export { createElement } from 'inferno-create-element'
