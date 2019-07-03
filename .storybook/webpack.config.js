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
// https://storybook.js.org/configurations/custom-webpack-config/#full-control-mode--default
const path = require('path')

module.exports = ({ config }) => {
  // markdown loader: replace default md loader (= raw-loader)
  upsertRule(config.module.rules, {
    test: /\.md$/,
    use: [{ loader: 'transform-loader?browserify-markdown' }]
  })

  // svg loader: run first, before default svg loader (= file-loader)
  config.module.rules.unshift({
    test: /\.svg$/,
    loader: 'transform-loader?imgurify'
  })

  // typescript
  config.resolve.extensions = (config.resolve.extensions || []).concat(
    '.ts',
    '.tsx'
  )

  config.module.rules.push({
    test: /\.tsx?$/,
    include: [
      path.resolve(__dirname, '../src'),
      path.resolve(__dirname, '../stubs')
    ],
    loader: 'ts-loader',
    options: {
      configFile: path.resolve(__dirname, '../src/tsconfig.json'),
      logLevel: 'info',
      compilerOptions: {
        paths: {
          '@zenyway/zenypass-service': ['../stubs/@zenyway/zenypass-service'],
          'zenypass-service': ['../stubs/zenypass-service']
        },
        sourceMap: true // https://github.com/TypeStrong/ts-loader#devtool--sourcemaps
      }
    }
  })

  config.devtool = 'inline-source-map' // development only

  // add alias specs from package browser field
  config.resolve.aliasFields = (config.resolve.aliasFields || []).concat(
    'browser'
  )

  config.resolve.alias = Object.assign({}, config.resolve.alias, {
    // inferno dev build
    inferno: 'inferno/dist/index.dev.esm.js',
    'inferno-create-element': 'inferno-create-element/dist/index.dev.esm.js',
    // replace react with inferno
    react: path.resolve(__dirname, './react-compat'),
    'react-devtools': 'inferno-devtools',
    'react-dom': 'inferno-compat',
    '@zenyway/zenypass-service': path.resolve(
      __dirname,
      '../stubs/zenypass-service'
    ),
    'zenypass-service': path.resolve(__dirname, '../stubs')
  })

  return config
}

function upsertRule (rules, rule) {
  const testAsString = rule.test.toString()
  const index = rules.findIndex(rule => rule.test.toString() === testAsString)
  if (index >= 0) rules[index] = rule
  else rules.push(rule)
  return rule
}
