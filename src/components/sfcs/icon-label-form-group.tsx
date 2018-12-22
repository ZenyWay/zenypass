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
import { FormGroup, FormGroupProps, Input, Label } from 'bootstrap'
import { classes } from 'utils'
import { FAIcon } from './fa-icon'

export interface IconLabelInputFormGroupProps extends FormGroupProps {
  value?: string
  icon?: string
  rotate?: '90' | '180' | '270' | '' | false
  flip?: 'horizontal' | 'vertical' | '' | false
  animate?: 'spin' | 'pulse' | '' | false
  size?: 'sm' | 'lg' | '' | false
  plaintext?: boolean
  readonly?: boolean
  className?: string
}

export function IconLabelInputFormGroup ({
  icon,
  rotate,
  flip,
  animate,
  value,
  size,
  plaintext,
  readonly,
  ...attrs
}: IconLabelInputFormGroupProps) {
  const classNames = classes(
    'w-auto', // override w-100 from 'form-control' for xs & sm
    'form-control',
    size && `form-control-${size}`,
    plaintext && 'form-control-plaintext'
  )
  return (
    <FormGroup inline {...attrs}>
      {icon && (
        <Label size={size}>
          <FAIcon
            icon={icon}
            rotate={rotate}
            flip={flip}
            animate={animate}
            fw
          />
        </Label>
      )}
      {
        plaintext
        ? <span className={classNames}>{value}</span>
        : <Input className={classNames} readonly={readonly} value={value} />
      }
    </FormGroup>
  )
}
