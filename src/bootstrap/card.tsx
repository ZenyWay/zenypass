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
import { BasicColor, UnknownProps } from './types'

export interface CardProps {
  rounded?: boolean
  border?: BasicColor | 'white' | 'none' | '' | false
  bg?: BasicColor | 'white' | 'transparent' | '' | false
  align?: 'left' | 'center' | 'right' | '' | false
  text?: BasicColor | 'white' | 'muted' | '' | false
  tag?: string
  className?: string
}

export function Card (props: CardProps & UnknownProps) {
  return CardFragment(props)
}

export function CardHeader (props: CardProps & UnknownProps) {
  return CardFragment({ ...props, type: 'header' })
}

export function CardBody (props: CardProps & UnknownProps) {
  return CardFragment({ ...props, type: 'body' })
}

export function CardFooter (props: CardProps & UnknownProps) {
  return CardFragment({ ...props, type: 'footer' })
}

export interface CardImgProps {
  tag?: string
  align?: 'top' | 'bottom' | '' | false
  className?: string
}

export function CardImg ({
  tag: Tag = 'img',
  align,
  className,
  ...attrs
}: CardImgProps & UnknownProps) {
  const classNames = classes(
    align ? `card-img-${align}` : 'card-img',
    className
  )
  return <Tag className={classNames} {...attrs} />
}

export const CardLink = createComponent({
  tag: 'a',
  className: 'card-link'
})

export const CardSubtitle = createComponent({
  tag: 'h6',
  className: 'card-subtitle'
})

export const CardTitle = createComponent({
  tag: 'h5',
  className: 'card-title'
})

function createComponent (defaults: { tag: string; className: string }) {
  return function ({
    tag: Tag = defaults.tag,
    className,
    ...attrs
  }: { tag?: string; className?: string } & UnknownProps) {
    const classNames = classes(defaults.className, className)
    return <Tag className={classNames} {...attrs} />
  }
}

type CardFragmentType = 'header' | 'body' | 'footer'

function CardFragment ({
  tag: Tag = 'div',
  type,
  border,
  bg,
  rounded,
  text,
  align,
  className,
  ...attrs
}: CardProps & { type?: CardFragmentType } & UnknownProps) {
  const classNames = classes(
    type ? `card-${type}` : 'card',
    border && `border-${border === 'none' ? '0' : border}`,
    bg && `bg-${bg}`,
    text && `text-${text}`,
    align && `text-${align}`,
    rounded && 'rounded',
    className
  )
  return <Tag className={classNames} {...attrs} />
}
