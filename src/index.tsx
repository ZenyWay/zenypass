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
import 'symbol-observable' // polyfill
import { initDevTools } from 'inferno-devtools'
import { createElement, render } from 'create-element'
import { Router as App } from 'components'

if (process.env.NODE_ENV !== 'production') {
  console.log('initializing dev-tools')
  initDevTools()
} else {
  require('debug').disable()
}

const app = removeChildNodes(document.getElementById('app')) // Inferno expects empty node

window.addEventListener('touchstart', function isTouchDevice () {
  document.body.className += ' is-touch-device'
  window.removeEventListener('touchstart', isTouchDevice)
})

render(<App />, app)

function removeChildNodes (node: HTMLElement): HTMLElement {
  Array.from(node.childNodes).forEach(el => el.remove())
  return node
}
