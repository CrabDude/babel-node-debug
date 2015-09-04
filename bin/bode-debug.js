#!/usr/bin/env node

var main = require('node-inspector/bin/node-debug')

var createConfig = main.createConfig
main.createConfig = function() {
  var config = createConfig.apply(this, arguments)
  console.log('here')
  config.execPath = require.resolve('babel/bin/babel-node')
  return config
}
main()
