// ==UserScript==
// @name           OGame Redesign (v.6): Auction Timer
// @author         MomoCow
// @namespace      https://github.com/momocow
// @version        3.0.0
// @description    Displays a countdown timer for the Auction in OGame 6.*
// @include        *.ogame*gameforge.com/game/index.php?page=*
// @updateURL      https://raw.githubusercontent.com/momocow/OGame-Redesign-v.6-Auction-Timer/master/dist/auction-timer.meta.js
// @downloadURL    https://raw.githubusercontent.com/momocow/OGame-Redesign-v.6-Auction-Timer/master/dist/auction-timer.user.js
// @supportURL     https://github.com/momocow/OGame-Redesign-v.6-Auction-Timer/issues
// @run-at         document-idle
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_addStyle
// ==/UserScript==

/*****************************************************************************
 * Originaly developed by Vesselin
 * Currently developed by MomoCow after v3.0.0
 * Released under MIT
 *****************************************************************************/

/*****************************************************************************
 * Changelog
 * ### v3.0.0
 * - [Add] provide a more stateful timer
 * - [Changed] rewritten as a ES6 script with eslint `standard` coding style
 * - [Optmized] more stable dependency check
 *****************************************************************************/

/* jshint asi:true */

'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MAX_LOG_ENTRIES = 100;
var MAX_DEP_TIMEOUT = 10000;
var DEP_CHECK_PERIOD = 500;
var DEP_LIST = {
  AUCTION: ['io', '$', 'localStorage', 'nodeParams', 'simpleCountdown', 'loca'],
  NON_AUCTION: ['$', 'localStorage', 'simpleCountdown']
};

var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;

var isArray = function isArray(arr) {
  if (typeof Array.isArray === 'function') {
    return Array.isArray(arr);
  }

  return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
  if (!obj || toStr.call(obj) !== '[object Object]') {
    return false;
  }

  var hasOwnConstructor = hasOwn.call(obj, 'constructor');
  var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');

  if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
    return false;
  }

  var key;
  for (key in obj) {}

  return typeof key === 'undefined' || hasOwn.call(obj, key);
};

var extend = function extend() {
  var options, name, src, copy, copyIsArray, clone;
  var target = arguments[0];
  var i = 1;
  var length = arguments.length;
  var deep = false;

  if (typeof target === 'boolean') {
    deep = target;
    target = arguments[1] || {};

    i = 2;
  }
  if (target == null || (typeof target === 'undefined' ? 'undefined' : _typeof(target)) !== 'object' && typeof target !== 'function') {
    target = {};
  }

  for (; i < length; ++i) {
    options = arguments[i];

    if (options != null) {
      for (name in options) {
        src = target[name];
        copy = options[name];

        if (target !== copy) {
          if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
            if (copyIsArray) {
              copyIsArray = false;
              clone = src && isArray(src) ? src : [];
            } else {
              clone = src && isPlainObject(src) ? src : {};
            }

            target[name] = extend(deep, clone, copy);
          } else if (typeof copy !== 'undefined') {
            target[name] = copy;
          }
        }
      }
    }
  }

  return target;
};

var domain;

function EventHandlers() {}
EventHandlers.prototype = Object.create(null);

function EventEmitter() {
  EventEmitter.init.call(this);
}

EventEmitter.EventEmitter = EventEmitter;

EventEmitter.usingDomains = false;

EventEmitter.prototype.domain = undefined;
EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

EventEmitter.defaultMaxListeners = 10;

EventEmitter.init = function () {
  this.domain = null;
  if (EventEmitter.usingDomains) {
    if (domain.active && !(this instanceof domain.Domain)) {
      this.domain = domain.active;
    }
  }

  if (!this._events || this._events === Object.getPrototypeOf(this)._events) {
    this._events = new EventHandlers();
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n)) throw new TypeError('"n" argument must be a positive number');
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined) return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

function emitNone(handler, isFn, self) {
  if (isFn) handler.call(self);else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i) {
      listeners[i].call(self);
    }
  }
}
function emitOne(handler, isFn, self, arg1) {
  if (isFn) handler.call(self, arg1);else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i) {
      listeners[i].call(self, arg1);
    }
  }
}
function emitTwo(handler, isFn, self, arg1, arg2) {
  if (isFn) handler.call(self, arg1, arg2);else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i) {
      listeners[i].call(self, arg1, arg2);
    }
  }
}
function emitThree(handler, isFn, self, arg1, arg2, arg3) {
  if (isFn) handler.call(self, arg1, arg2, arg3);else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i) {
      listeners[i].call(self, arg1, arg2, arg3);
    }
  }
}

function emitMany(handler, isFn, self, args) {
  if (isFn) handler.apply(self, args);else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i) {
      listeners[i].apply(self, args);
    }
  }
}

EventEmitter.prototype.emit = function emit(type) {
  var er, handler, len, args, i, events, domain;
  var needDomainExit = false;
  var doError = type === 'error';

  events = this._events;
  if (events) doError = doError && events.error == null;else if (!doError) return false;

  domain = this.domain;

  if (doError) {
    er = arguments[1];
    if (domain) {
      if (!er) er = new Error('Uncaught, unspecified "error" event');
      er.domainEmitter = this;
      er.domain = domain;
      er.domainThrown = false;
      domain.emit('error', er);
    } else if (er instanceof Error) {
      throw er;
    } else {
      var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
      err.context = er;
      throw err;
    }
    return false;
  }

  handler = events[type];

  if (!handler) return false;

  var isFn = typeof handler === 'function';
  len = arguments.length;
  switch (len) {
    case 1:
      emitNone(handler, isFn, this);
      break;
    case 2:
      emitOne(handler, isFn, this, arguments[1]);
      break;
    case 3:
      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
      break;
    case 4:
      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
      break;

    default:
      args = new Array(len - 1);
      for (i = 1; i < len; i++) {
        args[i - 1] = arguments[i];
      }emitMany(handler, isFn, this, args);
  }

  if (needDomainExit) domain.exit();

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  if (typeof listener !== 'function') throw new TypeError('"listener" argument must be a function');

  events = target._events;
  if (!events) {
    events = target._events = new EventHandlers();
    target._eventsCount = 0;
  } else {
    if (events.newListener) {
      target.emit('newListener', type, listener.listener ? listener.listener : listener);

      events = target._events;
    }
    existing = events[type];
  }

  if (!existing) {
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      existing = events[type] = prepend ? [listener, existing] : [existing, listener];
    } else {
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    }

    if (!existing.warned) {
      m = $getMaxListeners(target);
      if (m && m > 0 && existing.length > m) {
        existing.warned = true;
        var w = new Error('Possible EventEmitter memory leak detected. ' + existing.length + ' ' + type + ' listeners added. ' + 'Use emitter.setMaxListeners() to increase limit');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        emitWarning(w);
      }
    }
  }

  return target;
}
function emitWarning(e) {
  typeof console.warn === 'function' ? console.warn(e) : console.log(e);
}
EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener = function prependListener(type, listener) {
  return _addListener(this, type, listener, true);
};

