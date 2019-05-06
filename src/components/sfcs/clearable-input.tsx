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
import { createElement, Fragment } from 'create-element'
import { Input, InputProps } from 'bootstrap'
import { style } from 'typestyle'
import { FAIcon } from './fa-icon'
import { classes } from 'utils'

export interface ClearableInputProps
  extends Pick<InputProps, Exclude<keyof InputProps, 'innerRef'>> {
  clearIconRef?: (ref: HTMLElement) => void
  inputRef?: (ref: HTMLElement) => void
  onClickClear(event?: MouseEvent): void
}

const foreground = style({
  zIndex: 5
})

const inputFocusStyle = style({
  $nest: {
    '&:focus': {
      boxShadow: 'unset',
      borderColor: '#17a2b8' // info
    }
  }
})

const iconSpanClassName = `d-flex align-items-center ${foreground} ml-n4 pr-1`

export function ClearableInput ({
  value,
  disabled,
  invalid,
  className,
  clearIconRef,
  inputRef,
  onClickClear,
  ...attrs
}: ClearableInputProps) {
  const hideClearIcon = !value || disabled
  return (
    <Fragment>
      <Input
        value={value}
        disabled={disabled}
        className={classes(
          `${inputFocusStyle} pr-4`,
          invalid && 'border-danger',
          className
        )}
        innerRef={inputRef}
        {...attrs}
      />
      <span className={iconSpanClassName}>
        <FAIcon
          icon='times'
          fw
          className={classes(
            invalid ? 'text-danger' : 'text-secondary',
            hideClearIcon && 'invisible'
          )}
          tabIndex='-1'
          innerRef={clearIconRef}
          onClick={onClickClear}
        />
      </span>
    </Fragment>
  )
}
