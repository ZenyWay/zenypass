// https://storybook.js.org/configurations/custom-webpack-config/#full-control-mode--default
const path = require('path')

module.exports = (baseConfig, env, config) => {
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

  // replace react with inferno
  config.resolve.alias = Object.assign({}, config.resolve.alias, {
    react: 'inferno-compat',
    'react-devtools': 'inferno-devtools',
    'react-dom': 'inferno-compat',
    '@zenyway/zenypass-service': path.resolve(
      __dirname,
      '../stubs/zenypass-service'
    ),
    'zenypass-service': path.resolve(__dirname, '../stubs')
  })

  config.resolve.aliasFields = (config.resolve.aliasFields || []).concat(
    'browser'
  )

  return config
}

function upsertRule (rules, rule) {
  const testAsString = rule.test.toString()
  const index = rules.findIndex(rule => rule.test.toString() === testAsString)
  if (index >= 0) rules[index] = rule
  else rules.push(rule)
  return rule
}