function _onceWrap(target, type, listener) {
  var fired = false;
  function g() {
    target.removeListener(type, g);
    if (!fired) {
      fired = true;
      listener.apply(target, arguments);
    }
  }
  g.listener = listener;
  return g;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function') throw new TypeError('"listener" argument must be a function');
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener = function prependOnceListener(type, listener) {
  if (typeof listener !== 'function') throw new TypeError('"listener" argument must be a function');
  this.prependListener(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.removeListener = function removeListener(type, listener) {
  var list, events, position, i, originalListener;

  if (typeof listener !== 'function') throw new TypeError('"listener" argument must be a function');

  events = this._events;
  if (!events) return this;

  list = events[type];
  if (!list) return this;

  if (list === listener || list.listener && list.listener === listener) {
    if (--this._eventsCount === 0) this._events = new EventHandlers();else {
      delete events[type];
      if (events.removeListener) this.emit('removeListener', type, list.listener || listener);
    }
  } else if (typeof list !== 'function') {
    position = -1;

    for (i = list.length; i-- > 0;) {
      if (list[i] === listener || list[i].listener && list[i].listener === listener) {
        originalListener = list[i].listener;
        position = i;
        break;
      }
    }

    if (position < 0) return this;

    if (list.length === 1) {
      list[0] = undefined;
      if (--this._eventsCount === 0) {
        this._events = new EventHandlers();
        return this;
      } else {
        delete events[type];
      }
    } else {
      spliceOne(list, position);
    }

    if (events.removeListener) this.emit('removeListener', type, originalListener || listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function removeAllListeners(type) {
  var listeners, events;

  events = this._events;
  if (!events) return this;

  if (!events.removeListener) {
    if (arguments.length === 0) {
      this._events = new EventHandlers();
      this._eventsCount = 0;
    } else if (events[type]) {
      if (--this._eventsCount === 0) this._events = new EventHandlers();else delete events[type];
    }
    return this;
  }

  if (arguments.length === 0) {
    var keys = Object.keys(events);
    for (var i = 0, key; i < keys.length; ++i) {
      key = keys[i];
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = new EventHandlers();
    this._eventsCount = 0;
    return this;
  }

  listeners = events[type];

  if (typeof listeners === 'function') {
    this.removeListener(type, listeners);
  } else if (listeners) {
    do {
      this.removeListener(type, listeners[listeners.length - 1]);
    } while (listeners[0]);
  }

  return this;
};

EventEmitter.prototype.listeners = function listeners(type) {
  var evlistener;
  var ret;
  var events = this._events;

  if (!events) ret = [];else {
    evlistener = events[type];
    if (!evlistener) ret = [];else if (typeof evlistener === 'function') ret = [evlistener.listener || evlistener];else ret = unwrapListeners(evlistener);
  }

  return ret;
};

EventEmitter.listenerCount = function (emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};

function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1) {
    list[i] = list[k];
  }list.pop();
}

function arrayClone(arr, i) {
  var copy = new Array(i);
  while (i--) {
    copy[i] = arr[i];
  }return copy;
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function Callable(property) {
  var func = this.constructor.prototype[property];
  var apply = function apply() {
    return func.apply(apply, arguments);
  };
  Object.setPrototypeOf(apply, this.constructor.prototype);
  Object.getOwnPropertyNames(func).forEach(function (p) {
    Object.defineProperty(apply, p, Object.getOwnPropertyDescriptor(func, p));
  });
  return apply;
}
Callable.prototype = Object.create(Function.prototype);

var SafeFunction = function (_Callable) {
  _inherits(SafeFunction, _Callable);

  function SafeFunction(fn, defaultReturn) {
    _classCallCheck(this, SafeFunction);

    if (typeof fn !== 'function') {
      throw new TypeError('fn\' is not a function.');
    }

    var _this = _possibleConstructorReturn(this, (SafeFunction.__proto__ || Object.getPrototypeOf(SafeFunction)).call(this, '__call__'));

    _this._fn = fn;
    _this._rtn = defaultReturn;

    extend(true, _this, new EventEmitter());
    return _this;
  }

  _createClass(SafeFunction, [{
    key: '__call__',
    value: function __call__() {
      try {
        return this._fn.apply(this, arguments);
      } catch (err) {
        this.emit('error', err);
        return this._rtn;
      }
    }
  }]);

  return SafeFunction;
}(Callable);

var NOT_SUPPORTED_ENV = '[Auction Timer] The script will not work on your browser since it is out-of-date.\n\nYou can either disable the script or update your browser to avoid the alert.';

var DependencyError = function (_Error) {
  _inherits(DependencyError, _Error);

  function DependencyError(deps) {
    _classCallCheck(this, DependencyError);

    var _this2 = _possibleConstructorReturn(this, (DependencyError.__proto__ || Object.getPrototypeOf(DependencyError)).call(this, 'Dependency check failed. Dependencies, ' + deps.map(function (e) {
      return '"' + e + '"';
    }).join(', ') + ', are not found.'));

    _this2.name = 'DependencyError';
    return _this2;
  }

  return DependencyError;
}(Error);

var NotSupportedError = function (_Error2) {
  _inherits(NotSupportedError, _Error2);

  function NotSupportedError() {
    _classCallCheck(this, NotSupportedError);

    var _this3 = _possibleConstructorReturn(this, (NotSupportedError.__proto__ || Object.getPrototypeOf(NotSupportedError)).call(this, '' + NOT_SUPPORTED_ENV));

    _this3.name = 'NotSupportedError';
    return _this3;
  }

  return NotSupportedError;
}(Error);

var global$1 = typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};

var lookup = [];
var revLookup = [];
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
var inited = false;
function init() {
  inited = true;
  var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  for (var i = 0, len = code.length; i < len; ++i) {
    lookup[i] = code[i];
    revLookup[code.charCodeAt(i)] = i;
  }

  revLookup['-'.charCodeAt(0)] = 62;
  revLookup['_'.charCodeAt(0)] = 63;
}

function toByteArray(b64) {
  if (!inited) {
    init();
  }
  var i, j, l, tmp, placeHolders, arr;
  var len = b64.length;

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4');
  }

  placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0;

  arr = new Arr(len * 3 / 4 - placeHolders);

  l = placeHolders > 0 ? len - 4 : len;

  var L = 0;

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
    arr[L++] = tmp >> 16 & 0xFF;
    arr[L++] = tmp >> 8 & 0xFF;
    arr[L++] = tmp & 0xFF;
  }

  if (placeHolders === 2) {
    tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
    arr[L++] = tmp & 0xFF;
  } else if (placeHolders === 1) {
    tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
    arr[L++] = tmp >> 8 & 0xFF;
    arr[L++] = tmp & 0xFF;
  }

  return arr;
}

function tripletToBase64(num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
}

function encodeChunk(uint8, start, end) {
  var tmp;
  var output = [];
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + uint8[i + 2];
    output.push(tripletToBase64(tmp));
  }
  return output.join('');
}

function fromByteArray(uint8) {
  if (!inited) {
    init();
  }
  var tmp;
  var len = uint8.length;
  var extraBytes = len % 3;
  var output = '';
  var parts = [];
  var maxChunkLength = 16383;
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
  }

  if (extraBytes === 1) {
    tmp = uint8[len - 1];
    output += lookup[tmp >> 2];
    output += lookup[tmp << 4 & 0x3F];
    output += '==';
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1];
    output += lookup[tmp >> 10];
    output += lookup[tmp >> 4 & 0x3F];
    output += lookup[tmp << 2 & 0x3F];
    output += '=';
  }

  parts.push(output);

  return parts.join('');
}

function read(buffer, offset, isLE, mLen, nBytes) {
  var e, m;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var nBits = -7;
  var i = isLE ? nBytes - 1 : 0;
  var d = isLE ? -1 : 1;
  var s = buffer[offset + i];

  i += d;

  e = s & (1 << -nBits) - 1;
  s >>= -nBits;
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & (1 << -nBits) - 1;
  e >>= -nBits;
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : (s ? -1 : 1) * Infinity;
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
}

function write(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
  var i = isLE ? 0 : nBytes - 1;
  var d = isLE ? 1 : -1;
  var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = e << mLen | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128;
}

var toString = {}.toString;

var isArray$1 = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

var INSPECT_MAX_BYTES = 50;

Buffer.TYPED_ARRAY_SUPPORT = global$1.TYPED_ARRAY_SUPPORT !== undefined ? global$1.TYPED_ARRAY_SUPPORT : true;

function kMaxLength() {
  return Buffer.TYPED_ARRAY_SUPPORT ? 0x7fffffff : 0x3fffffff;
}

function createBuffer(that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length');
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    that = new Uint8Array(length);
    that.__proto__ = Buffer.prototype;
  } else {
    if (that === null) {
      that = new Buffer(length);
    }
    that.length = length;
  }

  return that;
}

function Buffer(arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length);
  }

  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error('If encoding is specified then the first argument must be a string');
    }
    return allocUnsafe(this, arg);
  }
  return from(this, arg, encodingOrOffset, length);
}

Buffer.poolSize = 8192;
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype;
  return arr;
};

function from(that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number');
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length);
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset);
  }

  return fromObject(that, value);
}

Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length);
};

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype;
  Buffer.__proto__ = Uint8Array;
}

function assertSize(size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number');
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative');
  }
}

function alloc(that, size, fill, encoding) {
  assertSize(size);
  if (size <= 0) {
    return createBuffer(that, size);
  }
  if (fill !== undefined) {
    return typeof encoding === 'string' ? createBuffer(that, size).fill(fill, encoding) : createBuffer(that, size).fill(fill);
  }
  return createBuffer(that, size);
}

Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding);
};

function allocUnsafe(that, size) {
  assertSize(size);
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0;
    }
  }
  return that;
}

Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size);
};

Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size);
};

function fromString(that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8';
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding');
  }

  var length = byteLength(string, encoding) | 0;
  that = createBuffer(that, length);

  var actual = that.write(string, encoding);

  if (actual !== length) {
    that = that.slice(0, actual);
  }

  return that;
}

function fromArrayLike(that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0;
  that = createBuffer(that, length);
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255;
  }
  return that;
}

function fromArrayBuffer(that, array, byteOffset, length) {
  array.byteLength;

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds');
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds');
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array);
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset);
  } else {
    array = new Uint8Array(array, byteOffset, length);
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    that = array;
    that.__proto__ = Buffer.prototype;
  } else {
    that = fromArrayLike(that, array);
  }
  return that;
}

function fromObject(that, obj) {
  if (internalIsBuffer(obj)) {
    var len = checked(obj.length) | 0;
    that = createBuffer(that, len);

    if (that.length === 0) {
      return that;
    }

    obj.copy(that, 0, 0, len);
    return that;
  }

  if (obj) {
    if (typeof ArrayBuffer !== 'undefined' && obj.buffer instanceof ArrayBuffer || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0);
      }
      return fromArrayLike(that, obj);
    }

    if (obj.type === 'Buffer' && isArray$1(obj.data)) {
      return fromArrayLike(that, obj.data);
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.');
}

function checked(length) {
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' + 'size: 0x' + kMaxLength().toString(16) + ' bytes');
  }
  return length | 0;
}
Buffer.isBuffer = isBuffer;
function internalIsBuffer(b) {
  return !!(b != null && b._isBuffer);
}

Buffer.compare = function compare(a, b) {
  if (!internalIsBuffer(a) || !internalIsBuffer(b)) {
    throw new TypeError('Arguments must be Buffers');
  }

  if (a === b) return 0;

  var x = a.length;
  var y = b.length;

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break;
    }
  }

  if (x < y) return -1;
  if (y < x) return 1;
  return 0;
};

Buffer.isEncoding = function isEncoding(encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true;
    default:
      return false;
  }
};

Buffer.concat = function concat(list, length) {
  if (!isArray$1(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers');
  }

  if (list.length === 0) {
    return Buffer.alloc(0);
  }

  var i;
  if (length === undefined) {
    length = 0;
    for (i = 0; i < list.length; ++i) {
      length += list[i].length;
    }
  }

  var buffer = Buffer.allocUnsafe(length);
  var pos = 0;
  for (i = 0; i < list.length; ++i) {
    var buf = list[i];
    if (!internalIsBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers');
    }
    buf.copy(buffer, pos);
    pos += buf.length;
  }
  return buffer;
};

function byteLength(string, encoding) {
  if (internalIsBuffer(string)) {
    return string.length;
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' && (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength;
  }
  if (typeof string !== 'string') {
    string = '' + string;
  }

  var len = string.length;
  if (len === 0) return 0;

  var loweredCase = false;
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len;
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length;
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2;
      case 'hex':
        return len >>> 1;
      case 'base64':
        return base64ToBytes(string).length;
      default:
        if (loweredCase) return utf8ToBytes(string).length;
        encoding = ('' + encoding).toLowerCase();
        loweredCase = true;
    }
  }
}
Buffer.byteLength = byteLength;

function slowToString(encoding, start, end) {
  var loweredCase = false;

  if (start === undefined || start < 0) {
    start = 0;
  }

  if (start > this.length) {
    return '';
  }

  if (end === undefined || end > this.length) {
    end = this.length;
  }

  if (end <= 0) {
    return '';
  }

  end >>>= 0;
  start >>>= 0;

  if (end <= start) {
    return '';
  }

  if (!encoding) encoding = 'utf8';

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end);

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end);

      case 'ascii':
        return asciiSlice(this, start, end);

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end);

      case 'base64':
        return base64Slice(this, start, end);

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end);

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
        encoding = (encoding + '').toLowerCase();
        loweredCase = true;
    }
  }
}

Buffer.prototype._isBuffer = true;

