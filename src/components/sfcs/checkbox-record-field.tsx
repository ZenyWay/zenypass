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
import { Button, ButtonGroup, InputGroup, InputGroupPrepend } from 'bootstrap'
import { FAIcon } from './fa-icon'

export interface CheckboxRecordFieldProps {
  /**
   * using `value` instead of `checked`
   * for compatibility with `RecordFieldProps`
   */
  value?: boolean
  icon?: string
  rotate?: '90' | '180' | '270' | '' | false
  flip?: 'horizontal' | 'vertical' | '' | false
  animate?: 'spin' | 'pulse' | '' | false
  label: string
  id: string
  className?: string
  [prop: string]: unknown
}

export function CheckboxRecordField ({
  value,
  icon,
  rotate,
  flip,
  animate,
  label,
  id,
  className,
  ...attrs
}: CheckboxRecordFieldProps) {
  return (
    <InputGroup id={id} className={className}>
      <InputGroupPrepend>
        <ButtonGroup toggle>
          <Button
            type='checkbox'
            id={`${id}_checkbox_input`}
            active={value}
            color='secondary'
            outline
            {...attrs}
          >
            <FAIcon
              icon={icon}
              fw
              rotate={rotate}
              flip={flip}
              animate={animate}
            />
          </Button>
        </ButtonGroup>
      </InputGroupPrepend>
      <span className='form-control form-control-plaintext pl-3'>{label}</span>
    </InputGroup>
  )
}
