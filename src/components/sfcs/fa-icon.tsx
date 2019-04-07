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
import { Button, ButtonProps } from 'bootstrap'
import { BasicColor } from 'bootstrap/types'
import { classes } from 'utils'

export interface FAIconProps {
  icon?: string[] | string
  color?: IconColor | '' | false
  size?: IconSize | '' | false
  rotate?: '90' | '180' | '270' | '' | false
  flip?: 'horizontal' | 'vertical' | '' | false
  animate?: 'spin' | 'pulse' | '' | false
  border?: boolean
  pull?: 'left' | 'right' | '' | false
  fw?: boolean
  className?: string
  innerRef?: (ref: HTMLElement) => void
  [prop: string]: unknown
}

export type IconSize = 'xs' | 'sm' | 'lg' | '2x' | '3x' | '5x' | '7x' | '10x'
export type IconColor =
  | BasicColor
  | 'body'
  | 'muted'
  | 'white'
  | 'black-50'
  | 'white-50'

export function FAIcon ({
  icon,
  color,
  size,
  rotate,
  flip,
  animate,
  border,
  pull,
  fw,
  className,
  innerRef,
  ...attrs
}: FAIconProps) {
  if (!icon) return null
  const classNames = classes(
    'fa',
    `fa-${icon}`,
    color && `text-${color}`,
    size && `fa-${size}`,
    rotate && `fa-rotate-${rotate}`,
    flip && `fa-flip-${flip}`,
    animate && `fa-${animate}`,
    border && `fa-${border}`,
    pull && `fa-pull-${pull}`,
    fw && 'fa-fw',
    className
  )
  return <i ref={innerRef} className={classNames} {...attrs} />
}

export interface FAIconButtonProps extends ButtonProps {
  icon?: string
  iconSize?: IconSize | '' | false
  fw?: boolean
  pending?: boolean
  rotate?: '90' | '180' | '270' | '' | false
  flip?: 'horizontal' | 'vertical' | '' | false
  animate?: 'spin' | 'pulse' | '' | false
}

export function FAIconButton ({
  icon,
  iconSize,
  fw,
  pending,
  rotate,
  flip,
  animate,
  disabled,
  children,
  ...attrs
}: FAIconButtonProps) {
  return (
    <Button disabled={disabled || pending} {...attrs}>
      <FAIcon
        icon={!pending ? icon : 'spinner'}
        size={iconSize}
        rotate={!pending && rotate}
        flip={!pending && flip}
        animate={!pending ? animate : 'spin'}
        fw={fw}
      />
      {children}
    </Button>
  )
}
