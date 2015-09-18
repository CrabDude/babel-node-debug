#!/usr/bin/env node

var babelNodePath = require.resolve('babel/bin/babel-node')
process.argv.splice(2, 0, '--nodejs', babelNodePath)

require('node-inspector/bin/node-debug')()