function swap(b, n, m) {
  var i = b[n];
  b[n] = b[m];
  b[m] = i;
}

Buffer.prototype.swap16 = function swap16() {
  var len = this.length;
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits');
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1);
  }
  return this;
};

Buffer.prototype.swap32 = function swap32() {
  var len = this.length;
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits');
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3);
    swap(this, i + 1, i + 2);
  }
  return this;
};

Buffer.prototype.swap64 = function swap64() {
  var len = this.length;
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits');
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7);
    swap(this, i + 1, i + 6);
    swap(this, i + 2, i + 5);
    swap(this, i + 3, i + 4);
  }
  return this;
};

Buffer.prototype.toString = function toString() {
  var length = this.length | 0;
  if (length === 0) return '';
  if (arguments.length === 0) return utf8Slice(this, 0, length);
  return slowToString.apply(this, arguments);
};

Buffer.prototype.equals = function equals(b) {
  if (!internalIsBuffer(b)) throw new TypeError('Argument must be a Buffer');
  if (this === b) return true;
  return Buffer.compare(this, b) === 0;
};

Buffer.prototype.inspect = function inspect() {
  var str = '';
  var max = INSPECT_MAX_BYTES;
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
    if (this.length > max) str += ' ... ';
  }
  return '<Buffer ' + str + '>';
};

Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
  if (!internalIsBuffer(target)) {
    throw new TypeError('Argument must be a Buffer');
  }

  if (start === undefined) {
    start = 0;
  }
  if (end === undefined) {
    end = target ? target.length : 0;
  }
  if (thisStart === undefined) {
    thisStart = 0;
  }
  if (thisEnd === undefined) {
    thisEnd = this.length;
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index');
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0;
  }
  if (thisStart >= thisEnd) {
    return -1;
  }
  if (start >= end) {
    return 1;
  }

  start >>>= 0;
  end >>>= 0;
  thisStart >>>= 0;
  thisEnd >>>= 0;

  if (this === target) return 0;

  var x = thisEnd - thisStart;
  var y = end - start;
  var len = Math.min(x, y);

  var thisCopy = this.slice(thisStart, thisEnd);
  var targetCopy = target.slice(start, end);

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i];
      y = targetCopy[i];
      break;
    }
  }

  if (x < y) return -1;
  if (y < x) return 1;
  return 0;
};

function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
  if (buffer.length === 0) return -1;

  if (typeof byteOffset === 'string') {
    encoding = byteOffset;
    byteOffset = 0;
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff;
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000;
  }
  byteOffset = +byteOffset;
  if (isNaN(byteOffset)) {
    byteOffset = dir ? 0 : buffer.length - 1;
  }

  if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
  if (byteOffset >= buffer.length) {
    if (dir) return -1;else byteOffset = buffer.length - 1;
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0;else return -1;
  }

  if (typeof val === 'string') {
    val = Buffer.from(val, encoding);
  }

  if (internalIsBuffer(val)) {
    if (val.length === 0) {
      return -1;
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
  } else if (typeof val === 'number') {
    val = val & 0xFF;
    if (Buffer.TYPED_ARRAY_SUPPORT && typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
      }
    }
    return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
  }

  throw new TypeError('val must be string, number or Buffer');
}

function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
  var indexSize = 1;
  var arrLength = arr.length;
  var valLength = val.length;

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase();
    if (encoding === 'ucs2' || encoding === 'ucs-2' || encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1;
      }
      indexSize = 2;
      arrLength /= 2;
      valLength /= 2;
      byteOffset /= 2;
    }
  }

  function read$$1(buf, i) {
    if (indexSize === 1) {
      return buf[i];
    } else {
      return buf.readUInt16BE(i * indexSize);
    }
  }

  var i;
  if (dir) {
    var foundIndex = -1;
    for (i = byteOffset; i < arrLength; i++) {
      if (read$$1(arr, i) === read$$1(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i;
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
      } else {
        if (foundIndex !== -1) i -= i - foundIndex;
        foundIndex = -1;
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
    for (i = byteOffset; i >= 0; i--) {
      var found = true;
      for (var j = 0; j < valLength; j++) {
        if (read$$1(arr, i + j) !== read$$1(val, j)) {
          found = false;
          break;
        }
      }
      if (found) return i;
    }
  }

  return -1;
}

Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1;
};

Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
};

Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
};

function hexWrite(buf, string, offset, length) {
  offset = Number(offset) || 0;
  var remaining = buf.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = Number(length);
    if (length > remaining) {
      length = remaining;
    }
  }

  var strLen = string.length;
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string');

  if (length > strLen / 2) {
    length = strLen / 2;
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(parsed)) return i;
    buf[offset + i] = parsed;
  }
  return i;
}

function utf8Write(buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
}

function asciiWrite(buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length);
}

function latin1Write(buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length);
}

function base64Write(buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length);
}

function ucs2Write(buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
}

Buffer.prototype.write = function write$$1(string, offset, length, encoding) {
  if (offset === undefined) {
    encoding = 'utf8';
    length = this.length;
    offset = 0;
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset;
    length = this.length;
    offset = 0;
  } else if (isFinite(offset)) {
    offset = offset | 0;
    if (isFinite(length)) {
      length = length | 0;
      if (encoding === undefined) encoding = 'utf8';
    } else {
      encoding = length;
      length = undefined;
    }
  } else {
    throw new Error('Buffer.write(string, encoding, offset[, length]) is no longer supported');
  }

  var remaining = this.length - offset;
  if (length === undefined || length > remaining) length = remaining;

  if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds');
  }

  if (!encoding) encoding = 'utf8';

  var loweredCase = false;
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length);

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length);

      case 'ascii':
        return asciiWrite(this, string, offset, length);

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length);

      case 'base64':
        return base64Write(this, string, offset, length);

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length);

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
        encoding = ('' + encoding).toLowerCase();
        loweredCase = true;
    }
  }
};

Buffer.prototype.toJSON = function toJSON() {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  };
};

function base64Slice(buf, start, end) {
  if (start === 0 && end === buf.length) {
    return fromByteArray(buf);
  } else {
    return fromByteArray(buf.slice(start, end));
  }
}

function utf8Slice(buf, start, end) {
  end = Math.min(buf.length, end);
  var res = [];

  var i = start;
  while (i < end) {
    var firstByte = buf[i];
    var codePoint = null;
    var bytesPerSequence = firstByte > 0xEF ? 4 : firstByte > 0xDF ? 3 : firstByte > 0xBF ? 2 : 1;

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint;

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte;
          }
          break;
        case 2:
          secondByte = buf[i + 1];
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | secondByte & 0x3F;
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint;
            }
          }
          break;
        case 3:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | thirdByte & 0x3F;
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint;
            }
          }
          break;
        case 4:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          fourthByte = buf[i + 3];
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | fourthByte & 0x3F;
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint;
            }
          }
      }
    }

    if (codePoint === null) {
      codePoint = 0xFFFD;
      bytesPerSequence = 1;
    } else if (codePoint > 0xFFFF) {
      codePoint -= 0x10000;
      res.push(codePoint >>> 10 & 0x3FF | 0xD800);
      codePoint = 0xDC00 | codePoint & 0x3FF;
    }

    res.push(codePoint);
    i += bytesPerSequence;
  }

  return decodeCodePointsArray(res);
}

var MAX_ARGUMENTS_LENGTH = 0x1000;

function decodeCodePointsArray(codePoints) {
  var len = codePoints.length;
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints);
  }

  var res = '';
  var i = 0;
  while (i < len) {
    res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
  }
  return res;
}

function asciiSlice(buf, start, end) {
  var ret = '';
  end = Math.min(buf.length, end);

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F);
  }
  return ret;
}

function latin1Slice(buf, start, end) {
  var ret = '';
  end = Math.min(buf.length, end);

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i]);
  }
  return ret;
}

function hexSlice(buf, start, end) {
  var len = buf.length;

  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;

  var out = '';
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i]);
  }
  return out;
}

function utf16leSlice(buf, start, end) {
  var bytes = buf.slice(start, end);
  var res = '';
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
  }
  return res;
}

Buffer.prototype.slice = function slice(start, end) {
  var len = this.length;
  start = ~~start;
  end = end === undefined ? len : ~~end;

  if (start < 0) {
    start += len;
    if (start < 0) start = 0;
  } else if (start > len) {
    start = len;
  }

  if (end < 0) {
    end += len;
    if (end < 0) end = 0;
  } else if (end > len) {
    end = len;
  }

  if (end < start) end = start;

  var newBuf;
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end);
    newBuf.__proto__ = Buffer.prototype;
  } else {
    var sliceLen = end - start;
    newBuf = new Buffer(sliceLen, undefined);
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start];
    }
  }

  return newBuf;
};

function checkOffset(offset, ext, length) {
  if (offset % 1 !== 0 || offset < 0) throw new RangeError('offset is not uint');
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length');
}

Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);

  var val = this[offset];
  var mul = 1;
  var i = 0;
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul;
  }

  return val;
};

Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length);
  }

  var val = this[offset + --byteLength];
  var mul = 1;
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul;
  }

  return val;
};

Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length);
  return this[offset];
};

Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  return this[offset] | this[offset + 1] << 8;
};

Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  return this[offset] << 8 | this[offset + 1];
};

Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 0x1000000;
};

Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return this[offset] * 0x1000000 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
};

Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);

  var val = this[offset];
  var mul = 1;
  var i = 0;
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul;
  }
  mul *= 0x80;

  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

  return val;
};

Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);

  var i = byteLength;
  var mul = 1;
  var val = this[offset + --i];
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul;
  }
  mul *= 0x80;

  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

  return val;
};

Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length);
  if (!(this[offset] & 0x80)) return this[offset];
  return (0xff - this[offset] + 1) * -1;
};

Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  var val = this[offset] | this[offset + 1] << 8;
  return val & 0x8000 ? val | 0xFFFF0000 : val;
};

Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  var val = this[offset + 1] | this[offset] << 8;
  return val & 0x8000 ? val | 0xFFFF0000 : val;
};

Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
};

Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
};

Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);
  return read(this, offset, true, 23, 4);
};

Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);
  return read(this, offset, false, 23, 4);
};

Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length);
  return read(this, offset, true, 52, 8);
};

Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length);
  return read(this, offset, false, 52, 8);
};

