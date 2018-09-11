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
import { UnknownProps } from 'bootstrap/types'
import { classes } from 'utils'

export interface IconProps {
  icon: string
  fw: boolean
  className: string
}

export default function Icon ({
  icon,
  fw,
  className,
  ...attrs
}: Partial<IconProps> & UnknownProps) {
  return (
    <i className={classes('fa', fw && `fa-fw`, icon, className)} {...attrs} />
  )
}

export interface IconButtonProps extends ButtonProps {
  icon: string
}

export function IconButton ({
  icon,
  children,
  ...attrs
}: Partial<IconButtonProps> & UnknownProps) {
  return (
    <Button {...attrs}>
      {icon ? <Icon icon={icon} fw/> : null}
      {children}
    </Button>
  )
}
