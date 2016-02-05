var Promise = require('bluebird')
var extend = require('util')._extend
var Debugger = require('yadc').Debugger

function BabelDebugger(options) {
  Debugger.call(this, options)
}

BabelDebugger.prototype.__proto__ = Debugger.prototype

extend(BabelDebugger.prototype, {
  clearAll: clearAll,
  listBreakpoints: listBreakpoints,
  clearBreakpoint: clearBreakpoint,
  sendContinue: sendContinue,
  setInitialBreakpoint: setInitialBreakpoint,
  send: Promise.promisify(Debugger.prototype.send)
})

function clearAll() {
  var self = this
  return this.listBreakpoints()
    .then(function(bps) {
      return bps.map(function(bp) {
        return self.clearBreakpoint(bp)
      })
    })
}
function listBreakpoints() {
  return this.send({
    command: 'listbreakpoints'
  }).get('res').get('body').get('breakpoints')
}
function clearBreakpoint(breakpoint) {
  return this.send({
    command: 'clearbreakpoint',
    arguments: {
      type: breakpoint.type,
      breakpoint: breakpoint.number
    }
  })
}
function sendContinue() {
  return this.send({command: 'continue'})
}
function setInitialBreakpoint(target) {
  return this.send({
    command: 'setBreakpoint',
    arguments: {
      type: 'script',
      target: target,
      line: 1,
      column: 1
    }
  })
}

module.exports = BabelDebugger