function checkInt(buf, value, offset, ext, max, min) {
  if (!internalIsBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
  if (offset + ext > buf.length) throw new RangeError('Index out of range');
}

Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
    checkInt(this, value, offset, byteLength, maxBytes, 0);
  }

  var mul = 1;
  var i = 0;
  this[offset] = value & 0xFF;
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = value / mul & 0xFF;
  }

  return offset + byteLength;
};

Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
    checkInt(this, value, offset, byteLength, maxBytes, 0);
  }

  var i = byteLength - 1;
  var mul = 1;
  this[offset + i] = value & 0xFF;
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = value / mul & 0xFF;
  }

  return offset + byteLength;
};

Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
  this[offset] = value & 0xff;
  return offset + 1;
};

function objectWriteUInt16(buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1;
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & 0xff << 8 * (littleEndian ? i : 1 - i)) >>> (littleEndian ? i : 1 - i) * 8;
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value & 0xff;
    this[offset + 1] = value >>> 8;
  } else {
    objectWriteUInt16(this, value, offset, true);
  }
  return offset + 2;
};

Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value >>> 8;
    this[offset + 1] = value & 0xff;
  } else {
    objectWriteUInt16(this, value, offset, false);
  }
  return offset + 2;
};

function objectWriteUInt32(buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1;
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = value >>> (littleEndian ? i : 3 - i) * 8 & 0xff;
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = value >>> 24;
    this[offset + 2] = value >>> 16;
    this[offset + 1] = value >>> 8;
    this[offset] = value & 0xff;
  } else {
    objectWriteUInt32(this, value, offset, true);
  }
  return offset + 4;
};

Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value >>> 24;
    this[offset + 1] = value >>> 16;
    this[offset + 2] = value >>> 8;
    this[offset + 3] = value & 0xff;
  } else {
    objectWriteUInt32(this, value, offset, false);
  }
  return offset + 4;
};

Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1);

    checkInt(this, value, offset, byteLength, limit - 1, -limit);
  }

  var i = 0;
  var mul = 1;
  var sub = 0;
  this[offset] = value & 0xFF;
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1;
    }
    this[offset + i] = (value / mul >> 0) - sub & 0xFF;
  }

  return offset + byteLength;
};

Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1);

    checkInt(this, value, offset, byteLength, limit - 1, -limit);
  }

  var i = byteLength - 1;
  var mul = 1;
  var sub = 0;
  this[offset + i] = value & 0xFF;
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1;
    }
    this[offset + i] = (value / mul >> 0) - sub & 0xFF;
  }

  return offset + byteLength;
};

Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
  if (value < 0) value = 0xff + value + 1;
  this[offset] = value & 0xff;
  return offset + 1;
};

Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value & 0xff;
    this[offset + 1] = value >>> 8;
  } else {
    objectWriteUInt16(this, value, offset, true);
  }
  return offset + 2;
};

Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value >>> 8;
    this[offset + 1] = value & 0xff;
  } else {
    objectWriteUInt16(this, value, offset, false);
  }
  return offset + 2;
};

Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value & 0xff;
    this[offset + 1] = value >>> 8;
    this[offset + 2] = value >>> 16;
    this[offset + 3] = value >>> 24;
  } else {
    objectWriteUInt32(this, value, offset, true);
  }
  return offset + 4;
};

Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
  if (value < 0) value = 0xffffffff + value + 1;
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value >>> 24;
    this[offset + 1] = value >>> 16;
    this[offset + 2] = value >>> 8;
    this[offset + 3] = value & 0xff;
  } else {
    objectWriteUInt32(this, value, offset, false);
  }
  return offset + 4;
};

function checkIEEE754(buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range');
  if (offset < 0) throw new RangeError('Index out of range');
}

function writeFloat(buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38);
  }
  write(buf, value, offset, littleEndian, 23, 4);
  return offset + 4;
}

Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert);
};

Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert);
};

function writeDouble(buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308);
  }
  write(buf, value, offset, littleEndian, 52, 8);
  return offset + 8;
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert);
};

Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert);
};

Buffer.prototype.copy = function copy(target, targetStart, start, end) {
  if (!start) start = 0;
  if (!end && end !== 0) end = this.length;
  if (targetStart >= target.length) targetStart = target.length;
  if (!targetStart) targetStart = 0;
  if (end > 0 && end < start) end = start;

  if (end === start) return 0;
  if (target.length === 0 || this.length === 0) return 0;

  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds');
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds');
  if (end < 0) throw new RangeError('sourceEnd out of bounds');

  if (end > this.length) end = this.length;
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start;
  }

  var len = end - start;
  var i;

  if (this === target && start < targetStart && targetStart < end) {
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start];
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start];
    }
  } else {
    Uint8Array.prototype.set.call(target, this.subarray(start, start + len), targetStart);
  }

  return len;
};

Buffer.prototype.fill = function fill(val, start, end, encoding) {
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start;
      start = 0;
      end = this.length;
    } else if (typeof end === 'string') {
      encoding = end;
      end = this.length;
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0);
      if (code < 256) {
        val = code;
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string');
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding);
    }
  } else if (typeof val === 'number') {
    val = val & 255;
  }

  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index');
  }

  if (end <= start) {
    return this;
  }

  start = start >>> 0;
  end = end === undefined ? this.length : end >>> 0;

  if (!val) val = 0;

  var i;
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val;
    }
  } else {
    var bytes = internalIsBuffer(val) ? val : utf8ToBytes(new Buffer(val, encoding).toString());
    var len = bytes.length;
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len];
    }
  }

  return this;
};

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

function base64clean(str) {
  str = stringtrim(str).replace(INVALID_BASE64_RE, '');

  if (str.length < 2) return '';

  while (str.length % 4 !== 0) {
    str = str + '=';
  }
  return str;
}

function stringtrim(str) {
  if (str.trim) return str.trim();
  return str.replace(/^\s+|\s+$/g, '');
}

function toHex(n) {
  if (n < 16) return '0' + n.toString(16);
  return n.toString(16);
}

function utf8ToBytes(string, units) {
  units = units || Infinity;
  var codePoint;
  var length = string.length;
  var leadSurrogate = null;
  var bytes = [];

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i);

    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      if (!leadSurrogate) {
        if (codePoint > 0xDBFF) {
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          continue;
        } else if (i + 1 === length) {
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          continue;
        }

        leadSurrogate = codePoint;

        continue;
      }

      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
        leadSurrogate = codePoint;
        continue;
      }

      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
    } else if (leadSurrogate) {
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
    }

    leadSurrogate = null;

    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break;
      bytes.push(codePoint);
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break;
      bytes.push(codePoint >> 0x6 | 0xC0, codePoint & 0x3F | 0x80);
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break;
      bytes.push(codePoint >> 0xC | 0xE0, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break;
      bytes.push(codePoint >> 0x12 | 0xF0, codePoint >> 0xC & 0x3F | 0x80, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
    } else {
      throw new Error('Invalid code point');
    }
  }

  return bytes;
}

function asciiToBytes(str) {
  var byteArray = [];
  for (var i = 0; i < str.length; ++i) {
    byteArray.push(str.charCodeAt(i) & 0xFF);
  }
  return byteArray;
}

function utf16leToBytes(str, units) {
  var c, hi, lo;
  var byteArray = [];
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break;

    c = str.charCodeAt(i);
    hi = c >> 8;
    lo = c % 256;
    byteArray.push(lo);
    byteArray.push(hi);
  }

  return byteArray;
}

function base64ToBytes(str) {
  return toByteArray(base64clean(str));
}

function blitBuffer(src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if (i + offset >= dst.length || i >= src.length) break;
    dst[i + offset] = src[i];
  }
  return i;
}

function isnan(val) {
  return val !== val;
}

function isBuffer(obj) {
  return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj));
}

function isFastBuffer(obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj);
}

function isSlowBuffer(obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isFastBuffer(obj.slice(0, 0));
}

if (typeof global$1.setTimeout === 'function') {}
if (typeof global$1.clearTimeout === 'function') {}

var performance = global$1.performance || {};
var performanceNow = performance.now || performance.mozNow || performance.msNow || performance.oNow || performance.webkitNow || function () {
  return new Date().getTime();
};

var formatRegExp = /%[sdj%]/g;
function format(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function (x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s':
        return String(args[i++]);
      case '%d':
        return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
}

function inspect(obj, opts) {
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };

  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    ctx.showHidden = opts;
  } else if (opts) {
    _extend(ctx, opts);
  }

  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}

inspect.colors = {
  'bold': [1, 22],
  'italic': [3, 23],
  'underline': [4, 24],
  'inverse': [7, 27],
  'white': [37, 39],
  'grey': [90, 39],
  'black': [30, 39],
  'blue': [34, 39],
  'cyan': [36, 39],
  'green': [32, 39],
  'magenta': [35, 39],
  'red': [31, 39],
  'yellow': [33, 39]
};

inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',

  'regexp': 'red'
};

function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\x1B[' + inspect.colors[style][0] + 'm' + str + '\x1B[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}

function stylizeNoColor(str, styleType) {
  return str;
}

function arrayToHash(array) {
  var hash = {};

  array.forEach(function (val, idx) {
    hash[val] = true;
  });

  return hash;
}

function formatValue(ctx, value, recurseTimes) {
  if (ctx.customInspect && value && isFunction(value.inspect) && value.inspect !== inspect && !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  if (isError(value) && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '',
      array = false,
      braces = ['{', '}'];

  if (isArray$2(value)) {
    array = true;
    braces = ['[', ']'];
  }

  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function (key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}

function formatPrimitive(ctx, value) {
  if (isUndefined(value)) return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '').replace(/'/g, "\\'").replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value)) return ctx.stylize('' + value, 'number');
  if (isBoolean(value)) return ctx.stylize('' + value, 'boolean');

  if (isNull(value)) return ctx.stylize('null', 'null');
}

function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}

function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function (key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, key, true));
    }
  });
  return output;
}

function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function (line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function (line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}

function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function (prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] + (base === '' ? '' : base + '\n ') + ' ' + output.join(',\n  ') + ' ' + braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}

function isArray$2(ar) {
  return Array.isArray(ar);
}

function isBoolean(arg) {
  return typeof arg === 'boolean';
}

function isNull(arg) {
  return arg === null;
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isString(arg) {
  return typeof arg === 'string';
}

function isUndefined(arg) {
  return arg === void 0;
}

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}

function isObject(arg) {
  return (typeof arg === 'undefined' ? 'undefined' : _typeof(arg)) === 'object' && arg !== null;
}

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}

