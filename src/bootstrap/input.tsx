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

export interface InputProps {
  id?: string
  type?: string
  value?: string | number
  defaultChecked?: boolean
  placeholder?: string
  rows?: string
  readOnly?: boolean
  autoFocus?: boolean
  autoComplete?: 'off' | 'on' | '' | false
  autoCorrect?: 'off' | 'on' | '' | false
  disabled?: boolean
  invalid?: boolean
  className?: string
  innerRef?: (ref: HTMLElement) => void
  onBlur?: (event?: Event) => void
  onInput?: (event?: Event) => void
}

export function Input ({
  type,
  invalid,
  className,
  innerRef,
  ...attrs
}: InputProps) {
  const Tag = (type === 'textarea' ? type : 'input') as 'input'
  if (!attrs.autoComplete) delete attrs.autoComplete
  if (!attrs.autoCorrect) delete attrs.autoCorrect
  return (
    <Tag
      ref={innerRef}
      type={type}
      className={classes(invalid && 'is-invalid', className)}
      {...attrs as any}
    />
  )
}
