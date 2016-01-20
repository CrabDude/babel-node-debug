#!/usr/bin/env node

var Debugger = require('yadc').Debugger
var babelNodePath = require.resolve('babel-cli/bin/babel-node')
var path = require('path')
var nodeDebugDir = path.dirname(require.resolve('node-inspector/bin/node-debug'))
process.argv.splice(2, 0, '--nodejs', babelNodePath)

var oldFork = require('child_process').fork
require('child_process').fork = function fork() {
  var childProcess = oldFork.apply(this, arguments)
  if (arguments[0].indexOf(nodeDebugDir) === -1) {
    setTimeout(function() {
      var debug = new Debugger({
        port: config.subproc.debugPort,
        host: '127.0.0.1'
      })
      debug.send({command: 'continue'}, function() {
        debug.send({
            command: 'setBreakpoint',
            arguments: {
              type: 'scriptRegExp',
              target: config.subproc.script,
              line: 1,
              column: 1
            }
          }, function(err, result) {
            if (err) return
            debug.on('event', function listener(event) {
              if (event.event === 'break') {
                debug.send({
                    command: 'clearbreakpoint',
                    arguments: {
                      type: 'scriptRegExp',
                      breakpoint: result.res.body.breakpoint
                    }
                  })
                debug.client.end()
                debug.removeListener('event', listener)
                debug.removeListener('error', onError)
              }
            })
        })
      })
      function onError(errObj) {}
      debug.on('error', onError)
    }, 1000)
  }
  return childProcess
}
var main = require('node-inspector/bin/node-debug')
require('child_process').fork = oldFork
var config = main.createConfig(process.argv.slice(2))
main()