function isError(e) {
  return isObject(e) && (objectToString(e) === '[object Error]' || e instanceof Error);
}

function isFunction(arg) {
  return typeof arg === 'function';
}

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

function _extend(origin, add) {
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
}
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

GM_addStyle('\n  .auc-timer-dialog-container {\n    float: right;\n    width: 280px;\n    height: 0;\n    z-index: 1000000;\n    position: fixed;\n    right: 0;\n    bottom: 0;\n    padding: 20px;\n    overflow: hidden;\n    transition: height: 0.5;\n  }\n\n  .auc-timer-dialog {\n    width: 240px;\n    margin-top: 8px;\n    height: 0;\n    padding: 20px;\n    color: #ededed;\n    font-size: 16px;\n    cursor: pointer;\n    position: relative;\n    border-radius: 2px;\n    opacity: 0;\n    left: 300px;\n    transition: height: 0.5, opacity 0.5s, left 0.5s;\n  }\n\n  .auc-timer-dialog.auc-timer-error {\n    background-color: #c8181888;\n  }\n\n  .auc-timer-dialog.active {\n    left: 0;\n    height: auto;\n    opacity: 1;\n  }\n');

var DialogManager = function () {
  function DialogManager() {
    _classCallCheck(this, DialogManager);

    this._no = 0;
    this._queue = [];
    this._isBusy = false;
    this._dialogs = {};

    this._container = document.body.appendChild(document.createElement('div'));
    this._container.classList.add('auc-timer-dialog-container');
  }

  _createClass(DialogManager, [{
    key: '_startProcessing',
    value: function _startProcessing() {
      if (this._isBusy) return;

      this._isBusy = true;
      this._processStep();
    }
  }, {
    key: '_processStep',
    value: function _processStep() {
      var _this4 = this;

      setTimeout(function () {
        var dialogMeta = _this4._queue.shift();
        _this4._container.style.height = _this4._container.getBoundingClientRect().height - 40 + dialogMeta.box.height + 'px';

        dialogMeta.show();

        if (_this4._queue.length > 0) {
          _this4._processStep();
        } else {
          _this4._isBusy = false;
        }
      }, DialogManager.PROCESS_DELAY);
    }
  }, {
    key: 'register',
    value: function register(dialog, show) {
      if (!dialog.el) throw new Error('Dialog should have a \'el\' property.');

      this._container.appendChild(dialog.el);

      var dialogId = DialogManager.PREFIX + this._no++;
      this._dialogs[dialogId] = dialog;
      this._queue.push({ box: dialog.el.getBoundingClientRect(), show: show });
      this._startProcessing();
      return dialogId;
    }
  }, {
    key: 'unregister',
    value: function unregister(dialogOrId, hide) {
      var prevDialog = void 0;

      if (typeof dialogOrId === 'string') {
        prevDialog = this._dialogs[dialogOrId];
        delete this._dialogs[dialogOrId];
      } else {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = Object.keys(this._dialogs)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var DID = _step.value;

            if (this._dialogs[DID] === dialogOrId) {
              prevDialog = this._dialogs[DID];
              delete this._dialogs[DID];
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }

      hide();
      prevDialog.el.remove();
    }
  }]);

  return DialogManager;
}();

DialogManager.PROCESS_DELAY = 500;
DialogManager.PREFIX = 'auc-timer-dialog-';
DialogManager.INSTANCE = new DialogManager();

var Dialog = function (_EventEmitter) {
  _inherits(Dialog, _EventEmitter);

  function Dialog(type, msg, options) {
    _classCallCheck(this, Dialog);

    if (typeof type !== 'string') type = 'info';
    if (typeof msg !== 'string') msg = '';
    if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) !== 'object') {
      options = { ttl: 5000, listeners: {} };
    }

    var _this5 = _possibleConstructorReturn(this, (Dialog.__proto__ || Object.getPrototypeOf(Dialog)).call(this));

    options.ttl = typeof options.ttl === 'number' ? options.ttl : 5000;
    options.listeners = _typeof(options.listeners) === 'object' ? options.listeners : {};
    _this5.options = options;
    _this5._id = '';

    _this5.el = document.createElement('div');
    _this5.el.innerHTML = msg;
    _this5.el.classList.add('auc-timer-dialog', 'auc-timer-' + type);
    _this5.el.addEventListener('animationend', function () {
      if (_this5.el.classList.contains('active')) _this5.emit('show');else _this5.emit('hide');
    });
    _this5.on('show', function () {
      setTimeout(function () {
        _this5.hide();
      }, _this5.options.ttl);
    });

    Object.keys(options.listeners).forEach(function (listener) {
      _this5.el.addEventListener(listener, options.listeners[listener]);
    });

    _this5.show();
    return _this5;
  }

  _createClass(Dialog, [{
    key: 'show',
    value: function show() {
      var _this6 = this;

      if (this._id) return;

      this._id = DialogManager.INSTANCE.register(this, function () {
        _this6.el.classList.add('active');
      });
    }
  }, {
    key: 'hide',
    value: function hide() {
      if (!this.el) return;

      var _el = this.el;
      DialogManager.INSTANCE.ungister(this._id, function () {
        _el.classList.remove('active');
      });

      delete this.el;
    }
  }]);

  return Dialog;
}(EventEmitter);

function error(msg, options) {
  return new Dialog('error', msg, options);
}

GM_getValue = GM_getValue || function (key, defaultVal) {
  if (!window.localStorage && !window.localStorage.getItem) throw new NotSupportedError();

  var storage = window.localStorage.getItem(key);
  return storage === null ? defaultVal : storage;
};

GM_setValue = GM_setValue || function (key, val) {
  if (!window.localStorage && !window.localStorage.setItem) throw new NotSupportedError();

  window.localStorage.setItem(key, val);
};

var GMLogger = function () {
  function GMLogger(config) {
    _classCallCheck(this, GMLogger);

    this.constructor.prototype.prototype = console.prototype;

    this._GM_key = '__logs__';
    this._MAX_LOG_ENTRIES = config.MAX_LOG_ENTRIES;
    this._cache = [];

    this._load();
  }

  _createClass(GMLogger, [{
    key: '_gc',
    value: function _gc() {
      if (this._cache.length > this._MAX_LOG_ENTRIES) {
        this._cache.splice(0, this._cache.length - this._MAX_LOG_ENTRIES);
      }
    }
  }, {
    key: '_log',
    value: function _log(level) {
      var time = new Date();

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var msg = format.apply(undefined, args);

      this._cache.push({
        time: time,
        level: level,
        msg: msg,
        toString: function toString() {
          return '[' + time + '][' + level + '] ' + msg;
        }
      });

      if (level === 'error') {
        var ep = error('Error occurs. <br>(Click to view logs)', {
          listeners: {
            click: function click(e) {
              ep.hide();
            }
          }
        });
      }
    }
  }, {
    key: '_load',
    value: function _load() {
      this._cache = GM_getValue(this._GM_key, []);
    }
  }, {
    key: '_save',
    value: function _save() {
      this._gc();
      GM_setValue(this._GM_key, this._cache);
    }
  }, {
    key: 'debug',
    value: function debug() {
      var _console;

      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      (_console = console).debug.apply(_console, args);
      this._log.apply(this, ['debug'].concat(args));
    }
  }, {
    key: 'info',
    value: function info() {
      var _console2;

      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      if (arguments.length === 0) return;
      (_console2 = console).info.apply(_console2, args);
      this._log.apply(this, ['info'].concat(args));
    }
  }, {
    key: 'warn',
    value: function warn() {
      var _console3;

      for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      if (arguments.length === 0) return;
      (_console3 = console).warn.apply(_console3, args);
      this._log.apply(this, ['warn'].concat(args));
    }
  }, {
    key: 'error',
    value: function error() {
      var _console4;

      for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
      }

      if (arguments.length === 0) return;
      (_console4 = console).error.apply(_console4, args);
      this._log.apply(this, ['error'].concat(args));
    }
  }]);

  return GMLogger;
}();

function getLogger() {
  try {
    return new GMLogger({ MAX_LOG_ENTRIES: MAX_LOG_ENTRIES });
  } catch (e) {
    if (e instanceof NotSupportedError) {
      window.alert(e.message);
    }
    return console;
  }
}

var LOG = getLogger();

function checkDependencies(scope, deps, cb, due) {
  due = due instanceof Date ? due : new Date(new Date().getTime() + MAX_DEP_TIMEOUT);

  var lacks = [];

  deps.forEach(function (dep) {
    if (!scope[dep]) {
      lacks.push(dep);
    }
  });

  if (lacks.length === 0) {
    cb(null);
  } else if (lacks.length > 0) {
    if (new Date().getTime() <= due.getTime()) {
      var safeFn = new SafeFunction(checkDependencies.bind(undefined, scope, lacks, cb, due));
      safeFn.on('error', function (err) {
        LOG.error('Error occurs in #checkDependencies()');
        LOG.error(err);
      });

      setTimeout(safeFn, DEP_CHECK_PERIOD);
    } else {
      cb(new DependencyError(lacks));
    }
  }
}

var SimpleCountdown = simpleCountdown;

function changeTimeLeft(timer, timeLeft) {
  if ((typeof timer === 'undefined' ? 'undefined' : _typeof(timer)) !== 'object') {
    return;
  }
  var time = new Date();
  if (_typeof(timer.countdown) === 'object') {
    timer.countdown.startTime = time.getTime();
    timer.countdown.startLeftoverTime = timeLeft;
  } else if (_typeof(timer.countdownObject) === 'object') {
    timer.countdownObject.startTime = time.getTime();
    timer.countdownObject.startLeftoverTime = timeLeft;
  }
}

