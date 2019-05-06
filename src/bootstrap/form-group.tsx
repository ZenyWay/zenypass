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

export interface FormGroupProps {
  size?: 'sm' | 'lg' | '' | false
  check?: boolean
  row?: boolean
  inline?: boolean
  className?: string
  children?: any
  [prop: string]: unknown
}

export function FormGroup ({
  size,
  check,
  row,
  inline,
  className,
  children,
  ...attrs
}: FormGroupProps) {
  const classNames = classes(
    size && `form-group-${size}`,
    check ? 'form-check' : 'form-group',
    row && 'row',
    inline && (check ? 'form-check-inline' : 'form-inline'),
    className
  )
  return (
    <div className={classNames} {...attrs}>
      {children}
    </div>
  )
}
