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
import { FormGroup, Input, Label } from 'bootstrap'
import { UnknownProps } from 'bootstrap/types'
import { classes } from 'utils'
import Icon from './icon'

export interface IconLabelInputFormGroupProps {
  value: string
  icon: string
  size: 'sm' | 'lg' | '' | false
  plaintext: boolean
  readonly: boolean
  className: string
}

export default function IconLabelInputFormGroup ({
  icon,
  value,
  size,
  plaintext,
  readonly,
  className,
  ...attrs
}: Partial<IconLabelInputFormGroupProps> & UnknownProps) {
  const classNames = classes(
    'w-auto', // override w-100 from 'form-control' for xs & sm
    'form-control',
    size && `form-control-${size}`,
    plaintext && 'form-control-plaintext',
    className
  )
  return (
    <FormGroup inline {...attrs}>
      {icon && <Label size={size}><Icon icon={icon} fw /></Label>}
      {
        plaintext
        ? <span className={classNames}>{value}</span>
        : <Input className={classNames} readonly={readonly} value={value} />
      }
    </FormGroup>
  )
}