function handleAuction() {
  var createTimer = function createTimer() {
    var oldMins = -1;
    var first = false;
    var overflowAuctionTimer = null;
    var newMins = void 0,
        mins = void 0,
        secs = void 0,
        auctionTimer = void 0,
        auctionEndTime = void 0,
        currentTime = void 0;
    var uni = document.location.href.replace(/^https:\/\/([^/]+).+/, '$1');

    if ($('#auctionTimer').length > 0) {
      return;
    }
    $('p.auction_info').next().before('<span id="auctionTimer" style="font-weight: bold; color: ' + $('p.auction_info span').css('color') + ';"></span>');
    if ($('#div_traderAuctioneer .left_header h2').text().indexOf(loca.auctionFinished) < 0) {
      auctionEndTime = localStorage.getItem(uni + '_auctionEndTime');
      auctionEndTime = auctionEndTime ? parseInt(auctionEndTime) : -1;
      currentTime = new Date().getTime();
      if (auctionEndTime >= currentTime) {
        secs = Math.round((auctionEndTime - currentTime) / 1000);
        oldMins = Math.ceil(secs / 60);
        first = false;
      } else {
        var matched = $('p.auction_info').text().match(/\d+/g);
        if (!matched) return;

        oldMins = parseInt(matched[0]);
        secs = oldMins * 60;
        first = true;
      }
      mins = oldMins;
      auctionTimer = new SimpleCountdown($('#auctionTimer').get(0), secs, function () {
        $('#auctionTimer').text('');
      });
    }

    var mySock = io.connect('/auctioneer', nodeParams);
    var onConnect = new SafeFunction(function () {
      mySock.on('timeLeft', function (msg) {
        if ($('#div_traderAuctioneer .left_header h2').text().indexOf(loca.auctionFinished) >= 0) {
          first = true;
          localStorage.setItem(uni + '_auctionEndTime', '-1');
          return;
        }
        auctionEndTime = localStorage.getItem(uni + '_auctionEndTime');
        auctionEndTime = auctionEndTime ? parseInt(auctionEndTime) : -1;
        currentTime = new Date().getTime();
        /<b>\D+(\d+)/.exec(msg);
        newMins = parseInt(RegExp.$1);
        if (newMins === oldMins) {
          mins--;
          if (first) {
            first = false;
          } else if (auctionEndTime >= 0) {
            localStorage.setItem(uni + '_auctionEndTime', currentTime + mins * 60 * 1000);
          }
        } else {
          if (newMins > oldMins && auctionEndTime >= currentTime) {
            newMins = Math.round((auctionEndTime - currentTime) / (1000 * 60));
          }
          if (first) {
            first = false;
          } else if (oldMins >= 0) {
            localStorage.setItem(uni + '_auctionEndTime', currentTime + newMins * 60 * 1000);
          }
          oldMins = newMins;
          mins = newMins;
        }
        if (mins) {
          changeTimeLeft(auctionTimer, mins * 60);
        } else {
          overflowAuctionTimer = new SimpleCountdown($('#auctionTimer').get(0), 30, function () {
            $('#auctionTimer').text('');
          });
        }
        setTimeout(function () {
          $('#auctionTimer').css('color', $('p.auction_info span').css('color'));
        }, 100);
      });
      mySock.on('new auction', function (msg) {
        /<b>\D+(\d+)/.exec(msg.info);
        mins = parseInt(RegExp.$1);
        auctionTimer = new SimpleCountdown($('#auctionTimer').get(0), mins * 60, function () {
          $('#auctionTimer').text('');
        });
        overflowAuctionTimer = null;
        first = true;
        setTimeout(function () {
          $('#auctionTimer').css('color', $('p.auction_info span').css('color'));
        }, 100);
      });
      mySock.on('auction finished', function (msg) {
        changeTimeLeft(auctionTimer, 0);
        changeTimeLeft(overflowAuctionTimer, 0);
        first = true;
        localStorage.setItem(uni + '_auctionEndTime', '-1');
      });
    });

    onConnect.on('error', function (err) {
      LOG.error(err);
    });

    mySock.on('connect', onConnect).on('error', LOG.error.bind(LOG));
  };

  if (document.getElementById('div_traderAuctioneer')) {
    createTimer();
  } else {
    $(document).ajaxSuccess(function () {
      if ($('#auctionTimer').length === 0) {
        createTimer();
      }
    });
  }
}

var SimpleCountdown$1 = simpleCountdown;

function handleNonAuction() {
  var uni = document.location.href.replace(/^https:\/\/([^/]+).+/, '$1');
  var auctionEndTime = localStorage.getItem(uni + '_auctionEndTime');
  if (auctionEndTime == null) {
    return;
  }
  auctionEndTime = parseInt(auctionEndTime);
  var currentTime = new Date().getTime();
  if (auctionEndTime < currentTime) {
    return;
  }
  var clock = $('#OGameClock');
  if (clock.length <= 0) {
    clock = $('.OGameClock');
  }
  if (clock.length <= 0) {
    return;
  }
  clock.parent().append('<li id="auctionTimer" style="position: absolute; right: 125px;"></li>');
  var auctionTimer = new SimpleCountdown$1($('#auctionTimer').get(0), Math.round((auctionEndTime - currentTime) / 1000), function () {
    $('#auctionTimer').text('');
  });
}

