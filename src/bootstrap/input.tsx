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
import { classes } from 'utils'
import { UnknownProps } from './types'

export interface InputProps {
  type: string
  invalid: boolean
  className: string
  blurOnEnterKey: boolean
}

const onKeyPress = ({ target, key }) => (key === 'Enter') && target.blur()

export function Input ({
  type,
  invalid,
  className,
  blurOnEnterKey,
  ...attrs
}: Partial<InputProps> & UnknownProps) {
  const Tag = type === 'textarea' ? type : 'input'
  return <Tag
    type={type}
    className={classes(invalid && 'is-invalid', className)}
    onKeyPress={blurOnEnterKey && onKeyPress}
    {...attrs}
  />
}
