#!/usr/bin/env node

var Debugger = require('../lib/Debugger')
var babelNodePath = require.resolve('babel-cli/bin/babel-node')
var path = require('path')
var child_process = require('child_process')


var nodeDebugDir = path.dirname(require.resolve('node-inspector/bin/node-debug'))
process.argv.splice(2, 0, '--nodejs', babelNodePath)

// Pass shimmed fork to node-debug
var oldFork = child_process.fork
child_process.fork = fork
var main = require('node-inspector/bin/node-debug')
child_process.fork = oldFork

// Get config
var config = main.createConfig(process.argv.slice(2))
var filename = path.resolve(process.cwd(), config.subproc.script)

// Start Debugger
main()

function fork() {
  var childProcess = oldFork.apply(this, arguments)
  if (arguments[0].indexOf(nodeDebugDir) === -1) {
    setTimeout(function() {
      var debug = new Debugger({
        port: config.subproc.debugPort,
        host: '127.0.0.1'
      })
      function onError() {}
      debug.on('error', onError)
      debug.on('event', function listener(event) {
        if (event.event === 'afterCompile' && event.body.script.name === filename) {
          debug.client.end()
          debug.removeListener('event', listener)
          debug.removeListener('error', onError)
        }
      })

      debug.clearAll()
        .then(function(result) {
          return debug.setInitialBreakpoint(filename)
        })
        .then(function(result) {
          return debug.sendContinue()
        })
    }, 1000)
  }
  return childProcess
}
