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
//
import { createElement } from 'create-element'
import { classes } from 'utils'

export type BasicColor = 'primary' | 'secondary' | 'success' | 'danger'
  | 'warning' | 'info' | 'light' | 'dark' | 'white'

export interface CardProps {
  rounded: boolean
  border: BasicColor | '' | false
  bg: BasicColor | 'transparent' | '' | false
  align: 'left' | 'center' | 'right' | '' | false
  text: BasicColor | 'muted' | '' | false
  className: string
}

export interface UnknownProps {
  [attr: string]: unknown
}

export default function (props: Partial<CardProps> & UnknownProps) {
  return Card(props)
}

export function CardHeader (props: Partial<CardProps> & UnknownProps) {
  return Card({ ...props, type: 'header' })
}

export function CardBody (props: Partial<CardProps> & UnknownProps) {
  return Card({ ...props, type: 'body' })
}

export function CardFooter (props: Partial<CardProps> & UnknownProps) {
  return Card({ ...props, type: 'footer' })
}

type CardType = 'header' | 'body' | 'footer'

function Card ({
  type,
  border,
  bg,
  rounded,
  text,
  align,
  className,
  ...attrs
}: Partial<CardProps & { type: CardType }> & UnknownProps) {
  const classNames = classes(
    type ? `card-${type}` : 'card',
    border && `border-${border}`,
    bg && `bg-${bg}`,
    text && `text-${text}`,
    align && `text-${align}`,
    rounded && 'rounded',
    className
  )
  return <div className={classNames} {...attrs} />
}
