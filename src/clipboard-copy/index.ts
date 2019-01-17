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
 *
 * forked from:
 * @module clipboard-copy
 * @author Feross Aboukhadijeh
 * @license MIT
 *
 * The MIT License (MIT)
 *
 * Copyright (c) Feross Aboukhadijeh
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
//
/**
 * compared to the original 'clipboard-copy' module,
 * this implementation first tries to use the legacy ExecCommand API,
 * before attempting the new Clipboard API.
 */
export default function(text: string): Promise<void> {
  const iframe = document.createElement('iframe')
  iframe.setAttribute('sandbox', 'allow-same-origin')
  document.body.appendChild(iframe)

  const result = copyToClipboard(text, iframe.contentWindow)

  document.body.removeChild(iframe)
  return result
}

function copyToClipboard(text: string, win = window): Promise<void> {
  const selection = win.getSelection()
  if (!selection) {
    return win !== window
      ? copyToClipboard(text)
      : (navigator as any) && (navigator as any).clipboard
      ? (navigator as any).clipboard.writeText(text)
      : Promise.reject()
  }
  selection.removeAllRanges()

  const span = document.createElement('span')
  span.textContent = text
  win.document.body.appendChild(span)
  const range = win.document.createRange()
  range.selectNode(span)
  selection.addRange(range)

  const success = execCommand('copy', win)

  selection.removeAllRanges()
  win.document.body.removeChild(span)
  return success ? Promise.resolve() : Promise.reject()
}

function execCommand(command: string, win = window) {
  try {
    return win.document.execCommand(command)
  } catch (err) {
    return false
  }
}