(function () {
  if (document.location.href.indexOf('/game/index.php?') < 0) {
    return;
  }

  try {
    var handle = function handle(cb, err) {
      if (err) {
        LOG.error('Failed to pass dependency check.');
        LOG.error(err);
        return;
      }
      cb();
    };
    var deps = void 0;

    if (document.location.href.indexOf('/game/index.php?page=traderOverview') >= 0) {
      deps = DEP_LIST.AUCTION;
      handle = handle.bind(null, handleAuction);
    } else if (document.getElementById('bar')) {
      deps = DEP_LIST.NON_AUCTION;
      handle = handle.bind(null, handleNonAuction);
    }

    checkDependencies(unsafeWindow, deps, handle);
  } catch (e) {
    LOG.error('Error is caught in the entry.');
    LOG.error(e);
  }
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF1Y3Rpb24tdGltZXIuanMiLCIuLi9zcmMvY29uZmlnLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2V4dGVuZC9pbmRleC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9yb2xsdXAtcGx1Z2luLW5vZGUtYnVpbHRpbnMvc3JjL2VzNi9ldmVudHMuanMiLCIuLi91dGlsL2Z1bmN0aW9uLmpzIiwiLi4vc3JjL3N0cmluZ3MuanMiLCIuLi9zcmMvZXJyb3JzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3JvbGx1cC1wbHVnaW4tbm9kZS1nbG9iYWxzL3NyYy9nbG9iYWwuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvYnVmZmVyLWVzNi9iYXNlNjQuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvYnVmZmVyLWVzNi9pZWVlNzU0LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2J1ZmZlci1lczYvaXNBcnJheS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9idWZmZXItZXM2L2luZGV4LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3Byb2Nlc3MtZXM2L2Jyb3dzZXIuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvcm9sbHVwLXBsdWdpbi1ub2RlLWJ1aWx0aW5zL3NyYy9lczYvdXRpbC5qcyIsIi4uL3NyYy91aS9kaWFsb2cuanMiLCIuLi9zcmMvbG9nZ2VyLmpzIiwiLi4vc3JjL2RlcGVuZGVuY3kuanMiLCIuLi9zcmMvaGFuZGxlci9hdWN0aW9uLmpzIiwiLi4vc3JjL2hhbmRsZXIvbm9uLWF1Y3Rpb24uanMiLCIuLi9zcmMvaW5kZXguanMiXSwibmFtZXMiOlsiTUFYX0xPR19FTlRSSUVTIiwiTUFYX0RFUF9USU1FT1VUIiwiREVQX0NIRUNLX1BFUklPRCIsIkRFUF9MSVNUIiwiQVVDVElPTiIsIk5PTl9BVUNUSU9OIiwiaGFzT3duIiwiT2JqZWN0IiwicHJvdG90eXBlIiwiaGFzT3duUHJvcGVydHkiLCJ0b1N0ciIsInRvU3RyaW5nIiwiaXNBcnJheSIsImFyciIsIkFycmF5IiwiY2FsbCIsImlzUGxhaW5PYmplY3QiLCJvYmoiLCJoYXNPd25Db25zdHJ1Y3RvciIsImhhc0lzUHJvdG90eXBlT2YiLCJjb25zdHJ1Y3RvciIsImtleSIsImV4dGVuZCIsIm9wdGlvbnMiLCJuYW1lIiwic3JjIiwiY29weSIsImNvcHlJc0FycmF5IiwiY2xvbmUiLCJ0YXJnZXQiLCJhcmd1bWVudHMiLCJpIiwibGVuZ3RoIiwiZGVlcCIsImRvbWFpbiIsIkV2ZW50SGFuZGxlcnMiLCJjcmVhdGUiLCJFdmVudEVtaXR0ZXIiLCJpbml0IiwidXNpbmdEb21haW5zIiwidW5kZWZpbmVkIiwiX2V2ZW50cyIsIl9tYXhMaXN0ZW5lcnMiLCJkZWZhdWx0TWF4TGlzdGVuZXJzIiwiYWN0aXZlIiwiRG9tYWluIiwiZ2V0UHJvdG90eXBlT2YiLCJfZXZlbnRzQ291bnQiLCJzZXRNYXhMaXN0ZW5lcnMiLCJuIiwiaXNOYU4iLCJUeXBlRXJyb3IiLCIkZ2V0TWF4TGlzdGVuZXJzIiwidGhhdCIsImdldE1heExpc3RlbmVycyIsImVtaXROb25lIiwiaGFuZGxlciIsImlzRm4iLCJzZWxmIiwibGVuIiwibGlzdGVuZXJzIiwiYXJyYXlDbG9uZSIsImVtaXRPbmUiLCJhcmcxIiwiZW1pdFR3byIsImFyZzIiLCJlbWl0VGhyZWUiLCJhcmczIiwiZW1pdE1hbnkiLCJhcmdzIiwiYXBwbHkiLCJlbWl0IiwidHlwZSIsImVyIiwiZXZlbnRzIiwibmVlZERvbWFpbkV4aXQiLCJkb0Vycm9yIiwiZXJyb3IiLCJFcnJvciIsImRvbWFpbkVtaXR0ZXIiLCJkb21haW5UaHJvd24iLCJlcnIiLCJjb250ZXh0IiwiZXhpdCIsIl9hZGRMaXN0ZW5lciIsImxpc3RlbmVyIiwicHJlcGVuZCIsIm0iLCJleGlzdGluZyIsIm5ld0xpc3RlbmVyIiwidW5zaGlmdCIsInB1c2giLCJ3YXJuZWQiLCJ3IiwiZW1pdHRlciIsImNvdW50IiwiZW1pdFdhcm5pbmciLCJlIiwiY29uc29sZSIsIndhcm4iLCJsb2ciLCJhZGRMaXN0ZW5lciIsIm9uIiwicHJlcGVuZExpc3RlbmVyIiwiX29uY2VXcmFwIiwiZmlyZWQiLCJnIiwicmVtb3ZlTGlzdGVuZXIiLCJvbmNlIiwicHJlcGVuZE9uY2VMaXN0ZW5lciIsImxpc3QiLCJwb3NpdGlvbiIsIm9yaWdpbmFsTGlzdGVuZXIiLCJzcGxpY2VPbmUiLCJyZW1vdmVBbGxMaXN0ZW5lcnMiLCJrZXlzIiwiZXZsaXN0ZW5lciIsInJldCIsInVud3JhcExpc3RlbmVycyIsImxpc3RlbmVyQ291bnQiLCJldmVudE5hbWVzIiwiUmVmbGVjdCIsIm93bktleXMiLCJpbmRleCIsImsiLCJwb3AiLCJDYWxsYWJsZSIsInByb3BlcnR5IiwiZnVuYyIsInNldFByb3RvdHlwZU9mIiwiZ2V0T3duUHJvcGVydHlOYW1lcyIsImZvckVhY2giLCJwIiwiZGVmaW5lUHJvcGVydHkiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJGdW5jdGlvbiIsIlNhZmVGdW5jdGlvbiIsImZuIiwiZGVmYXVsdFJldHVybiIsIl9mbiIsIl9ydG4iLCJOT1RfU1VQUE9SVEVEX0VOViIsIkRlcGVuZGVuY3lFcnJvciIsImRlcHMiLCJtYXAiLCJqb2luIiwiTm90U3VwcG9ydGVkRXJyb3IiLCJnbG9iYWwkMSIsImdsb2JhbCIsIndpbmRvdyIsImxvb2t1cCIsInJldkxvb2t1cCIsIkFyciIsIlVpbnQ4QXJyYXkiLCJpbml0ZWQiLCJjb2RlIiwiY2hhckNvZGVBdCIsInRvQnl0ZUFycmF5IiwiYjY0IiwiaiIsImwiLCJ0bXAiLCJwbGFjZUhvbGRlcnMiLCJMIiwidHJpcGxldFRvQmFzZTY0IiwibnVtIiwiZW5jb2RlQ2h1bmsiLCJ1aW50OCIsInN0YXJ0IiwiZW5kIiwib3V0cHV0IiwiZnJvbUJ5dGVBcnJheSIsImV4dHJhQnl0ZXMiLCJwYXJ0cyIsIm1heENodW5rTGVuZ3RoIiwibGVuMiIsInJlYWQiLCJidWZmZXIiLCJvZmZzZXQiLCJpc0xFIiwibUxlbiIsIm5CeXRlcyIsImVMZW4iLCJlTWF4IiwiZUJpYXMiLCJuQml0cyIsImQiLCJzIiwiTmFOIiwiSW5maW5pdHkiLCJNYXRoIiwicG93Iiwid3JpdGUiLCJ2YWx1ZSIsImMiLCJydCIsImFicyIsImZsb29yIiwiTE4yIiwiaXNBcnJheSQxIiwiSU5TUEVDVF9NQVhfQllURVMiLCJCdWZmZXIiLCJUWVBFRF9BUlJBWV9TVVBQT1JUIiwia01heExlbmd0aCIsImNyZWF0ZUJ1ZmZlciIsIlJhbmdlRXJyb3IiLCJfX3Byb3RvX18iLCJhcmciLCJlbmNvZGluZ09yT2Zmc2V0IiwiYWxsb2NVbnNhZmUiLCJmcm9tIiwicG9vbFNpemUiLCJfYXVnbWVudCIsIkFycmF5QnVmZmVyIiwiZnJvbUFycmF5QnVmZmVyIiwiZnJvbVN0cmluZyIsImZyb21PYmplY3QiLCJhc3NlcnRTaXplIiwic2l6ZSIsImFsbG9jIiwiZmlsbCIsImVuY29kaW5nIiwiY2hlY2tlZCIsImFsbG9jVW5zYWZlU2xvdyIsInN0cmluZyIsImlzRW5jb2RpbmciLCJieXRlTGVuZ3RoIiwiYWN0dWFsIiwic2xpY2UiLCJmcm9tQXJyYXlMaWtlIiwiYXJyYXkiLCJieXRlT2Zmc2V0IiwiaW50ZXJuYWxJc0J1ZmZlciIsImlzbmFuIiwiZGF0YSIsImlzQnVmZmVyIiwiYiIsIl9pc0J1ZmZlciIsImNvbXBhcmUiLCJhIiwieCIsInkiLCJtaW4iLCJTdHJpbmciLCJ0b0xvd2VyQ2FzZSIsImNvbmNhdCIsInBvcyIsImJ1ZiIsImlzVmlldyIsImxvd2VyZWRDYXNlIiwidXRmOFRvQnl0ZXMiLCJiYXNlNjRUb0J5dGVzIiwic2xvd1RvU3RyaW5nIiwiaGV4U2xpY2UiLCJ1dGY4U2xpY2UiLCJhc2NpaVNsaWNlIiwibGF0aW4xU2xpY2UiLCJiYXNlNjRTbGljZSIsInV0ZjE2bGVTbGljZSIsInN3YXAiLCJzd2FwMTYiLCJzd2FwMzIiLCJzd2FwNjQiLCJlcXVhbHMiLCJpbnNwZWN0Iiwic3RyIiwibWF4IiwibWF0Y2giLCJ0aGlzU3RhcnQiLCJ0aGlzRW5kIiwidGhpc0NvcHkiLCJ0YXJnZXRDb3B5IiwiYmlkaXJlY3Rpb25hbEluZGV4T2YiLCJ2YWwiLCJkaXIiLCJhcnJheUluZGV4T2YiLCJpbmRleE9mIiwibGFzdEluZGV4T2YiLCJpbmRleFNpemUiLCJhcnJMZW5ndGgiLCJ2YWxMZW5ndGgiLCJyZWFkVUludDE2QkUiLCJmb3VuZEluZGV4IiwiZm91bmQiLCJpbmNsdWRlcyIsImhleFdyaXRlIiwiTnVtYmVyIiwicmVtYWluaW5nIiwic3RyTGVuIiwicGFyc2VkIiwicGFyc2VJbnQiLCJzdWJzdHIiLCJ1dGY4V3JpdGUiLCJibGl0QnVmZmVyIiwiYXNjaWlXcml0ZSIsImFzY2lpVG9CeXRlcyIsImxhdGluMVdyaXRlIiwiYmFzZTY0V3JpdGUiLCJ1Y3MyV3JpdGUiLCJ1dGYxNmxlVG9CeXRlcyIsImlzRmluaXRlIiwidG9KU09OIiwiX2FyciIsImJhc2U2NC5mcm9tQnl0ZUFycmF5IiwicmVzIiwiZmlyc3RCeXRlIiwiY29kZVBvaW50IiwiYnl0ZXNQZXJTZXF1ZW5jZSIsInNlY29uZEJ5dGUiLCJ0aGlyZEJ5dGUiLCJmb3VydGhCeXRlIiwidGVtcENvZGVQb2ludCIsImRlY29kZUNvZGVQb2ludHNBcnJheSIsIk1BWF9BUkdVTUVOVFNfTEVOR1RIIiwiY29kZVBvaW50cyIsImZyb21DaGFyQ29kZSIsIm91dCIsInRvSGV4IiwiYnl0ZXMiLCJuZXdCdWYiLCJzdWJhcnJheSIsInNsaWNlTGVuIiwiY2hlY2tPZmZzZXQiLCJleHQiLCJyZWFkVUludExFIiwibm9Bc3NlcnQiLCJtdWwiLCJyZWFkVUludEJFIiwicmVhZFVJbnQ4IiwicmVhZFVJbnQxNkxFIiwicmVhZFVJbnQzMkxFIiwicmVhZFVJbnQzMkJFIiwicmVhZEludExFIiwicmVhZEludEJFIiwicmVhZEludDgiLCJyZWFkSW50MTZMRSIsInJlYWRJbnQxNkJFIiwicmVhZEludDMyTEUiLCJyZWFkSW50MzJCRSIsInJlYWRGbG9hdExFIiwiaWVlZTc1NC5yZWFkIiwicmVhZEZsb2F0QkUiLCJyZWFkRG91YmxlTEUiLCJyZWFkRG91YmxlQkUiLCJjaGVja0ludCIsIndyaXRlVUludExFIiwibWF4Qnl0ZXMiLCJ3cml0ZVVJbnRCRSIsIndyaXRlVUludDgiLCJvYmplY3RXcml0ZVVJbnQxNiIsImxpdHRsZUVuZGlhbiIsIndyaXRlVUludDE2TEUiLCJ3cml0ZVVJbnQxNkJFIiwib2JqZWN0V3JpdGVVSW50MzIiLCJ3cml0ZVVJbnQzMkxFIiwid3JpdGVVSW50MzJCRSIsIndyaXRlSW50TEUiLCJsaW1pdCIsInN1YiIsIndyaXRlSW50QkUiLCJ3cml0ZUludDgiLCJ3cml0ZUludDE2TEUiLCJ3cml0ZUludDE2QkUiLCJ3cml0ZUludDMyTEUiLCJ3cml0ZUludDMyQkUiLCJjaGVja0lFRUU3NTQiLCJ3cml0ZUZsb2F0IiwiaWVlZTc1NC53cml0ZSIsIndyaXRlRmxvYXRMRSIsIndyaXRlRmxvYXRCRSIsIndyaXRlRG91YmxlIiwid3JpdGVEb3VibGVMRSIsIndyaXRlRG91YmxlQkUiLCJ0YXJnZXRTdGFydCIsInNldCIsIklOVkFMSURfQkFTRTY0X1JFIiwiYmFzZTY0Y2xlYW4iLCJzdHJpbmd0cmltIiwicmVwbGFjZSIsInRyaW0iLCJ1bml0cyIsImxlYWRTdXJyb2dhdGUiLCJieXRlQXJyYXkiLCJoaSIsImxvIiwiYmFzZTY0LnRvQnl0ZUFycmF5IiwiZHN0IiwiaXNGYXN0QnVmZmVyIiwiaXNTbG93QnVmZmVyIiwic2V0VGltZW91dCIsImNsZWFyVGltZW91dCIsInBlcmZvcm1hbmNlIiwicGVyZm9ybWFuY2VOb3ciLCJub3ciLCJtb3pOb3ciLCJtc05vdyIsIm9Ob3ciLCJ3ZWJraXROb3ciLCJEYXRlIiwiZ2V0VGltZSIsImZvcm1hdFJlZ0V4cCIsImZvcm1hdCIsImYiLCJpc1N0cmluZyIsIm9iamVjdHMiLCJKU09OIiwic3RyaW5naWZ5IiwiXyIsImlzTnVsbCIsImlzT2JqZWN0Iiwib3B0cyIsImN0eCIsInNlZW4iLCJzdHlsaXplIiwic3R5bGl6ZU5vQ29sb3IiLCJkZXB0aCIsImNvbG9ycyIsImlzQm9vbGVhbiIsInNob3dIaWRkZW4iLCJfZXh0ZW5kIiwiaXNVbmRlZmluZWQiLCJjdXN0b21JbnNwZWN0Iiwic3R5bGl6ZVdpdGhDb2xvciIsImZvcm1hdFZhbHVlIiwic3R5bGVzIiwic3R5bGVUeXBlIiwic3R5bGUiLCJhcnJheVRvSGFzaCIsImhhc2giLCJpZHgiLCJyZWN1cnNlVGltZXMiLCJpc0Z1bmN0aW9uIiwicHJpbWl0aXZlIiwiZm9ybWF0UHJpbWl0aXZlIiwidmlzaWJsZUtleXMiLCJpc0Vycm9yIiwiZm9ybWF0RXJyb3IiLCJpc1JlZ0V4cCIsIlJlZ0V4cCIsImlzRGF0ZSIsImJhc2UiLCJicmFjZXMiLCJ0b1VUQ1N0cmluZyIsImZvcm1hdEFycmF5IiwiZm9ybWF0UHJvcGVydHkiLCJyZWR1Y2VUb1NpbmdsZVN0cmluZyIsInNpbXBsZSIsImlzTnVtYmVyIiwiZGVzYyIsImdldCIsInNwbGl0IiwibGluZSIsIm51bUxpbmVzRXN0IiwicmVkdWNlIiwicHJldiIsImN1ciIsImFyIiwicmUiLCJvYmplY3RUb1N0cmluZyIsIm8iLCJvcmlnaW4iLCJhZGQiLCJwcm9wIiwiR01fYWRkU3R5bGUiLCJEaWFsb2dNYW5hZ2VyIiwiX25vIiwiX3F1ZXVlIiwiX2lzQnVzeSIsIl9kaWFsb2dzIiwiX2NvbnRhaW5lciIsImRvY3VtZW50IiwiYm9keSIsImFwcGVuZENoaWxkIiwiY3JlYXRlRWxlbWVudCIsImNsYXNzTGlzdCIsIl9wcm9jZXNzU3RlcCIsImRpYWxvZ01ldGEiLCJzaGlmdCIsImhlaWdodCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsImJveCIsInNob3ciLCJQUk9DRVNTX0RFTEFZIiwiZGlhbG9nIiwiZWwiLCJkaWFsb2dJZCIsIlBSRUZJWCIsIl9zdGFydFByb2Nlc3NpbmciLCJkaWFsb2dPcklkIiwiaGlkZSIsInByZXZEaWFsb2ciLCJESUQiLCJyZW1vdmUiLCJJTlNUQU5DRSIsIkRpYWxvZyIsIm1zZyIsInR0bCIsIl9pZCIsImlubmVySFRNTCIsImFkZEV2ZW50TGlzdGVuZXIiLCJjb250YWlucyIsInJlZ2lzdGVyIiwiX2VsIiwidW5naXN0ZXIiLCJHTV9nZXRWYWx1ZSIsImRlZmF1bHRWYWwiLCJsb2NhbFN0b3JhZ2UiLCJnZXRJdGVtIiwic3RvcmFnZSIsIkdNX3NldFZhbHVlIiwic2V0SXRlbSIsIkdNTG9nZ2VyIiwiY29uZmlnIiwiX0dNX2tleSIsIl9NQVhfTE9HX0VOVFJJRVMiLCJfY2FjaGUiLCJfbG9hZCIsInNwbGljZSIsImxldmVsIiwidGltZSIsImVwIiwicHJvbXB0RXJyb3IiLCJjbGljayIsIl9nYyIsImRlYnVnIiwiX2xvZyIsImluZm8iLCJnZXRMb2dnZXIiLCJhbGVydCIsIm1lc3NhZ2UiLCJMT0ciLCJjaGVja0RlcGVuZGVuY2llcyIsInNjb3BlIiwiY2IiLCJkdWUiLCJsYWNrcyIsImRlcCIsInNhZmVGbiIsImJpbmQiLCJTaW1wbGVDb3VudGRvd24iLCJzaW1wbGVDb3VudGRvd24iLCJjaGFuZ2VUaW1lTGVmdCIsInRpbWVyIiwidGltZUxlZnQiLCJjb3VudGRvd24iLCJzdGFydFRpbWUiLCJzdGFydExlZnRvdmVyVGltZSIsImNvdW50ZG93bk9iamVjdCIsImhhbmRsZUF1Y3Rpb24iLCJjcmVhdGVUaW1lciIsIm9sZE1pbnMiLCJmaXJzdCIsIm92ZXJmbG93QXVjdGlvblRpbWVyIiwibmV3TWlucyIsIm1pbnMiLCJzZWNzIiwiYXVjdGlvblRpbWVyIiwiYXVjdGlvbkVuZFRpbWUiLCJjdXJyZW50VGltZSIsInVuaSIsImxvY2F0aW9uIiwiaHJlZiIsIiQiLCJuZXh0IiwiYmVmb3JlIiwiY3NzIiwidGV4dCIsImxvY2EiLCJhdWN0aW9uRmluaXNoZWQiLCJyb3VuZCIsImNlaWwiLCJtYXRjaGVkIiwibXlTb2NrIiwiaW8iLCJjb25uZWN0Iiwibm9kZVBhcmFtcyIsIm9uQ29ubmVjdCIsImV4ZWMiLCIkMSIsImdldEVsZW1lbnRCeUlkIiwiYWpheFN1Y2Nlc3MiLCJoYW5kbGVOb25BdWN0aW9uIiwiY2xvY2siLCJwYXJlbnQiLCJhcHBlbmQiLCJoYW5kbGUiLCJ1bnNhZmVXaW5kb3ciXSwibWFwcGluZ3MiOiJBQUFBOzs7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QUFBUTtBQUM1QyxNQUFJd0IsUUFBUXBCLEVBQUUsYUFBRixDQUFaO0FBQ0EsTUFBSW9CLE1BQU10aUIsTUFBTixJQUFnQixDQUFwQixFQUF1QjtBQUFFc2lCLFlBQVFwQixFQUFFLGFBQUYsQ0FBUjtBQUEwQjtBQUNuRCxNQUFJb0IsTUFBTXRpQixNQUFOLElBQWdCLENBQXBCLEVBQXVCO0FBQUU7QUFBUTtBQUNqQ3NpQixRQUFNQyxNQUFOLEdBQWVDLE1BQWYsQ0FBc0IsdUVBQXRCO0FBQ0EsTUFBSTVCLGVBQWUsSUFBSWpCLGlCQUFKLENBQW9CdUIsRUFBRSxlQUFGLEVBQW1CakgsR0FBbkIsQ0FBdUIsQ0FBdkIsQ0FBcEIsRUFDakJuUSxLQUFLMlgsS0FBTCxDQUFXLENBQUNaLGlCQUFpQkMsV0FBbEIsSUFBaUMsSUFBNUMsQ0FEaUIsRUFFakIsWUFBWTtBQUFFSSxNQUFFLGVBQUYsRUFBbUJJLElBQW5CLENBQXdCLEVBQXhCO0FBQTZCLEdBRjFCLENBQW5CO0FBR0Q7O0FDWkQsQ0FBQyxZQUFZO0FBRVgsTUFBSWhHLFNBQVMwRixRQUFULENBQWtCQyxJQUFsQixDQUF1QjdSLE9BQXZCLENBQStCLGtCQUEvQixJQUFxRCxDQUF6RCxFQUE0RDtBQUFFO0FBQVE7O0FBRXRFLE1BQUk7QUFDRixRQUFJcVQsU0FBUyxnQkFBVXBELEVBQVYsRUFBY3BjLEdBQWQsRUFBbUI7QUFDOUIsVUFBSUEsR0FBSixFQUFTO0FBQ1BpYyxZQUFJcmMsS0FBSixDQUFVLGtDQUFWO0FBQ0FxYyxZQUFJcmMsS0FBSixDQUFVSSxHQUFWO0FBQ0E7QUFDRDtBQUNEb2M7QW5CNjVHRCxLbUJuNkdEO0FBUUEsUUFBSXRZLGFBQUo7O0FBRUEsUUFBSXVVLFNBQVMwRixRQUFULENBQWtCQyxJQUFsQixDQUF1QjdSLE9BQXZCLENBQStCLHFDQUEvQixLQUF5RSxDQUE3RSxFQUFnRjtBQUM5RXJJLGFBQU81SSxTQUFTQyxPQUFoQjtBQUNBcWtCLGVBQVNBLE9BQU8vQyxJQUFQLENBQVksSUFBWixFQUFrQlUsYUFBbEIsQ0FBVDtBQUNELEtBSEQsTUFHTyxJQUFJOUUsU0FBUzZHLGNBQVQsQ0FBd0IsS0FBeEIsQ0FBSixFQUFvQztBQUN6Q3BiLGFBQU81SSxTQUFTRSxXQUFoQjtBQUNBb2tCLGVBQVNBLE9BQU8vQyxJQUFQLENBQVksSUFBWixFQUFrQjJDLGdCQUFsQixDQUFUO0FBQ0Q7O0FBRURsRCxzQkFBa0J1RCxZQUFsQixFQUFnQzNiLElBQWhDLEVBQXNDMGIsTUFBdEM7QUFDRCxHQXBCRCxDQW9CRSxPQUFPeGUsQ0FBUCxFQUFVO0FBQ1ZpYixRQUFJcmMsS0FBSixDQUFVLCtCQUFWO0FBQ0FxYyxRQUFJcmMsS0FBSixDQUFVb0IsQ0FBVjtBQUNEO0FBQ0YsQ0E1QkQiLCJmaWxlIjoiLi4vLi4vLi4vLi4vLi4vYXVjdGlvbi10aW1lci5qcyJ9