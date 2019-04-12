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
import {
  Input,
  InputGroup,
  InputGroupPrepend,
  InputGroupAppend
} from 'bootstrap'
import { FAIconButton } from '../fa-icon'
import { style } from 'typestyle'
import { classes } from 'utils'

export interface QuantityInputProps {
  value: number
  disabled?: boolean
  invisible?: boolean
  onClickMinus?: (event?: MouseEvent) => void
  onClickPlus?: (event?: MouseEvent) => void
  onInput?: (event?: Event) => void
}

const hideSpinButtons = style({
  $nest: {
    '&::-webkit-inner-spin-button': {
      '-webkit-appearance': 'none',
      margin: '0'
    },
    '&::-webkit-outer-spin-button': {
      '-webkit-appearance': 'none',
      margin: '0'
    }
  }
})

const quantityInputClassName = classes(
  'form-control border-info text-center font-weight-bold',
  hideSpinButtons,
  style({
    maxWidth: '4.5rem',
    $nest: {
      '&:focus': { boxShadow: 'unset' }
    }
  })
)

export function QuantityInput ({
  value,
  disabled,
  invisible,
  onClickMinus,
  onClickPlus,
  onInput
}: QuantityInputProps) {
  return (
    <InputGroup className='justify-content-center'>
      {disabled ? null : (
        <InputGroupPrepend>
          <FAIconButton
            icon='minus'
            color='info'
            outline
            onClick={onClickMinus}
          />
        </InputGroupPrepend>
      )}
      <Input
        type='number'
        value={Number.isNaN(value) ? '' : '' + value}
        readOnly={disabled}
        autoCorrect='off'
        autoComplete='off'
        className={classes(quantityInputClassName, invisible && 'invisible')}
        onInput={onInput}
      />
      {disabled ? null : (
        <InputGroupAppend>
          <FAIconButton
            icon='plus'
            color='info'
            outline
            onClick={onClickPlus}
          />
        </InputGroupAppend>
      )}
    </InputGroup>
  )
}
