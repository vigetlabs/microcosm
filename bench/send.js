/**
 * Call with node --trace_opt --trace_deopt --allow-natives-syntax bench/send.js
 */

var send = require('../dist/src/send')
var tag  = require('../dist/src/tag')
function action() {}

var store = {
  register: function () {
    var handlers = {}
    handlers[action] = function() { return 1 }
    return handlers
  }
}

function test() {
  var state = { foo: 'bar' }
  send(store, tag(action), state['foo'], null, state)
}

function printStatus(fn) {
  switch(%GetOptimizationStatus(fn)) {
  case 1: console.log("Function is optimized"); break;
  case 2: console.log("Function is not optimized"); break;
  case 3: console.log("Function is always optimized"); break;
  case 4: console.log("Function is never optimized"); break;
  case 6: console.log("Function is maybe deoptimized"); break;
  }
}

//Fill type-info
test();
// 2 calls are needed to go from uninitialized -> pre-monomorphic -> monomorphic
test();

%OptimizeFunctionOnNextCall(test);
//The next call
test();

//Check
printStatus(test);
