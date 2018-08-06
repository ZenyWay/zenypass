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
import Icon, { IconProps } from './icon'
import { classes } from 'utils'

export interface InputGroupProps extends InputGroupAddonProps {
  size: 'sm' | 'lg'
}

export interface InputGroupAddonProps {
  className: string
  [prop: string]: any
}

export default function ({
  size,
  className,
  ...attrs
}: Partial<InputGroupProps>) {
  return <div
    className={classes('input-group', size && `input-group-${size}`, className)}
    {...attrs}
  />
}

export function InputGroupPrepend ({
  className,
  ...attrs
}: Partial<InputGroupAddonProps>) {
  return <div className={classes('input-group-prepend', className)} {...attrs} />
}

export function InputGroupAppend ({
  className,
  ...attrs
}: Partial<InputGroupAddonProps>) {
  return <div className={classes('input-group-append', className)} {...attrs} />
}

export function InputGroupText ({
  className,
  ...attrs
}: Partial<InputGroupAddonProps>) {
  return <div className={classes('input-group-text', className)} {...attrs} />
}

export function InputGroupIcon ({
  className,
  ...attrs
}: Partial<IconProps>) {
  return <InputGroupText className={className}><Icon {...attrs} /></InputGroupText>
}
