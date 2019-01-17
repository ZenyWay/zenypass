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
import { Card, CardImg } from 'bootstrap'
import { classes } from 'utils'
import { ZENYPASS_LOGO_CYAN_SVG } from 'static'
import { style } from 'typestyle'

export interface SplashCardProps {
  tag?: string
  className?: string
  children?: any
}

const logoClassName = style({
  height: '64px',
  marginTop: '-32px'
})

const ZP_VERSION = process.env.ZP_VERSION

export function SplashCard({
  className,
  children,
  ...attrs
}: SplashCardProps & { [prop: string]: unknown }) {
  const classNames = classes(
    'col-sm-10 col-md-8 col-lg-7 col-xl-6 mt-5',
    className
  )
  return (
    <Card align="center" border="info" className={classNames} {...attrs}>
      <CardImg
        src={ZENYPASS_LOGO_CYAN_SVG}
        alt="ZenyPass Logo"
        className={logoClassName}
      />
      <small>v{ZP_VERSION}</small>
      {children}
    </Card>
  )
}

export function SplashFooterCard({
  className,
  ...attrs
}: SplashCardProps & { [prop: string]: unknown }) {
  const classNames = classes(
    'col-sm-10 col-md-8 col-lg-7 col-xl-6 border-0 bg-transparent',
    className
  )
  return <Card align="center" className={classNames} {...attrs} />
}
