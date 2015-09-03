#!/usr/bin/env node

process.argv[0] = require.resolve('babel/bin/babel-node')
require('node-inspector/bin/node-debug')()
