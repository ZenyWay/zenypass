// https://storybook.js.org/configurations/custom-webpack-config/#full-control-mode--default
const path = require('path')

module.exports = (baseConfig, env, config) => {
  // typescript
  const tsconfig = path.resolve(__dirname, '../src/tsconfig.json')

  config.resolve.extensions = (config.resolve.extensions || []).concat(
    '.ts', '.tsx'
  )

  config.module.rules.push({
    test: /\.tsx?$/,
    include: [
      path.resolve(__dirname, '../src'),
      // path.resolve(__dirname, '../stories'),
    ],
    loader: require.resolve('ts-loader'),
    options: {
      configFile: tsconfig,
      logLevel: 'info'
    }
  })

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
