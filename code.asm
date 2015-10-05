--- FUNCTION SOURCE (SetFunctionName) id{0,0} ---
(g,h,i){
if((typeof(h)==='symbol')){
h="["+%SymbolDescription(h)+"]";
}
if((i===(void 0))){
%FunctionSetName(g,h);
}else{
%FunctionSetName(g,i+" "+h);
}
}
--- END ---
--- FUNCTION SOURCE (ToName) id{1,0} ---
(i){
return(typeof(i)==='symbol')?i:ToString(i);
}
--- END ---
--- FUNCTION SOURCE (join) id{2,0} ---
(C){
if((this==null)&&!(%_IsUndetectableObject(this)))throw MakeTypeError(14,"Array.prototype.join");
var o=((%_IsSpecObject(%IS_VAR(this)))?this:$toObject(this));
var v=(o.length>>>0);
return InnerArrayJoin(C,o,v);
}
--- END ---
--- FUNCTION SOURCE (send) id{3,0} ---
(store, type, subset, payload, state) {
  var handler = store[type];

  if (typeof handler === 'undefined' && typeof store.register === 'function') {
    handler = store.register()[type];
  }

  return typeof handler === 'function' ? handler.call(store, subset, payload, state) : handler;
}
--- END ---
--- FUNCTION SOURCE (Store.getInitialState) id{4,0} ---
() {
    return 0
  }
--- END ---
--- FUNCTION SOURCE (rollforward) id{5,0} ---
() {
    var _this = this;

    var next = this.history.reduce(function (state, transaction) {
      return dispatch(_this.stores, state, transaction);
    }, _extends({}, this.base));

    if (next != this.state) {
      this.state = next;
      this.emit(next);
    }

    return this;
  }
--- END ---
--- FUNCTION SOURCE (reduce) id{5,1} ---
(fn, value) {
    var node = this.root();

    while (node !== null) {
      value = fn(value, node.value);

      if (this.focus === node) {
        break;
      }

      node = node.next();
    }

    return value;
  }
--- END ---
INLINE (reduce) id{5,1} AS 1 AT <0:56>
--- FUNCTION SOURCE (root) id{5,2} ---
() {
    var node = this.focus;

    while (node !== null && node.parent !== null) {
      node = node.parent;
    }

    return node;
  }
--- END ---
INLINE (root) id{5,2} AS 2 AT <1:34>
--- FUNCTION SOURCE (app.emit.app.publish) id{5,3} ---
() {
    for (var i = 0; i < callbacks.length; i++) {
      callbacks[i].callback.apply(callbacks[i].scope, arguments)
    }

    return app
  }
--- END ---
INLINE (app.emit.app.publish) id{5,3} AS 3 AT <0:252>
--- FUNCTION SOURCE (OwnPropertyKeys) id{6,0} ---
(J){
if(%_IsJSProxy(J)){
var D=%GetHandler(J);
var K=CallTrap0(D,"ownKeys",(void 0));
return ToNameArray(K,"getOwnPropertyNames",false);
}
return ObjectGetOwnPropertyKeys(J,32);
}
--- END ---
--- FUNCTION SOURCE (dispatch) id{7,0} ---
(stores, state, _ref) {
  var active = _ref.active;
  var payload = _ref.payload;
  var type = _ref.type;

  for (var i = 0, len = stores.length; active && i < len; i++) {
    var _stores$i = stores[i];
    var key = _stores$i[0];
    var store = _stores$i[1];

    var answer = send(store, type, state[key], payload, state);

    if (answer !== void 0) {
      state[key] = answer;
    }
  }

  return state;
}
--- END ---
--- FUNCTION SOURCE (send) id{7,1} ---
(store, type, subset, payload, state) {
  var handler = store[type];

  if (typeof handler === 'undefined' && typeof store.register === 'function') {
    handler = store.register()[type];
  }

  return typeof handler === 'function' ? handler.call(store, subset, payload, state) : handler;
}
--- END ---
INLINE (send) id{7,1} AS 1 AT <0:279>
--- FUNCTION SOURCE (ToPrimitive) id{8,0} ---
(i,R){
if((typeof(i)==='string'))return i;
if(!(%_IsSpecObject(i)))return i;
if((%_ClassOf(i)==='Symbol'))throw MakeTypeError(109);
if(R==0)R=((%_IsDate(i)))?2:1;
return(R==1)?DefaultNumber(i):DefaultString(i);
}
--- END ---
--- FUNCTION SOURCE (Transaction) id{9,0} ---
(type, payload, complete) {

  return {
    type: '' + type,
    error: false,
    active: arguments.length > 1,
    payload: payload,
    complete: complete
  };
}
--- END ---
--- FUNCTION SOURCE (IsPrimitive) id{10,0} ---
(i){
return!(%_IsSpecObject(i));
}
--- END ---
--- FUNCTION SOURCE (append) id{11,0} ---
(item) {
    this.focus = new Node(item, this.focus);

    return this.focus;
  }
