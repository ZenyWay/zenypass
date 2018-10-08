// https://storybook.js.org/configurations/custom-webpack-config/#full-control-mode--default
const path = require('path')

module.exports = (baseConfig, env, config) => {
  // svg loader: run first, before default svg loader (= file-loader)
  config.module.rules.unshift({
    test: /\.svg$/,
    loader: 'transform-loader?imgurify'
  })

  // typescript
  const tsconfig = path.resolve(__dirname, '../src/tsconfig.json')

  config.resolve.extensions = (config.resolve.extensions || []).concat(
    '.ts', '.tsx'
  )

  config.module.rules.push({
    test: /\.tsx?$/,
    include: [
      path.resolve(__dirname, '../src'),
      path.resolve(__dirname, '../stubs'),
    ],
    loader: 'ts-loader',
    options: {
      configFile: tsconfig,
      logLevel: 'info',
      compilerOptions: {
        "sourceMap": true // https://github.com/TypeStrong/ts-loader#devtool--sourcemaps
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
    'react': 'inferno-compat',
    "react-devtools": "inferno-devtools",
    'react-dom': 'inferno-compat'
  })

  return config
}
