/**
 * Copyright 2019 ZenyWay S.A.S., Stephane M. Catala
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

/**
 * prepend a string supplied as argument to this script
 * to src attributes of <script> and <img> tags and
 * href attributes of <link> tags of the html file
 * referenced by the --input (-i) argument or from stdin.
 * output to the file referenced by the --output (-o) argument or stdout.
 * e.g. node html-prepend-url.js -i src/index.html -o dist/index.html ${npm_package_version}/
 */

const hs = require('hyperstream')
const trumpet = require('trumpet')
const parse = require('minimist')
const fs = require('fs')
const path = require('path')

const args = parse(process.argv.slice(2), {
  string: ['input', 'output'],
  alias: { input: 'i', output: 'o' }
})

const prepend = args._[0]
const prependUrl = hs({
  'script[prepend-url],img[prepend-url]': { src: { prepend } },
  'link[prepend-url]': { href: { prepend } }
})

const removePrependUrl = trumpet()
removePrependUrl.selectAll(
  'script[prepend-url],img[prepend-url],link[prepend-url]',
  elem => elem.removeAttribute('prepend-url')
)

const rs = args.input
  ? fs.createReadStream(path.resolve(args.input))
  : process.stdin
const ws = args.output
  ? fs.createWriteStream(path.resolve(args.output))
  : process.stdout

rs.pipe(prependUrl)
  .pipe(removePrependUrl)
  .pipe(ws)
