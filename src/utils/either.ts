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
export interface Either<R, L = any> {
  map<A>(project: (value: R) => A): Either<A, L>
  flatMap<A>(project: (value: R) => Either<A, L>): Either<A, L>
  unwrap<A, B>(left: (value: L) => B, right: (value: R) => A)
}

export function left<L, R = any>(value: L): Either<R, L> {
  return new Left(value)
}

export function right<R, L = any>(value: R): Either<R, L> {
  return new Right(value)
}

abstract class AbstractEither<R, L = any> implements Either<R, L> {
  flatMap<A>(project: (value: R) => Either<A, L>): Either<A, L> {
    return this.map(project).unwrap(identity, identity) // TODO fix this
  }

  abstract map<A>(project: (value: R) => A): Either<A, L>

  abstract unwrap<A, B>(left: (value: L) => B, right: (value: R) => A)
}

class Left<L> extends AbstractEither<any, L> implements Either<any, L> {
  map<A>(project: (value: any) => A): Either<A, L> {
    return this
  }

  unwrap<A, B>(left: (value: L) => B, right: (value: any) => A) {
    return left(this._value)
  }

  constructor(private _value: L) {
    super()
  }
}

class Right<R> extends AbstractEither<R, any> implements Either<R, any> {
  map<A>(project: (value: R) => A): Either<A, any> {
    return new Right(project(this._value))
  }

  unwrap<A, B>(left: (value: any) => B, right: (value: R) => A) {
    return right(this._value)
  }

  constructor(private _value: R) {
    super()
  }
}

function identity<V>(v: V): V {
  return v
}