--- END ---
--- FUNCTION SOURCE (Node) id{11,1} ---
(value, parent) {
  this.children = [];
  this.parent = parent || null;
  this.value = value;

  if (parent) {
    parent.children.unshift(this);
  }
}
--- END ---
INLINE (Node) id{11,1} AS 1 AT <0:26>
--- FUNCTION SOURCE (action.toString) id{12,0} ---
() { return 'test' }
--- END ---
--- FUNCTION SOURCE (DefaultNumber) id{13,0} ---
(i){
if(!(%_ClassOf(i)==='Symbol')){
var X=i.valueOf;
if((%_ClassOf(X)==='Function')){
var N=%_CallFunction(i,X);
if(IsPrimitive(N))return N;
}
var Y=i.toString;
if((%_ClassOf(Y)==='Function')){
var Z=%_CallFunction(i,Y);
if(IsPrimitive(Z))return Z;
}
}
throw MakeTypeError(15);
}
--- END ---
--- FUNCTION SOURCE (IsAccessorDescriptor) id{14,0} ---
(G){
if((G===(void 0)))return false;
return G.hasGetter()||G.hasSetter();
}
--- END ---
[deoptimizing (DEOPT soft): begin 0x2a7d8f4e1179 <JS Function rollforward (SharedFunctionInfo 0x2a7d8f42dfb9)> (opt #5) @10, FP to SP delta: 64]
            ;;; deoptimize at 2_102: Insufficient type feedback for generic named access
  reading input frame rollforward => node=1, args=47, height=4; inputs:
      0: 0x2a7d8f4e1179 ; (frame function) 0x2a7d8f4e1179 <JS Function rollforward (SharedFunctionInfo 0x2a7d8f42dfb9)>
      1: 0x2a7d8f4cd369 ; [fp + 16] 0x2a7d8f4cd369 <a Microcosm with map 0x15b460834721>
      2: 0x11c70a129ef1 ; [fp - 24] 0x11c70a129ef1 <FixedArray[5]>
      3: 0x5de8fa04131 ; (literal 4) 0x5de8fa04131 <undefined>
      4: 0x5de8fa04131 ; (literal 4) 0x5de8fa04131 <undefined>
      5: 0x2a7d8f4e1a21 ; (literal 6) 0x2a7d8f4e1a21 <JS Function reduce (SharedFunctionInfo 0x2a7d8f4333c9)>
  reading input frame reduce => node=3, args=31, height=4; inputs:
      0: 0x2a7d8f4e1a21 ; (literal 6) 0x2a7d8f4e1a21 <JS Function reduce (SharedFunctionInfo 0x2a7d8f4333c9)>
      1: 0x2a7d8f4cd251 ; rbx 0x2a7d8f4cd251 <a Tree with map 0x15b4608344b9>
      2: 0x11c70a129f29 ; [fp - 40] 0x11c70a129f29 <JS Function (SharedFunctionInfo 0x2a7d8f4410b1)>
      3: 0x11c70a129f71 ; rax 0x11c70a129f71 <an Object with map 0x15b4608065c9>
      4: 0x2a7d8f4cd219 ; (literal 7) 0x2a7d8f4cd219 <FixedArray[5]>
      5: 0x5de8fa04131 ; (literal 4) 0x5de8fa04131 <undefined>
      6: 0x5de8fa04131 ; (literal 4) 0x5de8fa04131 <undefined>
      7: 0x2a7d8f4e1a69 ; (literal 8) 0x2a7d8f4e1a69 <JS Function root (SharedFunctionInfo 0x2a7d8f433471)>
  reading input frame root => node=1, args=41, height=3; inputs:
      0: 0x2a7d8f4e1a69 ; (literal 8) 0x2a7d8f4e1a69 <JS Function root (SharedFunctionInfo 0x2a7d8f433471)>
      1: 0x2a7d8f4cd251 ; rbx 0x2a7d8f4cd251 <a Tree with map 0x15b4608344b9>
      2: 0x2a7d8f4cd219 ; (literal 7) 0x2a7d8f4cd219 <FixedArray[5]>
      3: 0x11c70a129ca9 ; rdx 0x11c70a129ca9 <a Node with map 0x15b460834619>
      4: 0x5de8fa04131 ; (literal 4) 0x5de8fa04131 <undefined>
  translating frame rollforward => node=47, height=24
    0x7fff5fbfee70: [top + 56] <- 0x2a7d8f4cd369 ;  0x2a7d8f4cd369 <a Microcosm with map 0x15b460834721>  (input #1)
    0x7fff5fbfee68: [top + 48] <- 0x2fc336fecb41 ;  caller's pc
    0x7fff5fbfee60: [top + 40] <- 0x7fff5fbfee90 ;  caller's fp
    0x7fff5fbfee58: [top + 32] <- 0x11c70a129ef1 ;  context    0x11c70a129ef1 <FixedArray[5]>  (input #2)
    0x7fff5fbfee50: [top + 24] <- 0x2a7d8f4e1179 ;  function    0x2a7d8f4e1179 <JS Function rollforward (SharedFunctionInfo 0x2a7d8f42dfb9)>  (input #0)
    0x7fff5fbfee48: [top + 16] <- 0x5de8fa04131 ;  0x5de8fa04131 <undefined>  (input #3)
    0x7fff5fbfee40: [top + 8] <- 0x5de8fa04131 ;  0x5de8fa04131 <undefined>  (input #4)
    0x7fff5fbfee38: [top + 0] <- 0x2a7d8f4e1a21 ;  0x2a7d8f4e1a21 <JS Function reduce (SharedFunctionInfo 0x2a7d8f4333c9)>  (input #5)
  translating frame reduce => node=31, height=24
    0x7fff5fbfee30: [top + 72] <- 0x2a7d8f4cd251 ;  0x2a7d8f4cd251 <a Tree with map 0x15b4608344b9>  (input #1)
    0x7fff5fbfee28: [top + 64] <- 0x11c70a129f29 ;  0x11c70a129f29 <JS Function (SharedFunctionInfo 0x2a7d8f4410b1)>  (input #2)
    0x7fff5fbfee20: [top + 56] <- 0x11c70a129f71 ;  0x11c70a129f71 <an Object with map 0x15b4608065c9>  (input #3)
    0x7fff5fbfee18: [top + 48] <- 0x2fc336fca99b ;  caller's pc
    0x7fff5fbfee10: [top + 40] <- 0x7fff5fbfee60 ;  caller's fp
    0x7fff5fbfee08: [top + 32] <- 0x2a7d8f4cd219 ;  context    0x2a7d8f4cd219 <FixedArray[5]>  (input #4)
    0x7fff5fbfee00: [top + 24] <- 0x2a7d8f4e1a21 ;  function    0x2a7d8f4e1a21 <JS Function reduce (SharedFunctionInfo 0x2a7d8f4333c9)>  (input #0)
    0x7fff5fbfedf8: [top + 16] <- 0x5de8fa04131 ;  0x5de8fa04131 <undefined>  (input #5)
    0x7fff5fbfedf0: [top + 8] <- 0x5de8fa04131 ;  0x5de8fa04131 <undefined>  (input #6)
    0x7fff5fbfede8: [top + 0] <- 0x2a7d8f4e1a69 ;  0x2a7d8f4e1a69 <JS Function root (SharedFunctionInfo 0x2a7d8f433471)>  (input #7)
  translating frame root => node=41, height=16
    0x7fff5fbfede0: [top + 48] <- 0x2a7d8f4cd251 ;  0x2a7d8f4cd251 <a Tree with map 0x15b4608344b9>  (input #1)
    0x7fff5fbfedd8: [top + 40] <- 0x2fc336fcbc06 ;  caller's pc
    0x7fff5fbfedd0: [top + 32] <- 0x7fff5fbfee10 ;  caller's fp
    0x7fff5fbfedc8: [top + 24] <- 0x2a7d8f4cd219 ;  context    0x2a7d8f4cd219 <FixedArray[5]>  (input #2)
    0x7fff5fbfedc0: [top + 16] <- 0x2a7d8f4e1a69 ;  function    0x2a7d8f4e1a69 <JS Function root (SharedFunctionInfo 0x2a7d8f433471)>  (input #0)
    0x7fff5fbfedb8: [top + 8] <- 0x11c70a129ca9 ;  0x11c70a129ca9 <a Node with map 0x15b460834619>  (input #3)
    0x7fff5fbfedb0: [top + 0] <- 0x5de8fa04131 ;  0x5de8fa04131 <undefined>  (input #4)
[deoptimizing (soft): end 0x2a7d8f4e1179 <JS Function rollforward (SharedFunctionInfo 0x2a7d8f42dfb9)> @10 => node=41, pc=0x2fc336fcbec8, state=NO_REGISTERS, alignment=no padding, took 0.157 ms]
[deoptimizing (DEOPT soft): begin 0x2a7d8f43e331 <JS Function dispatch (SharedFunctionInfo 0x2a7d8f43d311)> (opt #7) @16, FP to SP delta: 96]
            ;;; deoptimize at 1_122: Insufficient type feedback for generic named access
  reading input frame dispatch => node=4, args=231, height=12; inputs:
      0: 0x2a7d8f43e331 ; (frame function) 0x2a7d8f43e331 <JS Function dispatch (SharedFunctionInfo 0x2a7d8f43d311)>
      1: 0x5de8fa04131 ; [fp + 40] 0x5de8fa04131 <undefined>
      2: 0x2a7d8f4e35f1 ; [fp + 32] 0x2a7d8f4e35f1 <JS Array[5]>
      3: 0x11c70a129f71 ; [fp + 24] 0x11c70a129f71 <an Object with map 0x15b460834989>
      4: 0x2bdadd671f69 ; [fp + 16] 0x2bdadd671f69 <an Object with map 0x15b460834409>
      5: 0x2a7d8f4df841 ; [fp - 24] 0x2a7d8f4df841 <FixedArray[5]>
      6: 0x5de8fa043f1 ; [fp - 56] 0x5de8fa043f1 <true>
      7: 0x5de8fa043f1 ; [fp - 64] 0x5de8fa043f1 <true>
      8: 0x5de8fa73081 ; [fp - 72] 0x5de8fa73081 <String[4]: test>
      9: 0 ; (int) [fp - 88] 
     10: 5 ; (int) [fp - 80] 
     11: 0x5de8fa04131 ; (literal 2) 0x5de8fa04131 <undefined>
     12: 0x2a7d8f426f41 ; [fp - 32] 0x2a7d8f426f41 <String[3]: one>
     13: 0x5de8fa04131 ; (literal 2) 0x5de8fa04131 <undefined>
     14: 0x5de8fa04131 ; (literal 2) 0x5de8fa04131 <undefined>
     15: 0x5de8fa04131 ; (literal 2) 0x5de8fa04131 <undefined>
     16: 0x2a7d8f43e2e9 ; [fp - 48] 0x2a7d8f43e2e9 <JS Function send (SharedFunctionInfo 0x2a7d8f43df49)>
  reading input frame send => node=6, args=43, height=3; inputs:
      0: 0x2a7d8f43e2e9 ; (literal 4) 0x2a7d8f43e2e9 <JS Function send (SharedFunctionInfo 0x2a7d8f43df49)>
      1: 0x5de8fa04131 ; (literal 2) 0x5de8fa04131 <undefined>
      2: 0x2a7d8f4cd2f9 ; [fp - 40] 0x2a7d8f4cd2f9 <an Object with map 0x15b4608347d1>
      3: 0x5de8fa73081 ; [fp - 72] 0x5de8fa73081 <String[4]: test>
      4: 0x00000000 ; [fp - 96] 0
      5: 0x5de8fa043f1 ; [fp - 64] 0x5de8fa043f1 <true>
      6: 0x11c70a129f71 ; [fp + 24] 0x11c70a129f71 <an Object with map 0x15b460834989>
      7: 0x5de8fa40161 ; (literal 5) 0x5de8fa40161 <FixedArray[137]>
      8: 0x5de8fa04131 ; rax 0x5de8fa04131 <undefined>
      9: 0x5de8fa04131 ; (literal 2) 0x5de8fa04131 <undefined>
  translating frame dispatch => node=231, height=88
    0x7fff5fbfeda0: [top + 144] <- 0x5de8fa04131 ;  0x5de8fa04131 <undefined>  (input #1)
    0x7fff5fbfed98: [top + 136] <- 0x2a7d8f4e35f1 ;  0x2a7d8f4e35f1 <JS Array[5]>  (input #2)
    0x7fff5fbfed90: [top + 128] <- 0x11c70a129f71 ;  0x11c70a129f71 <an Object with map 0x15b460834989>  (input #3)
    0x7fff5fbfed88: [top + 120] <- 0x2bdadd671f69 ;  0x2bdadd671f69 <an Object with map 0x15b460834409>  (input #4)
    0x7fff5fbfed80: [top + 112] <- 0x2fc336fcc03d ;  caller's pc
    0x7fff5fbfed78: [top + 104] <- 0x7fff5fbfedc0 ;  caller's fp
    0x7fff5fbfed70: [top + 96] <- 0x2a7d8f4df841 ;  context    0x2a7d8f4df841 <FixedArray[5]>  (input #5)
    0x7fff5fbfed68: [top + 88] <- 0x2a7d8f43e331 ;  function    0x2a7d8f43e331 <JS Function dispatch (SharedFunctionInfo 0x2a7d8f43d311)>  (input #0)
    0x7fff5fbfed60: [top + 80] <- 0x5de8fa043f1 ;  0x5de8fa043f1 <true>  (input #6)
    0x7fff5fbfed58: [top + 72] <- 0x5de8fa043f1 ;  0x5de8fa043f1 <true>  (input #7)
    0x7fff5fbfed50: [top + 64] <- 0x5de8fa73081 ;  0x5de8fa73081 <String[4]: test>  (input #8)
    0x7fff5fbfed48: [top + 56] <- 0x00000000 ;  0  (input #9)
    0x7fff5fbfed40: [top + 48] <- 0x500000000 ;  5  (input #10)
    0x7fff5fbfed38: [top + 40] <- 0x5de8fa04131 ;  0x5de8fa04131 <undefined>  (input #11)
    0x7fff5fbfed30: [top + 32] <- 0x2a7d8f426f41 ;  0x2a7d8f426f41 <String[3]: one>  (input #12)
    0x7fff5fbfed28: [top + 24] <- 0x5de8fa04131 ;  0x5de8fa04131 <undefined>  (input #13)
    0x7fff5fbfed20: [top + 16] <- 0x5de8fa04131 ;  0x5de8fa04131 <undefined>  (input #14)
    0x7fff5fbfed18: [top + 8] <- 0x5de8fa04131 ;  0x5de8fa04131 <undefined>  (input #15)
    0x7fff5fbfed10: [top + 0] <- 0x2a7d8f43e2e9 ;  0x2a7d8f43e2e9 <JS Function send (SharedFunctionInfo 0x2a7d8f43df49)>  (input #16)
  translating frame send => node=43, height=16
    0x7fff5fbfed08: [top + 88] <- 0x5de8fa04131 ;  0x5de8fa04131 <undefined>  (input #1)
    0x7fff5fbfed00: [top + 80] <- 0x2a7d8f4cd2f9 ;  0x2a7d8f4cd2f9 <an Object with map 0x15b4608347d1>  (input #2)
    0x7fff5fbfecf8: [top + 72] <- 0x5de8fa73081 ;  0x5de8fa73081 <String[4]: test>  (input #3)
    0x7fff5fbfecf0: [top + 64] <- 0x00000000 ;  0  (input #4)
    0x7fff5fbfece8: [top + 56] <- 0x5de8fa043f1 ;  0x5de8fa043f1 <true>  (input #5)
    0x7fff5fbfece0: [top + 48] <- 0x11c70a129f71 ;  0x11c70a129f71 <an Object with map 0x15b460834989>  (input #6)
    0x7fff5fbfecd8: [top + 40] <- 0x2fc336fcc280 ;  caller's pc
    0x7fff5fbfecd0: [top + 32] <- 0x7fff5fbfed78 ;  caller's fp
    0x7fff5fbfecc8: [top + 24] <- 0x5de8fa40161 ;  context    0x5de8fa40161 <FixedArray[137]>  (input #7)
    0x7fff5fbfecc0: [top + 16] <- 0x2a7d8f43e2e9 ;  function    0x2a7d8f43e2e9 <JS Function send (SharedFunctionInfo 0x2a7d8f43df49)>  (input #0)
    0x7fff5fbfecb8: [top + 8] <- 0x5de8fa04131 ;  0x5de8fa04131 <undefined>  (input #8)
    0x7fff5fbfecb0: [top + 0] <- 0x5de8fa04131 ;  0x5de8fa04131 <undefined>  (input #9)
[deoptimizing (soft): end 0x2a7d8f43e331 <JS Function dispatch (SharedFunctionInfo 0x2a7d8f43d311)> @16 => node=43, pc=0x2fc336fcc4bd, state=NO_REGISTERS, alignment=no padding, took 0.143 ms]
[deoptimizing (DEOPT soft): begin 0x2a7d8f43e2e9 <JS Function send (SharedFunctionInfo 0x2a7d8f43df49)> (opt #3) @2, FP to SP delta: 24]
            ;;; deoptimize at 0_122: Insufficient type feedback for generic named access
  reading input frame send => node=6, args=43, height=3; inputs:
      0: 0x2a7d8f43e2e9 ; (frame function) 0x2a7d8f43e2e9 <JS Function send (SharedFunctionInfo 0x2a7d8f43df49)>
      1: 0x5de8fa04131 ; [fp + 56] 0x5de8fa04131 <undefined>
      2: 0x2a7d8f4cd2f9 ; [fp + 48] 0x2a7d8f4cd2f9 <an Object with map 0x15b4608347d1>
      3: 0x5de8fa73081 ; [fp + 40] 0x5de8fa73081 <String[4]: test>
      4: 0x00000000 ; [fp + 32] 0
      5: 0x5de8fa043f1 ; [fp + 24] 0x5de8fa043f1 <true>
      6: 0x11c70a129f71 ; [fp + 16] 0x11c70a129f71 <an Object with map 0x15b460834989>
      7: 0x5de8fa40161 ; [fp - 24] 0x5de8fa40161 <FixedArray[137]>
      8: 0x5de8fa04131 ; rax 0x5de8fa04131 <undefined>
      9: 0x5de8fa04131 ; (literal 1) 0x5de8fa04131 <undefined>
  translating frame send => node=43, height=16
    0x7fff5fbfed08: [top + 88] <- 0x5de8fa04131 ;  0x5de8fa04131 <undefined>  (input #1)
    0x7fff5fbfed00: [top + 80] <- 0x2a7d8f4cd2f9 ;  0x2a7d8f4cd2f9 <an Object with map 0x15b4608347d1>  (input #2)
    0x7fff5fbfecf8: [top + 72] <- 0x5de8fa73081 ;  0x5de8fa73081 <String[4]: test>  (input #3)
    0x7fff5fbfecf0: [top + 64] <- 0x00000000 ;  0  (input #4)
    0x7fff5fbfece8: [top + 56] <- 0x5de8fa043f1 ;  0x5de8fa043f1 <true>  (input #5)
    0x7fff5fbfece0: [top + 48] <- 0x11c70a129f71 ;  0x11c70a129f71 <an Object with map 0x15b460834989>  (input #6)
    0x7fff5fbfecd8: [top + 40] <- 0x2fc336fcc280 ;  caller's pc
    0x7fff5fbfecd0: [top + 32] <- 0x7fff5fbfed78 ;  caller's fp
    0x7fff5fbfecc8: [top + 24] <- 0x5de8fa40161 ;  context    0x5de8fa40161 <FixedArray[137]>  (input #7)
    0x7fff5fbfecc0: [top + 16] <- 0x2a7d8f43e2e9 ;  function    0x2a7d8f43e2e9 <JS Function send (SharedFunctionInfo 0x2a7d8f43df49)>  (input #0)
    0x7fff5fbfecb8: [top + 8] <- 0x5de8fa04131 ;  0x5de8fa04131 <undefined>  (input #8)
    0x7fff5fbfecb0: [top + 0] <- 0x5de8fa04131 ;  0x5de8fa04131 <undefined>  (input #9)
[deoptimizing (soft): end 0x2a7d8f43e2e9 <JS Function send (SharedFunctionInfo 0x2a7d8f43df49)> @2 => node=43, pc=0x2fc336fcc4bd, state=NO_REGISTERS, alignment=no padding, took 0.057 ms]
--- FUNCTION SOURCE (send) id{15,0} ---
(store, type, subset, payload, state) {
  var handler = store[type];

  if (typeof handler === 'undefined' && typeof store.register === 'function') {
    handler = store.register()[type];
  }

  return typeof handler === 'function' ? handler.call(store, subset, payload, state) : handler;
}
--- END ---
--- FUNCTION SOURCE () id{16,0} ---
(state, transaction) {
      return dispatch(_this.stores, state, transaction);
    }
--- END ---
--- FUNCTION SOURCE (dispatch) id{16,1} ---
(stores, state, _ref) {
  var active = _ref.active;
  var payload = _ref.payload;
  var type = _ref.type;

  for (var i = 0, len = stores.length; active && i < len; i++) {
    var _stores$i = stores[i];
    var key = _stores$i[0];
    var store = _stores$i[1];

    var answer = send(store, type, state[key], payload, state);

    if (answer !== void 0) {
      state[key] = answer;
    }
  }

  return state;
}
--- END ---
INLINE (dispatch) id{16,1} AS 1 AT <0:36>
--- FUNCTION SOURCE (send) id{16,2} ---
(store, type, subset, payload, state) {
  var handler = store[type];

  if (typeof handler === 'undefined' && typeof store.register === 'function') {
    handler = store.register()[type];
  }

  return typeof handler === 'function' ? handler.call(store, subset, payload, state) : handler;
}
--- END ---
INLINE (send) id{16,2} AS 2 AT <1:279>
--- FUNCTION SOURCE (Store.register) id{17,0} ---
() {
    return {
      test: function(n) {
        return n + 1
      }
    }
  }
--- END ---
--- FUNCTION SOURCE (next) id{18,0} ---
() {
    return this.children[0] || null;
  }
--- END ---
