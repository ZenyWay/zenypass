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
//
export function classes (...classes: string[]): string {
  return classes.filter(Boolean).join(' ')
}

export function preventDefault (event: Event) {
  event.preventDefault()
  return event
}

export function stopPropagation (event: Event) {
  event.stopPropagation()
  return event
}

export function focus (element?: HTMLElement) {
  element && element.focus()
}

export function blur (element?: HTMLElement) {
  element && element.blur()
}

export function openItemLink ({ href }: HTMLLinkElement) {
  const win = window.open()
  win.opener = null
  win.location.href = href
}
