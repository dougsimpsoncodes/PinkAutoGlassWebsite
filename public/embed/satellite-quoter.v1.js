/* Pink Auto Glass satellite quoter embed bundle */
var process = globalThis.process || { env: {"NODE_ENV":"production","NEXT_PUBLIC_APP_ENV":"","NEXT_PUBLIC_BASE_URL":"","NEXT_PUBLIC_SITE_URL":"","NEXT_PUBLIC_STICKY_CALLBAR":"","NEXT_PUBLIC_SUPABASE_URL":"","NEXT_PUBLIC_SUPABASE_ANON_KEY":""} };
"use strict";
"use client";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // node_modules/react/cjs/react.production.min.js
  var require_react_production_min = __commonJS({
    "node_modules/react/cjs/react.production.min.js"(exports) {
      "use strict";
      var l = Symbol.for("react.element");
      var n = Symbol.for("react.portal");
      var p = Symbol.for("react.fragment");
      var q = Symbol.for("react.strict_mode");
      var r = Symbol.for("react.profiler");
      var t = Symbol.for("react.provider");
      var u = Symbol.for("react.context");
      var v = Symbol.for("react.forward_ref");
      var w = Symbol.for("react.suspense");
      var x = Symbol.for("react.memo");
      var y = Symbol.for("react.lazy");
      var z = Symbol.iterator;
      function A(a) {
        if (null === a || "object" !== typeof a) return null;
        a = z && a[z] || a["@@iterator"];
        return "function" === typeof a ? a : null;
      }
      var B = { isMounted: function() {
        return false;
      }, enqueueForceUpdate: function() {
      }, enqueueReplaceState: function() {
      }, enqueueSetState: function() {
      } };
      var C = Object.assign;
      var D = {};
      function E(a, b, e) {
        this.props = a;
        this.context = b;
        this.refs = D;
        this.updater = e || B;
      }
      E.prototype.isReactComponent = {};
      E.prototype.setState = function(a, b) {
        if ("object" !== typeof a && "function" !== typeof a && null != a) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
        this.updater.enqueueSetState(this, a, b, "setState");
      };
      E.prototype.forceUpdate = function(a) {
        this.updater.enqueueForceUpdate(this, a, "forceUpdate");
      };
      function F() {
      }
      F.prototype = E.prototype;
      function G(a, b, e) {
        this.props = a;
        this.context = b;
        this.refs = D;
        this.updater = e || B;
      }
      var H = G.prototype = new F();
      H.constructor = G;
      C(H, E.prototype);
      H.isPureReactComponent = true;
      var I = Array.isArray;
      var J = Object.prototype.hasOwnProperty;
      var K = { current: null };
      var L = { key: true, ref: true, __self: true, __source: true };
      function M(a, b, e) {
        var d, c = {}, k = null, h = null;
        if (null != b) for (d in void 0 !== b.ref && (h = b.ref), void 0 !== b.key && (k = "" + b.key), b) J.call(b, d) && !L.hasOwnProperty(d) && (c[d] = b[d]);
        var g = arguments.length - 2;
        if (1 === g) c.children = e;
        else if (1 < g) {
          for (var f = Array(g), m = 0; m < g; m++) f[m] = arguments[m + 2];
          c.children = f;
        }
        if (a && a.defaultProps) for (d in g = a.defaultProps, g) void 0 === c[d] && (c[d] = g[d]);
        return { $$typeof: l, type: a, key: k, ref: h, props: c, _owner: K.current };
      }
      function N(a, b) {
        return { $$typeof: l, type: a.type, key: b, ref: a.ref, props: a.props, _owner: a._owner };
      }
      function O(a) {
        return "object" === typeof a && null !== a && a.$$typeof === l;
      }
      function escape(a) {
        var b = { "=": "=0", ":": "=2" };
        return "$" + a.replace(/[=:]/g, function(a2) {
          return b[a2];
        });
      }
      var P = /\/+/g;
      function Q(a, b) {
        return "object" === typeof a && null !== a && null != a.key ? escape("" + a.key) : b.toString(36);
      }
      function R(a, b, e, d, c) {
        var k = typeof a;
        if ("undefined" === k || "boolean" === k) a = null;
        var h = false;
        if (null === a) h = true;
        else switch (k) {
          case "string":
          case "number":
            h = true;
            break;
          case "object":
            switch (a.$$typeof) {
              case l:
              case n:
                h = true;
            }
        }
        if (h) return h = a, c = c(h), a = "" === d ? "." + Q(h, 0) : d, I(c) ? (e = "", null != a && (e = a.replace(P, "$&/") + "/"), R(c, b, e, "", function(a2) {
          return a2;
        })) : null != c && (O(c) && (c = N(c, e + (!c.key || h && h.key === c.key ? "" : ("" + c.key).replace(P, "$&/") + "/") + a)), b.push(c)), 1;
        h = 0;
        d = "" === d ? "." : d + ":";
        if (I(a)) for (var g = 0; g < a.length; g++) {
          k = a[g];
          var f = d + Q(k, g);
          h += R(k, b, e, f, c);
        }
        else if (f = A(a), "function" === typeof f) for (a = f.call(a), g = 0; !(k = a.next()).done; ) k = k.value, f = d + Q(k, g++), h += R(k, b, e, f, c);
        else if ("object" === k) throw b = String(a), Error("Objects are not valid as a React child (found: " + ("[object Object]" === b ? "object with keys {" + Object.keys(a).join(", ") + "}" : b) + "). If you meant to render a collection of children, use an array instead.");
        return h;
      }
      function S(a, b, e) {
        if (null == a) return a;
        var d = [], c = 0;
        R(a, d, "", "", function(a2) {
          return b.call(e, a2, c++);
        });
        return d;
      }
      function T(a) {
        if (-1 === a._status) {
          var b = a._result;
          b = b();
          b.then(function(b2) {
            if (0 === a._status || -1 === a._status) a._status = 1, a._result = b2;
          }, function(b2) {
            if (0 === a._status || -1 === a._status) a._status = 2, a._result = b2;
          });
          -1 === a._status && (a._status = 0, a._result = b);
        }
        if (1 === a._status) return a._result.default;
        throw a._result;
      }
      var U = { current: null };
      var V = { transition: null };
      var W = { ReactCurrentDispatcher: U, ReactCurrentBatchConfig: V, ReactCurrentOwner: K };
      exports.Children = { map: S, forEach: function(a, b, e) {
        S(a, function() {
          b.apply(this, arguments);
        }, e);
      }, count: function(a) {
        var b = 0;
        S(a, function() {
          b++;
        });
        return b;
      }, toArray: function(a) {
        return S(a, function(a2) {
          return a2;
        }) || [];
      }, only: function(a) {
        if (!O(a)) throw Error("React.Children.only expected to receive a single React element child.");
        return a;
      } };
      exports.Component = E;
      exports.Fragment = p;
      exports.Profiler = r;
      exports.PureComponent = G;
      exports.StrictMode = q;
      exports.Suspense = w;
      exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = W;
      exports.cloneElement = function(a, b, e) {
        if (null === a || void 0 === a) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + a + ".");
        var d = C({}, a.props), c = a.key, k = a.ref, h = a._owner;
        if (null != b) {
          void 0 !== b.ref && (k = b.ref, h = K.current);
          void 0 !== b.key && (c = "" + b.key);
          if (a.type && a.type.defaultProps) var g = a.type.defaultProps;
          for (f in b) J.call(b, f) && !L.hasOwnProperty(f) && (d[f] = void 0 === b[f] && void 0 !== g ? g[f] : b[f]);
        }
        var f = arguments.length - 2;
        if (1 === f) d.children = e;
        else if (1 < f) {
          g = Array(f);
          for (var m = 0; m < f; m++) g[m] = arguments[m + 2];
          d.children = g;
        }
        return { $$typeof: l, type: a.type, key: c, ref: k, props: d, _owner: h };
      };
      exports.createContext = function(a) {
        a = { $$typeof: u, _currentValue: a, _currentValue2: a, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null };
        a.Provider = { $$typeof: t, _context: a };
        return a.Consumer = a;
      };
      exports.createElement = M;
      exports.createFactory = function(a) {
        var b = M.bind(null, a);
        b.type = a;
        return b;
      };
      exports.createRef = function() {
        return { current: null };
      };
      exports.forwardRef = function(a) {
        return { $$typeof: v, render: a };
      };
      exports.isValidElement = O;
      exports.lazy = function(a) {
        return { $$typeof: y, _payload: { _status: -1, _result: a }, _init: T };
      };
      exports.memo = function(a, b) {
        return { $$typeof: x, type: a, compare: void 0 === b ? null : b };
      };
      exports.startTransition = function(a) {
        var b = V.transition;
        V.transition = {};
        try {
          a();
        } finally {
          V.transition = b;
        }
      };
      exports.unstable_act = function() {
        throw Error("act(...) is not supported in production builds of React.");
      };
      exports.useCallback = function(a, b) {
        return U.current.useCallback(a, b);
      };
      exports.useContext = function(a) {
        return U.current.useContext(a);
      };
      exports.useDebugValue = function() {
      };
      exports.useDeferredValue = function(a) {
        return U.current.useDeferredValue(a);
      };
      exports.useEffect = function(a, b) {
        return U.current.useEffect(a, b);
      };
      exports.useId = function() {
        return U.current.useId();
      };
      exports.useImperativeHandle = function(a, b, e) {
        return U.current.useImperativeHandle(a, b, e);
      };
      exports.useInsertionEffect = function(a, b) {
        return U.current.useInsertionEffect(a, b);
      };
      exports.useLayoutEffect = function(a, b) {
        return U.current.useLayoutEffect(a, b);
      };
      exports.useMemo = function(a, b) {
        return U.current.useMemo(a, b);
      };
      exports.useReducer = function(a, b, e) {
        return U.current.useReducer(a, b, e);
      };
      exports.useRef = function(a) {
        return U.current.useRef(a);
      };
      exports.useState = function(a) {
        return U.current.useState(a);
      };
      exports.useSyncExternalStore = function(a, b, e) {
        return U.current.useSyncExternalStore(a, b, e);
      };
      exports.useTransition = function() {
        return U.current.useTransition();
      };
      exports.version = "18.2.0";
    }
  });

  // node_modules/react/index.js
  var require_react = __commonJS({
    "node_modules/react/index.js"(exports, module) {
      "use strict";
      if (true) {
        module.exports = require_react_production_min();
      } else {
        module.exports = null;
      }
    }
  });

  // node_modules/scheduler/cjs/scheduler.production.min.js
  var require_scheduler_production_min = __commonJS({
    "node_modules/scheduler/cjs/scheduler.production.min.js"(exports) {
      "use strict";
      function f(a, b) {
        var c = a.length;
        a.push(b);
        a: for (; 0 < c; ) {
          var d = c - 1 >>> 1, e = a[d];
          if (0 < g(e, b)) a[d] = b, a[c] = e, c = d;
          else break a;
        }
      }
      function h(a) {
        return 0 === a.length ? null : a[0];
      }
      function k(a) {
        if (0 === a.length) return null;
        var b = a[0], c = a.pop();
        if (c !== b) {
          a[0] = c;
          a: for (var d = 0, e = a.length, w = e >>> 1; d < w; ) {
            var m = 2 * (d + 1) - 1, C = a[m], n = m + 1, x = a[n];
            if (0 > g(C, c)) n < e && 0 > g(x, C) ? (a[d] = x, a[n] = c, d = n) : (a[d] = C, a[m] = c, d = m);
            else if (n < e && 0 > g(x, c)) a[d] = x, a[n] = c, d = n;
            else break a;
          }
        }
        return b;
      }
      function g(a, b) {
        var c = a.sortIndex - b.sortIndex;
        return 0 !== c ? c : a.id - b.id;
      }
      if ("object" === typeof performance && "function" === typeof performance.now) {
        l = performance;
        exports.unstable_now = function() {
          return l.now();
        };
      } else {
        p = Date, q = p.now();
        exports.unstable_now = function() {
          return p.now() - q;
        };
      }
      var l;
      var p;
      var q;
      var r = [];
      var t = [];
      var u = 1;
      var v = null;
      var y = 3;
      var z = false;
      var A = false;
      var B = false;
      var D = "function" === typeof setTimeout ? setTimeout : null;
      var E = "function" === typeof clearTimeout ? clearTimeout : null;
      var F = "undefined" !== typeof setImmediate ? setImmediate : null;
      "undefined" !== typeof navigator && void 0 !== navigator.scheduling && void 0 !== navigator.scheduling.isInputPending && navigator.scheduling.isInputPending.bind(navigator.scheduling);
      function G(a) {
        for (var b = h(t); null !== b; ) {
          if (null === b.callback) k(t);
          else if (b.startTime <= a) k(t), b.sortIndex = b.expirationTime, f(r, b);
          else break;
          b = h(t);
        }
      }
      function H(a) {
        B = false;
        G(a);
        if (!A) if (null !== h(r)) A = true, I(J);
        else {
          var b = h(t);
          null !== b && K(H, b.startTime - a);
        }
      }
      function J(a, b) {
        A = false;
        B && (B = false, E(L), L = -1);
        z = true;
        var c = y;
        try {
          G(b);
          for (v = h(r); null !== v && (!(v.expirationTime > b) || a && !M()); ) {
            var d = v.callback;
            if ("function" === typeof d) {
              v.callback = null;
              y = v.priorityLevel;
              var e = d(v.expirationTime <= b);
              b = exports.unstable_now();
              "function" === typeof e ? v.callback = e : v === h(r) && k(r);
              G(b);
            } else k(r);
            v = h(r);
          }
          if (null !== v) var w = true;
          else {
            var m = h(t);
            null !== m && K(H, m.startTime - b);
            w = false;
          }
          return w;
        } finally {
          v = null, y = c, z = false;
        }
      }
      var N = false;
      var O = null;
      var L = -1;
      var P = 5;
      var Q = -1;
      function M() {
        return exports.unstable_now() - Q < P ? false : true;
      }
      function R() {
        if (null !== O) {
          var a = exports.unstable_now();
          Q = a;
          var b = true;
          try {
            b = O(true, a);
          } finally {
            b ? S() : (N = false, O = null);
          }
        } else N = false;
      }
      var S;
      if ("function" === typeof F) S = function() {
        F(R);
      };
      else if ("undefined" !== typeof MessageChannel) {
        T = new MessageChannel(), U = T.port2;
        T.port1.onmessage = R;
        S = function() {
          U.postMessage(null);
        };
      } else S = function() {
        D(R, 0);
      };
      var T;
      var U;
      function I(a) {
        O = a;
        N || (N = true, S());
      }
      function K(a, b) {
        L = D(function() {
          a(exports.unstable_now());
        }, b);
      }
      exports.unstable_IdlePriority = 5;
      exports.unstable_ImmediatePriority = 1;
      exports.unstable_LowPriority = 4;
      exports.unstable_NormalPriority = 3;
      exports.unstable_Profiling = null;
      exports.unstable_UserBlockingPriority = 2;
      exports.unstable_cancelCallback = function(a) {
        a.callback = null;
      };
      exports.unstable_continueExecution = function() {
        A || z || (A = true, I(J));
      };
      exports.unstable_forceFrameRate = function(a) {
        0 > a || 125 < a ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : P = 0 < a ? Math.floor(1e3 / a) : 5;
      };
      exports.unstable_getCurrentPriorityLevel = function() {
        return y;
      };
      exports.unstable_getFirstCallbackNode = function() {
        return h(r);
      };
      exports.unstable_next = function(a) {
        switch (y) {
          case 1:
          case 2:
          case 3:
            var b = 3;
            break;
          default:
            b = y;
        }
        var c = y;
        y = b;
        try {
          return a();
        } finally {
          y = c;
        }
      };
      exports.unstable_pauseExecution = function() {
      };
      exports.unstable_requestPaint = function() {
      };
      exports.unstable_runWithPriority = function(a, b) {
        switch (a) {
          case 1:
          case 2:
          case 3:
          case 4:
          case 5:
            break;
          default:
            a = 3;
        }
        var c = y;
        y = a;
        try {
          return b();
        } finally {
          y = c;
        }
      };
      exports.unstable_scheduleCallback = function(a, b, c) {
        var d = exports.unstable_now();
        "object" === typeof c && null !== c ? (c = c.delay, c = "number" === typeof c && 0 < c ? d + c : d) : c = d;
        switch (a) {
          case 1:
            var e = -1;
            break;
          case 2:
            e = 250;
            break;
          case 5:
            e = 1073741823;
            break;
          case 4:
            e = 1e4;
            break;
          default:
            e = 5e3;
        }
        e = c + e;
        a = { id: u++, callback: b, priorityLevel: a, startTime: c, expirationTime: e, sortIndex: -1 };
        c > d ? (a.sortIndex = c, f(t, a), null === h(r) && a === h(t) && (B ? (E(L), L = -1) : B = true, K(H, c - d))) : (a.sortIndex = e, f(r, a), A || z || (A = true, I(J)));
        return a;
      };
      exports.unstable_shouldYield = M;
      exports.unstable_wrapCallback = function(a) {
        var b = y;
        return function() {
          var c = y;
          y = b;
          try {
            return a.apply(this, arguments);
          } finally {
            y = c;
          }
        };
      };
    }
  });

  // node_modules/scheduler/index.js
  var require_scheduler = __commonJS({
    "node_modules/scheduler/index.js"(exports, module) {
      "use strict";
      if (true) {
        module.exports = require_scheduler_production_min();
      } else {
        module.exports = null;
      }
    }
  });

  // node_modules/react-dom/cjs/react-dom.production.min.js
  var require_react_dom_production_min = __commonJS({
    "node_modules/react-dom/cjs/react-dom.production.min.js"(exports) {
      "use strict";
      var aa = require_react();
      var ca = require_scheduler();
      function p(a) {
        for (var b = "https://reactjs.org/docs/error-decoder.html?invariant=" + a, c = 1; c < arguments.length; c++) b += "&args[]=" + encodeURIComponent(arguments[c]);
        return "Minified React error #" + a + "; visit " + b + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
      }
      var da = /* @__PURE__ */ new Set();
      var ea = {};
      function fa(a, b) {
        ha(a, b);
        ha(a + "Capture", b);
      }
      function ha(a, b) {
        ea[a] = b;
        for (a = 0; a < b.length; a++) da.add(b[a]);
      }
      var ia = !("undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement);
      var ja = Object.prototype.hasOwnProperty;
      var ka = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/;
      var la = {};
      var ma = {};
      function oa(a) {
        if (ja.call(ma, a)) return true;
        if (ja.call(la, a)) return false;
        if (ka.test(a)) return ma[a] = true;
        la[a] = true;
        return false;
      }
      function pa(a, b, c, d) {
        if (null !== c && 0 === c.type) return false;
        switch (typeof b) {
          case "function":
          case "symbol":
            return true;
          case "boolean":
            if (d) return false;
            if (null !== c) return !c.acceptsBooleans;
            a = a.toLowerCase().slice(0, 5);
            return "data-" !== a && "aria-" !== a;
          default:
            return false;
        }
      }
      function qa(a, b, c, d) {
        if (null === b || "undefined" === typeof b || pa(a, b, c, d)) return true;
        if (d) return false;
        if (null !== c) switch (c.type) {
          case 3:
            return !b;
          case 4:
            return false === b;
          case 5:
            return isNaN(b);
          case 6:
            return isNaN(b) || 1 > b;
        }
        return false;
      }
      function v(a, b, c, d, e, f, g) {
        this.acceptsBooleans = 2 === b || 3 === b || 4 === b;
        this.attributeName = d;
        this.attributeNamespace = e;
        this.mustUseProperty = c;
        this.propertyName = a;
        this.type = b;
        this.sanitizeURL = f;
        this.removeEmptyString = g;
      }
      var z = {};
      "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(a) {
        z[a] = new v(a, 0, false, a, null, false, false);
      });
      [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(a) {
        var b = a[0];
        z[b] = new v(b, 1, false, a[1], null, false, false);
      });
      ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(a) {
        z[a] = new v(a, 2, false, a.toLowerCase(), null, false, false);
      });
      ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(a) {
        z[a] = new v(a, 2, false, a, null, false, false);
      });
      "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(a) {
        z[a] = new v(a, 3, false, a.toLowerCase(), null, false, false);
      });
      ["checked", "multiple", "muted", "selected"].forEach(function(a) {
        z[a] = new v(a, 3, true, a, null, false, false);
      });
      ["capture", "download"].forEach(function(a) {
        z[a] = new v(a, 4, false, a, null, false, false);
      });
      ["cols", "rows", "size", "span"].forEach(function(a) {
        z[a] = new v(a, 6, false, a, null, false, false);
      });
      ["rowSpan", "start"].forEach(function(a) {
        z[a] = new v(a, 5, false, a.toLowerCase(), null, false, false);
      });
      var ra = /[\-:]([a-z])/g;
      function sa(a) {
        return a[1].toUpperCase();
      }
      "accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(a) {
        var b = a.replace(
          ra,
          sa
        );
        z[b] = new v(b, 1, false, a, null, false, false);
      });
      "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(a) {
        var b = a.replace(ra, sa);
        z[b] = new v(b, 1, false, a, "http://www.w3.org/1999/xlink", false, false);
      });
      ["xml:base", "xml:lang", "xml:space"].forEach(function(a) {
        var b = a.replace(ra, sa);
        z[b] = new v(b, 1, false, a, "http://www.w3.org/XML/1998/namespace", false, false);
      });
      ["tabIndex", "crossOrigin"].forEach(function(a) {
        z[a] = new v(a, 1, false, a.toLowerCase(), null, false, false);
      });
      z.xlinkHref = new v("xlinkHref", 1, false, "xlink:href", "http://www.w3.org/1999/xlink", true, false);
      ["src", "href", "action", "formAction"].forEach(function(a) {
        z[a] = new v(a, 1, false, a.toLowerCase(), null, true, true);
      });
      function ta(a, b, c, d) {
        var e = z.hasOwnProperty(b) ? z[b] : null;
        if (null !== e ? 0 !== e.type : d || !(2 < b.length) || "o" !== b[0] && "O" !== b[0] || "n" !== b[1] && "N" !== b[1]) qa(b, c, e, d) && (c = null), d || null === e ? oa(b) && (null === c ? a.removeAttribute(b) : a.setAttribute(b, "" + c)) : e.mustUseProperty ? a[e.propertyName] = null === c ? 3 === e.type ? false : "" : c : (b = e.attributeName, d = e.attributeNamespace, null === c ? a.removeAttribute(b) : (e = e.type, c = 3 === e || 4 === e && true === c ? "" : "" + c, d ? a.setAttributeNS(d, b, c) : a.setAttribute(b, c)));
      }
      var ua = aa.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
      var va = Symbol.for("react.element");
      var wa = Symbol.for("react.portal");
      var ya = Symbol.for("react.fragment");
      var za = Symbol.for("react.strict_mode");
      var Aa = Symbol.for("react.profiler");
      var Ba = Symbol.for("react.provider");
      var Ca = Symbol.for("react.context");
      var Da = Symbol.for("react.forward_ref");
      var Ea = Symbol.for("react.suspense");
      var Fa = Symbol.for("react.suspense_list");
      var Ga = Symbol.for("react.memo");
      var Ha = Symbol.for("react.lazy");
      Symbol.for("react.scope");
      Symbol.for("react.debug_trace_mode");
      var Ia = Symbol.for("react.offscreen");
      Symbol.for("react.legacy_hidden");
      Symbol.for("react.cache");
      Symbol.for("react.tracing_marker");
      var Ja = Symbol.iterator;
      function Ka(a) {
        if (null === a || "object" !== typeof a) return null;
        a = Ja && a[Ja] || a["@@iterator"];
        return "function" === typeof a ? a : null;
      }
      var A = Object.assign;
      var La;
      function Ma(a) {
        if (void 0 === La) try {
          throw Error();
        } catch (c) {
          var b = c.stack.trim().match(/\n( *(at )?)/);
          La = b && b[1] || "";
        }
        return "\n" + La + a;
      }
      var Na = false;
      function Oa(a, b) {
        if (!a || Na) return "";
        Na = true;
        var c = Error.prepareStackTrace;
        Error.prepareStackTrace = void 0;
        try {
          if (b) if (b = function() {
            throw Error();
          }, Object.defineProperty(b.prototype, "props", { set: function() {
            throw Error();
          } }), "object" === typeof Reflect && Reflect.construct) {
            try {
              Reflect.construct(b, []);
            } catch (l) {
              var d = l;
            }
            Reflect.construct(a, [], b);
          } else {
            try {
              b.call();
            } catch (l) {
              d = l;
            }
            a.call(b.prototype);
          }
          else {
            try {
              throw Error();
            } catch (l) {
              d = l;
            }
            a();
          }
        } catch (l) {
          if (l && d && "string" === typeof l.stack) {
            for (var e = l.stack.split("\n"), f = d.stack.split("\n"), g = e.length - 1, h = f.length - 1; 1 <= g && 0 <= h && e[g] !== f[h]; ) h--;
            for (; 1 <= g && 0 <= h; g--, h--) if (e[g] !== f[h]) {
              if (1 !== g || 1 !== h) {
                do
                  if (g--, h--, 0 > h || e[g] !== f[h]) {
                    var k = "\n" + e[g].replace(" at new ", " at ");
                    a.displayName && k.includes("<anonymous>") && (k = k.replace("<anonymous>", a.displayName));
                    return k;
                  }
                while (1 <= g && 0 <= h);
              }
              break;
            }
          }
        } finally {
          Na = false, Error.prepareStackTrace = c;
        }
        return (a = a ? a.displayName || a.name : "") ? Ma(a) : "";
      }
      function Pa(a) {
        switch (a.tag) {
          case 5:
            return Ma(a.type);
          case 16:
            return Ma("Lazy");
          case 13:
            return Ma("Suspense");
          case 19:
            return Ma("SuspenseList");
          case 0:
          case 2:
          case 15:
            return a = Oa(a.type, false), a;
          case 11:
            return a = Oa(a.type.render, false), a;
          case 1:
            return a = Oa(a.type, true), a;
          default:
            return "";
        }
      }
      function Qa(a) {
        if (null == a) return null;
        if ("function" === typeof a) return a.displayName || a.name || null;
        if ("string" === typeof a) return a;
        switch (a) {
          case ya:
            return "Fragment";
          case wa:
            return "Portal";
          case Aa:
            return "Profiler";
          case za:
            return "StrictMode";
          case Ea:
            return "Suspense";
          case Fa:
            return "SuspenseList";
        }
        if ("object" === typeof a) switch (a.$$typeof) {
          case Ca:
            return (a.displayName || "Context") + ".Consumer";
          case Ba:
            return (a._context.displayName || "Context") + ".Provider";
          case Da:
            var b = a.render;
            a = a.displayName;
            a || (a = b.displayName || b.name || "", a = "" !== a ? "ForwardRef(" + a + ")" : "ForwardRef");
            return a;
          case Ga:
            return b = a.displayName || null, null !== b ? b : Qa(a.type) || "Memo";
          case Ha:
            b = a._payload;
            a = a._init;
            try {
              return Qa(a(b));
            } catch (c) {
            }
        }
        return null;
      }
      function Ra(a) {
        var b = a.type;
        switch (a.tag) {
          case 24:
            return "Cache";
          case 9:
            return (b.displayName || "Context") + ".Consumer";
          case 10:
            return (b._context.displayName || "Context") + ".Provider";
          case 18:
            return "DehydratedFragment";
          case 11:
            return a = b.render, a = a.displayName || a.name || "", b.displayName || ("" !== a ? "ForwardRef(" + a + ")" : "ForwardRef");
          case 7:
            return "Fragment";
          case 5:
            return b;
          case 4:
            return "Portal";
          case 3:
            return "Root";
          case 6:
            return "Text";
          case 16:
            return Qa(b);
          case 8:
            return b === za ? "StrictMode" : "Mode";
          case 22:
            return "Offscreen";
          case 12:
            return "Profiler";
          case 21:
            return "Scope";
          case 13:
            return "Suspense";
          case 19:
            return "SuspenseList";
          case 25:
            return "TracingMarker";
          case 1:
          case 0:
          case 17:
          case 2:
          case 14:
          case 15:
            if ("function" === typeof b) return b.displayName || b.name || null;
            if ("string" === typeof b) return b;
        }
        return null;
      }
      function Sa(a) {
        switch (typeof a) {
          case "boolean":
          case "number":
          case "string":
          case "undefined":
            return a;
          case "object":
            return a;
          default:
            return "";
        }
      }
      function Ta(a) {
        var b = a.type;
        return (a = a.nodeName) && "input" === a.toLowerCase() && ("checkbox" === b || "radio" === b);
      }
      function Ua(a) {
        var b = Ta(a) ? "checked" : "value", c = Object.getOwnPropertyDescriptor(a.constructor.prototype, b), d = "" + a[b];
        if (!a.hasOwnProperty(b) && "undefined" !== typeof c && "function" === typeof c.get && "function" === typeof c.set) {
          var e = c.get, f = c.set;
          Object.defineProperty(a, b, { configurable: true, get: function() {
            return e.call(this);
          }, set: function(a2) {
            d = "" + a2;
            f.call(this, a2);
          } });
          Object.defineProperty(a, b, { enumerable: c.enumerable });
          return { getValue: function() {
            return d;
          }, setValue: function(a2) {
            d = "" + a2;
          }, stopTracking: function() {
            a._valueTracker = null;
            delete a[b];
          } };
        }
      }
      function Va(a) {
        a._valueTracker || (a._valueTracker = Ua(a));
      }
      function Wa(a) {
        if (!a) return false;
        var b = a._valueTracker;
        if (!b) return true;
        var c = b.getValue();
        var d = "";
        a && (d = Ta(a) ? a.checked ? "true" : "false" : a.value);
        a = d;
        return a !== c ? (b.setValue(a), true) : false;
      }
      function Xa(a) {
        a = a || ("undefined" !== typeof document ? document : void 0);
        if ("undefined" === typeof a) return null;
        try {
          return a.activeElement || a.body;
        } catch (b) {
          return a.body;
        }
      }
      function Ya(a, b) {
        var c = b.checked;
        return A({}, b, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: null != c ? c : a._wrapperState.initialChecked });
      }
      function Za(a, b) {
        var c = null == b.defaultValue ? "" : b.defaultValue, d = null != b.checked ? b.checked : b.defaultChecked;
        c = Sa(null != b.value ? b.value : c);
        a._wrapperState = { initialChecked: d, initialValue: c, controlled: "checkbox" === b.type || "radio" === b.type ? null != b.checked : null != b.value };
      }
      function ab(a, b) {
        b = b.checked;
        null != b && ta(a, "checked", b, false);
      }
      function bb(a, b) {
        ab(a, b);
        var c = Sa(b.value), d = b.type;
        if (null != c) if ("number" === d) {
          if (0 === c && "" === a.value || a.value != c) a.value = "" + c;
        } else a.value !== "" + c && (a.value = "" + c);
        else if ("submit" === d || "reset" === d) {
          a.removeAttribute("value");
          return;
        }
        b.hasOwnProperty("value") ? cb(a, b.type, c) : b.hasOwnProperty("defaultValue") && cb(a, b.type, Sa(b.defaultValue));
        null == b.checked && null != b.defaultChecked && (a.defaultChecked = !!b.defaultChecked);
      }
      function db(a, b, c) {
        if (b.hasOwnProperty("value") || b.hasOwnProperty("defaultValue")) {
          var d = b.type;
          if (!("submit" !== d && "reset" !== d || void 0 !== b.value && null !== b.value)) return;
          b = "" + a._wrapperState.initialValue;
          c || b === a.value || (a.value = b);
          a.defaultValue = b;
        }
        c = a.name;
        "" !== c && (a.name = "");
        a.defaultChecked = !!a._wrapperState.initialChecked;
        "" !== c && (a.name = c);
      }
      function cb(a, b, c) {
        if ("number" !== b || Xa(a.ownerDocument) !== a) null == c ? a.defaultValue = "" + a._wrapperState.initialValue : a.defaultValue !== "" + c && (a.defaultValue = "" + c);
      }
      var eb = Array.isArray;
      function fb(a, b, c, d) {
        a = a.options;
        if (b) {
          b = {};
          for (var e = 0; e < c.length; e++) b["$" + c[e]] = true;
          for (c = 0; c < a.length; c++) e = b.hasOwnProperty("$" + a[c].value), a[c].selected !== e && (a[c].selected = e), e && d && (a[c].defaultSelected = true);
        } else {
          c = "" + Sa(c);
          b = null;
          for (e = 0; e < a.length; e++) {
            if (a[e].value === c) {
              a[e].selected = true;
              d && (a[e].defaultSelected = true);
              return;
            }
            null !== b || a[e].disabled || (b = a[e]);
          }
          null !== b && (b.selected = true);
        }
      }
      function gb(a, b) {
        if (null != b.dangerouslySetInnerHTML) throw Error(p(91));
        return A({}, b, { value: void 0, defaultValue: void 0, children: "" + a._wrapperState.initialValue });
      }
      function hb(a, b) {
        var c = b.value;
        if (null == c) {
          c = b.children;
          b = b.defaultValue;
          if (null != c) {
            if (null != b) throw Error(p(92));
            if (eb(c)) {
              if (1 < c.length) throw Error(p(93));
              c = c[0];
            }
            b = c;
          }
          null == b && (b = "");
          c = b;
        }
        a._wrapperState = { initialValue: Sa(c) };
      }
      function ib(a, b) {
        var c = Sa(b.value), d = Sa(b.defaultValue);
        null != c && (c = "" + c, c !== a.value && (a.value = c), null == b.defaultValue && a.defaultValue !== c && (a.defaultValue = c));
        null != d && (a.defaultValue = "" + d);
      }
      function jb(a) {
        var b = a.textContent;
        b === a._wrapperState.initialValue && "" !== b && null !== b && (a.value = b);
      }
      function kb(a) {
        switch (a) {
          case "svg":
            return "http://www.w3.org/2000/svg";
          case "math":
            return "http://www.w3.org/1998/Math/MathML";
          default:
            return "http://www.w3.org/1999/xhtml";
        }
      }
      function lb(a, b) {
        return null == a || "http://www.w3.org/1999/xhtml" === a ? kb(b) : "http://www.w3.org/2000/svg" === a && "foreignObject" === b ? "http://www.w3.org/1999/xhtml" : a;
      }
      var mb;
      var nb = (function(a) {
        return "undefined" !== typeof MSApp && MSApp.execUnsafeLocalFunction ? function(b, c, d, e) {
          MSApp.execUnsafeLocalFunction(function() {
            return a(b, c, d, e);
          });
        } : a;
      })(function(a, b) {
        if ("http://www.w3.org/2000/svg" !== a.namespaceURI || "innerHTML" in a) a.innerHTML = b;
        else {
          mb = mb || document.createElement("div");
          mb.innerHTML = "<svg>" + b.valueOf().toString() + "</svg>";
          for (b = mb.firstChild; a.firstChild; ) a.removeChild(a.firstChild);
          for (; b.firstChild; ) a.appendChild(b.firstChild);
        }
      });
      function ob(a, b) {
        if (b) {
          var c = a.firstChild;
          if (c && c === a.lastChild && 3 === c.nodeType) {
            c.nodeValue = b;
            return;
          }
        }
        a.textContent = b;
      }
      var pb = {
        animationIterationCount: true,
        aspectRatio: true,
        borderImageOutset: true,
        borderImageSlice: true,
        borderImageWidth: true,
        boxFlex: true,
        boxFlexGroup: true,
        boxOrdinalGroup: true,
        columnCount: true,
        columns: true,
        flex: true,
        flexGrow: true,
        flexPositive: true,
        flexShrink: true,
        flexNegative: true,
        flexOrder: true,
        gridArea: true,
        gridRow: true,
        gridRowEnd: true,
        gridRowSpan: true,
        gridRowStart: true,
        gridColumn: true,
        gridColumnEnd: true,
        gridColumnSpan: true,
        gridColumnStart: true,
        fontWeight: true,
        lineClamp: true,
        lineHeight: true,
        opacity: true,
        order: true,
        orphans: true,
        tabSize: true,
        widows: true,
        zIndex: true,
        zoom: true,
        fillOpacity: true,
        floodOpacity: true,
        stopOpacity: true,
        strokeDasharray: true,
        strokeDashoffset: true,
        strokeMiterlimit: true,
        strokeOpacity: true,
        strokeWidth: true
      };
      var qb = ["Webkit", "ms", "Moz", "O"];
      Object.keys(pb).forEach(function(a) {
        qb.forEach(function(b) {
          b = b + a.charAt(0).toUpperCase() + a.substring(1);
          pb[b] = pb[a];
        });
      });
      function rb(a, b, c) {
        return null == b || "boolean" === typeof b || "" === b ? "" : c || "number" !== typeof b || 0 === b || pb.hasOwnProperty(a) && pb[a] ? ("" + b).trim() : b + "px";
      }
      function sb(a, b) {
        a = a.style;
        for (var c in b) if (b.hasOwnProperty(c)) {
          var d = 0 === c.indexOf("--"), e = rb(c, b[c], d);
          "float" === c && (c = "cssFloat");
          d ? a.setProperty(c, e) : a[c] = e;
        }
      }
      var tb = A({ menuitem: true }, { area: true, base: true, br: true, col: true, embed: true, hr: true, img: true, input: true, keygen: true, link: true, meta: true, param: true, source: true, track: true, wbr: true });
      function ub(a, b) {
        if (b) {
          if (tb[a] && (null != b.children || null != b.dangerouslySetInnerHTML)) throw Error(p(137, a));
          if (null != b.dangerouslySetInnerHTML) {
            if (null != b.children) throw Error(p(60));
            if ("object" !== typeof b.dangerouslySetInnerHTML || !("__html" in b.dangerouslySetInnerHTML)) throw Error(p(61));
          }
          if (null != b.style && "object" !== typeof b.style) throw Error(p(62));
        }
      }
      function vb(a, b) {
        if (-1 === a.indexOf("-")) return "string" === typeof b.is;
        switch (a) {
          case "annotation-xml":
          case "color-profile":
          case "font-face":
          case "font-face-src":
          case "font-face-uri":
          case "font-face-format":
          case "font-face-name":
          case "missing-glyph":
            return false;
          default:
            return true;
        }
      }
      var wb = null;
      function xb(a) {
        a = a.target || a.srcElement || window;
        a.correspondingUseElement && (a = a.correspondingUseElement);
        return 3 === a.nodeType ? a.parentNode : a;
      }
      var yb = null;
      var zb = null;
      var Ab = null;
      function Bb(a) {
        if (a = Cb(a)) {
          if ("function" !== typeof yb) throw Error(p(280));
          var b = a.stateNode;
          b && (b = Db(b), yb(a.stateNode, a.type, b));
        }
      }
      function Eb(a) {
        zb ? Ab ? Ab.push(a) : Ab = [a] : zb = a;
      }
      function Fb() {
        if (zb) {
          var a = zb, b = Ab;
          Ab = zb = null;
          Bb(a);
          if (b) for (a = 0; a < b.length; a++) Bb(b[a]);
        }
      }
      function Gb(a, b) {
        return a(b);
      }
      function Hb() {
      }
      var Ib = false;
      function Jb(a, b, c) {
        if (Ib) return a(b, c);
        Ib = true;
        try {
          return Gb(a, b, c);
        } finally {
          if (Ib = false, null !== zb || null !== Ab) Hb(), Fb();
        }
      }
      function Kb(a, b) {
        var c = a.stateNode;
        if (null === c) return null;
        var d = Db(c);
        if (null === d) return null;
        c = d[b];
        a: switch (b) {
          case "onClick":
          case "onClickCapture":
          case "onDoubleClick":
          case "onDoubleClickCapture":
          case "onMouseDown":
          case "onMouseDownCapture":
          case "onMouseMove":
          case "onMouseMoveCapture":
          case "onMouseUp":
          case "onMouseUpCapture":
          case "onMouseEnter":
            (d = !d.disabled) || (a = a.type, d = !("button" === a || "input" === a || "select" === a || "textarea" === a));
            a = !d;
            break a;
          default:
            a = false;
        }
        if (a) return null;
        if (c && "function" !== typeof c) throw Error(p(231, b, typeof c));
        return c;
      }
      var Lb = false;
      if (ia) try {
        Mb = {};
        Object.defineProperty(Mb, "passive", { get: function() {
          Lb = true;
        } });
        window.addEventListener("test", Mb, Mb);
        window.removeEventListener("test", Mb, Mb);
      } catch (a) {
        Lb = false;
      }
      var Mb;
      function Nb(a, b, c, d, e, f, g, h, k) {
        var l = Array.prototype.slice.call(arguments, 3);
        try {
          b.apply(c, l);
        } catch (m) {
          this.onError(m);
        }
      }
      var Ob = false;
      var Pb = null;
      var Qb = false;
      var Rb = null;
      var Sb = { onError: function(a) {
        Ob = true;
        Pb = a;
      } };
      function Tb(a, b, c, d, e, f, g, h, k) {
        Ob = false;
        Pb = null;
        Nb.apply(Sb, arguments);
      }
      function Ub(a, b, c, d, e, f, g, h, k) {
        Tb.apply(this, arguments);
        if (Ob) {
          if (Ob) {
            var l = Pb;
            Ob = false;
            Pb = null;
          } else throw Error(p(198));
          Qb || (Qb = true, Rb = l);
        }
      }
      function Vb(a) {
        var b = a, c = a;
        if (a.alternate) for (; b.return; ) b = b.return;
        else {
          a = b;
          do
            b = a, 0 !== (b.flags & 4098) && (c = b.return), a = b.return;
          while (a);
        }
        return 3 === b.tag ? c : null;
      }
      function Wb(a) {
        if (13 === a.tag) {
          var b = a.memoizedState;
          null === b && (a = a.alternate, null !== a && (b = a.memoizedState));
          if (null !== b) return b.dehydrated;
        }
        return null;
      }
      function Xb(a) {
        if (Vb(a) !== a) throw Error(p(188));
      }
      function Yb(a) {
        var b = a.alternate;
        if (!b) {
          b = Vb(a);
          if (null === b) throw Error(p(188));
          return b !== a ? null : a;
        }
        for (var c = a, d = b; ; ) {
          var e = c.return;
          if (null === e) break;
          var f = e.alternate;
          if (null === f) {
            d = e.return;
            if (null !== d) {
              c = d;
              continue;
            }
            break;
          }
          if (e.child === f.child) {
            for (f = e.child; f; ) {
              if (f === c) return Xb(e), a;
              if (f === d) return Xb(e), b;
              f = f.sibling;
            }
            throw Error(p(188));
          }
          if (c.return !== d.return) c = e, d = f;
          else {
            for (var g = false, h = e.child; h; ) {
              if (h === c) {
                g = true;
                c = e;
                d = f;
                break;
              }
              if (h === d) {
                g = true;
                d = e;
                c = f;
                break;
              }
              h = h.sibling;
            }
            if (!g) {
              for (h = f.child; h; ) {
                if (h === c) {
                  g = true;
                  c = f;
                  d = e;
                  break;
                }
                if (h === d) {
                  g = true;
                  d = f;
                  c = e;
                  break;
                }
                h = h.sibling;
              }
              if (!g) throw Error(p(189));
            }
          }
          if (c.alternate !== d) throw Error(p(190));
        }
        if (3 !== c.tag) throw Error(p(188));
        return c.stateNode.current === c ? a : b;
      }
      function Zb(a) {
        a = Yb(a);
        return null !== a ? $b(a) : null;
      }
      function $b(a) {
        if (5 === a.tag || 6 === a.tag) return a;
        for (a = a.child; null !== a; ) {
          var b = $b(a);
          if (null !== b) return b;
          a = a.sibling;
        }
        return null;
      }
      var ac = ca.unstable_scheduleCallback;
      var bc = ca.unstable_cancelCallback;
      var cc = ca.unstable_shouldYield;
      var dc = ca.unstable_requestPaint;
      var B = ca.unstable_now;
      var ec = ca.unstable_getCurrentPriorityLevel;
      var fc = ca.unstable_ImmediatePriority;
      var gc = ca.unstable_UserBlockingPriority;
      var hc = ca.unstable_NormalPriority;
      var ic = ca.unstable_LowPriority;
      var jc = ca.unstable_IdlePriority;
      var kc = null;
      var lc = null;
      function mc(a) {
        if (lc && "function" === typeof lc.onCommitFiberRoot) try {
          lc.onCommitFiberRoot(kc, a, void 0, 128 === (a.current.flags & 128));
        } catch (b) {
        }
      }
      var oc = Math.clz32 ? Math.clz32 : nc;
      var pc = Math.log;
      var qc = Math.LN2;
      function nc(a) {
        a >>>= 0;
        return 0 === a ? 32 : 31 - (pc(a) / qc | 0) | 0;
      }
      var rc = 64;
      var sc = 4194304;
      function tc(a) {
        switch (a & -a) {
          case 1:
            return 1;
          case 2:
            return 2;
          case 4:
            return 4;
          case 8:
            return 8;
          case 16:
            return 16;
          case 32:
            return 32;
          case 64:
          case 128:
          case 256:
          case 512:
          case 1024:
          case 2048:
          case 4096:
          case 8192:
          case 16384:
          case 32768:
          case 65536:
          case 131072:
          case 262144:
          case 524288:
          case 1048576:
          case 2097152:
            return a & 4194240;
          case 4194304:
          case 8388608:
          case 16777216:
          case 33554432:
          case 67108864:
            return a & 130023424;
          case 134217728:
            return 134217728;
          case 268435456:
            return 268435456;
          case 536870912:
            return 536870912;
          case 1073741824:
            return 1073741824;
          default:
            return a;
        }
      }
      function uc(a, b) {
        var c = a.pendingLanes;
        if (0 === c) return 0;
        var d = 0, e = a.suspendedLanes, f = a.pingedLanes, g = c & 268435455;
        if (0 !== g) {
          var h = g & ~e;
          0 !== h ? d = tc(h) : (f &= g, 0 !== f && (d = tc(f)));
        } else g = c & ~e, 0 !== g ? d = tc(g) : 0 !== f && (d = tc(f));
        if (0 === d) return 0;
        if (0 !== b && b !== d && 0 === (b & e) && (e = d & -d, f = b & -b, e >= f || 16 === e && 0 !== (f & 4194240))) return b;
        0 !== (d & 4) && (d |= c & 16);
        b = a.entangledLanes;
        if (0 !== b) for (a = a.entanglements, b &= d; 0 < b; ) c = 31 - oc(b), e = 1 << c, d |= a[c], b &= ~e;
        return d;
      }
      function vc(a, b) {
        switch (a) {
          case 1:
          case 2:
          case 4:
            return b + 250;
          case 8:
          case 16:
          case 32:
          case 64:
          case 128:
          case 256:
          case 512:
          case 1024:
          case 2048:
          case 4096:
          case 8192:
          case 16384:
          case 32768:
          case 65536:
          case 131072:
          case 262144:
          case 524288:
          case 1048576:
          case 2097152:
            return b + 5e3;
          case 4194304:
          case 8388608:
          case 16777216:
          case 33554432:
          case 67108864:
            return -1;
          case 134217728:
          case 268435456:
          case 536870912:
          case 1073741824:
            return -1;
          default:
            return -1;
        }
      }
      function wc(a, b) {
        for (var c = a.suspendedLanes, d = a.pingedLanes, e = a.expirationTimes, f = a.pendingLanes; 0 < f; ) {
          var g = 31 - oc(f), h = 1 << g, k = e[g];
          if (-1 === k) {
            if (0 === (h & c) || 0 !== (h & d)) e[g] = vc(h, b);
          } else k <= b && (a.expiredLanes |= h);
          f &= ~h;
        }
      }
      function xc(a) {
        a = a.pendingLanes & -1073741825;
        return 0 !== a ? a : a & 1073741824 ? 1073741824 : 0;
      }
      function yc() {
        var a = rc;
        rc <<= 1;
        0 === (rc & 4194240) && (rc = 64);
        return a;
      }
      function zc(a) {
        for (var b = [], c = 0; 31 > c; c++) b.push(a);
        return b;
      }
      function Ac(a, b, c) {
        a.pendingLanes |= b;
        536870912 !== b && (a.suspendedLanes = 0, a.pingedLanes = 0);
        a = a.eventTimes;
        b = 31 - oc(b);
        a[b] = c;
      }
      function Bc(a, b) {
        var c = a.pendingLanes & ~b;
        a.pendingLanes = b;
        a.suspendedLanes = 0;
        a.pingedLanes = 0;
        a.expiredLanes &= b;
        a.mutableReadLanes &= b;
        a.entangledLanes &= b;
        b = a.entanglements;
        var d = a.eventTimes;
        for (a = a.expirationTimes; 0 < c; ) {
          var e = 31 - oc(c), f = 1 << e;
          b[e] = 0;
          d[e] = -1;
          a[e] = -1;
          c &= ~f;
        }
      }
      function Cc(a, b) {
        var c = a.entangledLanes |= b;
        for (a = a.entanglements; c; ) {
          var d = 31 - oc(c), e = 1 << d;
          e & b | a[d] & b && (a[d] |= b);
          c &= ~e;
        }
      }
      var C = 0;
      function Dc(a) {
        a &= -a;
        return 1 < a ? 4 < a ? 0 !== (a & 268435455) ? 16 : 536870912 : 4 : 1;
      }
      var Ec;
      var Fc;
      var Gc;
      var Hc;
      var Ic;
      var Jc = false;
      var Kc = [];
      var Lc = null;
      var Mc = null;
      var Nc = null;
      var Oc = /* @__PURE__ */ new Map();
      var Pc = /* @__PURE__ */ new Map();
      var Qc = [];
      var Rc = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
      function Sc(a, b) {
        switch (a) {
          case "focusin":
          case "focusout":
            Lc = null;
            break;
          case "dragenter":
          case "dragleave":
            Mc = null;
            break;
          case "mouseover":
          case "mouseout":
            Nc = null;
            break;
          case "pointerover":
          case "pointerout":
            Oc.delete(b.pointerId);
            break;
          case "gotpointercapture":
          case "lostpointercapture":
            Pc.delete(b.pointerId);
        }
      }
      function Tc(a, b, c, d, e, f) {
        if (null === a || a.nativeEvent !== f) return a = { blockedOn: b, domEventName: c, eventSystemFlags: d, nativeEvent: f, targetContainers: [e] }, null !== b && (b = Cb(b), null !== b && Fc(b)), a;
        a.eventSystemFlags |= d;
        b = a.targetContainers;
        null !== e && -1 === b.indexOf(e) && b.push(e);
        return a;
      }
      function Uc(a, b, c, d, e) {
        switch (b) {
          case "focusin":
            return Lc = Tc(Lc, a, b, c, d, e), true;
          case "dragenter":
            return Mc = Tc(Mc, a, b, c, d, e), true;
          case "mouseover":
            return Nc = Tc(Nc, a, b, c, d, e), true;
          case "pointerover":
            var f = e.pointerId;
            Oc.set(f, Tc(Oc.get(f) || null, a, b, c, d, e));
            return true;
          case "gotpointercapture":
            return f = e.pointerId, Pc.set(f, Tc(Pc.get(f) || null, a, b, c, d, e)), true;
        }
        return false;
      }
      function Vc(a) {
        var b = Wc(a.target);
        if (null !== b) {
          var c = Vb(b);
          if (null !== c) {
            if (b = c.tag, 13 === b) {
              if (b = Wb(c), null !== b) {
                a.blockedOn = b;
                Ic(a.priority, function() {
                  Gc(c);
                });
                return;
              }
            } else if (3 === b && c.stateNode.current.memoizedState.isDehydrated) {
              a.blockedOn = 3 === c.tag ? c.stateNode.containerInfo : null;
              return;
            }
          }
        }
        a.blockedOn = null;
      }
      function Xc(a) {
        if (null !== a.blockedOn) return false;
        for (var b = a.targetContainers; 0 < b.length; ) {
          var c = Yc(a.domEventName, a.eventSystemFlags, b[0], a.nativeEvent);
          if (null === c) {
            c = a.nativeEvent;
            var d = new c.constructor(c.type, c);
            wb = d;
            c.target.dispatchEvent(d);
            wb = null;
          } else return b = Cb(c), null !== b && Fc(b), a.blockedOn = c, false;
          b.shift();
        }
        return true;
      }
      function Zc(a, b, c) {
        Xc(a) && c.delete(b);
      }
      function $c() {
        Jc = false;
        null !== Lc && Xc(Lc) && (Lc = null);
        null !== Mc && Xc(Mc) && (Mc = null);
        null !== Nc && Xc(Nc) && (Nc = null);
        Oc.forEach(Zc);
        Pc.forEach(Zc);
      }
      function ad(a, b) {
        a.blockedOn === b && (a.blockedOn = null, Jc || (Jc = true, ca.unstable_scheduleCallback(ca.unstable_NormalPriority, $c)));
      }
      function bd(a) {
        function b(b2) {
          return ad(b2, a);
        }
        if (0 < Kc.length) {
          ad(Kc[0], a);
          for (var c = 1; c < Kc.length; c++) {
            var d = Kc[c];
            d.blockedOn === a && (d.blockedOn = null);
          }
        }
        null !== Lc && ad(Lc, a);
        null !== Mc && ad(Mc, a);
        null !== Nc && ad(Nc, a);
        Oc.forEach(b);
        Pc.forEach(b);
        for (c = 0; c < Qc.length; c++) d = Qc[c], d.blockedOn === a && (d.blockedOn = null);
        for (; 0 < Qc.length && (c = Qc[0], null === c.blockedOn); ) Vc(c), null === c.blockedOn && Qc.shift();
      }
      var cd = ua.ReactCurrentBatchConfig;
      var dd = true;
      function ed(a, b, c, d) {
        var e = C, f = cd.transition;
        cd.transition = null;
        try {
          C = 1, fd(a, b, c, d);
        } finally {
          C = e, cd.transition = f;
        }
      }
      function gd(a, b, c, d) {
        var e = C, f = cd.transition;
        cd.transition = null;
        try {
          C = 4, fd(a, b, c, d);
        } finally {
          C = e, cd.transition = f;
        }
      }
      function fd(a, b, c, d) {
        if (dd) {
          var e = Yc(a, b, c, d);
          if (null === e) hd(a, b, d, id, c), Sc(a, d);
          else if (Uc(e, a, b, c, d)) d.stopPropagation();
          else if (Sc(a, d), b & 4 && -1 < Rc.indexOf(a)) {
            for (; null !== e; ) {
              var f = Cb(e);
              null !== f && Ec(f);
              f = Yc(a, b, c, d);
              null === f && hd(a, b, d, id, c);
              if (f === e) break;
              e = f;
            }
            null !== e && d.stopPropagation();
          } else hd(a, b, d, null, c);
        }
      }
      var id = null;
      function Yc(a, b, c, d) {
        id = null;
        a = xb(d);
        a = Wc(a);
        if (null !== a) if (b = Vb(a), null === b) a = null;
        else if (c = b.tag, 13 === c) {
          a = Wb(b);
          if (null !== a) return a;
          a = null;
        } else if (3 === c) {
          if (b.stateNode.current.memoizedState.isDehydrated) return 3 === b.tag ? b.stateNode.containerInfo : null;
          a = null;
        } else b !== a && (a = null);
        id = a;
        return null;
      }
      function jd(a) {
        switch (a) {
          case "cancel":
          case "click":
          case "close":
          case "contextmenu":
          case "copy":
          case "cut":
          case "auxclick":
          case "dblclick":
          case "dragend":
          case "dragstart":
          case "drop":
          case "focusin":
          case "focusout":
          case "input":
          case "invalid":
          case "keydown":
          case "keypress":
          case "keyup":
          case "mousedown":
          case "mouseup":
          case "paste":
          case "pause":
          case "play":
          case "pointercancel":
          case "pointerdown":
          case "pointerup":
          case "ratechange":
          case "reset":
          case "resize":
          case "seeked":
          case "submit":
          case "touchcancel":
          case "touchend":
          case "touchstart":
          case "volumechange":
          case "change":
          case "selectionchange":
          case "textInput":
          case "compositionstart":
          case "compositionend":
          case "compositionupdate":
          case "beforeblur":
          case "afterblur":
          case "beforeinput":
          case "blur":
          case "fullscreenchange":
          case "focus":
          case "hashchange":
          case "popstate":
          case "select":
          case "selectstart":
            return 1;
          case "drag":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "mousemove":
          case "mouseout":
          case "mouseover":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "scroll":
          case "toggle":
          case "touchmove":
          case "wheel":
          case "mouseenter":
          case "mouseleave":
          case "pointerenter":
          case "pointerleave":
            return 4;
          case "message":
            switch (ec()) {
              case fc:
                return 1;
              case gc:
                return 4;
              case hc:
              case ic:
                return 16;
              case jc:
                return 536870912;
              default:
                return 16;
            }
          default:
            return 16;
        }
      }
      var kd = null;
      var ld = null;
      var md = null;
      function nd() {
        if (md) return md;
        var a, b = ld, c = b.length, d, e = "value" in kd ? kd.value : kd.textContent, f = e.length;
        for (a = 0; a < c && b[a] === e[a]; a++) ;
        var g = c - a;
        for (d = 1; d <= g && b[c - d] === e[f - d]; d++) ;
        return md = e.slice(a, 1 < d ? 1 - d : void 0);
      }
      function od(a) {
        var b = a.keyCode;
        "charCode" in a ? (a = a.charCode, 0 === a && 13 === b && (a = 13)) : a = b;
        10 === a && (a = 13);
        return 32 <= a || 13 === a ? a : 0;
      }
      function pd() {
        return true;
      }
      function qd() {
        return false;
      }
      function rd(a) {
        function b(b2, d, e, f, g) {
          this._reactName = b2;
          this._targetInst = e;
          this.type = d;
          this.nativeEvent = f;
          this.target = g;
          this.currentTarget = null;
          for (var c in a) a.hasOwnProperty(c) && (b2 = a[c], this[c] = b2 ? b2(f) : f[c]);
          this.isDefaultPrevented = (null != f.defaultPrevented ? f.defaultPrevented : false === f.returnValue) ? pd : qd;
          this.isPropagationStopped = qd;
          return this;
        }
        A(b.prototype, { preventDefault: function() {
          this.defaultPrevented = true;
          var a2 = this.nativeEvent;
          a2 && (a2.preventDefault ? a2.preventDefault() : "unknown" !== typeof a2.returnValue && (a2.returnValue = false), this.isDefaultPrevented = pd);
        }, stopPropagation: function() {
          var a2 = this.nativeEvent;
          a2 && (a2.stopPropagation ? a2.stopPropagation() : "unknown" !== typeof a2.cancelBubble && (a2.cancelBubble = true), this.isPropagationStopped = pd);
        }, persist: function() {
        }, isPersistent: pd });
        return b;
      }
      var sd = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(a) {
        return a.timeStamp || Date.now();
      }, defaultPrevented: 0, isTrusted: 0 };
      var td = rd(sd);
      var ud = A({}, sd, { view: 0, detail: 0 });
      var vd = rd(ud);
      var wd;
      var xd;
      var yd;
      var Ad = A({}, ud, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: zd, button: 0, buttons: 0, relatedTarget: function(a) {
        return void 0 === a.relatedTarget ? a.fromElement === a.srcElement ? a.toElement : a.fromElement : a.relatedTarget;
      }, movementX: function(a) {
        if ("movementX" in a) return a.movementX;
        a !== yd && (yd && "mousemove" === a.type ? (wd = a.screenX - yd.screenX, xd = a.screenY - yd.screenY) : xd = wd = 0, yd = a);
        return wd;
      }, movementY: function(a) {
        return "movementY" in a ? a.movementY : xd;
      } });
      var Bd = rd(Ad);
      var Cd = A({}, Ad, { dataTransfer: 0 });
      var Dd = rd(Cd);
      var Ed = A({}, ud, { relatedTarget: 0 });
      var Fd = rd(Ed);
      var Gd = A({}, sd, { animationName: 0, elapsedTime: 0, pseudoElement: 0 });
      var Hd = rd(Gd);
      var Id = A({}, sd, { clipboardData: function(a) {
        return "clipboardData" in a ? a.clipboardData : window.clipboardData;
      } });
      var Jd = rd(Id);
      var Kd = A({}, sd, { data: 0 });
      var Ld = rd(Kd);
      var Md = {
        Esc: "Escape",
        Spacebar: " ",
        Left: "ArrowLeft",
        Up: "ArrowUp",
        Right: "ArrowRight",
        Down: "ArrowDown",
        Del: "Delete",
        Win: "OS",
        Menu: "ContextMenu",
        Apps: "ContextMenu",
        Scroll: "ScrollLock",
        MozPrintableKey: "Unidentified"
      };
      var Nd = {
        8: "Backspace",
        9: "Tab",
        12: "Clear",
        13: "Enter",
        16: "Shift",
        17: "Control",
        18: "Alt",
        19: "Pause",
        20: "CapsLock",
        27: "Escape",
        32: " ",
        33: "PageUp",
        34: "PageDown",
        35: "End",
        36: "Home",
        37: "ArrowLeft",
        38: "ArrowUp",
        39: "ArrowRight",
        40: "ArrowDown",
        45: "Insert",
        46: "Delete",
        112: "F1",
        113: "F2",
        114: "F3",
        115: "F4",
        116: "F5",
        117: "F6",
        118: "F7",
        119: "F8",
        120: "F9",
        121: "F10",
        122: "F11",
        123: "F12",
        144: "NumLock",
        145: "ScrollLock",
        224: "Meta"
      };
      var Od = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
      function Pd(a) {
        var b = this.nativeEvent;
        return b.getModifierState ? b.getModifierState(a) : (a = Od[a]) ? !!b[a] : false;
      }
      function zd() {
        return Pd;
      }
      var Qd = A({}, ud, { key: function(a) {
        if (a.key) {
          var b = Md[a.key] || a.key;
          if ("Unidentified" !== b) return b;
        }
        return "keypress" === a.type ? (a = od(a), 13 === a ? "Enter" : String.fromCharCode(a)) : "keydown" === a.type || "keyup" === a.type ? Nd[a.keyCode] || "Unidentified" : "";
      }, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: zd, charCode: function(a) {
        return "keypress" === a.type ? od(a) : 0;
      }, keyCode: function(a) {
        return "keydown" === a.type || "keyup" === a.type ? a.keyCode : 0;
      }, which: function(a) {
        return "keypress" === a.type ? od(a) : "keydown" === a.type || "keyup" === a.type ? a.keyCode : 0;
      } });
      var Rd = rd(Qd);
      var Sd = A({}, Ad, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 });
      var Td = rd(Sd);
      var Ud = A({}, ud, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: zd });
      var Vd = rd(Ud);
      var Wd = A({}, sd, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 });
      var Xd = rd(Wd);
      var Yd = A({}, Ad, {
        deltaX: function(a) {
          return "deltaX" in a ? a.deltaX : "wheelDeltaX" in a ? -a.wheelDeltaX : 0;
        },
        deltaY: function(a) {
          return "deltaY" in a ? a.deltaY : "wheelDeltaY" in a ? -a.wheelDeltaY : "wheelDelta" in a ? -a.wheelDelta : 0;
        },
        deltaZ: 0,
        deltaMode: 0
      });
      var Zd = rd(Yd);
      var $d = [9, 13, 27, 32];
      var ae = ia && "CompositionEvent" in window;
      var be = null;
      ia && "documentMode" in document && (be = document.documentMode);
      var ce = ia && "TextEvent" in window && !be;
      var de = ia && (!ae || be && 8 < be && 11 >= be);
      var ee = String.fromCharCode(32);
      var fe = false;
      function ge(a, b) {
        switch (a) {
          case "keyup":
            return -1 !== $d.indexOf(b.keyCode);
          case "keydown":
            return 229 !== b.keyCode;
          case "keypress":
          case "mousedown":
          case "focusout":
            return true;
          default:
            return false;
        }
      }
      function he(a) {
        a = a.detail;
        return "object" === typeof a && "data" in a ? a.data : null;
      }
      var ie = false;
      function je(a, b) {
        switch (a) {
          case "compositionend":
            return he(b);
          case "keypress":
            if (32 !== b.which) return null;
            fe = true;
            return ee;
          case "textInput":
            return a = b.data, a === ee && fe ? null : a;
          default:
            return null;
        }
      }
      function ke(a, b) {
        if (ie) return "compositionend" === a || !ae && ge(a, b) ? (a = nd(), md = ld = kd = null, ie = false, a) : null;
        switch (a) {
          case "paste":
            return null;
          case "keypress":
            if (!(b.ctrlKey || b.altKey || b.metaKey) || b.ctrlKey && b.altKey) {
              if (b.char && 1 < b.char.length) return b.char;
              if (b.which) return String.fromCharCode(b.which);
            }
            return null;
          case "compositionend":
            return de && "ko" !== b.locale ? null : b.data;
          default:
            return null;
        }
      }
      var le = { color: true, date: true, datetime: true, "datetime-local": true, email: true, month: true, number: true, password: true, range: true, search: true, tel: true, text: true, time: true, url: true, week: true };
      function me(a) {
        var b = a && a.nodeName && a.nodeName.toLowerCase();
        return "input" === b ? !!le[a.type] : "textarea" === b ? true : false;
      }
      function ne(a, b, c, d) {
        Eb(d);
        b = oe(b, "onChange");
        0 < b.length && (c = new td("onChange", "change", null, c, d), a.push({ event: c, listeners: b }));
      }
      var pe = null;
      var qe = null;
      function re(a) {
        se(a, 0);
      }
      function te(a) {
        var b = ue(a);
        if (Wa(b)) return a;
      }
      function ve(a, b) {
        if ("change" === a) return b;
      }
      var we = false;
      if (ia) {
        if (ia) {
          ye = "oninput" in document;
          if (!ye) {
            ze = document.createElement("div");
            ze.setAttribute("oninput", "return;");
            ye = "function" === typeof ze.oninput;
          }
          xe = ye;
        } else xe = false;
        we = xe && (!document.documentMode || 9 < document.documentMode);
      }
      var xe;
      var ye;
      var ze;
      function Ae() {
        pe && (pe.detachEvent("onpropertychange", Be), qe = pe = null);
      }
      function Be(a) {
        if ("value" === a.propertyName && te(qe)) {
          var b = [];
          ne(b, qe, a, xb(a));
          Jb(re, b);
        }
      }
      function Ce(a, b, c) {
        "focusin" === a ? (Ae(), pe = b, qe = c, pe.attachEvent("onpropertychange", Be)) : "focusout" === a && Ae();
      }
      function De(a) {
        if ("selectionchange" === a || "keyup" === a || "keydown" === a) return te(qe);
      }
      function Ee(a, b) {
        if ("click" === a) return te(b);
      }
      function Fe(a, b) {
        if ("input" === a || "change" === a) return te(b);
      }
      function Ge(a, b) {
        return a === b && (0 !== a || 1 / a === 1 / b) || a !== a && b !== b;
      }
      var He = "function" === typeof Object.is ? Object.is : Ge;
      function Ie(a, b) {
        if (He(a, b)) return true;
        if ("object" !== typeof a || null === a || "object" !== typeof b || null === b) return false;
        var c = Object.keys(a), d = Object.keys(b);
        if (c.length !== d.length) return false;
        for (d = 0; d < c.length; d++) {
          var e = c[d];
          if (!ja.call(b, e) || !He(a[e], b[e])) return false;
        }
        return true;
      }
      function Je(a) {
        for (; a && a.firstChild; ) a = a.firstChild;
        return a;
      }
      function Ke(a, b) {
        var c = Je(a);
        a = 0;
        for (var d; c; ) {
          if (3 === c.nodeType) {
            d = a + c.textContent.length;
            if (a <= b && d >= b) return { node: c, offset: b - a };
            a = d;
          }
          a: {
            for (; c; ) {
              if (c.nextSibling) {
                c = c.nextSibling;
                break a;
              }
              c = c.parentNode;
            }
            c = void 0;
          }
          c = Je(c);
        }
      }
      function Le(a, b) {
        return a && b ? a === b ? true : a && 3 === a.nodeType ? false : b && 3 === b.nodeType ? Le(a, b.parentNode) : "contains" in a ? a.contains(b) : a.compareDocumentPosition ? !!(a.compareDocumentPosition(b) & 16) : false : false;
      }
      function Me() {
        for (var a = window, b = Xa(); b instanceof a.HTMLIFrameElement; ) {
          try {
            var c = "string" === typeof b.contentWindow.location.href;
          } catch (d) {
            c = false;
          }
          if (c) a = b.contentWindow;
          else break;
          b = Xa(a.document);
        }
        return b;
      }
      function Ne(a) {
        var b = a && a.nodeName && a.nodeName.toLowerCase();
        return b && ("input" === b && ("text" === a.type || "search" === a.type || "tel" === a.type || "url" === a.type || "password" === a.type) || "textarea" === b || "true" === a.contentEditable);
      }
      function Oe(a) {
        var b = Me(), c = a.focusedElem, d = a.selectionRange;
        if (b !== c && c && c.ownerDocument && Le(c.ownerDocument.documentElement, c)) {
          if (null !== d && Ne(c)) {
            if (b = d.start, a = d.end, void 0 === a && (a = b), "selectionStart" in c) c.selectionStart = b, c.selectionEnd = Math.min(a, c.value.length);
            else if (a = (b = c.ownerDocument || document) && b.defaultView || window, a.getSelection) {
              a = a.getSelection();
              var e = c.textContent.length, f = Math.min(d.start, e);
              d = void 0 === d.end ? f : Math.min(d.end, e);
              !a.extend && f > d && (e = d, d = f, f = e);
              e = Ke(c, f);
              var g = Ke(
                c,
                d
              );
              e && g && (1 !== a.rangeCount || a.anchorNode !== e.node || a.anchorOffset !== e.offset || a.focusNode !== g.node || a.focusOffset !== g.offset) && (b = b.createRange(), b.setStart(e.node, e.offset), a.removeAllRanges(), f > d ? (a.addRange(b), a.extend(g.node, g.offset)) : (b.setEnd(g.node, g.offset), a.addRange(b)));
            }
          }
          b = [];
          for (a = c; a = a.parentNode; ) 1 === a.nodeType && b.push({ element: a, left: a.scrollLeft, top: a.scrollTop });
          "function" === typeof c.focus && c.focus();
          for (c = 0; c < b.length; c++) a = b[c], a.element.scrollLeft = a.left, a.element.scrollTop = a.top;
        }
      }
      var Pe = ia && "documentMode" in document && 11 >= document.documentMode;
      var Qe = null;
      var Re = null;
      var Se = null;
      var Te = false;
      function Ue(a, b, c) {
        var d = c.window === c ? c.document : 9 === c.nodeType ? c : c.ownerDocument;
        Te || null == Qe || Qe !== Xa(d) || (d = Qe, "selectionStart" in d && Ne(d) ? d = { start: d.selectionStart, end: d.selectionEnd } : (d = (d.ownerDocument && d.ownerDocument.defaultView || window).getSelection(), d = { anchorNode: d.anchorNode, anchorOffset: d.anchorOffset, focusNode: d.focusNode, focusOffset: d.focusOffset }), Se && Ie(Se, d) || (Se = d, d = oe(Re, "onSelect"), 0 < d.length && (b = new td("onSelect", "select", null, b, c), a.push({ event: b, listeners: d }), b.target = Qe)));
      }
      function Ve(a, b) {
        var c = {};
        c[a.toLowerCase()] = b.toLowerCase();
        c["Webkit" + a] = "webkit" + b;
        c["Moz" + a] = "moz" + b;
        return c;
      }
      var We = { animationend: Ve("Animation", "AnimationEnd"), animationiteration: Ve("Animation", "AnimationIteration"), animationstart: Ve("Animation", "AnimationStart"), transitionend: Ve("Transition", "TransitionEnd") };
      var Xe = {};
      var Ye = {};
      ia && (Ye = document.createElement("div").style, "AnimationEvent" in window || (delete We.animationend.animation, delete We.animationiteration.animation, delete We.animationstart.animation), "TransitionEvent" in window || delete We.transitionend.transition);
      function Ze(a) {
        if (Xe[a]) return Xe[a];
        if (!We[a]) return a;
        var b = We[a], c;
        for (c in b) if (b.hasOwnProperty(c) && c in Ye) return Xe[a] = b[c];
        return a;
      }
      var $e = Ze("animationend");
      var af = Ze("animationiteration");
      var bf = Ze("animationstart");
      var cf = Ze("transitionend");
      var df = /* @__PURE__ */ new Map();
      var ef = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
      function ff(a, b) {
        df.set(a, b);
        fa(b, [a]);
      }
      for (gf = 0; gf < ef.length; gf++) {
        hf = ef[gf], jf = hf.toLowerCase(), kf = hf[0].toUpperCase() + hf.slice(1);
        ff(jf, "on" + kf);
      }
      var hf;
      var jf;
      var kf;
      var gf;
      ff($e, "onAnimationEnd");
      ff(af, "onAnimationIteration");
      ff(bf, "onAnimationStart");
      ff("dblclick", "onDoubleClick");
      ff("focusin", "onFocus");
      ff("focusout", "onBlur");
      ff(cf, "onTransitionEnd");
      ha("onMouseEnter", ["mouseout", "mouseover"]);
      ha("onMouseLeave", ["mouseout", "mouseover"]);
      ha("onPointerEnter", ["pointerout", "pointerover"]);
      ha("onPointerLeave", ["pointerout", "pointerover"]);
      fa("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" "));
      fa("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));
      fa("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]);
      fa("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" "));
      fa("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" "));
      fa("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
      var lf = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" ");
      var mf = new Set("cancel close invalid load scroll toggle".split(" ").concat(lf));
      function nf(a, b, c) {
        var d = a.type || "unknown-event";
        a.currentTarget = c;
        Ub(d, b, void 0, a);
        a.currentTarget = null;
      }
      function se(a, b) {
        b = 0 !== (b & 4);
        for (var c = 0; c < a.length; c++) {
          var d = a[c], e = d.event;
          d = d.listeners;
          a: {
            var f = void 0;
            if (b) for (var g = d.length - 1; 0 <= g; g--) {
              var h = d[g], k = h.instance, l = h.currentTarget;
              h = h.listener;
              if (k !== f && e.isPropagationStopped()) break a;
              nf(e, h, l);
              f = k;
            }
            else for (g = 0; g < d.length; g++) {
              h = d[g];
              k = h.instance;
              l = h.currentTarget;
              h = h.listener;
              if (k !== f && e.isPropagationStopped()) break a;
              nf(e, h, l);
              f = k;
            }
          }
        }
        if (Qb) throw a = Rb, Qb = false, Rb = null, a;
      }
      function D(a, b) {
        var c = b[of];
        void 0 === c && (c = b[of] = /* @__PURE__ */ new Set());
        var d = a + "__bubble";
        c.has(d) || (pf(b, a, 2, false), c.add(d));
      }
      function qf(a, b, c) {
        var d = 0;
        b && (d |= 4);
        pf(c, a, d, b);
      }
      var rf = "_reactListening" + Math.random().toString(36).slice(2);
      function sf(a) {
        if (!a[rf]) {
          a[rf] = true;
          da.forEach(function(b2) {
            "selectionchange" !== b2 && (mf.has(b2) || qf(b2, false, a), qf(b2, true, a));
          });
          var b = 9 === a.nodeType ? a : a.ownerDocument;
          null === b || b[rf] || (b[rf] = true, qf("selectionchange", false, b));
        }
      }
      function pf(a, b, c, d) {
        switch (jd(b)) {
          case 1:
            var e = ed;
            break;
          case 4:
            e = gd;
            break;
          default:
            e = fd;
        }
        c = e.bind(null, b, c, a);
        e = void 0;
        !Lb || "touchstart" !== b && "touchmove" !== b && "wheel" !== b || (e = true);
        d ? void 0 !== e ? a.addEventListener(b, c, { capture: true, passive: e }) : a.addEventListener(b, c, true) : void 0 !== e ? a.addEventListener(b, c, { passive: e }) : a.addEventListener(b, c, false);
      }
      function hd(a, b, c, d, e) {
        var f = d;
        if (0 === (b & 1) && 0 === (b & 2) && null !== d) a: for (; ; ) {
          if (null === d) return;
          var g = d.tag;
          if (3 === g || 4 === g) {
            var h = d.stateNode.containerInfo;
            if (h === e || 8 === h.nodeType && h.parentNode === e) break;
            if (4 === g) for (g = d.return; null !== g; ) {
              var k = g.tag;
              if (3 === k || 4 === k) {
                if (k = g.stateNode.containerInfo, k === e || 8 === k.nodeType && k.parentNode === e) return;
              }
              g = g.return;
            }
            for (; null !== h; ) {
              g = Wc(h);
              if (null === g) return;
              k = g.tag;
              if (5 === k || 6 === k) {
                d = f = g;
                continue a;
              }
              h = h.parentNode;
            }
          }
          d = d.return;
        }
        Jb(function() {
          var d2 = f, e2 = xb(c), g2 = [];
          a: {
            var h2 = df.get(a);
            if (void 0 !== h2) {
              var k2 = td, n = a;
              switch (a) {
                case "keypress":
                  if (0 === od(c)) break a;
                case "keydown":
                case "keyup":
                  k2 = Rd;
                  break;
                case "focusin":
                  n = "focus";
                  k2 = Fd;
                  break;
                case "focusout":
                  n = "blur";
                  k2 = Fd;
                  break;
                case "beforeblur":
                case "afterblur":
                  k2 = Fd;
                  break;
                case "click":
                  if (2 === c.button) break a;
                case "auxclick":
                case "dblclick":
                case "mousedown":
                case "mousemove":
                case "mouseup":
                case "mouseout":
                case "mouseover":
                case "contextmenu":
                  k2 = Bd;
                  break;
                case "drag":
                case "dragend":
                case "dragenter":
                case "dragexit":
                case "dragleave":
                case "dragover":
                case "dragstart":
                case "drop":
                  k2 = Dd;
                  break;
                case "touchcancel":
                case "touchend":
                case "touchmove":
                case "touchstart":
                  k2 = Vd;
                  break;
                case $e:
                case af:
                case bf:
                  k2 = Hd;
                  break;
                case cf:
                  k2 = Xd;
                  break;
                case "scroll":
                  k2 = vd;
                  break;
                case "wheel":
                  k2 = Zd;
                  break;
                case "copy":
                case "cut":
                case "paste":
                  k2 = Jd;
                  break;
                case "gotpointercapture":
                case "lostpointercapture":
                case "pointercancel":
                case "pointerdown":
                case "pointermove":
                case "pointerout":
                case "pointerover":
                case "pointerup":
                  k2 = Td;
              }
              var t = 0 !== (b & 4), J = !t && "scroll" === a, x = t ? null !== h2 ? h2 + "Capture" : null : h2;
              t = [];
              for (var w = d2, u; null !== w; ) {
                u = w;
                var F = u.stateNode;
                5 === u.tag && null !== F && (u = F, null !== x && (F = Kb(w, x), null != F && t.push(tf(w, F, u))));
                if (J) break;
                w = w.return;
              }
              0 < t.length && (h2 = new k2(h2, n, null, c, e2), g2.push({ event: h2, listeners: t }));
            }
          }
          if (0 === (b & 7)) {
            a: {
              h2 = "mouseover" === a || "pointerover" === a;
              k2 = "mouseout" === a || "pointerout" === a;
              if (h2 && c !== wb && (n = c.relatedTarget || c.fromElement) && (Wc(n) || n[uf])) break a;
              if (k2 || h2) {
                h2 = e2.window === e2 ? e2 : (h2 = e2.ownerDocument) ? h2.defaultView || h2.parentWindow : window;
                if (k2) {
                  if (n = c.relatedTarget || c.toElement, k2 = d2, n = n ? Wc(n) : null, null !== n && (J = Vb(n), n !== J || 5 !== n.tag && 6 !== n.tag)) n = null;
                } else k2 = null, n = d2;
                if (k2 !== n) {
                  t = Bd;
                  F = "onMouseLeave";
                  x = "onMouseEnter";
                  w = "mouse";
                  if ("pointerout" === a || "pointerover" === a) t = Td, F = "onPointerLeave", x = "onPointerEnter", w = "pointer";
                  J = null == k2 ? h2 : ue(k2);
                  u = null == n ? h2 : ue(n);
                  h2 = new t(F, w + "leave", k2, c, e2);
                  h2.target = J;
                  h2.relatedTarget = u;
                  F = null;
                  Wc(e2) === d2 && (t = new t(x, w + "enter", n, c, e2), t.target = u, t.relatedTarget = J, F = t);
                  J = F;
                  if (k2 && n) b: {
                    t = k2;
                    x = n;
                    w = 0;
                    for (u = t; u; u = vf(u)) w++;
                    u = 0;
                    for (F = x; F; F = vf(F)) u++;
                    for (; 0 < w - u; ) t = vf(t), w--;
                    for (; 0 < u - w; ) x = vf(x), u--;
                    for (; w--; ) {
                      if (t === x || null !== x && t === x.alternate) break b;
                      t = vf(t);
                      x = vf(x);
                    }
                    t = null;
                  }
                  else t = null;
                  null !== k2 && wf(g2, h2, k2, t, false);
                  null !== n && null !== J && wf(g2, J, n, t, true);
                }
              }
            }
            a: {
              h2 = d2 ? ue(d2) : window;
              k2 = h2.nodeName && h2.nodeName.toLowerCase();
              if ("select" === k2 || "input" === k2 && "file" === h2.type) var na = ve;
              else if (me(h2)) if (we) na = Fe;
              else {
                na = De;
                var xa = Ce;
              }
              else (k2 = h2.nodeName) && "input" === k2.toLowerCase() && ("checkbox" === h2.type || "radio" === h2.type) && (na = Ee);
              if (na && (na = na(a, d2))) {
                ne(g2, na, c, e2);
                break a;
              }
              xa && xa(a, h2, d2);
              "focusout" === a && (xa = h2._wrapperState) && xa.controlled && "number" === h2.type && cb(h2, "number", h2.value);
            }
            xa = d2 ? ue(d2) : window;
            switch (a) {
              case "focusin":
                if (me(xa) || "true" === xa.contentEditable) Qe = xa, Re = d2, Se = null;
                break;
              case "focusout":
                Se = Re = Qe = null;
                break;
              case "mousedown":
                Te = true;
                break;
              case "contextmenu":
              case "mouseup":
              case "dragend":
                Te = false;
                Ue(g2, c, e2);
                break;
              case "selectionchange":
                if (Pe) break;
              case "keydown":
              case "keyup":
                Ue(g2, c, e2);
            }
            var $a;
            if (ae) b: {
              switch (a) {
                case "compositionstart":
                  var ba = "onCompositionStart";
                  break b;
                case "compositionend":
                  ba = "onCompositionEnd";
                  break b;
                case "compositionupdate":
                  ba = "onCompositionUpdate";
                  break b;
              }
              ba = void 0;
            }
            else ie ? ge(a, c) && (ba = "onCompositionEnd") : "keydown" === a && 229 === c.keyCode && (ba = "onCompositionStart");
            ba && (de && "ko" !== c.locale && (ie || "onCompositionStart" !== ba ? "onCompositionEnd" === ba && ie && ($a = nd()) : (kd = e2, ld = "value" in kd ? kd.value : kd.textContent, ie = true)), xa = oe(d2, ba), 0 < xa.length && (ba = new Ld(ba, a, null, c, e2), g2.push({ event: ba, listeners: xa }), $a ? ba.data = $a : ($a = he(c), null !== $a && (ba.data = $a))));
            if ($a = ce ? je(a, c) : ke(a, c)) d2 = oe(d2, "onBeforeInput"), 0 < d2.length && (e2 = new Ld("onBeforeInput", "beforeinput", null, c, e2), g2.push({ event: e2, listeners: d2 }), e2.data = $a);
          }
          se(g2, b);
        });
      }
      function tf(a, b, c) {
        return { instance: a, listener: b, currentTarget: c };
      }
      function oe(a, b) {
        for (var c = b + "Capture", d = []; null !== a; ) {
          var e = a, f = e.stateNode;
          5 === e.tag && null !== f && (e = f, f = Kb(a, c), null != f && d.unshift(tf(a, f, e)), f = Kb(a, b), null != f && d.push(tf(a, f, e)));
          a = a.return;
        }
        return d;
      }
      function vf(a) {
        if (null === a) return null;
        do
          a = a.return;
        while (a && 5 !== a.tag);
        return a ? a : null;
      }
      function wf(a, b, c, d, e) {
        for (var f = b._reactName, g = []; null !== c && c !== d; ) {
          var h = c, k = h.alternate, l = h.stateNode;
          if (null !== k && k === d) break;
          5 === h.tag && null !== l && (h = l, e ? (k = Kb(c, f), null != k && g.unshift(tf(c, k, h))) : e || (k = Kb(c, f), null != k && g.push(tf(c, k, h))));
          c = c.return;
        }
        0 !== g.length && a.push({ event: b, listeners: g });
      }
      var xf = /\r\n?/g;
      var yf = /\u0000|\uFFFD/g;
      function zf(a) {
        return ("string" === typeof a ? a : "" + a).replace(xf, "\n").replace(yf, "");
      }
      function Af(a, b, c) {
        b = zf(b);
        if (zf(a) !== b && c) throw Error(p(425));
      }
      function Bf() {
      }
      var Cf = null;
      var Df = null;
      function Ef(a, b) {
        return "textarea" === a || "noscript" === a || "string" === typeof b.children || "number" === typeof b.children || "object" === typeof b.dangerouslySetInnerHTML && null !== b.dangerouslySetInnerHTML && null != b.dangerouslySetInnerHTML.__html;
      }
      var Ff = "function" === typeof setTimeout ? setTimeout : void 0;
      var Gf = "function" === typeof clearTimeout ? clearTimeout : void 0;
      var Hf = "function" === typeof Promise ? Promise : void 0;
      var Jf = "function" === typeof queueMicrotask ? queueMicrotask : "undefined" !== typeof Hf ? function(a) {
        return Hf.resolve(null).then(a).catch(If);
      } : Ff;
      function If(a) {
        setTimeout(function() {
          throw a;
        });
      }
      function Kf(a, b) {
        var c = b, d = 0;
        do {
          var e = c.nextSibling;
          a.removeChild(c);
          if (e && 8 === e.nodeType) if (c = e.data, "/$" === c) {
            if (0 === d) {
              a.removeChild(e);
              bd(b);
              return;
            }
            d--;
          } else "$" !== c && "$?" !== c && "$!" !== c || d++;
          c = e;
        } while (c);
        bd(b);
      }
      function Lf(a) {
        for (; null != a; a = a.nextSibling) {
          var b = a.nodeType;
          if (1 === b || 3 === b) break;
          if (8 === b) {
            b = a.data;
            if ("$" === b || "$!" === b || "$?" === b) break;
            if ("/$" === b) return null;
          }
        }
        return a;
      }
      function Mf(a) {
        a = a.previousSibling;
        for (var b = 0; a; ) {
          if (8 === a.nodeType) {
            var c = a.data;
            if ("$" === c || "$!" === c || "$?" === c) {
              if (0 === b) return a;
              b--;
            } else "/$" === c && b++;
          }
          a = a.previousSibling;
        }
        return null;
      }
      var Nf = Math.random().toString(36).slice(2);
      var Of = "__reactFiber$" + Nf;
      var Pf = "__reactProps$" + Nf;
      var uf = "__reactContainer$" + Nf;
      var of = "__reactEvents$" + Nf;
      var Qf = "__reactListeners$" + Nf;
      var Rf = "__reactHandles$" + Nf;
      function Wc(a) {
        var b = a[Of];
        if (b) return b;
        for (var c = a.parentNode; c; ) {
          if (b = c[uf] || c[Of]) {
            c = b.alternate;
            if (null !== b.child || null !== c && null !== c.child) for (a = Mf(a); null !== a; ) {
              if (c = a[Of]) return c;
              a = Mf(a);
            }
            return b;
          }
          a = c;
          c = a.parentNode;
        }
        return null;
      }
      function Cb(a) {
        a = a[Of] || a[uf];
        return !a || 5 !== a.tag && 6 !== a.tag && 13 !== a.tag && 3 !== a.tag ? null : a;
      }
      function ue(a) {
        if (5 === a.tag || 6 === a.tag) return a.stateNode;
        throw Error(p(33));
      }
      function Db(a) {
        return a[Pf] || null;
      }
      var Sf = [];
      var Tf = -1;
      function Uf(a) {
        return { current: a };
      }
      function E(a) {
        0 > Tf || (a.current = Sf[Tf], Sf[Tf] = null, Tf--);
      }
      function G(a, b) {
        Tf++;
        Sf[Tf] = a.current;
        a.current = b;
      }
      var Vf = {};
      var H = Uf(Vf);
      var Wf = Uf(false);
      var Xf = Vf;
      function Yf(a, b) {
        var c = a.type.contextTypes;
        if (!c) return Vf;
        var d = a.stateNode;
        if (d && d.__reactInternalMemoizedUnmaskedChildContext === b) return d.__reactInternalMemoizedMaskedChildContext;
        var e = {}, f;
        for (f in c) e[f] = b[f];
        d && (a = a.stateNode, a.__reactInternalMemoizedUnmaskedChildContext = b, a.__reactInternalMemoizedMaskedChildContext = e);
        return e;
      }
      function Zf(a) {
        a = a.childContextTypes;
        return null !== a && void 0 !== a;
      }
      function $f() {
        E(Wf);
        E(H);
      }
      function ag(a, b, c) {
        if (H.current !== Vf) throw Error(p(168));
        G(H, b);
        G(Wf, c);
      }
      function bg(a, b, c) {
        var d = a.stateNode;
        b = b.childContextTypes;
        if ("function" !== typeof d.getChildContext) return c;
        d = d.getChildContext();
        for (var e in d) if (!(e in b)) throw Error(p(108, Ra(a) || "Unknown", e));
        return A({}, c, d);
      }
      function cg(a) {
        a = (a = a.stateNode) && a.__reactInternalMemoizedMergedChildContext || Vf;
        Xf = H.current;
        G(H, a);
        G(Wf, Wf.current);
        return true;
      }
      function dg(a, b, c) {
        var d = a.stateNode;
        if (!d) throw Error(p(169));
        c ? (a = bg(a, b, Xf), d.__reactInternalMemoizedMergedChildContext = a, E(Wf), E(H), G(H, a)) : E(Wf);
        G(Wf, c);
      }
      var eg = null;
      var fg = false;
      var gg = false;
      function hg(a) {
        null === eg ? eg = [a] : eg.push(a);
      }
      function ig(a) {
        fg = true;
        hg(a);
      }
      function jg() {
        if (!gg && null !== eg) {
          gg = true;
          var a = 0, b = C;
          try {
            var c = eg;
            for (C = 1; a < c.length; a++) {
              var d = c[a];
              do
                d = d(true);
              while (null !== d);
            }
            eg = null;
            fg = false;
          } catch (e) {
            throw null !== eg && (eg = eg.slice(a + 1)), ac(fc, jg), e;
          } finally {
            C = b, gg = false;
          }
        }
        return null;
      }
      var kg = [];
      var lg = 0;
      var mg = null;
      var ng = 0;
      var og = [];
      var pg = 0;
      var qg = null;
      var rg = 1;
      var sg = "";
      function tg(a, b) {
        kg[lg++] = ng;
        kg[lg++] = mg;
        mg = a;
        ng = b;
      }
      function ug(a, b, c) {
        og[pg++] = rg;
        og[pg++] = sg;
        og[pg++] = qg;
        qg = a;
        var d = rg;
        a = sg;
        var e = 32 - oc(d) - 1;
        d &= ~(1 << e);
        c += 1;
        var f = 32 - oc(b) + e;
        if (30 < f) {
          var g = e - e % 5;
          f = (d & (1 << g) - 1).toString(32);
          d >>= g;
          e -= g;
          rg = 1 << 32 - oc(b) + e | c << e | d;
          sg = f + a;
        } else rg = 1 << f | c << e | d, sg = a;
      }
      function vg(a) {
        null !== a.return && (tg(a, 1), ug(a, 1, 0));
      }
      function wg(a) {
        for (; a === mg; ) mg = kg[--lg], kg[lg] = null, ng = kg[--lg], kg[lg] = null;
        for (; a === qg; ) qg = og[--pg], og[pg] = null, sg = og[--pg], og[pg] = null, rg = og[--pg], og[pg] = null;
      }
      var xg = null;
      var yg = null;
      var I = false;
      var zg = null;
      function Ag(a, b) {
        var c = Bg(5, null, null, 0);
        c.elementType = "DELETED";
        c.stateNode = b;
        c.return = a;
        b = a.deletions;
        null === b ? (a.deletions = [c], a.flags |= 16) : b.push(c);
      }
      function Cg(a, b) {
        switch (a.tag) {
          case 5:
            var c = a.type;
            b = 1 !== b.nodeType || c.toLowerCase() !== b.nodeName.toLowerCase() ? null : b;
            return null !== b ? (a.stateNode = b, xg = a, yg = Lf(b.firstChild), true) : false;
          case 6:
            return b = "" === a.pendingProps || 3 !== b.nodeType ? null : b, null !== b ? (a.stateNode = b, xg = a, yg = null, true) : false;
          case 13:
            return b = 8 !== b.nodeType ? null : b, null !== b ? (c = null !== qg ? { id: rg, overflow: sg } : null, a.memoizedState = { dehydrated: b, treeContext: c, retryLane: 1073741824 }, c = Bg(18, null, null, 0), c.stateNode = b, c.return = a, a.child = c, xg = a, yg = null, true) : false;
          default:
            return false;
        }
      }
      function Dg(a) {
        return 0 !== (a.mode & 1) && 0 === (a.flags & 128);
      }
      function Eg(a) {
        if (I) {
          var b = yg;
          if (b) {
            var c = b;
            if (!Cg(a, b)) {
              if (Dg(a)) throw Error(p(418));
              b = Lf(c.nextSibling);
              var d = xg;
              b && Cg(a, b) ? Ag(d, c) : (a.flags = a.flags & -4097 | 2, I = false, xg = a);
            }
          } else {
            if (Dg(a)) throw Error(p(418));
            a.flags = a.flags & -4097 | 2;
            I = false;
            xg = a;
          }
        }
      }
      function Fg(a) {
        for (a = a.return; null !== a && 5 !== a.tag && 3 !== a.tag && 13 !== a.tag; ) a = a.return;
        xg = a;
      }
      function Gg(a) {
        if (a !== xg) return false;
        if (!I) return Fg(a), I = true, false;
        var b;
        (b = 3 !== a.tag) && !(b = 5 !== a.tag) && (b = a.type, b = "head" !== b && "body" !== b && !Ef(a.type, a.memoizedProps));
        if (b && (b = yg)) {
          if (Dg(a)) throw Hg(), Error(p(418));
          for (; b; ) Ag(a, b), b = Lf(b.nextSibling);
        }
        Fg(a);
        if (13 === a.tag) {
          a = a.memoizedState;
          a = null !== a ? a.dehydrated : null;
          if (!a) throw Error(p(317));
          a: {
            a = a.nextSibling;
            for (b = 0; a; ) {
              if (8 === a.nodeType) {
                var c = a.data;
                if ("/$" === c) {
                  if (0 === b) {
                    yg = Lf(a.nextSibling);
                    break a;
                  }
                  b--;
                } else "$" !== c && "$!" !== c && "$?" !== c || b++;
              }
              a = a.nextSibling;
            }
            yg = null;
          }
        } else yg = xg ? Lf(a.stateNode.nextSibling) : null;
        return true;
      }
      function Hg() {
        for (var a = yg; a; ) a = Lf(a.nextSibling);
      }
      function Ig() {
        yg = xg = null;
        I = false;
      }
      function Jg(a) {
        null === zg ? zg = [a] : zg.push(a);
      }
      var Kg = ua.ReactCurrentBatchConfig;
      function Lg(a, b) {
        if (a && a.defaultProps) {
          b = A({}, b);
          a = a.defaultProps;
          for (var c in a) void 0 === b[c] && (b[c] = a[c]);
          return b;
        }
        return b;
      }
      var Mg = Uf(null);
      var Ng = null;
      var Og = null;
      var Pg = null;
      function Qg() {
        Pg = Og = Ng = null;
      }
      function Rg(a) {
        var b = Mg.current;
        E(Mg);
        a._currentValue = b;
      }
      function Sg(a, b, c) {
        for (; null !== a; ) {
          var d = a.alternate;
          (a.childLanes & b) !== b ? (a.childLanes |= b, null !== d && (d.childLanes |= b)) : null !== d && (d.childLanes & b) !== b && (d.childLanes |= b);
          if (a === c) break;
          a = a.return;
        }
      }
      function Tg(a, b) {
        Ng = a;
        Pg = Og = null;
        a = a.dependencies;
        null !== a && null !== a.firstContext && (0 !== (a.lanes & b) && (Ug = true), a.firstContext = null);
      }
      function Vg(a) {
        var b = a._currentValue;
        if (Pg !== a) if (a = { context: a, memoizedValue: b, next: null }, null === Og) {
          if (null === Ng) throw Error(p(308));
          Og = a;
          Ng.dependencies = { lanes: 0, firstContext: a };
        } else Og = Og.next = a;
        return b;
      }
      var Wg = null;
      function Xg(a) {
        null === Wg ? Wg = [a] : Wg.push(a);
      }
      function Yg(a, b, c, d) {
        var e = b.interleaved;
        null === e ? (c.next = c, Xg(b)) : (c.next = e.next, e.next = c);
        b.interleaved = c;
        return Zg(a, d);
      }
      function Zg(a, b) {
        a.lanes |= b;
        var c = a.alternate;
        null !== c && (c.lanes |= b);
        c = a;
        for (a = a.return; null !== a; ) a.childLanes |= b, c = a.alternate, null !== c && (c.childLanes |= b), c = a, a = a.return;
        return 3 === c.tag ? c.stateNode : null;
      }
      var $g = false;
      function ah(a) {
        a.updateQueue = { baseState: a.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
      }
      function bh(a, b) {
        a = a.updateQueue;
        b.updateQueue === a && (b.updateQueue = { baseState: a.baseState, firstBaseUpdate: a.firstBaseUpdate, lastBaseUpdate: a.lastBaseUpdate, shared: a.shared, effects: a.effects });
      }
      function ch(a, b) {
        return { eventTime: a, lane: b, tag: 0, payload: null, callback: null, next: null };
      }
      function dh(a, b, c) {
        var d = a.updateQueue;
        if (null === d) return null;
        d = d.shared;
        if (0 !== (K & 2)) {
          var e = d.pending;
          null === e ? b.next = b : (b.next = e.next, e.next = b);
          d.pending = b;
          return Zg(a, c);
        }
        e = d.interleaved;
        null === e ? (b.next = b, Xg(d)) : (b.next = e.next, e.next = b);
        d.interleaved = b;
        return Zg(a, c);
      }
      function eh(a, b, c) {
        b = b.updateQueue;
        if (null !== b && (b = b.shared, 0 !== (c & 4194240))) {
          var d = b.lanes;
          d &= a.pendingLanes;
          c |= d;
          b.lanes = c;
          Cc(a, c);
        }
      }
      function fh(a, b) {
        var c = a.updateQueue, d = a.alternate;
        if (null !== d && (d = d.updateQueue, c === d)) {
          var e = null, f = null;
          c = c.firstBaseUpdate;
          if (null !== c) {
            do {
              var g = { eventTime: c.eventTime, lane: c.lane, tag: c.tag, payload: c.payload, callback: c.callback, next: null };
              null === f ? e = f = g : f = f.next = g;
              c = c.next;
            } while (null !== c);
            null === f ? e = f = b : f = f.next = b;
          } else e = f = b;
          c = { baseState: d.baseState, firstBaseUpdate: e, lastBaseUpdate: f, shared: d.shared, effects: d.effects };
          a.updateQueue = c;
          return;
        }
        a = c.lastBaseUpdate;
        null === a ? c.firstBaseUpdate = b : a.next = b;
        c.lastBaseUpdate = b;
      }
      function gh(a, b, c, d) {
        var e = a.updateQueue;
        $g = false;
        var f = e.firstBaseUpdate, g = e.lastBaseUpdate, h = e.shared.pending;
        if (null !== h) {
          e.shared.pending = null;
          var k = h, l = k.next;
          k.next = null;
          null === g ? f = l : g.next = l;
          g = k;
          var m = a.alternate;
          null !== m && (m = m.updateQueue, h = m.lastBaseUpdate, h !== g && (null === h ? m.firstBaseUpdate = l : h.next = l, m.lastBaseUpdate = k));
        }
        if (null !== f) {
          var q = e.baseState;
          g = 0;
          m = l = k = null;
          h = f;
          do {
            var r = h.lane, y = h.eventTime;
            if ((d & r) === r) {
              null !== m && (m = m.next = {
                eventTime: y,
                lane: 0,
                tag: h.tag,
                payload: h.payload,
                callback: h.callback,
                next: null
              });
              a: {
                var n = a, t = h;
                r = b;
                y = c;
                switch (t.tag) {
                  case 1:
                    n = t.payload;
                    if ("function" === typeof n) {
                      q = n.call(y, q, r);
                      break a;
                    }
                    q = n;
                    break a;
                  case 3:
                    n.flags = n.flags & -65537 | 128;
                  case 0:
                    n = t.payload;
                    r = "function" === typeof n ? n.call(y, q, r) : n;
                    if (null === r || void 0 === r) break a;
                    q = A({}, q, r);
                    break a;
                  case 2:
                    $g = true;
                }
              }
              null !== h.callback && 0 !== h.lane && (a.flags |= 64, r = e.effects, null === r ? e.effects = [h] : r.push(h));
            } else y = { eventTime: y, lane: r, tag: h.tag, payload: h.payload, callback: h.callback, next: null }, null === m ? (l = m = y, k = q) : m = m.next = y, g |= r;
            h = h.next;
            if (null === h) if (h = e.shared.pending, null === h) break;
            else r = h, h = r.next, r.next = null, e.lastBaseUpdate = r, e.shared.pending = null;
          } while (1);
          null === m && (k = q);
          e.baseState = k;
          e.firstBaseUpdate = l;
          e.lastBaseUpdate = m;
          b = e.shared.interleaved;
          if (null !== b) {
            e = b;
            do
              g |= e.lane, e = e.next;
            while (e !== b);
          } else null === f && (e.shared.lanes = 0);
          hh |= g;
          a.lanes = g;
          a.memoizedState = q;
        }
      }
      function ih(a, b, c) {
        a = b.effects;
        b.effects = null;
        if (null !== a) for (b = 0; b < a.length; b++) {
          var d = a[b], e = d.callback;
          if (null !== e) {
            d.callback = null;
            d = c;
            if ("function" !== typeof e) throw Error(p(191, e));
            e.call(d);
          }
        }
      }
      var jh = new aa.Component().refs;
      function kh(a, b, c, d) {
        b = a.memoizedState;
        c = c(d, b);
        c = null === c || void 0 === c ? b : A({}, b, c);
        a.memoizedState = c;
        0 === a.lanes && (a.updateQueue.baseState = c);
      }
      var nh = { isMounted: function(a) {
        return (a = a._reactInternals) ? Vb(a) === a : false;
      }, enqueueSetState: function(a, b, c) {
        a = a._reactInternals;
        var d = L(), e = lh(a), f = ch(d, e);
        f.payload = b;
        void 0 !== c && null !== c && (f.callback = c);
        b = dh(a, f, e);
        null !== b && (mh(b, a, e, d), eh(b, a, e));
      }, enqueueReplaceState: function(a, b, c) {
        a = a._reactInternals;
        var d = L(), e = lh(a), f = ch(d, e);
        f.tag = 1;
        f.payload = b;
        void 0 !== c && null !== c && (f.callback = c);
        b = dh(a, f, e);
        null !== b && (mh(b, a, e, d), eh(b, a, e));
      }, enqueueForceUpdate: function(a, b) {
        a = a._reactInternals;
        var c = L(), d = lh(a), e = ch(c, d);
        e.tag = 2;
        void 0 !== b && null !== b && (e.callback = b);
        b = dh(a, e, d);
        null !== b && (mh(b, a, d, c), eh(b, a, d));
      } };
      function oh(a, b, c, d, e, f, g) {
        a = a.stateNode;
        return "function" === typeof a.shouldComponentUpdate ? a.shouldComponentUpdate(d, f, g) : b.prototype && b.prototype.isPureReactComponent ? !Ie(c, d) || !Ie(e, f) : true;
      }
      function ph(a, b, c) {
        var d = false, e = Vf;
        var f = b.contextType;
        "object" === typeof f && null !== f ? f = Vg(f) : (e = Zf(b) ? Xf : H.current, d = b.contextTypes, f = (d = null !== d && void 0 !== d) ? Yf(a, e) : Vf);
        b = new b(c, f);
        a.memoizedState = null !== b.state && void 0 !== b.state ? b.state : null;
        b.updater = nh;
        a.stateNode = b;
        b._reactInternals = a;
        d && (a = a.stateNode, a.__reactInternalMemoizedUnmaskedChildContext = e, a.__reactInternalMemoizedMaskedChildContext = f);
        return b;
      }
      function qh(a, b, c, d) {
        a = b.state;
        "function" === typeof b.componentWillReceiveProps && b.componentWillReceiveProps(c, d);
        "function" === typeof b.UNSAFE_componentWillReceiveProps && b.UNSAFE_componentWillReceiveProps(c, d);
        b.state !== a && nh.enqueueReplaceState(b, b.state, null);
      }
      function rh(a, b, c, d) {
        var e = a.stateNode;
        e.props = c;
        e.state = a.memoizedState;
        e.refs = jh;
        ah(a);
        var f = b.contextType;
        "object" === typeof f && null !== f ? e.context = Vg(f) : (f = Zf(b) ? Xf : H.current, e.context = Yf(a, f));
        e.state = a.memoizedState;
        f = b.getDerivedStateFromProps;
        "function" === typeof f && (kh(a, b, f, c), e.state = a.memoizedState);
        "function" === typeof b.getDerivedStateFromProps || "function" === typeof e.getSnapshotBeforeUpdate || "function" !== typeof e.UNSAFE_componentWillMount && "function" !== typeof e.componentWillMount || (b = e.state, "function" === typeof e.componentWillMount && e.componentWillMount(), "function" === typeof e.UNSAFE_componentWillMount && e.UNSAFE_componentWillMount(), b !== e.state && nh.enqueueReplaceState(e, e.state, null), gh(a, c, e, d), e.state = a.memoizedState);
        "function" === typeof e.componentDidMount && (a.flags |= 4194308);
      }
      function sh(a, b, c) {
        a = c.ref;
        if (null !== a && "function" !== typeof a && "object" !== typeof a) {
          if (c._owner) {
            c = c._owner;
            if (c) {
              if (1 !== c.tag) throw Error(p(309));
              var d = c.stateNode;
            }
            if (!d) throw Error(p(147, a));
            var e = d, f = "" + a;
            if (null !== b && null !== b.ref && "function" === typeof b.ref && b.ref._stringRef === f) return b.ref;
            b = function(a2) {
              var b2 = e.refs;
              b2 === jh && (b2 = e.refs = {});
              null === a2 ? delete b2[f] : b2[f] = a2;
            };
            b._stringRef = f;
            return b;
          }
          if ("string" !== typeof a) throw Error(p(284));
          if (!c._owner) throw Error(p(290, a));
        }
        return a;
      }
      function th(a, b) {
        a = Object.prototype.toString.call(b);
        throw Error(p(31, "[object Object]" === a ? "object with keys {" + Object.keys(b).join(", ") + "}" : a));
      }
      function uh(a) {
        var b = a._init;
        return b(a._payload);
      }
      function vh(a) {
        function b(b2, c2) {
          if (a) {
            var d2 = b2.deletions;
            null === d2 ? (b2.deletions = [c2], b2.flags |= 16) : d2.push(c2);
          }
        }
        function c(c2, d2) {
          if (!a) return null;
          for (; null !== d2; ) b(c2, d2), d2 = d2.sibling;
          return null;
        }
        function d(a2, b2) {
          for (a2 = /* @__PURE__ */ new Map(); null !== b2; ) null !== b2.key ? a2.set(b2.key, b2) : a2.set(b2.index, b2), b2 = b2.sibling;
          return a2;
        }
        function e(a2, b2) {
          a2 = wh(a2, b2);
          a2.index = 0;
          a2.sibling = null;
          return a2;
        }
        function f(b2, c2, d2) {
          b2.index = d2;
          if (!a) return b2.flags |= 1048576, c2;
          d2 = b2.alternate;
          if (null !== d2) return d2 = d2.index, d2 < c2 ? (b2.flags |= 2, c2) : d2;
          b2.flags |= 2;
          return c2;
        }
        function g(b2) {
          a && null === b2.alternate && (b2.flags |= 2);
          return b2;
        }
        function h(a2, b2, c2, d2) {
          if (null === b2 || 6 !== b2.tag) return b2 = xh(c2, a2.mode, d2), b2.return = a2, b2;
          b2 = e(b2, c2);
          b2.return = a2;
          return b2;
        }
        function k(a2, b2, c2, d2) {
          var f2 = c2.type;
          if (f2 === ya) return m(a2, b2, c2.props.children, d2, c2.key);
          if (null !== b2 && (b2.elementType === f2 || "object" === typeof f2 && null !== f2 && f2.$$typeof === Ha && uh(f2) === b2.type)) return d2 = e(b2, c2.props), d2.ref = sh(a2, b2, c2), d2.return = a2, d2;
          d2 = yh(c2.type, c2.key, c2.props, null, a2.mode, d2);
          d2.ref = sh(a2, b2, c2);
          d2.return = a2;
          return d2;
        }
        function l(a2, b2, c2, d2) {
          if (null === b2 || 4 !== b2.tag || b2.stateNode.containerInfo !== c2.containerInfo || b2.stateNode.implementation !== c2.implementation) return b2 = zh(c2, a2.mode, d2), b2.return = a2, b2;
          b2 = e(b2, c2.children || []);
          b2.return = a2;
          return b2;
        }
        function m(a2, b2, c2, d2, f2) {
          if (null === b2 || 7 !== b2.tag) return b2 = Ah(c2, a2.mode, d2, f2), b2.return = a2, b2;
          b2 = e(b2, c2);
          b2.return = a2;
          return b2;
        }
        function q(a2, b2, c2) {
          if ("string" === typeof b2 && "" !== b2 || "number" === typeof b2) return b2 = xh("" + b2, a2.mode, c2), b2.return = a2, b2;
          if ("object" === typeof b2 && null !== b2) {
            switch (b2.$$typeof) {
              case va:
                return c2 = yh(b2.type, b2.key, b2.props, null, a2.mode, c2), c2.ref = sh(a2, null, b2), c2.return = a2, c2;
              case wa:
                return b2 = zh(b2, a2.mode, c2), b2.return = a2, b2;
              case Ha:
                var d2 = b2._init;
                return q(a2, d2(b2._payload), c2);
            }
            if (eb(b2) || Ka(b2)) return b2 = Ah(b2, a2.mode, c2, null), b2.return = a2, b2;
            th(a2, b2);
          }
          return null;
        }
        function r(a2, b2, c2, d2) {
          var e2 = null !== b2 ? b2.key : null;
          if ("string" === typeof c2 && "" !== c2 || "number" === typeof c2) return null !== e2 ? null : h(a2, b2, "" + c2, d2);
          if ("object" === typeof c2 && null !== c2) {
            switch (c2.$$typeof) {
              case va:
                return c2.key === e2 ? k(a2, b2, c2, d2) : null;
              case wa:
                return c2.key === e2 ? l(a2, b2, c2, d2) : null;
              case Ha:
                return e2 = c2._init, r(
                  a2,
                  b2,
                  e2(c2._payload),
                  d2
                );
            }
            if (eb(c2) || Ka(c2)) return null !== e2 ? null : m(a2, b2, c2, d2, null);
            th(a2, c2);
          }
          return null;
        }
        function y(a2, b2, c2, d2, e2) {
          if ("string" === typeof d2 && "" !== d2 || "number" === typeof d2) return a2 = a2.get(c2) || null, h(b2, a2, "" + d2, e2);
          if ("object" === typeof d2 && null !== d2) {
            switch (d2.$$typeof) {
              case va:
                return a2 = a2.get(null === d2.key ? c2 : d2.key) || null, k(b2, a2, d2, e2);
              case wa:
                return a2 = a2.get(null === d2.key ? c2 : d2.key) || null, l(b2, a2, d2, e2);
              case Ha:
                var f2 = d2._init;
                return y(a2, b2, c2, f2(d2._payload), e2);
            }
            if (eb(d2) || Ka(d2)) return a2 = a2.get(c2) || null, m(b2, a2, d2, e2, null);
            th(b2, d2);
          }
          return null;
        }
        function n(e2, g2, h2, k2) {
          for (var l2 = null, m2 = null, u = g2, w = g2 = 0, x = null; null !== u && w < h2.length; w++) {
            u.index > w ? (x = u, u = null) : x = u.sibling;
            var n2 = r(e2, u, h2[w], k2);
            if (null === n2) {
              null === u && (u = x);
              break;
            }
            a && u && null === n2.alternate && b(e2, u);
            g2 = f(n2, g2, w);
            null === m2 ? l2 = n2 : m2.sibling = n2;
            m2 = n2;
            u = x;
          }
          if (w === h2.length) return c(e2, u), I && tg(e2, w), l2;
          if (null === u) {
            for (; w < h2.length; w++) u = q(e2, h2[w], k2), null !== u && (g2 = f(u, g2, w), null === m2 ? l2 = u : m2.sibling = u, m2 = u);
            I && tg(e2, w);
            return l2;
          }
          for (u = d(e2, u); w < h2.length; w++) x = y(u, e2, w, h2[w], k2), null !== x && (a && null !== x.alternate && u.delete(null === x.key ? w : x.key), g2 = f(x, g2, w), null === m2 ? l2 = x : m2.sibling = x, m2 = x);
          a && u.forEach(function(a2) {
            return b(e2, a2);
          });
          I && tg(e2, w);
          return l2;
        }
        function t(e2, g2, h2, k2) {
          var l2 = Ka(h2);
          if ("function" !== typeof l2) throw Error(p(150));
          h2 = l2.call(h2);
          if (null == h2) throw Error(p(151));
          for (var u = l2 = null, m2 = g2, w = g2 = 0, x = null, n2 = h2.next(); null !== m2 && !n2.done; w++, n2 = h2.next()) {
            m2.index > w ? (x = m2, m2 = null) : x = m2.sibling;
            var t2 = r(e2, m2, n2.value, k2);
            if (null === t2) {
              null === m2 && (m2 = x);
              break;
            }
            a && m2 && null === t2.alternate && b(e2, m2);
            g2 = f(t2, g2, w);
            null === u ? l2 = t2 : u.sibling = t2;
            u = t2;
            m2 = x;
          }
          if (n2.done) return c(
            e2,
            m2
          ), I && tg(e2, w), l2;
          if (null === m2) {
            for (; !n2.done; w++, n2 = h2.next()) n2 = q(e2, n2.value, k2), null !== n2 && (g2 = f(n2, g2, w), null === u ? l2 = n2 : u.sibling = n2, u = n2);
            I && tg(e2, w);
            return l2;
          }
          for (m2 = d(e2, m2); !n2.done; w++, n2 = h2.next()) n2 = y(m2, e2, w, n2.value, k2), null !== n2 && (a && null !== n2.alternate && m2.delete(null === n2.key ? w : n2.key), g2 = f(n2, g2, w), null === u ? l2 = n2 : u.sibling = n2, u = n2);
          a && m2.forEach(function(a2) {
            return b(e2, a2);
          });
          I && tg(e2, w);
          return l2;
        }
        function J(a2, d2, f2, h2) {
          "object" === typeof f2 && null !== f2 && f2.type === ya && null === f2.key && (f2 = f2.props.children);
          if ("object" === typeof f2 && null !== f2) {
            switch (f2.$$typeof) {
              case va:
                a: {
                  for (var k2 = f2.key, l2 = d2; null !== l2; ) {
                    if (l2.key === k2) {
                      k2 = f2.type;
                      if (k2 === ya) {
                        if (7 === l2.tag) {
                          c(a2, l2.sibling);
                          d2 = e(l2, f2.props.children);
                          d2.return = a2;
                          a2 = d2;
                          break a;
                        }
                      } else if (l2.elementType === k2 || "object" === typeof k2 && null !== k2 && k2.$$typeof === Ha && uh(k2) === l2.type) {
                        c(a2, l2.sibling);
                        d2 = e(l2, f2.props);
                        d2.ref = sh(a2, l2, f2);
                        d2.return = a2;
                        a2 = d2;
                        break a;
                      }
                      c(a2, l2);
                      break;
                    } else b(a2, l2);
                    l2 = l2.sibling;
                  }
                  f2.type === ya ? (d2 = Ah(f2.props.children, a2.mode, h2, f2.key), d2.return = a2, a2 = d2) : (h2 = yh(f2.type, f2.key, f2.props, null, a2.mode, h2), h2.ref = sh(a2, d2, f2), h2.return = a2, a2 = h2);
                }
                return g(a2);
              case wa:
                a: {
                  for (l2 = f2.key; null !== d2; ) {
                    if (d2.key === l2) if (4 === d2.tag && d2.stateNode.containerInfo === f2.containerInfo && d2.stateNode.implementation === f2.implementation) {
                      c(a2, d2.sibling);
                      d2 = e(d2, f2.children || []);
                      d2.return = a2;
                      a2 = d2;
                      break a;
                    } else {
                      c(a2, d2);
                      break;
                    }
                    else b(a2, d2);
                    d2 = d2.sibling;
                  }
                  d2 = zh(f2, a2.mode, h2);
                  d2.return = a2;
                  a2 = d2;
                }
                return g(a2);
              case Ha:
                return l2 = f2._init, J(a2, d2, l2(f2._payload), h2);
            }
            if (eb(f2)) return n(a2, d2, f2, h2);
            if (Ka(f2)) return t(a2, d2, f2, h2);
            th(a2, f2);
          }
          return "string" === typeof f2 && "" !== f2 || "number" === typeof f2 ? (f2 = "" + f2, null !== d2 && 6 === d2.tag ? (c(a2, d2.sibling), d2 = e(d2, f2), d2.return = a2, a2 = d2) : (c(a2, d2), d2 = xh(f2, a2.mode, h2), d2.return = a2, a2 = d2), g(a2)) : c(a2, d2);
        }
        return J;
      }
      var Bh = vh(true);
      var Ch = vh(false);
      var Dh = {};
      var Eh = Uf(Dh);
      var Fh = Uf(Dh);
      var Gh = Uf(Dh);
      function Hh(a) {
        if (a === Dh) throw Error(p(174));
        return a;
      }
      function Ih(a, b) {
        G(Gh, b);
        G(Fh, a);
        G(Eh, Dh);
        a = b.nodeType;
        switch (a) {
          case 9:
          case 11:
            b = (b = b.documentElement) ? b.namespaceURI : lb(null, "");
            break;
          default:
            a = 8 === a ? b.parentNode : b, b = a.namespaceURI || null, a = a.tagName, b = lb(b, a);
        }
        E(Eh);
        G(Eh, b);
      }
      function Jh() {
        E(Eh);
        E(Fh);
        E(Gh);
      }
      function Kh(a) {
        Hh(Gh.current);
        var b = Hh(Eh.current);
        var c = lb(b, a.type);
        b !== c && (G(Fh, a), G(Eh, c));
      }
      function Lh(a) {
        Fh.current === a && (E(Eh), E(Fh));
      }
      var M = Uf(0);
      function Mh(a) {
        for (var b = a; null !== b; ) {
          if (13 === b.tag) {
            var c = b.memoizedState;
            if (null !== c && (c = c.dehydrated, null === c || "$?" === c.data || "$!" === c.data)) return b;
          } else if (19 === b.tag && void 0 !== b.memoizedProps.revealOrder) {
            if (0 !== (b.flags & 128)) return b;
          } else if (null !== b.child) {
            b.child.return = b;
            b = b.child;
            continue;
          }
          if (b === a) break;
          for (; null === b.sibling; ) {
            if (null === b.return || b.return === a) return null;
            b = b.return;
          }
          b.sibling.return = b.return;
          b = b.sibling;
        }
        return null;
      }
      var Nh = [];
      function Oh() {
        for (var a = 0; a < Nh.length; a++) Nh[a]._workInProgressVersionPrimary = null;
        Nh.length = 0;
      }
      var Ph = ua.ReactCurrentDispatcher;
      var Qh = ua.ReactCurrentBatchConfig;
      var Rh = 0;
      var N = null;
      var O = null;
      var P = null;
      var Sh = false;
      var Th = false;
      var Uh = 0;
      var Vh = 0;
      function Q() {
        throw Error(p(321));
      }
      function Wh(a, b) {
        if (null === b) return false;
        for (var c = 0; c < b.length && c < a.length; c++) if (!He(a[c], b[c])) return false;
        return true;
      }
      function Xh(a, b, c, d, e, f) {
        Rh = f;
        N = b;
        b.memoizedState = null;
        b.updateQueue = null;
        b.lanes = 0;
        Ph.current = null === a || null === a.memoizedState ? Yh : Zh;
        a = c(d, e);
        if (Th) {
          f = 0;
          do {
            Th = false;
            Uh = 0;
            if (25 <= f) throw Error(p(301));
            f += 1;
            P = O = null;
            b.updateQueue = null;
            Ph.current = $h;
            a = c(d, e);
          } while (Th);
        }
        Ph.current = ai;
        b = null !== O && null !== O.next;
        Rh = 0;
        P = O = N = null;
        Sh = false;
        if (b) throw Error(p(300));
        return a;
      }
      function bi() {
        var a = 0 !== Uh;
        Uh = 0;
        return a;
      }
      function ci() {
        var a = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
        null === P ? N.memoizedState = P = a : P = P.next = a;
        return P;
      }
      function di() {
        if (null === O) {
          var a = N.alternate;
          a = null !== a ? a.memoizedState : null;
        } else a = O.next;
        var b = null === P ? N.memoizedState : P.next;
        if (null !== b) P = b, O = a;
        else {
          if (null === a) throw Error(p(310));
          O = a;
          a = { memoizedState: O.memoizedState, baseState: O.baseState, baseQueue: O.baseQueue, queue: O.queue, next: null };
          null === P ? N.memoizedState = P = a : P = P.next = a;
        }
        return P;
      }
      function ei(a, b) {
        return "function" === typeof b ? b(a) : b;
      }
      function fi(a) {
        var b = di(), c = b.queue;
        if (null === c) throw Error(p(311));
        c.lastRenderedReducer = a;
        var d = O, e = d.baseQueue, f = c.pending;
        if (null !== f) {
          if (null !== e) {
            var g = e.next;
            e.next = f.next;
            f.next = g;
          }
          d.baseQueue = e = f;
          c.pending = null;
        }
        if (null !== e) {
          f = e.next;
          d = d.baseState;
          var h = g = null, k = null, l = f;
          do {
            var m = l.lane;
            if ((Rh & m) === m) null !== k && (k = k.next = { lane: 0, action: l.action, hasEagerState: l.hasEagerState, eagerState: l.eagerState, next: null }), d = l.hasEagerState ? l.eagerState : a(d, l.action);
            else {
              var q = {
                lane: m,
                action: l.action,
                hasEagerState: l.hasEagerState,
                eagerState: l.eagerState,
                next: null
              };
              null === k ? (h = k = q, g = d) : k = k.next = q;
              N.lanes |= m;
              hh |= m;
            }
            l = l.next;
          } while (null !== l && l !== f);
          null === k ? g = d : k.next = h;
          He(d, b.memoizedState) || (Ug = true);
          b.memoizedState = d;
          b.baseState = g;
          b.baseQueue = k;
          c.lastRenderedState = d;
        }
        a = c.interleaved;
        if (null !== a) {
          e = a;
          do
            f = e.lane, N.lanes |= f, hh |= f, e = e.next;
          while (e !== a);
        } else null === e && (c.lanes = 0);
        return [b.memoizedState, c.dispatch];
      }
      function gi(a) {
        var b = di(), c = b.queue;
        if (null === c) throw Error(p(311));
        c.lastRenderedReducer = a;
        var d = c.dispatch, e = c.pending, f = b.memoizedState;
        if (null !== e) {
          c.pending = null;
          var g = e = e.next;
          do
            f = a(f, g.action), g = g.next;
          while (g !== e);
          He(f, b.memoizedState) || (Ug = true);
          b.memoizedState = f;
          null === b.baseQueue && (b.baseState = f);
          c.lastRenderedState = f;
        }
        return [f, d];
      }
      function hi() {
      }
      function ii(a, b) {
        var c = N, d = di(), e = b(), f = !He(d.memoizedState, e);
        f && (d.memoizedState = e, Ug = true);
        d = d.queue;
        ji(ki.bind(null, c, d, a), [a]);
        if (d.getSnapshot !== b || f || null !== P && P.memoizedState.tag & 1) {
          c.flags |= 2048;
          li(9, mi.bind(null, c, d, e, b), void 0, null);
          if (null === R) throw Error(p(349));
          0 !== (Rh & 30) || ni(c, b, e);
        }
        return e;
      }
      function ni(a, b, c) {
        a.flags |= 16384;
        a = { getSnapshot: b, value: c };
        b = N.updateQueue;
        null === b ? (b = { lastEffect: null, stores: null }, N.updateQueue = b, b.stores = [a]) : (c = b.stores, null === c ? b.stores = [a] : c.push(a));
      }
      function mi(a, b, c, d) {
        b.value = c;
        b.getSnapshot = d;
        oi(b) && pi(a);
      }
      function ki(a, b, c) {
        return c(function() {
          oi(b) && pi(a);
        });
      }
      function oi(a) {
        var b = a.getSnapshot;
        a = a.value;
        try {
          var c = b();
          return !He(a, c);
        } catch (d) {
          return true;
        }
      }
      function pi(a) {
        var b = Zg(a, 1);
        null !== b && mh(b, a, 1, -1);
      }
      function qi(a) {
        var b = ci();
        "function" === typeof a && (a = a());
        b.memoizedState = b.baseState = a;
        a = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: ei, lastRenderedState: a };
        b.queue = a;
        a = a.dispatch = ri.bind(null, N, a);
        return [b.memoizedState, a];
      }
      function li(a, b, c, d) {
        a = { tag: a, create: b, destroy: c, deps: d, next: null };
        b = N.updateQueue;
        null === b ? (b = { lastEffect: null, stores: null }, N.updateQueue = b, b.lastEffect = a.next = a) : (c = b.lastEffect, null === c ? b.lastEffect = a.next = a : (d = c.next, c.next = a, a.next = d, b.lastEffect = a));
        return a;
      }
      function si() {
        return di().memoizedState;
      }
      function ti(a, b, c, d) {
        var e = ci();
        N.flags |= a;
        e.memoizedState = li(1 | b, c, void 0, void 0 === d ? null : d);
      }
      function ui(a, b, c, d) {
        var e = di();
        d = void 0 === d ? null : d;
        var f = void 0;
        if (null !== O) {
          var g = O.memoizedState;
          f = g.destroy;
          if (null !== d && Wh(d, g.deps)) {
            e.memoizedState = li(b, c, f, d);
            return;
          }
        }
        N.flags |= a;
        e.memoizedState = li(1 | b, c, f, d);
      }
      function vi(a, b) {
        return ti(8390656, 8, a, b);
      }
      function ji(a, b) {
        return ui(2048, 8, a, b);
      }
      function wi(a, b) {
        return ui(4, 2, a, b);
      }
      function xi(a, b) {
        return ui(4, 4, a, b);
      }
      function yi(a, b) {
        if ("function" === typeof b) return a = a(), b(a), function() {
          b(null);
        };
        if (null !== b && void 0 !== b) return a = a(), b.current = a, function() {
          b.current = null;
        };
      }
      function zi(a, b, c) {
        c = null !== c && void 0 !== c ? c.concat([a]) : null;
        return ui(4, 4, yi.bind(null, b, a), c);
      }
      function Ai() {
      }
      function Bi(a, b) {
        var c = di();
        b = void 0 === b ? null : b;
        var d = c.memoizedState;
        if (null !== d && null !== b && Wh(b, d[1])) return d[0];
        c.memoizedState = [a, b];
        return a;
      }
      function Ci(a, b) {
        var c = di();
        b = void 0 === b ? null : b;
        var d = c.memoizedState;
        if (null !== d && null !== b && Wh(b, d[1])) return d[0];
        a = a();
        c.memoizedState = [a, b];
        return a;
      }
      function Di(a, b, c) {
        if (0 === (Rh & 21)) return a.baseState && (a.baseState = false, Ug = true), a.memoizedState = c;
        He(c, b) || (c = yc(), N.lanes |= c, hh |= c, a.baseState = true);
        return b;
      }
      function Ei(a, b) {
        var c = C;
        C = 0 !== c && 4 > c ? c : 4;
        a(true);
        var d = Qh.transition;
        Qh.transition = {};
        try {
          a(false), b();
        } finally {
          C = c, Qh.transition = d;
        }
      }
      function Fi() {
        return di().memoizedState;
      }
      function Gi(a, b, c) {
        var d = lh(a);
        c = { lane: d, action: c, hasEagerState: false, eagerState: null, next: null };
        if (Hi(a)) Ii(b, c);
        else if (c = Yg(a, b, c, d), null !== c) {
          var e = L();
          mh(c, a, d, e);
          Ji(c, b, d);
        }
      }
      function ri(a, b, c) {
        var d = lh(a), e = { lane: d, action: c, hasEagerState: false, eagerState: null, next: null };
        if (Hi(a)) Ii(b, e);
        else {
          var f = a.alternate;
          if (0 === a.lanes && (null === f || 0 === f.lanes) && (f = b.lastRenderedReducer, null !== f)) try {
            var g = b.lastRenderedState, h = f(g, c);
            e.hasEagerState = true;
            e.eagerState = h;
            if (He(h, g)) {
              var k = b.interleaved;
              null === k ? (e.next = e, Xg(b)) : (e.next = k.next, k.next = e);
              b.interleaved = e;
              return;
            }
          } catch (l) {
          } finally {
          }
          c = Yg(a, b, e, d);
          null !== c && (e = L(), mh(c, a, d, e), Ji(c, b, d));
        }
      }
      function Hi(a) {
        var b = a.alternate;
        return a === N || null !== b && b === N;
      }
      function Ii(a, b) {
        Th = Sh = true;
        var c = a.pending;
        null === c ? b.next = b : (b.next = c.next, c.next = b);
        a.pending = b;
      }
      function Ji(a, b, c) {
        if (0 !== (c & 4194240)) {
          var d = b.lanes;
          d &= a.pendingLanes;
          c |= d;
          b.lanes = c;
          Cc(a, c);
        }
      }
      var ai = { readContext: Vg, useCallback: Q, useContext: Q, useEffect: Q, useImperativeHandle: Q, useInsertionEffect: Q, useLayoutEffect: Q, useMemo: Q, useReducer: Q, useRef: Q, useState: Q, useDebugValue: Q, useDeferredValue: Q, useTransition: Q, useMutableSource: Q, useSyncExternalStore: Q, useId: Q, unstable_isNewReconciler: false };
      var Yh = { readContext: Vg, useCallback: function(a, b) {
        ci().memoizedState = [a, void 0 === b ? null : b];
        return a;
      }, useContext: Vg, useEffect: vi, useImperativeHandle: function(a, b, c) {
        c = null !== c && void 0 !== c ? c.concat([a]) : null;
        return ti(
          4194308,
          4,
          yi.bind(null, b, a),
          c
        );
      }, useLayoutEffect: function(a, b) {
        return ti(4194308, 4, a, b);
      }, useInsertionEffect: function(a, b) {
        return ti(4, 2, a, b);
      }, useMemo: function(a, b) {
        var c = ci();
        b = void 0 === b ? null : b;
        a = a();
        c.memoizedState = [a, b];
        return a;
      }, useReducer: function(a, b, c) {
        var d = ci();
        b = void 0 !== c ? c(b) : b;
        d.memoizedState = d.baseState = b;
        a = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: a, lastRenderedState: b };
        d.queue = a;
        a = a.dispatch = Gi.bind(null, N, a);
        return [d.memoizedState, a];
      }, useRef: function(a) {
        var b = ci();
        a = { current: a };
        return b.memoizedState = a;
      }, useState: qi, useDebugValue: Ai, useDeferredValue: function(a) {
        return ci().memoizedState = a;
      }, useTransition: function() {
        var a = qi(false), b = a[0];
        a = Ei.bind(null, a[1]);
        ci().memoizedState = a;
        return [b, a];
      }, useMutableSource: function() {
      }, useSyncExternalStore: function(a, b, c) {
        var d = N, e = ci();
        if (I) {
          if (void 0 === c) throw Error(p(407));
          c = c();
        } else {
          c = b();
          if (null === R) throw Error(p(349));
          0 !== (Rh & 30) || ni(d, b, c);
        }
        e.memoizedState = c;
        var f = { value: c, getSnapshot: b };
        e.queue = f;
        vi(ki.bind(
          null,
          d,
          f,
          a
        ), [a]);
        d.flags |= 2048;
        li(9, mi.bind(null, d, f, c, b), void 0, null);
        return c;
      }, useId: function() {
        var a = ci(), b = R.identifierPrefix;
        if (I) {
          var c = sg;
          var d = rg;
          c = (d & ~(1 << 32 - oc(d) - 1)).toString(32) + c;
          b = ":" + b + "R" + c;
          c = Uh++;
          0 < c && (b += "H" + c.toString(32));
          b += ":";
        } else c = Vh++, b = ":" + b + "r" + c.toString(32) + ":";
        return a.memoizedState = b;
      }, unstable_isNewReconciler: false };
      var Zh = {
        readContext: Vg,
        useCallback: Bi,
        useContext: Vg,
        useEffect: ji,
        useImperativeHandle: zi,
        useInsertionEffect: wi,
        useLayoutEffect: xi,
        useMemo: Ci,
        useReducer: fi,
        useRef: si,
        useState: function() {
          return fi(ei);
        },
        useDebugValue: Ai,
        useDeferredValue: function(a) {
          var b = di();
          return Di(b, O.memoizedState, a);
        },
        useTransition: function() {
          var a = fi(ei)[0], b = di().memoizedState;
          return [a, b];
        },
        useMutableSource: hi,
        useSyncExternalStore: ii,
        useId: Fi,
        unstable_isNewReconciler: false
      };
      var $h = { readContext: Vg, useCallback: Bi, useContext: Vg, useEffect: ji, useImperativeHandle: zi, useInsertionEffect: wi, useLayoutEffect: xi, useMemo: Ci, useReducer: gi, useRef: si, useState: function() {
        return gi(ei);
      }, useDebugValue: Ai, useDeferredValue: function(a) {
        var b = di();
        return null === O ? b.memoizedState = a : Di(b, O.memoizedState, a);
      }, useTransition: function() {
        var a = gi(ei)[0], b = di().memoizedState;
        return [a, b];
      }, useMutableSource: hi, useSyncExternalStore: ii, useId: Fi, unstable_isNewReconciler: false };
      function Ki(a, b) {
        try {
          var c = "", d = b;
          do
            c += Pa(d), d = d.return;
          while (d);
          var e = c;
        } catch (f) {
          e = "\nError generating stack: " + f.message + "\n" + f.stack;
        }
        return { value: a, source: b, stack: e, digest: null };
      }
      function Li(a, b, c) {
        return { value: a, source: null, stack: null != c ? c : null, digest: null != b ? b : null };
      }
      function Mi(a, b) {
        try {
          console.error(b.value);
        } catch (c) {
          setTimeout(function() {
            throw c;
          });
        }
      }
      var Ni = "function" === typeof WeakMap ? WeakMap : Map;
      function Oi(a, b, c) {
        c = ch(-1, c);
        c.tag = 3;
        c.payload = { element: null };
        var d = b.value;
        c.callback = function() {
          Pi || (Pi = true, Qi = d);
          Mi(a, b);
        };
        return c;
      }
      function Ri(a, b, c) {
        c = ch(-1, c);
        c.tag = 3;
        var d = a.type.getDerivedStateFromError;
        if ("function" === typeof d) {
          var e = b.value;
          c.payload = function() {
            return d(e);
          };
          c.callback = function() {
            Mi(a, b);
          };
        }
        var f = a.stateNode;
        null !== f && "function" === typeof f.componentDidCatch && (c.callback = function() {
          Mi(a, b);
          "function" !== typeof d && (null === Si ? Si = /* @__PURE__ */ new Set([this]) : Si.add(this));
          var c2 = b.stack;
          this.componentDidCatch(b.value, { componentStack: null !== c2 ? c2 : "" });
        });
        return c;
      }
      function Ti(a, b, c) {
        var d = a.pingCache;
        if (null === d) {
          d = a.pingCache = new Ni();
          var e = /* @__PURE__ */ new Set();
          d.set(b, e);
        } else e = d.get(b), void 0 === e && (e = /* @__PURE__ */ new Set(), d.set(b, e));
        e.has(c) || (e.add(c), a = Ui.bind(null, a, b, c), b.then(a, a));
      }
      function Vi(a) {
        do {
          var b;
          if (b = 13 === a.tag) b = a.memoizedState, b = null !== b ? null !== b.dehydrated ? true : false : true;
          if (b) return a;
          a = a.return;
        } while (null !== a);
        return null;
      }
      function Wi(a, b, c, d, e) {
        if (0 === (a.mode & 1)) return a === b ? a.flags |= 65536 : (a.flags |= 128, c.flags |= 131072, c.flags &= -52805, 1 === c.tag && (null === c.alternate ? c.tag = 17 : (b = ch(-1, 1), b.tag = 2, dh(c, b, 1))), c.lanes |= 1), a;
        a.flags |= 65536;
        a.lanes = e;
        return a;
      }
      var Xi = ua.ReactCurrentOwner;
      var Ug = false;
      function Yi(a, b, c, d) {
        b.child = null === a ? Ch(b, null, c, d) : Bh(b, a.child, c, d);
      }
      function Zi(a, b, c, d, e) {
        c = c.render;
        var f = b.ref;
        Tg(b, e);
        d = Xh(a, b, c, d, f, e);
        c = bi();
        if (null !== a && !Ug) return b.updateQueue = a.updateQueue, b.flags &= -2053, a.lanes &= ~e, $i(a, b, e);
        I && c && vg(b);
        b.flags |= 1;
        Yi(a, b, d, e);
        return b.child;
      }
      function aj(a, b, c, d, e) {
        if (null === a) {
          var f = c.type;
          if ("function" === typeof f && !bj(f) && void 0 === f.defaultProps && null === c.compare && void 0 === c.defaultProps) return b.tag = 15, b.type = f, cj(a, b, f, d, e);
          a = yh(c.type, null, d, b, b.mode, e);
          a.ref = b.ref;
          a.return = b;
          return b.child = a;
        }
        f = a.child;
        if (0 === (a.lanes & e)) {
          var g = f.memoizedProps;
          c = c.compare;
          c = null !== c ? c : Ie;
          if (c(g, d) && a.ref === b.ref) return $i(a, b, e);
        }
        b.flags |= 1;
        a = wh(f, d);
        a.ref = b.ref;
        a.return = b;
        return b.child = a;
      }
      function cj(a, b, c, d, e) {
        if (null !== a) {
          var f = a.memoizedProps;
          if (Ie(f, d) && a.ref === b.ref) if (Ug = false, b.pendingProps = d = f, 0 !== (a.lanes & e)) 0 !== (a.flags & 131072) && (Ug = true);
          else return b.lanes = a.lanes, $i(a, b, e);
        }
        return dj(a, b, c, d, e);
      }
      function ej(a, b, c) {
        var d = b.pendingProps, e = d.children, f = null !== a ? a.memoizedState : null;
        if ("hidden" === d.mode) if (0 === (b.mode & 1)) b.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, G(fj, gj), gj |= c;
        else {
          if (0 === (c & 1073741824)) return a = null !== f ? f.baseLanes | c : c, b.lanes = b.childLanes = 1073741824, b.memoizedState = { baseLanes: a, cachePool: null, transitions: null }, b.updateQueue = null, G(fj, gj), gj |= a, null;
          b.memoizedState = { baseLanes: 0, cachePool: null, transitions: null };
          d = null !== f ? f.baseLanes : c;
          G(fj, gj);
          gj |= d;
        }
        else null !== f ? (d = f.baseLanes | c, b.memoizedState = null) : d = c, G(fj, gj), gj |= d;
        Yi(a, b, e, c);
        return b.child;
      }
      function hj(a, b) {
        var c = b.ref;
        if (null === a && null !== c || null !== a && a.ref !== c) b.flags |= 512, b.flags |= 2097152;
      }
      function dj(a, b, c, d, e) {
        var f = Zf(c) ? Xf : H.current;
        f = Yf(b, f);
        Tg(b, e);
        c = Xh(a, b, c, d, f, e);
        d = bi();
        if (null !== a && !Ug) return b.updateQueue = a.updateQueue, b.flags &= -2053, a.lanes &= ~e, $i(a, b, e);
        I && d && vg(b);
        b.flags |= 1;
        Yi(a, b, c, e);
        return b.child;
      }
      function ij(a, b, c, d, e) {
        if (Zf(c)) {
          var f = true;
          cg(b);
        } else f = false;
        Tg(b, e);
        if (null === b.stateNode) jj(a, b), ph(b, c, d), rh(b, c, d, e), d = true;
        else if (null === a) {
          var g = b.stateNode, h = b.memoizedProps;
          g.props = h;
          var k = g.context, l = c.contextType;
          "object" === typeof l && null !== l ? l = Vg(l) : (l = Zf(c) ? Xf : H.current, l = Yf(b, l));
          var m = c.getDerivedStateFromProps, q = "function" === typeof m || "function" === typeof g.getSnapshotBeforeUpdate;
          q || "function" !== typeof g.UNSAFE_componentWillReceiveProps && "function" !== typeof g.componentWillReceiveProps || (h !== d || k !== l) && qh(b, g, d, l);
          $g = false;
          var r = b.memoizedState;
          g.state = r;
          gh(b, d, g, e);
          k = b.memoizedState;
          h !== d || r !== k || Wf.current || $g ? ("function" === typeof m && (kh(b, c, m, d), k = b.memoizedState), (h = $g || oh(b, c, h, d, r, k, l)) ? (q || "function" !== typeof g.UNSAFE_componentWillMount && "function" !== typeof g.componentWillMount || ("function" === typeof g.componentWillMount && g.componentWillMount(), "function" === typeof g.UNSAFE_componentWillMount && g.UNSAFE_componentWillMount()), "function" === typeof g.componentDidMount && (b.flags |= 4194308)) : ("function" === typeof g.componentDidMount && (b.flags |= 4194308), b.memoizedProps = d, b.memoizedState = k), g.props = d, g.state = k, g.context = l, d = h) : ("function" === typeof g.componentDidMount && (b.flags |= 4194308), d = false);
        } else {
          g = b.stateNode;
          bh(a, b);
          h = b.memoizedProps;
          l = b.type === b.elementType ? h : Lg(b.type, h);
          g.props = l;
          q = b.pendingProps;
          r = g.context;
          k = c.contextType;
          "object" === typeof k && null !== k ? k = Vg(k) : (k = Zf(c) ? Xf : H.current, k = Yf(b, k));
          var y = c.getDerivedStateFromProps;
          (m = "function" === typeof y || "function" === typeof g.getSnapshotBeforeUpdate) || "function" !== typeof g.UNSAFE_componentWillReceiveProps && "function" !== typeof g.componentWillReceiveProps || (h !== q || r !== k) && qh(b, g, d, k);
          $g = false;
          r = b.memoizedState;
          g.state = r;
          gh(b, d, g, e);
          var n = b.memoizedState;
          h !== q || r !== n || Wf.current || $g ? ("function" === typeof y && (kh(b, c, y, d), n = b.memoizedState), (l = $g || oh(b, c, l, d, r, n, k) || false) ? (m || "function" !== typeof g.UNSAFE_componentWillUpdate && "function" !== typeof g.componentWillUpdate || ("function" === typeof g.componentWillUpdate && g.componentWillUpdate(d, n, k), "function" === typeof g.UNSAFE_componentWillUpdate && g.UNSAFE_componentWillUpdate(d, n, k)), "function" === typeof g.componentDidUpdate && (b.flags |= 4), "function" === typeof g.getSnapshotBeforeUpdate && (b.flags |= 1024)) : ("function" !== typeof g.componentDidUpdate || h === a.memoizedProps && r === a.memoizedState || (b.flags |= 4), "function" !== typeof g.getSnapshotBeforeUpdate || h === a.memoizedProps && r === a.memoizedState || (b.flags |= 1024), b.memoizedProps = d, b.memoizedState = n), g.props = d, g.state = n, g.context = k, d = l) : ("function" !== typeof g.componentDidUpdate || h === a.memoizedProps && r === a.memoizedState || (b.flags |= 4), "function" !== typeof g.getSnapshotBeforeUpdate || h === a.memoizedProps && r === a.memoizedState || (b.flags |= 1024), d = false);
        }
        return kj(a, b, c, d, f, e);
      }
      function kj(a, b, c, d, e, f) {
        hj(a, b);
        var g = 0 !== (b.flags & 128);
        if (!d && !g) return e && dg(b, c, false), $i(a, b, f);
        d = b.stateNode;
        Xi.current = b;
        var h = g && "function" !== typeof c.getDerivedStateFromError ? null : d.render();
        b.flags |= 1;
        null !== a && g ? (b.child = Bh(b, a.child, null, f), b.child = Bh(b, null, h, f)) : Yi(a, b, h, f);
        b.memoizedState = d.state;
        e && dg(b, c, true);
        return b.child;
      }
      function lj(a) {
        var b = a.stateNode;
        b.pendingContext ? ag(a, b.pendingContext, b.pendingContext !== b.context) : b.context && ag(a, b.context, false);
        Ih(a, b.containerInfo);
      }
      function mj(a, b, c, d, e) {
        Ig();
        Jg(e);
        b.flags |= 256;
        Yi(a, b, c, d);
        return b.child;
      }
      var nj = { dehydrated: null, treeContext: null, retryLane: 0 };
      function oj(a) {
        return { baseLanes: a, cachePool: null, transitions: null };
      }
      function pj(a, b, c) {
        var d = b.pendingProps, e = M.current, f = false, g = 0 !== (b.flags & 128), h;
        (h = g) || (h = null !== a && null === a.memoizedState ? false : 0 !== (e & 2));
        if (h) f = true, b.flags &= -129;
        else if (null === a || null !== a.memoizedState) e |= 1;
        G(M, e & 1);
        if (null === a) {
          Eg(b);
          a = b.memoizedState;
          if (null !== a && (a = a.dehydrated, null !== a)) return 0 === (b.mode & 1) ? b.lanes = 1 : "$!" === a.data ? b.lanes = 8 : b.lanes = 1073741824, null;
          g = d.children;
          a = d.fallback;
          return f ? (d = b.mode, f = b.child, g = { mode: "hidden", children: g }, 0 === (d & 1) && null !== f ? (f.childLanes = 0, f.pendingProps = g) : f = qj(g, d, 0, null), a = Ah(a, d, c, null), f.return = b, a.return = b, f.sibling = a, b.child = f, b.child.memoizedState = oj(c), b.memoizedState = nj, a) : rj(b, g);
        }
        e = a.memoizedState;
        if (null !== e && (h = e.dehydrated, null !== h)) return sj(a, b, g, d, h, e, c);
        if (f) {
          f = d.fallback;
          g = b.mode;
          e = a.child;
          h = e.sibling;
          var k = { mode: "hidden", children: d.children };
          0 === (g & 1) && b.child !== e ? (d = b.child, d.childLanes = 0, d.pendingProps = k, b.deletions = null) : (d = wh(e, k), d.subtreeFlags = e.subtreeFlags & 14680064);
          null !== h ? f = wh(h, f) : (f = Ah(f, g, c, null), f.flags |= 2);
          f.return = b;
          d.return = b;
          d.sibling = f;
          b.child = d;
          d = f;
          f = b.child;
          g = a.child.memoizedState;
          g = null === g ? oj(c) : { baseLanes: g.baseLanes | c, cachePool: null, transitions: g.transitions };
          f.memoizedState = g;
          f.childLanes = a.childLanes & ~c;
          b.memoizedState = nj;
          return d;
        }
        f = a.child;
        a = f.sibling;
        d = wh(f, { mode: "visible", children: d.children });
        0 === (b.mode & 1) && (d.lanes = c);
        d.return = b;
        d.sibling = null;
        null !== a && (c = b.deletions, null === c ? (b.deletions = [a], b.flags |= 16) : c.push(a));
        b.child = d;
        b.memoizedState = null;
        return d;
      }
      function rj(a, b) {
        b = qj({ mode: "visible", children: b }, a.mode, 0, null);
        b.return = a;
        return a.child = b;
      }
      function tj(a, b, c, d) {
        null !== d && Jg(d);
        Bh(b, a.child, null, c);
        a = rj(b, b.pendingProps.children);
        a.flags |= 2;
        b.memoizedState = null;
        return a;
      }
      function sj(a, b, c, d, e, f, g) {
        if (c) {
          if (b.flags & 256) return b.flags &= -257, d = Li(Error(p(422))), tj(a, b, g, d);
          if (null !== b.memoizedState) return b.child = a.child, b.flags |= 128, null;
          f = d.fallback;
          e = b.mode;
          d = qj({ mode: "visible", children: d.children }, e, 0, null);
          f = Ah(f, e, g, null);
          f.flags |= 2;
          d.return = b;
          f.return = b;
          d.sibling = f;
          b.child = d;
          0 !== (b.mode & 1) && Bh(b, a.child, null, g);
          b.child.memoizedState = oj(g);
          b.memoizedState = nj;
          return f;
        }
        if (0 === (b.mode & 1)) return tj(a, b, g, null);
        if ("$!" === e.data) {
          d = e.nextSibling && e.nextSibling.dataset;
          if (d) var h = d.dgst;
          d = h;
          f = Error(p(419));
          d = Li(f, d, void 0);
          return tj(a, b, g, d);
        }
        h = 0 !== (g & a.childLanes);
        if (Ug || h) {
          d = R;
          if (null !== d) {
            switch (g & -g) {
              case 4:
                e = 2;
                break;
              case 16:
                e = 8;
                break;
              case 64:
              case 128:
              case 256:
              case 512:
              case 1024:
              case 2048:
              case 4096:
              case 8192:
              case 16384:
              case 32768:
              case 65536:
              case 131072:
              case 262144:
              case 524288:
              case 1048576:
              case 2097152:
              case 4194304:
              case 8388608:
              case 16777216:
              case 33554432:
              case 67108864:
                e = 32;
                break;
              case 536870912:
                e = 268435456;
                break;
              default:
                e = 0;
            }
            e = 0 !== (e & (d.suspendedLanes | g)) ? 0 : e;
            0 !== e && e !== f.retryLane && (f.retryLane = e, Zg(a, e), mh(d, a, e, -1));
          }
          uj();
          d = Li(Error(p(421)));
          return tj(a, b, g, d);
        }
        if ("$?" === e.data) return b.flags |= 128, b.child = a.child, b = vj.bind(null, a), e._reactRetry = b, null;
        a = f.treeContext;
        yg = Lf(e.nextSibling);
        xg = b;
        I = true;
        zg = null;
        null !== a && (og[pg++] = rg, og[pg++] = sg, og[pg++] = qg, rg = a.id, sg = a.overflow, qg = b);
        b = rj(b, d.children);
        b.flags |= 4096;
        return b;
      }
      function wj(a, b, c) {
        a.lanes |= b;
        var d = a.alternate;
        null !== d && (d.lanes |= b);
        Sg(a.return, b, c);
      }
      function xj(a, b, c, d, e) {
        var f = a.memoizedState;
        null === f ? a.memoizedState = { isBackwards: b, rendering: null, renderingStartTime: 0, last: d, tail: c, tailMode: e } : (f.isBackwards = b, f.rendering = null, f.renderingStartTime = 0, f.last = d, f.tail = c, f.tailMode = e);
      }
      function yj(a, b, c) {
        var d = b.pendingProps, e = d.revealOrder, f = d.tail;
        Yi(a, b, d.children, c);
        d = M.current;
        if (0 !== (d & 2)) d = d & 1 | 2, b.flags |= 128;
        else {
          if (null !== a && 0 !== (a.flags & 128)) a: for (a = b.child; null !== a; ) {
            if (13 === a.tag) null !== a.memoizedState && wj(a, c, b);
            else if (19 === a.tag) wj(a, c, b);
            else if (null !== a.child) {
              a.child.return = a;
              a = a.child;
              continue;
            }
            if (a === b) break a;
            for (; null === a.sibling; ) {
              if (null === a.return || a.return === b) break a;
              a = a.return;
            }
            a.sibling.return = a.return;
            a = a.sibling;
          }
          d &= 1;
        }
        G(M, d);
        if (0 === (b.mode & 1)) b.memoizedState = null;
        else switch (e) {
          case "forwards":
            c = b.child;
            for (e = null; null !== c; ) a = c.alternate, null !== a && null === Mh(a) && (e = c), c = c.sibling;
            c = e;
            null === c ? (e = b.child, b.child = null) : (e = c.sibling, c.sibling = null);
            xj(b, false, e, c, f);
            break;
          case "backwards":
            c = null;
            e = b.child;
            for (b.child = null; null !== e; ) {
              a = e.alternate;
              if (null !== a && null === Mh(a)) {
                b.child = e;
                break;
              }
              a = e.sibling;
              e.sibling = c;
              c = e;
              e = a;
            }
            xj(b, true, c, null, f);
            break;
          case "together":
            xj(b, false, null, null, void 0);
            break;
          default:
            b.memoizedState = null;
        }
        return b.child;
      }
      function jj(a, b) {
        0 === (b.mode & 1) && null !== a && (a.alternate = null, b.alternate = null, b.flags |= 2);
      }
      function $i(a, b, c) {
        null !== a && (b.dependencies = a.dependencies);
        hh |= b.lanes;
        if (0 === (c & b.childLanes)) return null;
        if (null !== a && b.child !== a.child) throw Error(p(153));
        if (null !== b.child) {
          a = b.child;
          c = wh(a, a.pendingProps);
          b.child = c;
          for (c.return = b; null !== a.sibling; ) a = a.sibling, c = c.sibling = wh(a, a.pendingProps), c.return = b;
          c.sibling = null;
        }
        return b.child;
      }
      function zj(a, b, c) {
        switch (b.tag) {
          case 3:
            lj(b);
            Ig();
            break;
          case 5:
            Kh(b);
            break;
          case 1:
            Zf(b.type) && cg(b);
            break;
          case 4:
            Ih(b, b.stateNode.containerInfo);
            break;
          case 10:
            var d = b.type._context, e = b.memoizedProps.value;
            G(Mg, d._currentValue);
            d._currentValue = e;
            break;
          case 13:
            d = b.memoizedState;
            if (null !== d) {
              if (null !== d.dehydrated) return G(M, M.current & 1), b.flags |= 128, null;
              if (0 !== (c & b.child.childLanes)) return pj(a, b, c);
              G(M, M.current & 1);
              a = $i(a, b, c);
              return null !== a ? a.sibling : null;
            }
            G(M, M.current & 1);
            break;
          case 19:
            d = 0 !== (c & b.childLanes);
            if (0 !== (a.flags & 128)) {
              if (d) return yj(a, b, c);
              b.flags |= 128;
            }
            e = b.memoizedState;
            null !== e && (e.rendering = null, e.tail = null, e.lastEffect = null);
            G(M, M.current);
            if (d) break;
            else return null;
          case 22:
          case 23:
            return b.lanes = 0, ej(a, b, c);
        }
        return $i(a, b, c);
      }
      var Aj;
      var Bj;
      var Cj;
      var Dj;
      Aj = function(a, b) {
        for (var c = b.child; null !== c; ) {
          if (5 === c.tag || 6 === c.tag) a.appendChild(c.stateNode);
          else if (4 !== c.tag && null !== c.child) {
            c.child.return = c;
            c = c.child;
            continue;
          }
          if (c === b) break;
          for (; null === c.sibling; ) {
            if (null === c.return || c.return === b) return;
            c = c.return;
          }
          c.sibling.return = c.return;
          c = c.sibling;
        }
      };
      Bj = function() {
      };
      Cj = function(a, b, c, d) {
        var e = a.memoizedProps;
        if (e !== d) {
          a = b.stateNode;
          Hh(Eh.current);
          var f = null;
          switch (c) {
            case "input":
              e = Ya(a, e);
              d = Ya(a, d);
              f = [];
              break;
            case "select":
              e = A({}, e, { value: void 0 });
              d = A({}, d, { value: void 0 });
              f = [];
              break;
            case "textarea":
              e = gb(a, e);
              d = gb(a, d);
              f = [];
              break;
            default:
              "function" !== typeof e.onClick && "function" === typeof d.onClick && (a.onclick = Bf);
          }
          ub(c, d);
          var g;
          c = null;
          for (l in e) if (!d.hasOwnProperty(l) && e.hasOwnProperty(l) && null != e[l]) if ("style" === l) {
            var h = e[l];
            for (g in h) h.hasOwnProperty(g) && (c || (c = {}), c[g] = "");
          } else "dangerouslySetInnerHTML" !== l && "children" !== l && "suppressContentEditableWarning" !== l && "suppressHydrationWarning" !== l && "autoFocus" !== l && (ea.hasOwnProperty(l) ? f || (f = []) : (f = f || []).push(l, null));
          for (l in d) {
            var k = d[l];
            h = null != e ? e[l] : void 0;
            if (d.hasOwnProperty(l) && k !== h && (null != k || null != h)) if ("style" === l) if (h) {
              for (g in h) !h.hasOwnProperty(g) || k && k.hasOwnProperty(g) || (c || (c = {}), c[g] = "");
              for (g in k) k.hasOwnProperty(g) && h[g] !== k[g] && (c || (c = {}), c[g] = k[g]);
            } else c || (f || (f = []), f.push(
              l,
              c
            )), c = k;
            else "dangerouslySetInnerHTML" === l ? (k = k ? k.__html : void 0, h = h ? h.__html : void 0, null != k && h !== k && (f = f || []).push(l, k)) : "children" === l ? "string" !== typeof k && "number" !== typeof k || (f = f || []).push(l, "" + k) : "suppressContentEditableWarning" !== l && "suppressHydrationWarning" !== l && (ea.hasOwnProperty(l) ? (null != k && "onScroll" === l && D("scroll", a), f || h === k || (f = [])) : (f = f || []).push(l, k));
          }
          c && (f = f || []).push("style", c);
          var l = f;
          if (b.updateQueue = l) b.flags |= 4;
        }
      };
      Dj = function(a, b, c, d) {
        c !== d && (b.flags |= 4);
      };
      function Ej(a, b) {
        if (!I) switch (a.tailMode) {
          case "hidden":
            b = a.tail;
            for (var c = null; null !== b; ) null !== b.alternate && (c = b), b = b.sibling;
            null === c ? a.tail = null : c.sibling = null;
            break;
          case "collapsed":
            c = a.tail;
            for (var d = null; null !== c; ) null !== c.alternate && (d = c), c = c.sibling;
            null === d ? b || null === a.tail ? a.tail = null : a.tail.sibling = null : d.sibling = null;
        }
      }
      function S(a) {
        var b = null !== a.alternate && a.alternate.child === a.child, c = 0, d = 0;
        if (b) for (var e = a.child; null !== e; ) c |= e.lanes | e.childLanes, d |= e.subtreeFlags & 14680064, d |= e.flags & 14680064, e.return = a, e = e.sibling;
        else for (e = a.child; null !== e; ) c |= e.lanes | e.childLanes, d |= e.subtreeFlags, d |= e.flags, e.return = a, e = e.sibling;
        a.subtreeFlags |= d;
        a.childLanes = c;
        return b;
      }
      function Fj(a, b, c) {
        var d = b.pendingProps;
        wg(b);
        switch (b.tag) {
          case 2:
          case 16:
          case 15:
          case 0:
          case 11:
          case 7:
          case 8:
          case 12:
          case 9:
          case 14:
            return S(b), null;
          case 1:
            return Zf(b.type) && $f(), S(b), null;
          case 3:
            d = b.stateNode;
            Jh();
            E(Wf);
            E(H);
            Oh();
            d.pendingContext && (d.context = d.pendingContext, d.pendingContext = null);
            if (null === a || null === a.child) Gg(b) ? b.flags |= 4 : null === a || a.memoizedState.isDehydrated && 0 === (b.flags & 256) || (b.flags |= 1024, null !== zg && (Gj(zg), zg = null));
            Bj(a, b);
            S(b);
            return null;
          case 5:
            Lh(b);
            var e = Hh(Gh.current);
            c = b.type;
            if (null !== a && null != b.stateNode) Cj(a, b, c, d, e), a.ref !== b.ref && (b.flags |= 512, b.flags |= 2097152);
            else {
              if (!d) {
                if (null === b.stateNode) throw Error(p(166));
                S(b);
                return null;
              }
              a = Hh(Eh.current);
              if (Gg(b)) {
                d = b.stateNode;
                c = b.type;
                var f = b.memoizedProps;
                d[Of] = b;
                d[Pf] = f;
                a = 0 !== (b.mode & 1);
                switch (c) {
                  case "dialog":
                    D("cancel", d);
                    D("close", d);
                    break;
                  case "iframe":
                  case "object":
                  case "embed":
                    D("load", d);
                    break;
                  case "video":
                  case "audio":
                    for (e = 0; e < lf.length; e++) D(lf[e], d);
                    break;
                  case "source":
                    D("error", d);
                    break;
                  case "img":
                  case "image":
                  case "link":
                    D(
                      "error",
                      d
                    );
                    D("load", d);
                    break;
                  case "details":
                    D("toggle", d);
                    break;
                  case "input":
                    Za(d, f);
                    D("invalid", d);
                    break;
                  case "select":
                    d._wrapperState = { wasMultiple: !!f.multiple };
                    D("invalid", d);
                    break;
                  case "textarea":
                    hb(d, f), D("invalid", d);
                }
                ub(c, f);
                e = null;
                for (var g in f) if (f.hasOwnProperty(g)) {
                  var h = f[g];
                  "children" === g ? "string" === typeof h ? d.textContent !== h && (true !== f.suppressHydrationWarning && Af(d.textContent, h, a), e = ["children", h]) : "number" === typeof h && d.textContent !== "" + h && (true !== f.suppressHydrationWarning && Af(
                    d.textContent,
                    h,
                    a
                  ), e = ["children", "" + h]) : ea.hasOwnProperty(g) && null != h && "onScroll" === g && D("scroll", d);
                }
                switch (c) {
                  case "input":
                    Va(d);
                    db(d, f, true);
                    break;
                  case "textarea":
                    Va(d);
                    jb(d);
                    break;
                  case "select":
                  case "option":
                    break;
                  default:
                    "function" === typeof f.onClick && (d.onclick = Bf);
                }
                d = e;
                b.updateQueue = d;
                null !== d && (b.flags |= 4);
              } else {
                g = 9 === e.nodeType ? e : e.ownerDocument;
                "http://www.w3.org/1999/xhtml" === a && (a = kb(c));
                "http://www.w3.org/1999/xhtml" === a ? "script" === c ? (a = g.createElement("div"), a.innerHTML = "<script><\/script>", a = a.removeChild(a.firstChild)) : "string" === typeof d.is ? a = g.createElement(c, { is: d.is }) : (a = g.createElement(c), "select" === c && (g = a, d.multiple ? g.multiple = true : d.size && (g.size = d.size))) : a = g.createElementNS(a, c);
                a[Of] = b;
                a[Pf] = d;
                Aj(a, b, false, false);
                b.stateNode = a;
                a: {
                  g = vb(c, d);
                  switch (c) {
                    case "dialog":
                      D("cancel", a);
                      D("close", a);
                      e = d;
                      break;
                    case "iframe":
                    case "object":
                    case "embed":
                      D("load", a);
                      e = d;
                      break;
                    case "video":
                    case "audio":
                      for (e = 0; e < lf.length; e++) D(lf[e], a);
                      e = d;
                      break;
                    case "source":
                      D("error", a);
                      e = d;
                      break;
                    case "img":
                    case "image":
                    case "link":
                      D(
                        "error",
                        a
                      );
                      D("load", a);
                      e = d;
                      break;
                    case "details":
                      D("toggle", a);
                      e = d;
                      break;
                    case "input":
                      Za(a, d);
                      e = Ya(a, d);
                      D("invalid", a);
                      break;
                    case "option":
                      e = d;
                      break;
                    case "select":
                      a._wrapperState = { wasMultiple: !!d.multiple };
                      e = A({}, d, { value: void 0 });
                      D("invalid", a);
                      break;
                    case "textarea":
                      hb(a, d);
                      e = gb(a, d);
                      D("invalid", a);
                      break;
                    default:
                      e = d;
                  }
                  ub(c, e);
                  h = e;
                  for (f in h) if (h.hasOwnProperty(f)) {
                    var k = h[f];
                    "style" === f ? sb(a, k) : "dangerouslySetInnerHTML" === f ? (k = k ? k.__html : void 0, null != k && nb(a, k)) : "children" === f ? "string" === typeof k ? ("textarea" !== c || "" !== k) && ob(a, k) : "number" === typeof k && ob(a, "" + k) : "suppressContentEditableWarning" !== f && "suppressHydrationWarning" !== f && "autoFocus" !== f && (ea.hasOwnProperty(f) ? null != k && "onScroll" === f && D("scroll", a) : null != k && ta(a, f, k, g));
                  }
                  switch (c) {
                    case "input":
                      Va(a);
                      db(a, d, false);
                      break;
                    case "textarea":
                      Va(a);
                      jb(a);
                      break;
                    case "option":
                      null != d.value && a.setAttribute("value", "" + Sa(d.value));
                      break;
                    case "select":
                      a.multiple = !!d.multiple;
                      f = d.value;
                      null != f ? fb(a, !!d.multiple, f, false) : null != d.defaultValue && fb(
                        a,
                        !!d.multiple,
                        d.defaultValue,
                        true
                      );
                      break;
                    default:
                      "function" === typeof e.onClick && (a.onclick = Bf);
                  }
                  switch (c) {
                    case "button":
                    case "input":
                    case "select":
                    case "textarea":
                      d = !!d.autoFocus;
                      break a;
                    case "img":
                      d = true;
                      break a;
                    default:
                      d = false;
                  }
                }
                d && (b.flags |= 4);
              }
              null !== b.ref && (b.flags |= 512, b.flags |= 2097152);
            }
            S(b);
            return null;
          case 6:
            if (a && null != b.stateNode) Dj(a, b, a.memoizedProps, d);
            else {
              if ("string" !== typeof d && null === b.stateNode) throw Error(p(166));
              c = Hh(Gh.current);
              Hh(Eh.current);
              if (Gg(b)) {
                d = b.stateNode;
                c = b.memoizedProps;
                d[Of] = b;
                if (f = d.nodeValue !== c) {
                  if (a = xg, null !== a) switch (a.tag) {
                    case 3:
                      Af(d.nodeValue, c, 0 !== (a.mode & 1));
                      break;
                    case 5:
                      true !== a.memoizedProps.suppressHydrationWarning && Af(d.nodeValue, c, 0 !== (a.mode & 1));
                  }
                }
                f && (b.flags |= 4);
              } else d = (9 === c.nodeType ? c : c.ownerDocument).createTextNode(d), d[Of] = b, b.stateNode = d;
            }
            S(b);
            return null;
          case 13:
            E(M);
            d = b.memoizedState;
            if (null === a || null !== a.memoizedState && null !== a.memoizedState.dehydrated) {
              if (I && null !== yg && 0 !== (b.mode & 1) && 0 === (b.flags & 128)) Hg(), Ig(), b.flags |= 98560, f = false;
              else if (f = Gg(b), null !== d && null !== d.dehydrated) {
                if (null === a) {
                  if (!f) throw Error(p(318));
                  f = b.memoizedState;
                  f = null !== f ? f.dehydrated : null;
                  if (!f) throw Error(p(317));
                  f[Of] = b;
                } else Ig(), 0 === (b.flags & 128) && (b.memoizedState = null), b.flags |= 4;
                S(b);
                f = false;
              } else null !== zg && (Gj(zg), zg = null), f = true;
              if (!f) return b.flags & 65536 ? b : null;
            }
            if (0 !== (b.flags & 128)) return b.lanes = c, b;
            d = null !== d;
            d !== (null !== a && null !== a.memoizedState) && d && (b.child.flags |= 8192, 0 !== (b.mode & 1) && (null === a || 0 !== (M.current & 1) ? 0 === T && (T = 3) : uj()));
            null !== b.updateQueue && (b.flags |= 4);
            S(b);
            return null;
          case 4:
            return Jh(), Bj(a, b), null === a && sf(b.stateNode.containerInfo), S(b), null;
          case 10:
            return Rg(b.type._context), S(b), null;
          case 17:
            return Zf(b.type) && $f(), S(b), null;
          case 19:
            E(M);
            f = b.memoizedState;
            if (null === f) return S(b), null;
            d = 0 !== (b.flags & 128);
            g = f.rendering;
            if (null === g) if (d) Ej(f, false);
            else {
              if (0 !== T || null !== a && 0 !== (a.flags & 128)) for (a = b.child; null !== a; ) {
                g = Mh(a);
                if (null !== g) {
                  b.flags |= 128;
                  Ej(f, false);
                  d = g.updateQueue;
                  null !== d && (b.updateQueue = d, b.flags |= 4);
                  b.subtreeFlags = 0;
                  d = c;
                  for (c = b.child; null !== c; ) f = c, a = d, f.flags &= 14680066, g = f.alternate, null === g ? (f.childLanes = 0, f.lanes = a, f.child = null, f.subtreeFlags = 0, f.memoizedProps = null, f.memoizedState = null, f.updateQueue = null, f.dependencies = null, f.stateNode = null) : (f.childLanes = g.childLanes, f.lanes = g.lanes, f.child = g.child, f.subtreeFlags = 0, f.deletions = null, f.memoizedProps = g.memoizedProps, f.memoizedState = g.memoizedState, f.updateQueue = g.updateQueue, f.type = g.type, a = g.dependencies, f.dependencies = null === a ? null : { lanes: a.lanes, firstContext: a.firstContext }), c = c.sibling;
                  G(M, M.current & 1 | 2);
                  return b.child;
                }
                a = a.sibling;
              }
              null !== f.tail && B() > Hj && (b.flags |= 128, d = true, Ej(f, false), b.lanes = 4194304);
            }
            else {
              if (!d) if (a = Mh(g), null !== a) {
                if (b.flags |= 128, d = true, c = a.updateQueue, null !== c && (b.updateQueue = c, b.flags |= 4), Ej(f, true), null === f.tail && "hidden" === f.tailMode && !g.alternate && !I) return S(b), null;
              } else 2 * B() - f.renderingStartTime > Hj && 1073741824 !== c && (b.flags |= 128, d = true, Ej(f, false), b.lanes = 4194304);
              f.isBackwards ? (g.sibling = b.child, b.child = g) : (c = f.last, null !== c ? c.sibling = g : b.child = g, f.last = g);
            }
            if (null !== f.tail) return b = f.tail, f.rendering = b, f.tail = b.sibling, f.renderingStartTime = B(), b.sibling = null, c = M.current, G(M, d ? c & 1 | 2 : c & 1), b;
            S(b);
            return null;
          case 22:
          case 23:
            return Ij(), d = null !== b.memoizedState, null !== a && null !== a.memoizedState !== d && (b.flags |= 8192), d && 0 !== (b.mode & 1) ? 0 !== (gj & 1073741824) && (S(b), b.subtreeFlags & 6 && (b.flags |= 8192)) : S(b), null;
          case 24:
            return null;
          case 25:
            return null;
        }
        throw Error(p(156, b.tag));
      }
      function Jj(a, b) {
        wg(b);
        switch (b.tag) {
          case 1:
            return Zf(b.type) && $f(), a = b.flags, a & 65536 ? (b.flags = a & -65537 | 128, b) : null;
          case 3:
            return Jh(), E(Wf), E(H), Oh(), a = b.flags, 0 !== (a & 65536) && 0 === (a & 128) ? (b.flags = a & -65537 | 128, b) : null;
          case 5:
            return Lh(b), null;
          case 13:
            E(M);
            a = b.memoizedState;
            if (null !== a && null !== a.dehydrated) {
              if (null === b.alternate) throw Error(p(340));
              Ig();
            }
            a = b.flags;
            return a & 65536 ? (b.flags = a & -65537 | 128, b) : null;
          case 19:
            return E(M), null;
          case 4:
            return Jh(), null;
          case 10:
            return Rg(b.type._context), null;
          case 22:
          case 23:
            return Ij(), null;
          case 24:
            return null;
          default:
            return null;
        }
      }
      var Kj = false;
      var U = false;
      var Lj = "function" === typeof WeakSet ? WeakSet : Set;
      var V = null;
      function Mj(a, b) {
        var c = a.ref;
        if (null !== c) if ("function" === typeof c) try {
          c(null);
        } catch (d) {
          W(a, b, d);
        }
        else c.current = null;
      }
      function Nj(a, b, c) {
        try {
          c();
        } catch (d) {
          W(a, b, d);
        }
      }
      var Oj = false;
      function Pj(a, b) {
        Cf = dd;
        a = Me();
        if (Ne(a)) {
          if ("selectionStart" in a) var c = { start: a.selectionStart, end: a.selectionEnd };
          else a: {
            c = (c = a.ownerDocument) && c.defaultView || window;
            var d = c.getSelection && c.getSelection();
            if (d && 0 !== d.rangeCount) {
              c = d.anchorNode;
              var e = d.anchorOffset, f = d.focusNode;
              d = d.focusOffset;
              try {
                c.nodeType, f.nodeType;
              } catch (F) {
                c = null;
                break a;
              }
              var g = 0, h = -1, k = -1, l = 0, m = 0, q = a, r = null;
              b: for (; ; ) {
                for (var y; ; ) {
                  q !== c || 0 !== e && 3 !== q.nodeType || (h = g + e);
                  q !== f || 0 !== d && 3 !== q.nodeType || (k = g + d);
                  3 === q.nodeType && (g += q.nodeValue.length);
                  if (null === (y = q.firstChild)) break;
                  r = q;
                  q = y;
                }
                for (; ; ) {
                  if (q === a) break b;
                  r === c && ++l === e && (h = g);
                  r === f && ++m === d && (k = g);
                  if (null !== (y = q.nextSibling)) break;
                  q = r;
                  r = q.parentNode;
                }
                q = y;
              }
              c = -1 === h || -1 === k ? null : { start: h, end: k };
            } else c = null;
          }
          c = c || { start: 0, end: 0 };
        } else c = null;
        Df = { focusedElem: a, selectionRange: c };
        dd = false;
        for (V = b; null !== V; ) if (b = V, a = b.child, 0 !== (b.subtreeFlags & 1028) && null !== a) a.return = b, V = a;
        else for (; null !== V; ) {
          b = V;
          try {
            var n = b.alternate;
            if (0 !== (b.flags & 1024)) switch (b.tag) {
              case 0:
              case 11:
              case 15:
                break;
              case 1:
                if (null !== n) {
                  var t = n.memoizedProps, J = n.memoizedState, x = b.stateNode, w = x.getSnapshotBeforeUpdate(b.elementType === b.type ? t : Lg(b.type, t), J);
                  x.__reactInternalSnapshotBeforeUpdate = w;
                }
                break;
              case 3:
                var u = b.stateNode.containerInfo;
                1 === u.nodeType ? u.textContent = "" : 9 === u.nodeType && u.documentElement && u.removeChild(u.documentElement);
                break;
              case 5:
              case 6:
              case 4:
              case 17:
                break;
              default:
                throw Error(p(163));
            }
          } catch (F) {
            W(b, b.return, F);
          }
          a = b.sibling;
          if (null !== a) {
            a.return = b.return;
            V = a;
            break;
          }
          V = b.return;
        }
        n = Oj;
        Oj = false;
        return n;
      }
      function Qj(a, b, c) {
        var d = b.updateQueue;
        d = null !== d ? d.lastEffect : null;
        if (null !== d) {
          var e = d = d.next;
          do {
            if ((e.tag & a) === a) {
              var f = e.destroy;
              e.destroy = void 0;
              void 0 !== f && Nj(b, c, f);
            }
            e = e.next;
          } while (e !== d);
        }
      }
      function Rj(a, b) {
        b = b.updateQueue;
        b = null !== b ? b.lastEffect : null;
        if (null !== b) {
          var c = b = b.next;
          do {
            if ((c.tag & a) === a) {
              var d = c.create;
              c.destroy = d();
            }
            c = c.next;
          } while (c !== b);
        }
      }
      function Sj(a) {
        var b = a.ref;
        if (null !== b) {
          var c = a.stateNode;
          switch (a.tag) {
            case 5:
              a = c;
              break;
            default:
              a = c;
          }
          "function" === typeof b ? b(a) : b.current = a;
        }
      }
      function Tj(a) {
        var b = a.alternate;
        null !== b && (a.alternate = null, Tj(b));
        a.child = null;
        a.deletions = null;
        a.sibling = null;
        5 === a.tag && (b = a.stateNode, null !== b && (delete b[Of], delete b[Pf], delete b[of], delete b[Qf], delete b[Rf]));
        a.stateNode = null;
        a.return = null;
        a.dependencies = null;
        a.memoizedProps = null;
        a.memoizedState = null;
        a.pendingProps = null;
        a.stateNode = null;
        a.updateQueue = null;
      }
      function Uj(a) {
        return 5 === a.tag || 3 === a.tag || 4 === a.tag;
      }
      function Vj(a) {
        a: for (; ; ) {
          for (; null === a.sibling; ) {
            if (null === a.return || Uj(a.return)) return null;
            a = a.return;
          }
          a.sibling.return = a.return;
          for (a = a.sibling; 5 !== a.tag && 6 !== a.tag && 18 !== a.tag; ) {
            if (a.flags & 2) continue a;
            if (null === a.child || 4 === a.tag) continue a;
            else a.child.return = a, a = a.child;
          }
          if (!(a.flags & 2)) return a.stateNode;
        }
      }
      function Wj(a, b, c) {
        var d = a.tag;
        if (5 === d || 6 === d) a = a.stateNode, b ? 8 === c.nodeType ? c.parentNode.insertBefore(a, b) : c.insertBefore(a, b) : (8 === c.nodeType ? (b = c.parentNode, b.insertBefore(a, c)) : (b = c, b.appendChild(a)), c = c._reactRootContainer, null !== c && void 0 !== c || null !== b.onclick || (b.onclick = Bf));
        else if (4 !== d && (a = a.child, null !== a)) for (Wj(a, b, c), a = a.sibling; null !== a; ) Wj(a, b, c), a = a.sibling;
      }
      function Xj(a, b, c) {
        var d = a.tag;
        if (5 === d || 6 === d) a = a.stateNode, b ? c.insertBefore(a, b) : c.appendChild(a);
        else if (4 !== d && (a = a.child, null !== a)) for (Xj(a, b, c), a = a.sibling; null !== a; ) Xj(a, b, c), a = a.sibling;
      }
      var X = null;
      var Yj = false;
      function Zj(a, b, c) {
        for (c = c.child; null !== c; ) ak(a, b, c), c = c.sibling;
      }
      function ak(a, b, c) {
        if (lc && "function" === typeof lc.onCommitFiberUnmount) try {
          lc.onCommitFiberUnmount(kc, c);
        } catch (h) {
        }
        switch (c.tag) {
          case 5:
            U || Mj(c, b);
          case 6:
            var d = X, e = Yj;
            X = null;
            Zj(a, b, c);
            X = d;
            Yj = e;
            null !== X && (Yj ? (a = X, c = c.stateNode, 8 === a.nodeType ? a.parentNode.removeChild(c) : a.removeChild(c)) : X.removeChild(c.stateNode));
            break;
          case 18:
            null !== X && (Yj ? (a = X, c = c.stateNode, 8 === a.nodeType ? Kf(a.parentNode, c) : 1 === a.nodeType && Kf(a, c), bd(a)) : Kf(X, c.stateNode));
            break;
          case 4:
            d = X;
            e = Yj;
            X = c.stateNode.containerInfo;
            Yj = true;
            Zj(a, b, c);
            X = d;
            Yj = e;
            break;
          case 0:
          case 11:
          case 14:
          case 15:
            if (!U && (d = c.updateQueue, null !== d && (d = d.lastEffect, null !== d))) {
              e = d = d.next;
              do {
                var f = e, g = f.destroy;
                f = f.tag;
                void 0 !== g && (0 !== (f & 2) ? Nj(c, b, g) : 0 !== (f & 4) && Nj(c, b, g));
                e = e.next;
              } while (e !== d);
            }
            Zj(a, b, c);
            break;
          case 1:
            if (!U && (Mj(c, b), d = c.stateNode, "function" === typeof d.componentWillUnmount)) try {
              d.props = c.memoizedProps, d.state = c.memoizedState, d.componentWillUnmount();
            } catch (h) {
              W(c, b, h);
            }
            Zj(a, b, c);
            break;
          case 21:
            Zj(a, b, c);
            break;
          case 22:
            c.mode & 1 ? (U = (d = U) || null !== c.memoizedState, Zj(a, b, c), U = d) : Zj(a, b, c);
            break;
          default:
            Zj(a, b, c);
        }
      }
      function bk(a) {
        var b = a.updateQueue;
        if (null !== b) {
          a.updateQueue = null;
          var c = a.stateNode;
          null === c && (c = a.stateNode = new Lj());
          b.forEach(function(b2) {
            var d = ck.bind(null, a, b2);
            c.has(b2) || (c.add(b2), b2.then(d, d));
          });
        }
      }
      function dk(a, b) {
        var c = b.deletions;
        if (null !== c) for (var d = 0; d < c.length; d++) {
          var e = c[d];
          try {
            var f = a, g = b, h = g;
            a: for (; null !== h; ) {
              switch (h.tag) {
                case 5:
                  X = h.stateNode;
                  Yj = false;
                  break a;
                case 3:
                  X = h.stateNode.containerInfo;
                  Yj = true;
                  break a;
                case 4:
                  X = h.stateNode.containerInfo;
                  Yj = true;
                  break a;
              }
              h = h.return;
            }
            if (null === X) throw Error(p(160));
            ak(f, g, e);
            X = null;
            Yj = false;
            var k = e.alternate;
            null !== k && (k.return = null);
            e.return = null;
          } catch (l) {
            W(e, b, l);
          }
        }
        if (b.subtreeFlags & 12854) for (b = b.child; null !== b; ) ek(b, a), b = b.sibling;
      }
      function ek(a, b) {
        var c = a.alternate, d = a.flags;
        switch (a.tag) {
          case 0:
          case 11:
          case 14:
          case 15:
            dk(b, a);
            fk(a);
            if (d & 4) {
              try {
                Qj(3, a, a.return), Rj(3, a);
              } catch (t) {
                W(a, a.return, t);
              }
              try {
                Qj(5, a, a.return);
              } catch (t) {
                W(a, a.return, t);
              }
            }
            break;
          case 1:
            dk(b, a);
            fk(a);
            d & 512 && null !== c && Mj(c, c.return);
            break;
          case 5:
            dk(b, a);
            fk(a);
            d & 512 && null !== c && Mj(c, c.return);
            if (a.flags & 32) {
              var e = a.stateNode;
              try {
                ob(e, "");
              } catch (t) {
                W(a, a.return, t);
              }
            }
            if (d & 4 && (e = a.stateNode, null != e)) {
              var f = a.memoizedProps, g = null !== c ? c.memoizedProps : f, h = a.type, k = a.updateQueue;
              a.updateQueue = null;
              if (null !== k) try {
                "input" === h && "radio" === f.type && null != f.name && ab(e, f);
                vb(h, g);
                var l = vb(h, f);
                for (g = 0; g < k.length; g += 2) {
                  var m = k[g], q = k[g + 1];
                  "style" === m ? sb(e, q) : "dangerouslySetInnerHTML" === m ? nb(e, q) : "children" === m ? ob(e, q) : ta(e, m, q, l);
                }
                switch (h) {
                  case "input":
                    bb(e, f);
                    break;
                  case "textarea":
                    ib(e, f);
                    break;
                  case "select":
                    var r = e._wrapperState.wasMultiple;
                    e._wrapperState.wasMultiple = !!f.multiple;
                    var y = f.value;
                    null != y ? fb(e, !!f.multiple, y, false) : r !== !!f.multiple && (null != f.defaultValue ? fb(
                      e,
                      !!f.multiple,
                      f.defaultValue,
                      true
                    ) : fb(e, !!f.multiple, f.multiple ? [] : "", false));
                }
                e[Pf] = f;
              } catch (t) {
                W(a, a.return, t);
              }
            }
            break;
          case 6:
            dk(b, a);
            fk(a);
            if (d & 4) {
              if (null === a.stateNode) throw Error(p(162));
              e = a.stateNode;
              f = a.memoizedProps;
              try {
                e.nodeValue = f;
              } catch (t) {
                W(a, a.return, t);
              }
            }
            break;
          case 3:
            dk(b, a);
            fk(a);
            if (d & 4 && null !== c && c.memoizedState.isDehydrated) try {
              bd(b.containerInfo);
            } catch (t) {
              W(a, a.return, t);
            }
            break;
          case 4:
            dk(b, a);
            fk(a);
            break;
          case 13:
            dk(b, a);
            fk(a);
            e = a.child;
            e.flags & 8192 && (f = null !== e.memoizedState, e.stateNode.isHidden = f, !f || null !== e.alternate && null !== e.alternate.memoizedState || (gk = B()));
            d & 4 && bk(a);
            break;
          case 22:
            m = null !== c && null !== c.memoizedState;
            a.mode & 1 ? (U = (l = U) || m, dk(b, a), U = l) : dk(b, a);
            fk(a);
            if (d & 8192) {
              l = null !== a.memoizedState;
              if ((a.stateNode.isHidden = l) && !m && 0 !== (a.mode & 1)) for (V = a, m = a.child; null !== m; ) {
                for (q = V = m; null !== V; ) {
                  r = V;
                  y = r.child;
                  switch (r.tag) {
                    case 0:
                    case 11:
                    case 14:
                    case 15:
                      Qj(4, r, r.return);
                      break;
                    case 1:
                      Mj(r, r.return);
                      var n = r.stateNode;
                      if ("function" === typeof n.componentWillUnmount) {
                        d = r;
                        c = r.return;
                        try {
                          b = d, n.props = b.memoizedProps, n.state = b.memoizedState, n.componentWillUnmount();
                        } catch (t) {
                          W(d, c, t);
                        }
                      }
                      break;
                    case 5:
                      Mj(r, r.return);
                      break;
                    case 22:
                      if (null !== r.memoizedState) {
                        hk(q);
                        continue;
                      }
                  }
                  null !== y ? (y.return = r, V = y) : hk(q);
                }
                m = m.sibling;
              }
              a: for (m = null, q = a; ; ) {
                if (5 === q.tag) {
                  if (null === m) {
                    m = q;
                    try {
                      e = q.stateNode, l ? (f = e.style, "function" === typeof f.setProperty ? f.setProperty("display", "none", "important") : f.display = "none") : (h = q.stateNode, k = q.memoizedProps.style, g = void 0 !== k && null !== k && k.hasOwnProperty("display") ? k.display : null, h.style.display = rb("display", g));
                    } catch (t) {
                      W(a, a.return, t);
                    }
                  }
                } else if (6 === q.tag) {
                  if (null === m) try {
                    q.stateNode.nodeValue = l ? "" : q.memoizedProps;
                  } catch (t) {
                    W(a, a.return, t);
                  }
                } else if ((22 !== q.tag && 23 !== q.tag || null === q.memoizedState || q === a) && null !== q.child) {
                  q.child.return = q;
                  q = q.child;
                  continue;
                }
                if (q === a) break a;
                for (; null === q.sibling; ) {
                  if (null === q.return || q.return === a) break a;
                  m === q && (m = null);
                  q = q.return;
                }
                m === q && (m = null);
                q.sibling.return = q.return;
                q = q.sibling;
              }
            }
            break;
          case 19:
            dk(b, a);
            fk(a);
            d & 4 && bk(a);
            break;
          case 21:
            break;
          default:
            dk(
              b,
              a
            ), fk(a);
        }
      }
      function fk(a) {
        var b = a.flags;
        if (b & 2) {
          try {
            a: {
              for (var c = a.return; null !== c; ) {
                if (Uj(c)) {
                  var d = c;
                  break a;
                }
                c = c.return;
              }
              throw Error(p(160));
            }
            switch (d.tag) {
              case 5:
                var e = d.stateNode;
                d.flags & 32 && (ob(e, ""), d.flags &= -33);
                var f = Vj(a);
                Xj(a, f, e);
                break;
              case 3:
              case 4:
                var g = d.stateNode.containerInfo, h = Vj(a);
                Wj(a, h, g);
                break;
              default:
                throw Error(p(161));
            }
          } catch (k) {
            W(a, a.return, k);
          }
          a.flags &= -3;
        }
        b & 4096 && (a.flags &= -4097);
      }
      function ik(a, b, c) {
        V = a;
        jk(a, b, c);
      }
      function jk(a, b, c) {
        for (var d = 0 !== (a.mode & 1); null !== V; ) {
          var e = V, f = e.child;
          if (22 === e.tag && d) {
            var g = null !== e.memoizedState || Kj;
            if (!g) {
              var h = e.alternate, k = null !== h && null !== h.memoizedState || U;
              h = Kj;
              var l = U;
              Kj = g;
              if ((U = k) && !l) for (V = e; null !== V; ) g = V, k = g.child, 22 === g.tag && null !== g.memoizedState ? kk(e) : null !== k ? (k.return = g, V = k) : kk(e);
              for (; null !== f; ) V = f, jk(f, b, c), f = f.sibling;
              V = e;
              Kj = h;
              U = l;
            }
            lk(a, b, c);
          } else 0 !== (e.subtreeFlags & 8772) && null !== f ? (f.return = e, V = f) : lk(a, b, c);
        }
      }
      function lk(a) {
        for (; null !== V; ) {
          var b = V;
          if (0 !== (b.flags & 8772)) {
            var c = b.alternate;
            try {
              if (0 !== (b.flags & 8772)) switch (b.tag) {
                case 0:
                case 11:
                case 15:
                  U || Rj(5, b);
                  break;
                case 1:
                  var d = b.stateNode;
                  if (b.flags & 4 && !U) if (null === c) d.componentDidMount();
                  else {
                    var e = b.elementType === b.type ? c.memoizedProps : Lg(b.type, c.memoizedProps);
                    d.componentDidUpdate(e, c.memoizedState, d.__reactInternalSnapshotBeforeUpdate);
                  }
                  var f = b.updateQueue;
                  null !== f && ih(b, f, d);
                  break;
                case 3:
                  var g = b.updateQueue;
                  if (null !== g) {
                    c = null;
                    if (null !== b.child) switch (b.child.tag) {
                      case 5:
                        c = b.child.stateNode;
                        break;
                      case 1:
                        c = b.child.stateNode;
                    }
                    ih(b, g, c);
                  }
                  break;
                case 5:
                  var h = b.stateNode;
                  if (null === c && b.flags & 4) {
                    c = h;
                    var k = b.memoizedProps;
                    switch (b.type) {
                      case "button":
                      case "input":
                      case "select":
                      case "textarea":
                        k.autoFocus && c.focus();
                        break;
                      case "img":
                        k.src && (c.src = k.src);
                    }
                  }
                  break;
                case 6:
                  break;
                case 4:
                  break;
                case 12:
                  break;
                case 13:
                  if (null === b.memoizedState) {
                    var l = b.alternate;
                    if (null !== l) {
                      var m = l.memoizedState;
                      if (null !== m) {
                        var q = m.dehydrated;
                        null !== q && bd(q);
                      }
                    }
                  }
                  break;
                case 19:
                case 17:
                case 21:
                case 22:
                case 23:
                case 25:
                  break;
                default:
                  throw Error(p(163));
              }
              U || b.flags & 512 && Sj(b);
            } catch (r) {
              W(b, b.return, r);
            }
          }
          if (b === a) {
            V = null;
            break;
          }
          c = b.sibling;
          if (null !== c) {
            c.return = b.return;
            V = c;
            break;
          }
          V = b.return;
        }
      }
      function hk(a) {
        for (; null !== V; ) {
          var b = V;
          if (b === a) {
            V = null;
            break;
          }
          var c = b.sibling;
          if (null !== c) {
            c.return = b.return;
            V = c;
            break;
          }
          V = b.return;
        }
      }
      function kk(a) {
        for (; null !== V; ) {
          var b = V;
          try {
            switch (b.tag) {
              case 0:
              case 11:
              case 15:
                var c = b.return;
                try {
                  Rj(4, b);
                } catch (k) {
                  W(b, c, k);
                }
                break;
              case 1:
                var d = b.stateNode;
                if ("function" === typeof d.componentDidMount) {
                  var e = b.return;
                  try {
                    d.componentDidMount();
                  } catch (k) {
                    W(b, e, k);
                  }
                }
                var f = b.return;
                try {
                  Sj(b);
                } catch (k) {
                  W(b, f, k);
                }
                break;
              case 5:
                var g = b.return;
                try {
                  Sj(b);
                } catch (k) {
                  W(b, g, k);
                }
            }
          } catch (k) {
            W(b, b.return, k);
          }
          if (b === a) {
            V = null;
            break;
          }
          var h = b.sibling;
          if (null !== h) {
            h.return = b.return;
            V = h;
            break;
          }
          V = b.return;
        }
      }
      var mk = Math.ceil;
      var nk = ua.ReactCurrentDispatcher;
      var ok = ua.ReactCurrentOwner;
      var pk = ua.ReactCurrentBatchConfig;
      var K = 0;
      var R = null;
      var Y = null;
      var Z = 0;
      var gj = 0;
      var fj = Uf(0);
      var T = 0;
      var qk = null;
      var hh = 0;
      var rk = 0;
      var sk = 0;
      var tk = null;
      var uk = null;
      var gk = 0;
      var Hj = Infinity;
      var vk = null;
      var Pi = false;
      var Qi = null;
      var Si = null;
      var wk = false;
      var xk = null;
      var yk = 0;
      var zk = 0;
      var Ak = null;
      var Bk = -1;
      var Ck = 0;
      function L() {
        return 0 !== (K & 6) ? B() : -1 !== Bk ? Bk : Bk = B();
      }
      function lh(a) {
        if (0 === (a.mode & 1)) return 1;
        if (0 !== (K & 2) && 0 !== Z) return Z & -Z;
        if (null !== Kg.transition) return 0 === Ck && (Ck = yc()), Ck;
        a = C;
        if (0 !== a) return a;
        a = window.event;
        a = void 0 === a ? 16 : jd(a.type);
        return a;
      }
      function mh(a, b, c, d) {
        if (50 < zk) throw zk = 0, Ak = null, Error(p(185));
        Ac(a, c, d);
        if (0 === (K & 2) || a !== R) a === R && (0 === (K & 2) && (rk |= c), 4 === T && Dk(a, Z)), Ek(a, d), 1 === c && 0 === K && 0 === (b.mode & 1) && (Hj = B() + 500, fg && jg());
      }
      function Ek(a, b) {
        var c = a.callbackNode;
        wc(a, b);
        var d = uc(a, a === R ? Z : 0);
        if (0 === d) null !== c && bc(c), a.callbackNode = null, a.callbackPriority = 0;
        else if (b = d & -d, a.callbackPriority !== b) {
          null != c && bc(c);
          if (1 === b) 0 === a.tag ? ig(Fk.bind(null, a)) : hg(Fk.bind(null, a)), Jf(function() {
            0 === (K & 6) && jg();
          }), c = null;
          else {
            switch (Dc(d)) {
              case 1:
                c = fc;
                break;
              case 4:
                c = gc;
                break;
              case 16:
                c = hc;
                break;
              case 536870912:
                c = jc;
                break;
              default:
                c = hc;
            }
            c = Gk(c, Hk.bind(null, a));
          }
          a.callbackPriority = b;
          a.callbackNode = c;
        }
      }
      function Hk(a, b) {
        Bk = -1;
        Ck = 0;
        if (0 !== (K & 6)) throw Error(p(327));
        var c = a.callbackNode;
        if (Ik() && a.callbackNode !== c) return null;
        var d = uc(a, a === R ? Z : 0);
        if (0 === d) return null;
        if (0 !== (d & 30) || 0 !== (d & a.expiredLanes) || b) b = Jk(a, d);
        else {
          b = d;
          var e = K;
          K |= 2;
          var f = Kk();
          if (R !== a || Z !== b) vk = null, Hj = B() + 500, Lk(a, b);
          do
            try {
              Mk();
              break;
            } catch (h) {
              Nk(a, h);
            }
          while (1);
          Qg();
          nk.current = f;
          K = e;
          null !== Y ? b = 0 : (R = null, Z = 0, b = T);
        }
        if (0 !== b) {
          2 === b && (e = xc(a), 0 !== e && (d = e, b = Ok(a, e)));
          if (1 === b) throw c = qk, Lk(a, 0), Dk(a, d), Ek(a, B()), c;
          if (6 === b) Dk(a, d);
          else {
            e = a.current.alternate;
            if (0 === (d & 30) && !Pk(e) && (b = Jk(a, d), 2 === b && (f = xc(a), 0 !== f && (d = f, b = Ok(a, f))), 1 === b)) throw c = qk, Lk(a, 0), Dk(a, d), Ek(a, B()), c;
            a.finishedWork = e;
            a.finishedLanes = d;
            switch (b) {
              case 0:
              case 1:
                throw Error(p(345));
              case 2:
                Qk(a, uk, vk);
                break;
              case 3:
                Dk(a, d);
                if ((d & 130023424) === d && (b = gk + 500 - B(), 10 < b)) {
                  if (0 !== uc(a, 0)) break;
                  e = a.suspendedLanes;
                  if ((e & d) !== d) {
                    L();
                    a.pingedLanes |= a.suspendedLanes & e;
                    break;
                  }
                  a.timeoutHandle = Ff(Qk.bind(null, a, uk, vk), b);
                  break;
                }
                Qk(a, uk, vk);
                break;
              case 4:
                Dk(a, d);
                if ((d & 4194240) === d) break;
                b = a.eventTimes;
                for (e = -1; 0 < d; ) {
                  var g = 31 - oc(d);
                  f = 1 << g;
                  g = b[g];
                  g > e && (e = g);
                  d &= ~f;
                }
                d = e;
                d = B() - d;
                d = (120 > d ? 120 : 480 > d ? 480 : 1080 > d ? 1080 : 1920 > d ? 1920 : 3e3 > d ? 3e3 : 4320 > d ? 4320 : 1960 * mk(d / 1960)) - d;
                if (10 < d) {
                  a.timeoutHandle = Ff(Qk.bind(null, a, uk, vk), d);
                  break;
                }
                Qk(a, uk, vk);
                break;
              case 5:
                Qk(a, uk, vk);
                break;
              default:
                throw Error(p(329));
            }
          }
        }
        Ek(a, B());
        return a.callbackNode === c ? Hk.bind(null, a) : null;
      }
      function Ok(a, b) {
        var c = tk;
        a.current.memoizedState.isDehydrated && (Lk(a, b).flags |= 256);
        a = Jk(a, b);
        2 !== a && (b = uk, uk = c, null !== b && Gj(b));
        return a;
      }
      function Gj(a) {
        null === uk ? uk = a : uk.push.apply(uk, a);
      }
      function Pk(a) {
        for (var b = a; ; ) {
          if (b.flags & 16384) {
            var c = b.updateQueue;
            if (null !== c && (c = c.stores, null !== c)) for (var d = 0; d < c.length; d++) {
              var e = c[d], f = e.getSnapshot;
              e = e.value;
              try {
                if (!He(f(), e)) return false;
              } catch (g) {
                return false;
              }
            }
          }
          c = b.child;
          if (b.subtreeFlags & 16384 && null !== c) c.return = b, b = c;
          else {
            if (b === a) break;
            for (; null === b.sibling; ) {
              if (null === b.return || b.return === a) return true;
              b = b.return;
            }
            b.sibling.return = b.return;
            b = b.sibling;
          }
        }
        return true;
      }
      function Dk(a, b) {
        b &= ~sk;
        b &= ~rk;
        a.suspendedLanes |= b;
        a.pingedLanes &= ~b;
        for (a = a.expirationTimes; 0 < b; ) {
          var c = 31 - oc(b), d = 1 << c;
          a[c] = -1;
          b &= ~d;
        }
      }
      function Fk(a) {
        if (0 !== (K & 6)) throw Error(p(327));
        Ik();
        var b = uc(a, 0);
        if (0 === (b & 1)) return Ek(a, B()), null;
        var c = Jk(a, b);
        if (0 !== a.tag && 2 === c) {
          var d = xc(a);
          0 !== d && (b = d, c = Ok(a, d));
        }
        if (1 === c) throw c = qk, Lk(a, 0), Dk(a, b), Ek(a, B()), c;
        if (6 === c) throw Error(p(345));
        a.finishedWork = a.current.alternate;
        a.finishedLanes = b;
        Qk(a, uk, vk);
        Ek(a, B());
        return null;
      }
      function Rk(a, b) {
        var c = K;
        K |= 1;
        try {
          return a(b);
        } finally {
          K = c, 0 === K && (Hj = B() + 500, fg && jg());
        }
      }
      function Sk(a) {
        null !== xk && 0 === xk.tag && 0 === (K & 6) && Ik();
        var b = K;
        K |= 1;
        var c = pk.transition, d = C;
        try {
          if (pk.transition = null, C = 1, a) return a();
        } finally {
          C = d, pk.transition = c, K = b, 0 === (K & 6) && jg();
        }
      }
      function Ij() {
        gj = fj.current;
        E(fj);
      }
      function Lk(a, b) {
        a.finishedWork = null;
        a.finishedLanes = 0;
        var c = a.timeoutHandle;
        -1 !== c && (a.timeoutHandle = -1, Gf(c));
        if (null !== Y) for (c = Y.return; null !== c; ) {
          var d = c;
          wg(d);
          switch (d.tag) {
            case 1:
              d = d.type.childContextTypes;
              null !== d && void 0 !== d && $f();
              break;
            case 3:
              Jh();
              E(Wf);
              E(H);
              Oh();
              break;
            case 5:
              Lh(d);
              break;
            case 4:
              Jh();
              break;
            case 13:
              E(M);
              break;
            case 19:
              E(M);
              break;
            case 10:
              Rg(d.type._context);
              break;
            case 22:
            case 23:
              Ij();
          }
          c = c.return;
        }
        R = a;
        Y = a = wh(a.current, null);
        Z = gj = b;
        T = 0;
        qk = null;
        sk = rk = hh = 0;
        uk = tk = null;
        if (null !== Wg) {
          for (b = 0; b < Wg.length; b++) if (c = Wg[b], d = c.interleaved, null !== d) {
            c.interleaved = null;
            var e = d.next, f = c.pending;
            if (null !== f) {
              var g = f.next;
              f.next = e;
              d.next = g;
            }
            c.pending = d;
          }
          Wg = null;
        }
        return a;
      }
      function Nk(a, b) {
        do {
          var c = Y;
          try {
            Qg();
            Ph.current = ai;
            if (Sh) {
              for (var d = N.memoizedState; null !== d; ) {
                var e = d.queue;
                null !== e && (e.pending = null);
                d = d.next;
              }
              Sh = false;
            }
            Rh = 0;
            P = O = N = null;
            Th = false;
            Uh = 0;
            ok.current = null;
            if (null === c || null === c.return) {
              T = 1;
              qk = b;
              Y = null;
              break;
            }
            a: {
              var f = a, g = c.return, h = c, k = b;
              b = Z;
              h.flags |= 32768;
              if (null !== k && "object" === typeof k && "function" === typeof k.then) {
                var l = k, m = h, q = m.tag;
                if (0 === (m.mode & 1) && (0 === q || 11 === q || 15 === q)) {
                  var r = m.alternate;
                  r ? (m.updateQueue = r.updateQueue, m.memoizedState = r.memoizedState, m.lanes = r.lanes) : (m.updateQueue = null, m.memoizedState = null);
                }
                var y = Vi(g);
                if (null !== y) {
                  y.flags &= -257;
                  Wi(y, g, h, f, b);
                  y.mode & 1 && Ti(f, l, b);
                  b = y;
                  k = l;
                  var n = b.updateQueue;
                  if (null === n) {
                    var t = /* @__PURE__ */ new Set();
                    t.add(k);
                    b.updateQueue = t;
                  } else n.add(k);
                  break a;
                } else {
                  if (0 === (b & 1)) {
                    Ti(f, l, b);
                    uj();
                    break a;
                  }
                  k = Error(p(426));
                }
              } else if (I && h.mode & 1) {
                var J = Vi(g);
                if (null !== J) {
                  0 === (J.flags & 65536) && (J.flags |= 256);
                  Wi(J, g, h, f, b);
                  Jg(Ki(k, h));
                  break a;
                }
              }
              f = k = Ki(k, h);
              4 !== T && (T = 2);
              null === tk ? tk = [f] : tk.push(f);
              f = g;
              do {
                switch (f.tag) {
                  case 3:
                    f.flags |= 65536;
                    b &= -b;
                    f.lanes |= b;
                    var x = Oi(f, k, b);
                    fh(f, x);
                    break a;
                  case 1:
                    h = k;
                    var w = f.type, u = f.stateNode;
                    if (0 === (f.flags & 128) && ("function" === typeof w.getDerivedStateFromError || null !== u && "function" === typeof u.componentDidCatch && (null === Si || !Si.has(u)))) {
                      f.flags |= 65536;
                      b &= -b;
                      f.lanes |= b;
                      var F = Ri(f, h, b);
                      fh(f, F);
                      break a;
                    }
                }
                f = f.return;
              } while (null !== f);
            }
            Tk(c);
          } catch (na) {
            b = na;
            Y === c && null !== c && (Y = c = c.return);
            continue;
          }
          break;
        } while (1);
      }
      function Kk() {
        var a = nk.current;
        nk.current = ai;
        return null === a ? ai : a;
      }
      function uj() {
        if (0 === T || 3 === T || 2 === T) T = 4;
        null === R || 0 === (hh & 268435455) && 0 === (rk & 268435455) || Dk(R, Z);
      }
      function Jk(a, b) {
        var c = K;
        K |= 2;
        var d = Kk();
        if (R !== a || Z !== b) vk = null, Lk(a, b);
        do
          try {
            Uk();
            break;
          } catch (e) {
            Nk(a, e);
          }
        while (1);
        Qg();
        K = c;
        nk.current = d;
        if (null !== Y) throw Error(p(261));
        R = null;
        Z = 0;
        return T;
      }
      function Uk() {
        for (; null !== Y; ) Vk(Y);
      }
      function Mk() {
        for (; null !== Y && !cc(); ) Vk(Y);
      }
      function Vk(a) {
        var b = Wk(a.alternate, a, gj);
        a.memoizedProps = a.pendingProps;
        null === b ? Tk(a) : Y = b;
        ok.current = null;
      }
      function Tk(a) {
        var b = a;
        do {
          var c = b.alternate;
          a = b.return;
          if (0 === (b.flags & 32768)) {
            if (c = Fj(c, b, gj), null !== c) {
              Y = c;
              return;
            }
          } else {
            c = Jj(c, b);
            if (null !== c) {
              c.flags &= 32767;
              Y = c;
              return;
            }
            if (null !== a) a.flags |= 32768, a.subtreeFlags = 0, a.deletions = null;
            else {
              T = 6;
              Y = null;
              return;
            }
          }
          b = b.sibling;
          if (null !== b) {
            Y = b;
            return;
          }
          Y = b = a;
        } while (null !== b);
        0 === T && (T = 5);
      }
      function Qk(a, b, c) {
        var d = C, e = pk.transition;
        try {
          pk.transition = null, C = 1, Xk(a, b, c, d);
        } finally {
          pk.transition = e, C = d;
        }
        return null;
      }
      function Xk(a, b, c, d) {
        do
          Ik();
        while (null !== xk);
        if (0 !== (K & 6)) throw Error(p(327));
        c = a.finishedWork;
        var e = a.finishedLanes;
        if (null === c) return null;
        a.finishedWork = null;
        a.finishedLanes = 0;
        if (c === a.current) throw Error(p(177));
        a.callbackNode = null;
        a.callbackPriority = 0;
        var f = c.lanes | c.childLanes;
        Bc(a, f);
        a === R && (Y = R = null, Z = 0);
        0 === (c.subtreeFlags & 2064) && 0 === (c.flags & 2064) || wk || (wk = true, Gk(hc, function() {
          Ik();
          return null;
        }));
        f = 0 !== (c.flags & 15990);
        if (0 !== (c.subtreeFlags & 15990) || f) {
          f = pk.transition;
          pk.transition = null;
          var g = C;
          C = 1;
          var h = K;
          K |= 4;
          ok.current = null;
          Pj(a, c);
          ek(c, a);
          Oe(Df);
          dd = !!Cf;
          Df = Cf = null;
          a.current = c;
          ik(c, a, e);
          dc();
          K = h;
          C = g;
          pk.transition = f;
        } else a.current = c;
        wk && (wk = false, xk = a, yk = e);
        f = a.pendingLanes;
        0 === f && (Si = null);
        mc(c.stateNode, d);
        Ek(a, B());
        if (null !== b) for (d = a.onRecoverableError, c = 0; c < b.length; c++) e = b[c], d(e.value, { componentStack: e.stack, digest: e.digest });
        if (Pi) throw Pi = false, a = Qi, Qi = null, a;
        0 !== (yk & 1) && 0 !== a.tag && Ik();
        f = a.pendingLanes;
        0 !== (f & 1) ? a === Ak ? zk++ : (zk = 0, Ak = a) : zk = 0;
        jg();
        return null;
      }
      function Ik() {
        if (null !== xk) {
          var a = Dc(yk), b = pk.transition, c = C;
          try {
            pk.transition = null;
            C = 16 > a ? 16 : a;
            if (null === xk) var d = false;
            else {
              a = xk;
              xk = null;
              yk = 0;
              if (0 !== (K & 6)) throw Error(p(331));
              var e = K;
              K |= 4;
              for (V = a.current; null !== V; ) {
                var f = V, g = f.child;
                if (0 !== (V.flags & 16)) {
                  var h = f.deletions;
                  if (null !== h) {
                    for (var k = 0; k < h.length; k++) {
                      var l = h[k];
                      for (V = l; null !== V; ) {
                        var m = V;
                        switch (m.tag) {
                          case 0:
                          case 11:
                          case 15:
                            Qj(8, m, f);
                        }
                        var q = m.child;
                        if (null !== q) q.return = m, V = q;
                        else for (; null !== V; ) {
                          m = V;
                          var r = m.sibling, y = m.return;
                          Tj(m);
                          if (m === l) {
                            V = null;
                            break;
                          }
                          if (null !== r) {
                            r.return = y;
                            V = r;
                            break;
                          }
                          V = y;
                        }
                      }
                    }
                    var n = f.alternate;
                    if (null !== n) {
                      var t = n.child;
                      if (null !== t) {
                        n.child = null;
                        do {
                          var J = t.sibling;
                          t.sibling = null;
                          t = J;
                        } while (null !== t);
                      }
                    }
                    V = f;
                  }
                }
                if (0 !== (f.subtreeFlags & 2064) && null !== g) g.return = f, V = g;
                else b: for (; null !== V; ) {
                  f = V;
                  if (0 !== (f.flags & 2048)) switch (f.tag) {
                    case 0:
                    case 11:
                    case 15:
                      Qj(9, f, f.return);
                  }
                  var x = f.sibling;
                  if (null !== x) {
                    x.return = f.return;
                    V = x;
                    break b;
                  }
                  V = f.return;
                }
              }
              var w = a.current;
              for (V = w; null !== V; ) {
                g = V;
                var u = g.child;
                if (0 !== (g.subtreeFlags & 2064) && null !== u) u.return = g, V = u;
                else b: for (g = w; null !== V; ) {
                  h = V;
                  if (0 !== (h.flags & 2048)) try {
                    switch (h.tag) {
                      case 0:
                      case 11:
                      case 15:
                        Rj(9, h);
                    }
                  } catch (na) {
                    W(h, h.return, na);
                  }
                  if (h === g) {
                    V = null;
                    break b;
                  }
                  var F = h.sibling;
                  if (null !== F) {
                    F.return = h.return;
                    V = F;
                    break b;
                  }
                  V = h.return;
                }
              }
              K = e;
              jg();
              if (lc && "function" === typeof lc.onPostCommitFiberRoot) try {
                lc.onPostCommitFiberRoot(kc, a);
              } catch (na) {
              }
              d = true;
            }
            return d;
          } finally {
            C = c, pk.transition = b;
          }
        }
        return false;
      }
      function Yk(a, b, c) {
        b = Ki(c, b);
        b = Oi(a, b, 1);
        a = dh(a, b, 1);
        b = L();
        null !== a && (Ac(a, 1, b), Ek(a, b));
      }
      function W(a, b, c) {
        if (3 === a.tag) Yk(a, a, c);
        else for (; null !== b; ) {
          if (3 === b.tag) {
            Yk(b, a, c);
            break;
          } else if (1 === b.tag) {
            var d = b.stateNode;
            if ("function" === typeof b.type.getDerivedStateFromError || "function" === typeof d.componentDidCatch && (null === Si || !Si.has(d))) {
              a = Ki(c, a);
              a = Ri(b, a, 1);
              b = dh(b, a, 1);
              a = L();
              null !== b && (Ac(b, 1, a), Ek(b, a));
              break;
            }
          }
          b = b.return;
        }
      }
      function Ui(a, b, c) {
        var d = a.pingCache;
        null !== d && d.delete(b);
        b = L();
        a.pingedLanes |= a.suspendedLanes & c;
        R === a && (Z & c) === c && (4 === T || 3 === T && (Z & 130023424) === Z && 500 > B() - gk ? Lk(a, 0) : sk |= c);
        Ek(a, b);
      }
      function Zk(a, b) {
        0 === b && (0 === (a.mode & 1) ? b = 1 : (b = sc, sc <<= 1, 0 === (sc & 130023424) && (sc = 4194304)));
        var c = L();
        a = Zg(a, b);
        null !== a && (Ac(a, b, c), Ek(a, c));
      }
      function vj(a) {
        var b = a.memoizedState, c = 0;
        null !== b && (c = b.retryLane);
        Zk(a, c);
      }
      function ck(a, b) {
        var c = 0;
        switch (a.tag) {
          case 13:
            var d = a.stateNode;
            var e = a.memoizedState;
            null !== e && (c = e.retryLane);
            break;
          case 19:
            d = a.stateNode;
            break;
          default:
            throw Error(p(314));
        }
        null !== d && d.delete(b);
        Zk(a, c);
      }
      var Wk;
      Wk = function(a, b, c) {
        if (null !== a) if (a.memoizedProps !== b.pendingProps || Wf.current) Ug = true;
        else {
          if (0 === (a.lanes & c) && 0 === (b.flags & 128)) return Ug = false, zj(a, b, c);
          Ug = 0 !== (a.flags & 131072) ? true : false;
        }
        else Ug = false, I && 0 !== (b.flags & 1048576) && ug(b, ng, b.index);
        b.lanes = 0;
        switch (b.tag) {
          case 2:
            var d = b.type;
            jj(a, b);
            a = b.pendingProps;
            var e = Yf(b, H.current);
            Tg(b, c);
            e = Xh(null, b, d, a, e, c);
            var f = bi();
            b.flags |= 1;
            "object" === typeof e && null !== e && "function" === typeof e.render && void 0 === e.$$typeof ? (b.tag = 1, b.memoizedState = null, b.updateQueue = null, Zf(d) ? (f = true, cg(b)) : f = false, b.memoizedState = null !== e.state && void 0 !== e.state ? e.state : null, ah(b), e.updater = nh, b.stateNode = e, e._reactInternals = b, rh(b, d, a, c), b = kj(null, b, d, true, f, c)) : (b.tag = 0, I && f && vg(b), Yi(null, b, e, c), b = b.child);
            return b;
          case 16:
            d = b.elementType;
            a: {
              jj(a, b);
              a = b.pendingProps;
              e = d._init;
              d = e(d._payload);
              b.type = d;
              e = b.tag = $k(d);
              a = Lg(d, a);
              switch (e) {
                case 0:
                  b = dj(null, b, d, a, c);
                  break a;
                case 1:
                  b = ij(null, b, d, a, c);
                  break a;
                case 11:
                  b = Zi(null, b, d, a, c);
                  break a;
                case 14:
                  b = aj(null, b, d, Lg(d.type, a), c);
                  break a;
              }
              throw Error(p(
                306,
                d,
                ""
              ));
            }
            return b;
          case 0:
            return d = b.type, e = b.pendingProps, e = b.elementType === d ? e : Lg(d, e), dj(a, b, d, e, c);
          case 1:
            return d = b.type, e = b.pendingProps, e = b.elementType === d ? e : Lg(d, e), ij(a, b, d, e, c);
          case 3:
            a: {
              lj(b);
              if (null === a) throw Error(p(387));
              d = b.pendingProps;
              f = b.memoizedState;
              e = f.element;
              bh(a, b);
              gh(b, d, null, c);
              var g = b.memoizedState;
              d = g.element;
              if (f.isDehydrated) if (f = { element: d, isDehydrated: false, cache: g.cache, pendingSuspenseBoundaries: g.pendingSuspenseBoundaries, transitions: g.transitions }, b.updateQueue.baseState = f, b.memoizedState = f, b.flags & 256) {
                e = Ki(Error(p(423)), b);
                b = mj(a, b, d, c, e);
                break a;
              } else if (d !== e) {
                e = Ki(Error(p(424)), b);
                b = mj(a, b, d, c, e);
                break a;
              } else for (yg = Lf(b.stateNode.containerInfo.firstChild), xg = b, I = true, zg = null, c = Ch(b, null, d, c), b.child = c; c; ) c.flags = c.flags & -3 | 4096, c = c.sibling;
              else {
                Ig();
                if (d === e) {
                  b = $i(a, b, c);
                  break a;
                }
                Yi(a, b, d, c);
              }
              b = b.child;
            }
            return b;
          case 5:
            return Kh(b), null === a && Eg(b), d = b.type, e = b.pendingProps, f = null !== a ? a.memoizedProps : null, g = e.children, Ef(d, e) ? g = null : null !== f && Ef(d, f) && (b.flags |= 32), hj(a, b), Yi(a, b, g, c), b.child;
          case 6:
            return null === a && Eg(b), null;
          case 13:
            return pj(a, b, c);
          case 4:
            return Ih(b, b.stateNode.containerInfo), d = b.pendingProps, null === a ? b.child = Bh(b, null, d, c) : Yi(a, b, d, c), b.child;
          case 11:
            return d = b.type, e = b.pendingProps, e = b.elementType === d ? e : Lg(d, e), Zi(a, b, d, e, c);
          case 7:
            return Yi(a, b, b.pendingProps, c), b.child;
          case 8:
            return Yi(a, b, b.pendingProps.children, c), b.child;
          case 12:
            return Yi(a, b, b.pendingProps.children, c), b.child;
          case 10:
            a: {
              d = b.type._context;
              e = b.pendingProps;
              f = b.memoizedProps;
              g = e.value;
              G(Mg, d._currentValue);
              d._currentValue = g;
              if (null !== f) if (He(f.value, g)) {
                if (f.children === e.children && !Wf.current) {
                  b = $i(a, b, c);
                  break a;
                }
              } else for (f = b.child, null !== f && (f.return = b); null !== f; ) {
                var h = f.dependencies;
                if (null !== h) {
                  g = f.child;
                  for (var k = h.firstContext; null !== k; ) {
                    if (k.context === d) {
                      if (1 === f.tag) {
                        k = ch(-1, c & -c);
                        k.tag = 2;
                        var l = f.updateQueue;
                        if (null !== l) {
                          l = l.shared;
                          var m = l.pending;
                          null === m ? k.next = k : (k.next = m.next, m.next = k);
                          l.pending = k;
                        }
                      }
                      f.lanes |= c;
                      k = f.alternate;
                      null !== k && (k.lanes |= c);
                      Sg(
                        f.return,
                        c,
                        b
                      );
                      h.lanes |= c;
                      break;
                    }
                    k = k.next;
                  }
                } else if (10 === f.tag) g = f.type === b.type ? null : f.child;
                else if (18 === f.tag) {
                  g = f.return;
                  if (null === g) throw Error(p(341));
                  g.lanes |= c;
                  h = g.alternate;
                  null !== h && (h.lanes |= c);
                  Sg(g, c, b);
                  g = f.sibling;
                } else g = f.child;
                if (null !== g) g.return = f;
                else for (g = f; null !== g; ) {
                  if (g === b) {
                    g = null;
                    break;
                  }
                  f = g.sibling;
                  if (null !== f) {
                    f.return = g.return;
                    g = f;
                    break;
                  }
                  g = g.return;
                }
                f = g;
              }
              Yi(a, b, e.children, c);
              b = b.child;
            }
            return b;
          case 9:
            return e = b.type, d = b.pendingProps.children, Tg(b, c), e = Vg(e), d = d(e), b.flags |= 1, Yi(a, b, d, c), b.child;
          case 14:
            return d = b.type, e = Lg(d, b.pendingProps), e = Lg(d.type, e), aj(a, b, d, e, c);
          case 15:
            return cj(a, b, b.type, b.pendingProps, c);
          case 17:
            return d = b.type, e = b.pendingProps, e = b.elementType === d ? e : Lg(d, e), jj(a, b), b.tag = 1, Zf(d) ? (a = true, cg(b)) : a = false, Tg(b, c), ph(b, d, e), rh(b, d, e, c), kj(null, b, d, true, a, c);
          case 19:
            return yj(a, b, c);
          case 22:
            return ej(a, b, c);
        }
        throw Error(p(156, b.tag));
      };
      function Gk(a, b) {
        return ac(a, b);
      }
      function al(a, b, c, d) {
        this.tag = a;
        this.key = c;
        this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null;
        this.index = 0;
        this.ref = null;
        this.pendingProps = b;
        this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null;
        this.mode = d;
        this.subtreeFlags = this.flags = 0;
        this.deletions = null;
        this.childLanes = this.lanes = 0;
        this.alternate = null;
      }
      function Bg(a, b, c, d) {
        return new al(a, b, c, d);
      }
      function bj(a) {
        a = a.prototype;
        return !(!a || !a.isReactComponent);
      }
      function $k(a) {
        if ("function" === typeof a) return bj(a) ? 1 : 0;
        if (void 0 !== a && null !== a) {
          a = a.$$typeof;
          if (a === Da) return 11;
          if (a === Ga) return 14;
        }
        return 2;
      }
      function wh(a, b) {
        var c = a.alternate;
        null === c ? (c = Bg(a.tag, b, a.key, a.mode), c.elementType = a.elementType, c.type = a.type, c.stateNode = a.stateNode, c.alternate = a, a.alternate = c) : (c.pendingProps = b, c.type = a.type, c.flags = 0, c.subtreeFlags = 0, c.deletions = null);
        c.flags = a.flags & 14680064;
        c.childLanes = a.childLanes;
        c.lanes = a.lanes;
        c.child = a.child;
        c.memoizedProps = a.memoizedProps;
        c.memoizedState = a.memoizedState;
        c.updateQueue = a.updateQueue;
        b = a.dependencies;
        c.dependencies = null === b ? null : { lanes: b.lanes, firstContext: b.firstContext };
        c.sibling = a.sibling;
        c.index = a.index;
        c.ref = a.ref;
        return c;
      }
      function yh(a, b, c, d, e, f) {
        var g = 2;
        d = a;
        if ("function" === typeof a) bj(a) && (g = 1);
        else if ("string" === typeof a) g = 5;
        else a: switch (a) {
          case ya:
            return Ah(c.children, e, f, b);
          case za:
            g = 8;
            e |= 8;
            break;
          case Aa:
            return a = Bg(12, c, b, e | 2), a.elementType = Aa, a.lanes = f, a;
          case Ea:
            return a = Bg(13, c, b, e), a.elementType = Ea, a.lanes = f, a;
          case Fa:
            return a = Bg(19, c, b, e), a.elementType = Fa, a.lanes = f, a;
          case Ia:
            return qj(c, e, f, b);
          default:
            if ("object" === typeof a && null !== a) switch (a.$$typeof) {
              case Ba:
                g = 10;
                break a;
              case Ca:
                g = 9;
                break a;
              case Da:
                g = 11;
                break a;
              case Ga:
                g = 14;
                break a;
              case Ha:
                g = 16;
                d = null;
                break a;
            }
            throw Error(p(130, null == a ? a : typeof a, ""));
        }
        b = Bg(g, c, b, e);
        b.elementType = a;
        b.type = d;
        b.lanes = f;
        return b;
      }
      function Ah(a, b, c, d) {
        a = Bg(7, a, d, b);
        a.lanes = c;
        return a;
      }
      function qj(a, b, c, d) {
        a = Bg(22, a, d, b);
        a.elementType = Ia;
        a.lanes = c;
        a.stateNode = { isHidden: false };
        return a;
      }
      function xh(a, b, c) {
        a = Bg(6, a, null, b);
        a.lanes = c;
        return a;
      }
      function zh(a, b, c) {
        b = Bg(4, null !== a.children ? a.children : [], a.key, b);
        b.lanes = c;
        b.stateNode = { containerInfo: a.containerInfo, pendingChildren: null, implementation: a.implementation };
        return b;
      }
      function bl(a, b, c, d, e) {
        this.tag = b;
        this.containerInfo = a;
        this.finishedWork = this.pingCache = this.current = this.pendingChildren = null;
        this.timeoutHandle = -1;
        this.callbackNode = this.pendingContext = this.context = null;
        this.callbackPriority = 0;
        this.eventTimes = zc(0);
        this.expirationTimes = zc(-1);
        this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0;
        this.entanglements = zc(0);
        this.identifierPrefix = d;
        this.onRecoverableError = e;
        this.mutableSourceEagerHydrationData = null;
      }
      function cl(a, b, c, d, e, f, g, h, k) {
        a = new bl(a, b, c, h, k);
        1 === b ? (b = 1, true === f && (b |= 8)) : b = 0;
        f = Bg(3, null, null, b);
        a.current = f;
        f.stateNode = a;
        f.memoizedState = { element: d, isDehydrated: c, cache: null, transitions: null, pendingSuspenseBoundaries: null };
        ah(f);
        return a;
      }
      function dl(a, b, c) {
        var d = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : null;
        return { $$typeof: wa, key: null == d ? null : "" + d, children: a, containerInfo: b, implementation: c };
      }
      function el(a) {
        if (!a) return Vf;
        a = a._reactInternals;
        a: {
          if (Vb(a) !== a || 1 !== a.tag) throw Error(p(170));
          var b = a;
          do {
            switch (b.tag) {
              case 3:
                b = b.stateNode.context;
                break a;
              case 1:
                if (Zf(b.type)) {
                  b = b.stateNode.__reactInternalMemoizedMergedChildContext;
                  break a;
                }
            }
            b = b.return;
          } while (null !== b);
          throw Error(p(171));
        }
        if (1 === a.tag) {
          var c = a.type;
          if (Zf(c)) return bg(a, c, b);
        }
        return b;
      }
      function fl(a, b, c, d, e, f, g, h, k) {
        a = cl(c, d, true, a, e, f, g, h, k);
        a.context = el(null);
        c = a.current;
        d = L();
        e = lh(c);
        f = ch(d, e);
        f.callback = void 0 !== b && null !== b ? b : null;
        dh(c, f, e);
        a.current.lanes = e;
        Ac(a, e, d);
        Ek(a, d);
        return a;
      }
      function gl(a, b, c, d) {
        var e = b.current, f = L(), g = lh(e);
        c = el(c);
        null === b.context ? b.context = c : b.pendingContext = c;
        b = ch(f, g);
        b.payload = { element: a };
        d = void 0 === d ? null : d;
        null !== d && (b.callback = d);
        a = dh(e, b, g);
        null !== a && (mh(a, e, g, f), eh(a, e, g));
        return g;
      }
      function hl(a) {
        a = a.current;
        if (!a.child) return null;
        switch (a.child.tag) {
          case 5:
            return a.child.stateNode;
          default:
            return a.child.stateNode;
        }
      }
      function il(a, b) {
        a = a.memoizedState;
        if (null !== a && null !== a.dehydrated) {
          var c = a.retryLane;
          a.retryLane = 0 !== c && c < b ? c : b;
        }
      }
      function jl(a, b) {
        il(a, b);
        (a = a.alternate) && il(a, b);
      }
      function kl() {
        return null;
      }
      var ll = "function" === typeof reportError ? reportError : function(a) {
        console.error(a);
      };
      function ml(a) {
        this._internalRoot = a;
      }
      nl.prototype.render = ml.prototype.render = function(a) {
        var b = this._internalRoot;
        if (null === b) throw Error(p(409));
        gl(a, b, null, null);
      };
      nl.prototype.unmount = ml.prototype.unmount = function() {
        var a = this._internalRoot;
        if (null !== a) {
          this._internalRoot = null;
          var b = a.containerInfo;
          Sk(function() {
            gl(null, a, null, null);
          });
          b[uf] = null;
        }
      };
      function nl(a) {
        this._internalRoot = a;
      }
      nl.prototype.unstable_scheduleHydration = function(a) {
        if (a) {
          var b = Hc();
          a = { blockedOn: null, target: a, priority: b };
          for (var c = 0; c < Qc.length && 0 !== b && b < Qc[c].priority; c++) ;
          Qc.splice(c, 0, a);
          0 === c && Vc(a);
        }
      };
      function ol(a) {
        return !(!a || 1 !== a.nodeType && 9 !== a.nodeType && 11 !== a.nodeType);
      }
      function pl(a) {
        return !(!a || 1 !== a.nodeType && 9 !== a.nodeType && 11 !== a.nodeType && (8 !== a.nodeType || " react-mount-point-unstable " !== a.nodeValue));
      }
      function ql() {
      }
      function rl(a, b, c, d, e) {
        if (e) {
          if ("function" === typeof d) {
            var f = d;
            d = function() {
              var a2 = hl(g);
              f.call(a2);
            };
          }
          var g = fl(b, d, a, 0, null, false, false, "", ql);
          a._reactRootContainer = g;
          a[uf] = g.current;
          sf(8 === a.nodeType ? a.parentNode : a);
          Sk();
          return g;
        }
        for (; e = a.lastChild; ) a.removeChild(e);
        if ("function" === typeof d) {
          var h = d;
          d = function() {
            var a2 = hl(k);
            h.call(a2);
          };
        }
        var k = cl(a, 0, false, null, null, false, false, "", ql);
        a._reactRootContainer = k;
        a[uf] = k.current;
        sf(8 === a.nodeType ? a.parentNode : a);
        Sk(function() {
          gl(b, k, c, d);
        });
        return k;
      }
      function sl(a, b, c, d, e) {
        var f = c._reactRootContainer;
        if (f) {
          var g = f;
          if ("function" === typeof e) {
            var h = e;
            e = function() {
              var a2 = hl(g);
              h.call(a2);
            };
          }
          gl(b, g, a, e);
        } else g = rl(c, b, a, e, d);
        return hl(g);
      }
      Ec = function(a) {
        switch (a.tag) {
          case 3:
            var b = a.stateNode;
            if (b.current.memoizedState.isDehydrated) {
              var c = tc(b.pendingLanes);
              0 !== c && (Cc(b, c | 1), Ek(b, B()), 0 === (K & 6) && (Hj = B() + 500, jg()));
            }
            break;
          case 13:
            Sk(function() {
              var b2 = Zg(a, 1);
              if (null !== b2) {
                var c2 = L();
                mh(b2, a, 1, c2);
              }
            }), jl(a, 1);
        }
      };
      Fc = function(a) {
        if (13 === a.tag) {
          var b = Zg(a, 134217728);
          if (null !== b) {
            var c = L();
            mh(b, a, 134217728, c);
          }
          jl(a, 134217728);
        }
      };
      Gc = function(a) {
        if (13 === a.tag) {
          var b = lh(a), c = Zg(a, b);
          if (null !== c) {
            var d = L();
            mh(c, a, b, d);
          }
          jl(a, b);
        }
      };
      Hc = function() {
        return C;
      };
      Ic = function(a, b) {
        var c = C;
        try {
          return C = a, b();
        } finally {
          C = c;
        }
      };
      yb = function(a, b, c) {
        switch (b) {
          case "input":
            bb(a, c);
            b = c.name;
            if ("radio" === c.type && null != b) {
              for (c = a; c.parentNode; ) c = c.parentNode;
              c = c.querySelectorAll("input[name=" + JSON.stringify("" + b) + '][type="radio"]');
              for (b = 0; b < c.length; b++) {
                var d = c[b];
                if (d !== a && d.form === a.form) {
                  var e = Db(d);
                  if (!e) throw Error(p(90));
                  Wa(d);
                  bb(d, e);
                }
              }
            }
            break;
          case "textarea":
            ib(a, c);
            break;
          case "select":
            b = c.value, null != b && fb(a, !!c.multiple, b, false);
        }
      };
      Gb = Rk;
      Hb = Sk;
      var tl = { usingClientEntryPoint: false, Events: [Cb, ue, Db, Eb, Fb, Rk] };
      var ul = { findFiberByHostInstance: Wc, bundleType: 0, version: "18.2.0", rendererPackageName: "react-dom" };
      var vl = { bundleType: ul.bundleType, version: ul.version, rendererPackageName: ul.rendererPackageName, rendererConfig: ul.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: ua.ReactCurrentDispatcher, findHostInstanceByFiber: function(a) {
        a = Zb(a);
        return null === a ? null : a.stateNode;
      }, findFiberByHostInstance: ul.findFiberByHostInstance || kl, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.2.0-next-9e3b772b8-20220608" };
      if ("undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__) {
        wl = __REACT_DEVTOOLS_GLOBAL_HOOK__;
        if (!wl.isDisabled && wl.supportsFiber) try {
          kc = wl.inject(vl), lc = wl;
        } catch (a) {
        }
      }
      var wl;
      exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = tl;
      exports.createPortal = function(a, b) {
        var c = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : null;
        if (!ol(b)) throw Error(p(200));
        return dl(a, b, null, c);
      };
      exports.createRoot = function(a, b) {
        if (!ol(a)) throw Error(p(299));
        var c = false, d = "", e = ll;
        null !== b && void 0 !== b && (true === b.unstable_strictMode && (c = true), void 0 !== b.identifierPrefix && (d = b.identifierPrefix), void 0 !== b.onRecoverableError && (e = b.onRecoverableError));
        b = cl(a, 1, false, null, null, c, false, d, e);
        a[uf] = b.current;
        sf(8 === a.nodeType ? a.parentNode : a);
        return new ml(b);
      };
      exports.findDOMNode = function(a) {
        if (null == a) return null;
        if (1 === a.nodeType) return a;
        var b = a._reactInternals;
        if (void 0 === b) {
          if ("function" === typeof a.render) throw Error(p(188));
          a = Object.keys(a).join(",");
          throw Error(p(268, a));
        }
        a = Zb(b);
        a = null === a ? null : a.stateNode;
        return a;
      };
      exports.flushSync = function(a) {
        return Sk(a);
      };
      exports.hydrate = function(a, b, c) {
        if (!pl(b)) throw Error(p(200));
        return sl(null, a, b, true, c);
      };
      exports.hydrateRoot = function(a, b, c) {
        if (!ol(a)) throw Error(p(405));
        var d = null != c && c.hydratedSources || null, e = false, f = "", g = ll;
        null !== c && void 0 !== c && (true === c.unstable_strictMode && (e = true), void 0 !== c.identifierPrefix && (f = c.identifierPrefix), void 0 !== c.onRecoverableError && (g = c.onRecoverableError));
        b = fl(b, null, a, 1, null != c ? c : null, e, false, f, g);
        a[uf] = b.current;
        sf(a);
        if (d) for (a = 0; a < d.length; a++) c = d[a], e = c._getVersion, e = e(c._source), null == b.mutableSourceEagerHydrationData ? b.mutableSourceEagerHydrationData = [c, e] : b.mutableSourceEagerHydrationData.push(
          c,
          e
        );
        return new nl(b);
      };
      exports.render = function(a, b, c) {
        if (!pl(b)) throw Error(p(200));
        return sl(null, a, b, false, c);
      };
      exports.unmountComponentAtNode = function(a) {
        if (!pl(a)) throw Error(p(40));
        return a._reactRootContainer ? (Sk(function() {
          sl(null, null, a, false, function() {
            a._reactRootContainer = null;
            a[uf] = null;
          });
        }), true) : false;
      };
      exports.unstable_batchedUpdates = Rk;
      exports.unstable_renderSubtreeIntoContainer = function(a, b, c, d) {
        if (!pl(c)) throw Error(p(200));
        if (null == a || void 0 === a._reactInternals) throw Error(p(38));
        return sl(a, b, c, false, d);
      };
      exports.version = "18.2.0-next-9e3b772b8-20220608";
    }
  });

  // node_modules/react-dom/index.js
  var require_react_dom = __commonJS({
    "node_modules/react-dom/index.js"(exports, module) {
      "use strict";
      function checkDCE() {
        if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") {
          return;
        }
        if (false) {
          throw new Error("^_^");
        }
        try {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
        } catch (err) {
          console.error(err);
        }
      }
      if (true) {
        checkDCE();
        module.exports = require_react_dom_production_min();
      } else {
        module.exports = null;
      }
    }
  });

  // node_modules/react-dom/client.js
  var require_client = __commonJS({
    "node_modules/react-dom/client.js"(exports) {
      "use strict";
      var m = require_react_dom();
      if (true) {
        exports.createRoot = m.createRoot;
        exports.hydrateRoot = m.hydrateRoot;
      } else {
        i = m.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
        exports.createRoot = function(c, o) {
          i.usingClientEntryPoint = true;
          try {
            return m.createRoot(c, o);
          } finally {
            i.usingClientEntryPoint = false;
          }
        };
        exports.hydrateRoot = function(c, h, o) {
          i.usingClientEntryPoint = true;
          try {
            return m.hydrateRoot(c, h, o);
          } finally {
            i.usingClientEntryPoint = false;
          }
        };
      }
      var i;
    }
  });

  // node_modules/@supabase/node-fetch/browser.js
  var browser_exports = {};
  __export(browser_exports, {
    Headers: () => Headers2,
    Request: () => Request,
    Response: () => Response2,
    default: () => browser_default,
    fetch: () => fetch2
  });
  var getGlobal, globalObject, fetch2, browser_default, Headers2, Request, Response2;
  var init_browser = __esm({
    "node_modules/@supabase/node-fetch/browser.js"() {
      "use strict";
      getGlobal = function() {
        if (typeof self !== "undefined") {
          return self;
        }
        if (typeof window !== "undefined") {
          return window;
        }
        if (typeof global !== "undefined") {
          return global;
        }
        throw new Error("unable to locate global object");
      };
      globalObject = getGlobal();
      fetch2 = globalObject.fetch;
      browser_default = globalObject.fetch.bind(globalObject);
      Headers2 = globalObject.Headers;
      Request = globalObject.Request;
      Response2 = globalObject.Response;
    }
  });

  // node_modules/@supabase/postgrest-js/dist/cjs/PostgrestError.js
  var require_PostgrestError = __commonJS({
    "node_modules/@supabase/postgrest-js/dist/cjs/PostgrestError.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var PostgrestError2 = class extends Error {
        constructor(context) {
          super(context.message);
          this.name = "PostgrestError";
          this.details = context.details;
          this.hint = context.hint;
          this.code = context.code;
        }
      };
      exports.default = PostgrestError2;
    }
  });

  // node_modules/@supabase/postgrest-js/dist/cjs/PostgrestBuilder.js
  var require_PostgrestBuilder = __commonJS({
    "node_modules/@supabase/postgrest-js/dist/cjs/PostgrestBuilder.js"(exports) {
      "use strict";
      var __importDefault = exports && exports.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      var node_fetch_1 = __importDefault((init_browser(), __toCommonJS(browser_exports)));
      var PostgrestError_1 = __importDefault(require_PostgrestError());
      var PostgrestBuilder2 = class {
        constructor(builder) {
          this.shouldThrowOnError = false;
          this.method = builder.method;
          this.url = builder.url;
          this.headers = builder.headers;
          this.schema = builder.schema;
          this.body = builder.body;
          this.shouldThrowOnError = builder.shouldThrowOnError;
          this.signal = builder.signal;
          this.isMaybeSingle = builder.isMaybeSingle;
          if (builder.fetch) {
            this.fetch = builder.fetch;
          } else if (typeof fetch === "undefined") {
            this.fetch = node_fetch_1.default;
          } else {
            this.fetch = fetch;
          }
        }
        /**
         * If there's an error with the query, throwOnError will reject the promise by
         * throwing the error instead of returning it as part of a successful response.
         *
         * {@link https://github.com/supabase/supabase-js/issues/92}
         */
        throwOnError() {
          this.shouldThrowOnError = true;
          return this;
        }
        /**
         * Set an HTTP header for the request.
         */
        setHeader(name, value) {
          this.headers = Object.assign({}, this.headers);
          this.headers[name] = value;
          return this;
        }
        then(onfulfilled, onrejected) {
          if (this.schema === void 0) {
          } else if (["GET", "HEAD"].includes(this.method)) {
            this.headers["Accept-Profile"] = this.schema;
          } else {
            this.headers["Content-Profile"] = this.schema;
          }
          if (this.method !== "GET" && this.method !== "HEAD") {
            this.headers["Content-Type"] = "application/json";
          }
          const _fetch = this.fetch;
          let res = _fetch(this.url.toString(), {
            method: this.method,
            headers: this.headers,
            body: JSON.stringify(this.body),
            signal: this.signal
          }).then(async (res2) => {
            var _a, _b, _c;
            let error = null;
            let data = null;
            let count = null;
            let status = res2.status;
            let statusText = res2.statusText;
            if (res2.ok) {
              if (this.method !== "HEAD") {
                const body = await res2.text();
                if (body === "") {
                } else if (this.headers["Accept"] === "text/csv") {
                  data = body;
                } else if (this.headers["Accept"] && this.headers["Accept"].includes("application/vnd.pgrst.plan+text")) {
                  data = body;
                } else {
                  data = JSON.parse(body);
                }
              }
              const countHeader = (_a = this.headers["Prefer"]) === null || _a === void 0 ? void 0 : _a.match(/count=(exact|planned|estimated)/);
              const contentRange = (_b = res2.headers.get("content-range")) === null || _b === void 0 ? void 0 : _b.split("/");
              if (countHeader && contentRange && contentRange.length > 1) {
                count = parseInt(contentRange[1]);
              }
              if (this.isMaybeSingle && this.method === "GET" && Array.isArray(data)) {
                if (data.length > 1) {
                  error = {
                    // https://github.com/PostgREST/postgrest/blob/a867d79c42419af16c18c3fb019eba8df992626f/src/PostgREST/Error.hs#L553
                    code: "PGRST116",
                    details: `Results contain ${data.length} rows, application/vnd.pgrst.object+json requires 1 row`,
                    hint: null,
                    message: "JSON object requested, multiple (or no) rows returned"
                  };
                  data = null;
                  count = null;
                  status = 406;
                  statusText = "Not Acceptable";
                } else if (data.length === 1) {
                  data = data[0];
                } else {
                  data = null;
                }
              }
            } else {
              const body = await res2.text();
              try {
                error = JSON.parse(body);
                if (Array.isArray(error) && res2.status === 404) {
                  data = [];
                  error = null;
                  status = 200;
                  statusText = "OK";
                }
              } catch (_d) {
                if (res2.status === 404 && body === "") {
                  status = 204;
                  statusText = "No Content";
                } else {
                  error = {
                    message: body
                  };
                }
              }
              if (error && this.isMaybeSingle && ((_c = error === null || error === void 0 ? void 0 : error.details) === null || _c === void 0 ? void 0 : _c.includes("0 rows"))) {
                error = null;
                status = 200;
                statusText = "OK";
              }
              if (error && this.shouldThrowOnError) {
                throw new PostgrestError_1.default(error);
              }
            }
            const postgrestResponse = {
              error,
              data,
              count,
              status,
              statusText
            };
            return postgrestResponse;
          });
          if (!this.shouldThrowOnError) {
            res = res.catch((fetchError) => {
              var _a, _b, _c;
              return {
                error: {
                  message: `${(_a = fetchError === null || fetchError === void 0 ? void 0 : fetchError.name) !== null && _a !== void 0 ? _a : "FetchError"}: ${fetchError === null || fetchError === void 0 ? void 0 : fetchError.message}`,
                  details: `${(_b = fetchError === null || fetchError === void 0 ? void 0 : fetchError.stack) !== null && _b !== void 0 ? _b : ""}`,
                  hint: "",
                  code: `${(_c = fetchError === null || fetchError === void 0 ? void 0 : fetchError.code) !== null && _c !== void 0 ? _c : ""}`
                },
                data: null,
                count: null,
                status: 0,
                statusText: ""
              };
            });
          }
          return res.then(onfulfilled, onrejected);
        }
        /**
         * Override the type of the returned `data`.
         *
         * @typeParam NewResult - The new result type to override with
         * @deprecated Use overrideTypes<yourType, { merge: false }>() method at the end of your call chain instead
         */
        returns() {
          return this;
        }
        /**
         * Override the type of the returned `data` field in the response.
         *
         * @typeParam NewResult - The new type to cast the response data to
         * @typeParam Options - Optional type configuration (defaults to { merge: true })
         * @typeParam Options.merge - When true, merges the new type with existing return type. When false, replaces the existing types entirely (defaults to true)
         * @example
         * ```typescript
         * // Merge with existing types (default behavior)
         * const query = supabase
         *   .from('users')
         *   .select()
         *   .overrideTypes<{ custom_field: string }>()
         *
         * // Replace existing types completely
         * const replaceQuery = supabase
         *   .from('users')
         *   .select()
         *   .overrideTypes<{ id: number; name: string }, { merge: false }>()
         * ```
         * @returns A PostgrestBuilder instance with the new type
         */
        overrideTypes() {
          return this;
        }
      };
      exports.default = PostgrestBuilder2;
    }
  });

  // node_modules/@supabase/postgrest-js/dist/cjs/PostgrestTransformBuilder.js
  var require_PostgrestTransformBuilder = __commonJS({
    "node_modules/@supabase/postgrest-js/dist/cjs/PostgrestTransformBuilder.js"(exports) {
      "use strict";
      var __importDefault = exports && exports.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      var PostgrestBuilder_1 = __importDefault(require_PostgrestBuilder());
      var PostgrestTransformBuilder2 = class extends PostgrestBuilder_1.default {
        /**
         * Perform a SELECT on the query result.
         *
         * By default, `.insert()`, `.update()`, `.upsert()`, and `.delete()` do not
         * return modified rows. By calling this method, modified rows are returned in
         * `data`.
         *
         * @param columns - The columns to retrieve, separated by commas
         */
        select(columns) {
          let quoted = false;
          const cleanedColumns = (columns !== null && columns !== void 0 ? columns : "*").split("").map((c) => {
            if (/\s/.test(c) && !quoted) {
              return "";
            }
            if (c === '"') {
              quoted = !quoted;
            }
            return c;
          }).join("");
          this.url.searchParams.set("select", cleanedColumns);
          if (this.headers["Prefer"]) {
            this.headers["Prefer"] += ",";
          }
          this.headers["Prefer"] += "return=representation";
          return this;
        }
        /**
         * Order the query result by `column`.
         *
         * You can call this method multiple times to order by multiple columns.
         *
         * You can order referenced tables, but it only affects the ordering of the
         * parent table if you use `!inner` in the query.
         *
         * @param column - The column to order by
         * @param options - Named parameters
         * @param options.ascending - If `true`, the result will be in ascending order
         * @param options.nullsFirst - If `true`, `null`s appear first. If `false`,
         * `null`s appear last.
         * @param options.referencedTable - Set this to order a referenced table by
         * its columns
         * @param options.foreignTable - Deprecated, use `options.referencedTable`
         * instead
         */
        order(column, { ascending = true, nullsFirst, foreignTable, referencedTable = foreignTable } = {}) {
          const key = referencedTable ? `${referencedTable}.order` : "order";
          const existingOrder = this.url.searchParams.get(key);
          this.url.searchParams.set(key, `${existingOrder ? `${existingOrder},` : ""}${column}.${ascending ? "asc" : "desc"}${nullsFirst === void 0 ? "" : nullsFirst ? ".nullsfirst" : ".nullslast"}`);
          return this;
        }
        /**
         * Limit the query result by `count`.
         *
         * @param count - The maximum number of rows to return
         * @param options - Named parameters
         * @param options.referencedTable - Set this to limit rows of referenced
         * tables instead of the parent table
         * @param options.foreignTable - Deprecated, use `options.referencedTable`
         * instead
         */
        limit(count, { foreignTable, referencedTable = foreignTable } = {}) {
          const key = typeof referencedTable === "undefined" ? "limit" : `${referencedTable}.limit`;
          this.url.searchParams.set(key, `${count}`);
          return this;
        }
        /**
         * Limit the query result by starting at an offset `from` and ending at the offset `to`.
         * Only records within this range are returned.
         * This respects the query order and if there is no order clause the range could behave unexpectedly.
         * The `from` and `to` values are 0-based and inclusive: `range(1, 3)` will include the second, third
         * and fourth rows of the query.
         *
         * @param from - The starting index from which to limit the result
         * @param to - The last index to which to limit the result
         * @param options - Named parameters
         * @param options.referencedTable - Set this to limit rows of referenced
         * tables instead of the parent table
         * @param options.foreignTable - Deprecated, use `options.referencedTable`
         * instead
         */
        range(from, to, { foreignTable, referencedTable = foreignTable } = {}) {
          const keyOffset = typeof referencedTable === "undefined" ? "offset" : `${referencedTable}.offset`;
          const keyLimit = typeof referencedTable === "undefined" ? "limit" : `${referencedTable}.limit`;
          this.url.searchParams.set(keyOffset, `${from}`);
          this.url.searchParams.set(keyLimit, `${to - from + 1}`);
          return this;
        }
        /**
         * Set the AbortSignal for the fetch request.
         *
         * @param signal - The AbortSignal to use for the fetch request
         */
        abortSignal(signal) {
          this.signal = signal;
          return this;
        }
        /**
         * Return `data` as a single object instead of an array of objects.
         *
         * Query result must be one row (e.g. using `.limit(1)`), otherwise this
         * returns an error.
         */
        single() {
          this.headers["Accept"] = "application/vnd.pgrst.object+json";
          return this;
        }
        /**
         * Return `data` as a single object instead of an array of objects.
         *
         * Query result must be zero or one row (e.g. using `.limit(1)`), otherwise
         * this returns an error.
         */
        maybeSingle() {
          if (this.method === "GET") {
            this.headers["Accept"] = "application/json";
          } else {
            this.headers["Accept"] = "application/vnd.pgrst.object+json";
          }
          this.isMaybeSingle = true;
          return this;
        }
        /**
         * Return `data` as a string in CSV format.
         */
        csv() {
          this.headers["Accept"] = "text/csv";
          return this;
        }
        /**
         * Return `data` as an object in [GeoJSON](https://geojson.org) format.
         */
        geojson() {
          this.headers["Accept"] = "application/geo+json";
          return this;
        }
        /**
         * Return `data` as the EXPLAIN plan for the query.
         *
         * You need to enable the
         * [db_plan_enabled](https://supabase.com/docs/guides/database/debugging-performance#enabling-explain)
         * setting before using this method.
         *
         * @param options - Named parameters
         *
         * @param options.analyze - If `true`, the query will be executed and the
         * actual run time will be returned
         *
         * @param options.verbose - If `true`, the query identifier will be returned
         * and `data` will include the output columns of the query
         *
         * @param options.settings - If `true`, include information on configuration
         * parameters that affect query planning
         *
         * @param options.buffers - If `true`, include information on buffer usage
         *
         * @param options.wal - If `true`, include information on WAL record generation
         *
         * @param options.format - The format of the output, can be `"text"` (default)
         * or `"json"`
         */
        explain({ analyze = false, verbose = false, settings = false, buffers = false, wal = false, format = "text" } = {}) {
          var _a;
          const options = [
            analyze ? "analyze" : null,
            verbose ? "verbose" : null,
            settings ? "settings" : null,
            buffers ? "buffers" : null,
            wal ? "wal" : null
          ].filter(Boolean).join("|");
          const forMediatype = (_a = this.headers["Accept"]) !== null && _a !== void 0 ? _a : "application/json";
          this.headers["Accept"] = `application/vnd.pgrst.plan+${format}; for="${forMediatype}"; options=${options};`;
          if (format === "json")
            return this;
          else
            return this;
        }
        /**
         * Rollback the query.
         *
         * `data` will still be returned, but the query is not committed.
         */
        rollback() {
          var _a;
          if (((_a = this.headers["Prefer"]) !== null && _a !== void 0 ? _a : "").trim().length > 0) {
            this.headers["Prefer"] += ",tx=rollback";
          } else {
            this.headers["Prefer"] = "tx=rollback";
          }
          return this;
        }
        /**
         * Override the type of the returned `data`.
         *
         * @typeParam NewResult - The new result type to override with
         * @deprecated Use overrideTypes<yourType, { merge: false }>() method at the end of your call chain instead
         */
        returns() {
          return this;
        }
      };
      exports.default = PostgrestTransformBuilder2;
    }
  });

  // node_modules/@supabase/postgrest-js/dist/cjs/PostgrestFilterBuilder.js
  var require_PostgrestFilterBuilder = __commonJS({
    "node_modules/@supabase/postgrest-js/dist/cjs/PostgrestFilterBuilder.js"(exports) {
      "use strict";
      var __importDefault = exports && exports.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      var PostgrestTransformBuilder_1 = __importDefault(require_PostgrestTransformBuilder());
      var PostgrestFilterBuilder2 = class extends PostgrestTransformBuilder_1.default {
        /**
         * Match only rows where `column` is equal to `value`.
         *
         * To check if the value of `column` is NULL, you should use `.is()` instead.
         *
         * @param column - The column to filter on
         * @param value - The value to filter with
         */
        eq(column, value) {
          this.url.searchParams.append(column, `eq.${value}`);
          return this;
        }
        /**
         * Match only rows where `column` is not equal to `value`.
         *
         * @param column - The column to filter on
         * @param value - The value to filter with
         */
        neq(column, value) {
          this.url.searchParams.append(column, `neq.${value}`);
          return this;
        }
        /**
         * Match only rows where `column` is greater than `value`.
         *
         * @param column - The column to filter on
         * @param value - The value to filter with
         */
        gt(column, value) {
          this.url.searchParams.append(column, `gt.${value}`);
          return this;
        }
        /**
         * Match only rows where `column` is greater than or equal to `value`.
         *
         * @param column - The column to filter on
         * @param value - The value to filter with
         */
        gte(column, value) {
          this.url.searchParams.append(column, `gte.${value}`);
          return this;
        }
        /**
         * Match only rows where `column` is less than `value`.
         *
         * @param column - The column to filter on
         * @param value - The value to filter with
         */
        lt(column, value) {
          this.url.searchParams.append(column, `lt.${value}`);
          return this;
        }
        /**
         * Match only rows where `column` is less than or equal to `value`.
         *
         * @param column - The column to filter on
         * @param value - The value to filter with
         */
        lte(column, value) {
          this.url.searchParams.append(column, `lte.${value}`);
          return this;
        }
        /**
         * Match only rows where `column` matches `pattern` case-sensitively.
         *
         * @param column - The column to filter on
         * @param pattern - The pattern to match with
         */
        like(column, pattern) {
          this.url.searchParams.append(column, `like.${pattern}`);
          return this;
        }
        /**
         * Match only rows where `column` matches all of `patterns` case-sensitively.
         *
         * @param column - The column to filter on
         * @param patterns - The patterns to match with
         */
        likeAllOf(column, patterns) {
          this.url.searchParams.append(column, `like(all).{${patterns.join(",")}}`);
          return this;
        }
        /**
         * Match only rows where `column` matches any of `patterns` case-sensitively.
         *
         * @param column - The column to filter on
         * @param patterns - The patterns to match with
         */
        likeAnyOf(column, patterns) {
          this.url.searchParams.append(column, `like(any).{${patterns.join(",")}}`);
          return this;
        }
        /**
         * Match only rows where `column` matches `pattern` case-insensitively.
         *
         * @param column - The column to filter on
         * @param pattern - The pattern to match with
         */
        ilike(column, pattern) {
          this.url.searchParams.append(column, `ilike.${pattern}`);
          return this;
        }
        /**
         * Match only rows where `column` matches all of `patterns` case-insensitively.
         *
         * @param column - The column to filter on
         * @param patterns - The patterns to match with
         */
        ilikeAllOf(column, patterns) {
          this.url.searchParams.append(column, `ilike(all).{${patterns.join(",")}}`);
          return this;
        }
        /**
         * Match only rows where `column` matches any of `patterns` case-insensitively.
         *
         * @param column - The column to filter on
         * @param patterns - The patterns to match with
         */
        ilikeAnyOf(column, patterns) {
          this.url.searchParams.append(column, `ilike(any).{${patterns.join(",")}}`);
          return this;
        }
        /**
         * Match only rows where `column` IS `value`.
         *
         * For non-boolean columns, this is only relevant for checking if the value of
         * `column` is NULL by setting `value` to `null`.
         *
         * For boolean columns, you can also set `value` to `true` or `false` and it
         * will behave the same way as `.eq()`.
         *
         * @param column - The column to filter on
         * @param value - The value to filter with
         */
        is(column, value) {
          this.url.searchParams.append(column, `is.${value}`);
          return this;
        }
        /**
         * Match only rows where `column` is included in the `values` array.
         *
         * @param column - The column to filter on
         * @param values - The values array to filter with
         */
        in(column, values) {
          const cleanedValues = Array.from(new Set(values)).map((s) => {
            if (typeof s === "string" && new RegExp("[,()]").test(s))
              return `"${s}"`;
            else
              return `${s}`;
          }).join(",");
          this.url.searchParams.append(column, `in.(${cleanedValues})`);
          return this;
        }
        /**
         * Only relevant for jsonb, array, and range columns. Match only rows where
         * `column` contains every element appearing in `value`.
         *
         * @param column - The jsonb, array, or range column to filter on
         * @param value - The jsonb, array, or range value to filter with
         */
        contains(column, value) {
          if (typeof value === "string") {
            this.url.searchParams.append(column, `cs.${value}`);
          } else if (Array.isArray(value)) {
            this.url.searchParams.append(column, `cs.{${value.join(",")}}`);
          } else {
            this.url.searchParams.append(column, `cs.${JSON.stringify(value)}`);
          }
          return this;
        }
        /**
         * Only relevant for jsonb, array, and range columns. Match only rows where
         * every element appearing in `column` is contained by `value`.
         *
         * @param column - The jsonb, array, or range column to filter on
         * @param value - The jsonb, array, or range value to filter with
         */
        containedBy(column, value) {
          if (typeof value === "string") {
            this.url.searchParams.append(column, `cd.${value}`);
          } else if (Array.isArray(value)) {
            this.url.searchParams.append(column, `cd.{${value.join(",")}}`);
          } else {
            this.url.searchParams.append(column, `cd.${JSON.stringify(value)}`);
          }
          return this;
        }
        /**
         * Only relevant for range columns. Match only rows where every element in
         * `column` is greater than any element in `range`.
         *
         * @param column - The range column to filter on
         * @param range - The range to filter with
         */
        rangeGt(column, range) {
          this.url.searchParams.append(column, `sr.${range}`);
          return this;
        }
        /**
         * Only relevant for range columns. Match only rows where every element in
         * `column` is either contained in `range` or greater than any element in
         * `range`.
         *
         * @param column - The range column to filter on
         * @param range - The range to filter with
         */
        rangeGte(column, range) {
          this.url.searchParams.append(column, `nxl.${range}`);
          return this;
        }
        /**
         * Only relevant for range columns. Match only rows where every element in
         * `column` is less than any element in `range`.
         *
         * @param column - The range column to filter on
         * @param range - The range to filter with
         */
        rangeLt(column, range) {
          this.url.searchParams.append(column, `sl.${range}`);
          return this;
        }
        /**
         * Only relevant for range columns. Match only rows where every element in
         * `column` is either contained in `range` or less than any element in
         * `range`.
         *
         * @param column - The range column to filter on
         * @param range - The range to filter with
         */
        rangeLte(column, range) {
          this.url.searchParams.append(column, `nxr.${range}`);
          return this;
        }
        /**
         * Only relevant for range columns. Match only rows where `column` is
         * mutually exclusive to `range` and there can be no element between the two
         * ranges.
         *
         * @param column - The range column to filter on
         * @param range - The range to filter with
         */
        rangeAdjacent(column, range) {
          this.url.searchParams.append(column, `adj.${range}`);
          return this;
        }
        /**
         * Only relevant for array and range columns. Match only rows where
         * `column` and `value` have an element in common.
         *
         * @param column - The array or range column to filter on
         * @param value - The array or range value to filter with
         */
        overlaps(column, value) {
          if (typeof value === "string") {
            this.url.searchParams.append(column, `ov.${value}`);
          } else {
            this.url.searchParams.append(column, `ov.{${value.join(",")}}`);
          }
          return this;
        }
        /**
         * Only relevant for text and tsvector columns. Match only rows where
         * `column` matches the query string in `query`.
         *
         * @param column - The text or tsvector column to filter on
         * @param query - The query text to match with
         * @param options - Named parameters
         * @param options.config - The text search configuration to use
         * @param options.type - Change how the `query` text is interpreted
         */
        textSearch(column, query, { config, type } = {}) {
          let typePart = "";
          if (type === "plain") {
            typePart = "pl";
          } else if (type === "phrase") {
            typePart = "ph";
          } else if (type === "websearch") {
            typePart = "w";
          }
          const configPart = config === void 0 ? "" : `(${config})`;
          this.url.searchParams.append(column, `${typePart}fts${configPart}.${query}`);
          return this;
        }
        /**
         * Match only rows where each column in `query` keys is equal to its
         * associated value. Shorthand for multiple `.eq()`s.
         *
         * @param query - The object to filter with, with column names as keys mapped
         * to their filter values
         */
        match(query) {
          Object.entries(query).forEach(([column, value]) => {
            this.url.searchParams.append(column, `eq.${value}`);
          });
          return this;
        }
        /**
         * Match only rows which doesn't satisfy the filter.
         *
         * Unlike most filters, `opearator` and `value` are used as-is and need to
         * follow [PostgREST
         * syntax](https://postgrest.org/en/stable/api.html#operators). You also need
         * to make sure they are properly sanitized.
         *
         * @param column - The column to filter on
         * @param operator - The operator to be negated to filter with, following
         * PostgREST syntax
         * @param value - The value to filter with, following PostgREST syntax
         */
        not(column, operator, value) {
          this.url.searchParams.append(column, `not.${operator}.${value}`);
          return this;
        }
        /**
         * Match only rows which satisfy at least one of the filters.
         *
         * Unlike most filters, `filters` is used as-is and needs to follow [PostgREST
         * syntax](https://postgrest.org/en/stable/api.html#operators). You also need
         * to make sure it's properly sanitized.
         *
         * It's currently not possible to do an `.or()` filter across multiple tables.
         *
         * @param filters - The filters to use, following PostgREST syntax
         * @param options - Named parameters
         * @param options.referencedTable - Set this to filter on referenced tables
         * instead of the parent table
         * @param options.foreignTable - Deprecated, use `referencedTable` instead
         */
        or(filters, { foreignTable, referencedTable = foreignTable } = {}) {
          const key = referencedTable ? `${referencedTable}.or` : "or";
          this.url.searchParams.append(key, `(${filters})`);
          return this;
        }
        /**
         * Match only rows which satisfy the filter. This is an escape hatch - you
         * should use the specific filter methods wherever possible.
         *
         * Unlike most filters, `opearator` and `value` are used as-is and need to
         * follow [PostgREST
         * syntax](https://postgrest.org/en/stable/api.html#operators). You also need
         * to make sure they are properly sanitized.
         *
         * @param column - The column to filter on
         * @param operator - The operator to filter with, following PostgREST syntax
         * @param value - The value to filter with, following PostgREST syntax
         */
        filter(column, operator, value) {
          this.url.searchParams.append(column, `${operator}.${value}`);
          return this;
        }
      };
      exports.default = PostgrestFilterBuilder2;
    }
  });

  // node_modules/@supabase/postgrest-js/dist/cjs/PostgrestQueryBuilder.js
  var require_PostgrestQueryBuilder = __commonJS({
    "node_modules/@supabase/postgrest-js/dist/cjs/PostgrestQueryBuilder.js"(exports) {
      "use strict";
      var __importDefault = exports && exports.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      var PostgrestFilterBuilder_1 = __importDefault(require_PostgrestFilterBuilder());
      var PostgrestQueryBuilder2 = class {
        constructor(url, { headers = {}, schema, fetch: fetch3 }) {
          this.url = url;
          this.headers = headers;
          this.schema = schema;
          this.fetch = fetch3;
        }
        /**
         * Perform a SELECT query on the table or view.
         *
         * @param columns - The columns to retrieve, separated by commas. Columns can be renamed when returned with `customName:columnName`
         *
         * @param options - Named parameters
         *
         * @param options.head - When set to `true`, `data` will not be returned.
         * Useful if you only need the count.
         *
         * @param options.count - Count algorithm to use to count rows in the table or view.
         *
         * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
         * hood.
         *
         * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
         * statistics under the hood.
         *
         * `"estimated"`: Uses exact count for low numbers and planned count for high
         * numbers.
         */
        select(columns, { head: head2 = false, count } = {}) {
          const method = head2 ? "HEAD" : "GET";
          let quoted = false;
          const cleanedColumns = (columns !== null && columns !== void 0 ? columns : "*").split("").map((c) => {
            if (/\s/.test(c) && !quoted) {
              return "";
            }
            if (c === '"') {
              quoted = !quoted;
            }
            return c;
          }).join("");
          this.url.searchParams.set("select", cleanedColumns);
          if (count) {
            this.headers["Prefer"] = `count=${count}`;
          }
          return new PostgrestFilterBuilder_1.default({
            method,
            url: this.url,
            headers: this.headers,
            schema: this.schema,
            fetch: this.fetch,
            allowEmpty: false
          });
        }
        /**
         * Perform an INSERT into the table or view.
         *
         * By default, inserted rows are not returned. To return it, chain the call
         * with `.select()`.
         *
         * @param values - The values to insert. Pass an object to insert a single row
         * or an array to insert multiple rows.
         *
         * @param options - Named parameters
         *
         * @param options.count - Count algorithm to use to count inserted rows.
         *
         * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
         * hood.
         *
         * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
         * statistics under the hood.
         *
         * `"estimated"`: Uses exact count for low numbers and planned count for high
         * numbers.
         *
         * @param options.defaultToNull - Make missing fields default to `null`.
         * Otherwise, use the default value for the column. Only applies for bulk
         * inserts.
         */
        insert(values, { count, defaultToNull = true } = {}) {
          const method = "POST";
          const prefersHeaders = [];
          if (this.headers["Prefer"]) {
            prefersHeaders.push(this.headers["Prefer"]);
          }
          if (count) {
            prefersHeaders.push(`count=${count}`);
          }
          if (!defaultToNull) {
            prefersHeaders.push("missing=default");
          }
          this.headers["Prefer"] = prefersHeaders.join(",");
          if (Array.isArray(values)) {
            const columns = values.reduce((acc, x) => acc.concat(Object.keys(x)), []);
            if (columns.length > 0) {
              const uniqueColumns = [...new Set(columns)].map((column) => `"${column}"`);
              this.url.searchParams.set("columns", uniqueColumns.join(","));
            }
          }
          return new PostgrestFilterBuilder_1.default({
            method,
            url: this.url,
            headers: this.headers,
            schema: this.schema,
            body: values,
            fetch: this.fetch,
            allowEmpty: false
          });
        }
        /**
         * Perform an UPSERT on the table or view. Depending on the column(s) passed
         * to `onConflict`, `.upsert()` allows you to perform the equivalent of
         * `.insert()` if a row with the corresponding `onConflict` columns doesn't
         * exist, or if it does exist, perform an alternative action depending on
         * `ignoreDuplicates`.
         *
         * By default, upserted rows are not returned. To return it, chain the call
         * with `.select()`.
         *
         * @param values - The values to upsert with. Pass an object to upsert a
         * single row or an array to upsert multiple rows.
         *
         * @param options - Named parameters
         *
         * @param options.onConflict - Comma-separated UNIQUE column(s) to specify how
         * duplicate rows are determined. Two rows are duplicates if all the
         * `onConflict` columns are equal.
         *
         * @param options.ignoreDuplicates - If `true`, duplicate rows are ignored. If
         * `false`, duplicate rows are merged with existing rows.
         *
         * @param options.count - Count algorithm to use to count upserted rows.
         *
         * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
         * hood.
         *
         * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
         * statistics under the hood.
         *
         * `"estimated"`: Uses exact count for low numbers and planned count for high
         * numbers.
         *
         * @param options.defaultToNull - Make missing fields default to `null`.
         * Otherwise, use the default value for the column. This only applies when
         * inserting new rows, not when merging with existing rows under
         * `ignoreDuplicates: false`. This also only applies when doing bulk upserts.
         */
        upsert(values, { onConflict, ignoreDuplicates = false, count, defaultToNull = true } = {}) {
          const method = "POST";
          const prefersHeaders = [`resolution=${ignoreDuplicates ? "ignore" : "merge"}-duplicates`];
          if (onConflict !== void 0)
            this.url.searchParams.set("on_conflict", onConflict);
          if (this.headers["Prefer"]) {
            prefersHeaders.push(this.headers["Prefer"]);
          }
          if (count) {
            prefersHeaders.push(`count=${count}`);
          }
          if (!defaultToNull) {
            prefersHeaders.push("missing=default");
          }
          this.headers["Prefer"] = prefersHeaders.join(",");
          if (Array.isArray(values)) {
            const columns = values.reduce((acc, x) => acc.concat(Object.keys(x)), []);
            if (columns.length > 0) {
              const uniqueColumns = [...new Set(columns)].map((column) => `"${column}"`);
              this.url.searchParams.set("columns", uniqueColumns.join(","));
            }
          }
          return new PostgrestFilterBuilder_1.default({
            method,
            url: this.url,
            headers: this.headers,
            schema: this.schema,
            body: values,
            fetch: this.fetch,
            allowEmpty: false
          });
        }
        /**
         * Perform an UPDATE on the table or view.
         *
         * By default, updated rows are not returned. To return it, chain the call
         * with `.select()` after filters.
         *
         * @param values - The values to update with
         *
         * @param options - Named parameters
         *
         * @param options.count - Count algorithm to use to count updated rows.
         *
         * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
         * hood.
         *
         * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
         * statistics under the hood.
         *
         * `"estimated"`: Uses exact count for low numbers and planned count for high
         * numbers.
         */
        update(values, { count } = {}) {
          const method = "PATCH";
          const prefersHeaders = [];
          if (this.headers["Prefer"]) {
            prefersHeaders.push(this.headers["Prefer"]);
          }
          if (count) {
            prefersHeaders.push(`count=${count}`);
          }
          this.headers["Prefer"] = prefersHeaders.join(",");
          return new PostgrestFilterBuilder_1.default({
            method,
            url: this.url,
            headers: this.headers,
            schema: this.schema,
            body: values,
            fetch: this.fetch,
            allowEmpty: false
          });
        }
        /**
         * Perform a DELETE on the table or view.
         *
         * By default, deleted rows are not returned. To return it, chain the call
         * with `.select()` after filters.
         *
         * @param options - Named parameters
         *
         * @param options.count - Count algorithm to use to count deleted rows.
         *
         * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
         * hood.
         *
         * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
         * statistics under the hood.
         *
         * `"estimated"`: Uses exact count for low numbers and planned count for high
         * numbers.
         */
        delete({ count } = {}) {
          const method = "DELETE";
          const prefersHeaders = [];
          if (count) {
            prefersHeaders.push(`count=${count}`);
          }
          if (this.headers["Prefer"]) {
            prefersHeaders.unshift(this.headers["Prefer"]);
          }
          this.headers["Prefer"] = prefersHeaders.join(",");
          return new PostgrestFilterBuilder_1.default({
            method,
            url: this.url,
            headers: this.headers,
            schema: this.schema,
            fetch: this.fetch,
            allowEmpty: false
          });
        }
      };
      exports.default = PostgrestQueryBuilder2;
    }
  });

  // node_modules/@supabase/postgrest-js/dist/cjs/version.js
  var require_version = __commonJS({
    "node_modules/@supabase/postgrest-js/dist/cjs/version.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.version = void 0;
      exports.version = "0.0.0-automated";
    }
  });

  // node_modules/@supabase/postgrest-js/dist/cjs/constants.js
  var require_constants = __commonJS({
    "node_modules/@supabase/postgrest-js/dist/cjs/constants.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.DEFAULT_HEADERS = void 0;
      var version_1 = require_version();
      exports.DEFAULT_HEADERS = { "X-Client-Info": `postgrest-js/${version_1.version}` };
    }
  });

  // node_modules/@supabase/postgrest-js/dist/cjs/PostgrestClient.js
  var require_PostgrestClient = __commonJS({
    "node_modules/@supabase/postgrest-js/dist/cjs/PostgrestClient.js"(exports) {
      "use strict";
      var __importDefault = exports && exports.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      var PostgrestQueryBuilder_1 = __importDefault(require_PostgrestQueryBuilder());
      var PostgrestFilterBuilder_1 = __importDefault(require_PostgrestFilterBuilder());
      var constants_1 = require_constants();
      var PostgrestClient2 = class _PostgrestClient {
        // TODO: Add back shouldThrowOnError once we figure out the typings
        /**
         * Creates a PostgREST client.
         *
         * @param url - URL of the PostgREST endpoint
         * @param options - Named parameters
         * @param options.headers - Custom headers
         * @param options.schema - Postgres schema to switch to
         * @param options.fetch - Custom fetch
         */
        constructor(url, { headers = {}, schema, fetch: fetch3 } = {}) {
          this.url = url;
          this.headers = Object.assign(Object.assign({}, constants_1.DEFAULT_HEADERS), headers);
          this.schemaName = schema;
          this.fetch = fetch3;
        }
        /**
         * Perform a query on a table or a view.
         *
         * @param relation - The table or view name to query
         */
        from(relation) {
          const url = new URL(`${this.url}/${relation}`);
          return new PostgrestQueryBuilder_1.default(url, {
            headers: Object.assign({}, this.headers),
            schema: this.schemaName,
            fetch: this.fetch
          });
        }
        /**
         * Select a schema to query or perform an function (rpc) call.
         *
         * The schema needs to be on the list of exposed schemas inside Supabase.
         *
         * @param schema - The schema to query
         */
        schema(schema) {
          return new _PostgrestClient(this.url, {
            headers: this.headers,
            schema,
            fetch: this.fetch
          });
        }
        /**
         * Perform a function call.
         *
         * @param fn - The function name to call
         * @param args - The arguments to pass to the function call
         * @param options - Named parameters
         * @param options.head - When set to `true`, `data` will not be returned.
         * Useful if you only need the count.
         * @param options.get - When set to `true`, the function will be called with
         * read-only access mode.
         * @param options.count - Count algorithm to use to count rows returned by the
         * function. Only applicable for [set-returning
         * functions](https://www.postgresql.org/docs/current/functions-srf.html).
         *
         * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
         * hood.
         *
         * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
         * statistics under the hood.
         *
         * `"estimated"`: Uses exact count for low numbers and planned count for high
         * numbers.
         */
        rpc(fn, args = {}, { head: head2 = false, get: get2 = false, count } = {}) {
          let method;
          const url = new URL(`${this.url}/rpc/${fn}`);
          let body;
          if (head2 || get2) {
            method = head2 ? "HEAD" : "GET";
            Object.entries(args).filter(([_, value]) => value !== void 0).map(([name, value]) => [name, Array.isArray(value) ? `{${value.join(",")}}` : `${value}`]).forEach(([name, value]) => {
              url.searchParams.append(name, value);
            });
          } else {
            method = "POST";
            body = args;
          }
          const headers = Object.assign({}, this.headers);
          if (count) {
            headers["Prefer"] = `count=${count}`;
          }
          return new PostgrestFilterBuilder_1.default({
            method,
            url,
            headers,
            schema: this.schemaName,
            body,
            fetch: this.fetch,
            allowEmpty: false
          });
        }
      };
      exports.default = PostgrestClient2;
    }
  });

  // node_modules/@supabase/postgrest-js/dist/cjs/index.js
  var require_cjs = __commonJS({
    "node_modules/@supabase/postgrest-js/dist/cjs/index.js"(exports) {
      "use strict";
      var __importDefault = exports && exports.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.PostgrestError = exports.PostgrestBuilder = exports.PostgrestTransformBuilder = exports.PostgrestFilterBuilder = exports.PostgrestQueryBuilder = exports.PostgrestClient = void 0;
      var PostgrestClient_1 = __importDefault(require_PostgrestClient());
      exports.PostgrestClient = PostgrestClient_1.default;
      var PostgrestQueryBuilder_1 = __importDefault(require_PostgrestQueryBuilder());
      exports.PostgrestQueryBuilder = PostgrestQueryBuilder_1.default;
      var PostgrestFilterBuilder_1 = __importDefault(require_PostgrestFilterBuilder());
      exports.PostgrestFilterBuilder = PostgrestFilterBuilder_1.default;
      var PostgrestTransformBuilder_1 = __importDefault(require_PostgrestTransformBuilder());
      exports.PostgrestTransformBuilder = PostgrestTransformBuilder_1.default;
      var PostgrestBuilder_1 = __importDefault(require_PostgrestBuilder());
      exports.PostgrestBuilder = PostgrestBuilder_1.default;
      var PostgrestError_1 = __importDefault(require_PostgrestError());
      exports.PostgrestError = PostgrestError_1.default;
      exports.default = {
        PostgrestClient: PostgrestClient_1.default,
        PostgrestQueryBuilder: PostgrestQueryBuilder_1.default,
        PostgrestFilterBuilder: PostgrestFilterBuilder_1.default,
        PostgrestTransformBuilder: PostgrestTransformBuilder_1.default,
        PostgrestBuilder: PostgrestBuilder_1.default,
        PostgrestError: PostgrestError_1.default
      };
    }
  });

  // node_modules/react/cjs/react-jsx-runtime.production.min.js
  var require_react_jsx_runtime_production_min = __commonJS({
    "node_modules/react/cjs/react-jsx-runtime.production.min.js"(exports) {
      "use strict";
      var f = require_react();
      var k = Symbol.for("react.element");
      var l = Symbol.for("react.fragment");
      var m = Object.prototype.hasOwnProperty;
      var n = f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner;
      var p = { key: true, ref: true, __self: true, __source: true };
      function q(c, a, g) {
        var b, d = {}, e = null, h = null;
        void 0 !== g && (e = "" + g);
        void 0 !== a.key && (e = "" + a.key);
        void 0 !== a.ref && (h = a.ref);
        for (b in a) m.call(a, b) && !p.hasOwnProperty(b) && (d[b] = a[b]);
        if (c && c.defaultProps) for (b in a = c.defaultProps, a) void 0 === d[b] && (d[b] = a[b]);
        return { $$typeof: k, type: c, key: e, ref: h, props: d, _owner: n.current };
      }
      exports.Fragment = l;
      exports.jsx = q;
      exports.jsxs = q;
    }
  });

  // node_modules/react/jsx-runtime.js
  var require_jsx_runtime = __commonJS({
    "node_modules/react/jsx-runtime.js"(exports, module) {
      "use strict";
      if (true) {
        module.exports = require_react_jsx_runtime_production_min();
      } else {
        module.exports = null;
      }
    }
  });

  // src/embed/satellite-quoter-entry.tsx
  var import_react6 = __toESM(require_react());
  var import_client = __toESM(require_client());

  // src/components/satellite/SatelliteQuoterShell.tsx
  var import_react5 = __toESM(require_react());

  // src/components/AutomatedQuoteForm.tsx
  var import_react3 = __toESM(require_react());

  // node_modules/lucide-react/dist/esm/createLucideIcon.js
  var import_react = __toESM(require_react());

  // node_modules/lucide-react/dist/esm/defaultAttributes.js
  var defaultAttributes = {
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  };

  // node_modules/lucide-react/dist/esm/createLucideIcon.js
  var toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase().trim();
  var createLucideIcon = (iconName, iconNode) => {
    const Component = (0, import_react.forwardRef)(
      ({ color = "currentColor", size = 24, strokeWidth = 2, absoluteStrokeWidth, className = "", children, ...rest }, ref) => (0, import_react.createElement)(
        "svg",
        {
          ref,
          ...defaultAttributes,
          width: size,
          height: size,
          stroke: color,
          strokeWidth: absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
          className: ["lucide", `lucide-${toKebabCase(iconName)}`, className].join(" "),
          ...rest
        },
        [
          ...iconNode.map(([tag, attrs]) => (0, import_react.createElement)(tag, attrs)),
          ...Array.isArray(children) ? children : [children]
        ]
      )
    );
    Component.displayName = `${iconName}`;
    return Component;
  };

  // node_modules/lucide-react/dist/esm/icons/alert-triangle.js
  var AlertTriangle = createLucideIcon("AlertTriangle", [
    [
      "path",
      {
        d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z",
        key: "c3ski4"
      }
    ],
    ["path", { d: "M12 9v4", key: "juzpu7" }],
    ["path", { d: "M12 17h.01", key: "p32p05" }]
  ]);

  // node_modules/lucide-react/dist/esm/icons/check-circle-2.js
  var CheckCircle2 = createLucideIcon("CheckCircle2", [
    ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
    ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
  ]);

  // node_modules/lucide-react/dist/esm/icons/loader-2.js
  var Loader2 = createLucideIcon("Loader2", [
    ["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]
  ]);

  // node_modules/lucide-react/dist/esm/icons/map-pin.js
  var MapPin = createLucideIcon("MapPin", [
    ["path", { d: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z", key: "2oe9fu" }],
    ["circle", { cx: "12", cy: "10", r: "3", key: "ilqhr7" }]
  ]);

  // node_modules/lucide-react/dist/esm/icons/phone.js
  var Phone = createLucideIcon("Phone", [
    [
      "path",
      {
        d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",
        key: "foiqr5"
      }
    ]
  ]);

  // node_modules/lucide-react/dist/esm/icons/search.js
  var Search = createLucideIcon("Search", [
    ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
    ["path", { d: "m21 21-4.3-4.3", key: "1qie3q" }]
  ]);

  // node_modules/lucide-react/dist/esm/icons/shield-check.js
  var ShieldCheck = createLucideIcon("ShieldCheck", [
    ["path", { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10", key: "1irkt0" }],
    ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
  ]);

  // src/lib/quote/service-area.ts
  var CO_FRONT_RANGE_ZIP3 = /* @__PURE__ */ new Set([
    "800",
    // Denver metro core
    "801",
    // Denver metro
    "802",
    // Denver metro
    "803",
    // Boulder, Broomfield, north metro
    "804",
    // (currently unassigned; reserved)
    "805",
    // Fort Collins, Loveland, Greeley, north
    "806",
    // Greeley, Brighton, NE plains-edge cities we serve
    "808",
    // Colorado Springs metro
    "809"
    // Colorado Springs metro
  ]);
  var PHOENIX_METRO_ZIP3 = /* @__PURE__ */ new Set([
    "850",
    // Phoenix, north
    "851",
    // West Valley pieces
    "852",
    // Mesa, Tempe, Scottsdale, Chandler
    "853"
    // East/SE Valley (Gilbert), West Valley (Glendale, Peoria, Surprise)
  ]);
  function isInServiceArea(rawZip) {
    const zip = rawZip.trim();
    if (!/^\d{5}(-\d{4})?$/.test(zip)) {
      return { inServiceArea: false, reason: "invalid_zip" };
    }
    const zip3 = zip.slice(0, 3);
    if (CO_FRONT_RANGE_ZIP3.has(zip3) || PHOENIX_METRO_ZIP3.has(zip3)) {
      return { inServiceArea: true, zip3 };
    }
    return { inServiceArea: false, reason: "out_of_area", zip3 };
  }
  var OUT_OF_AREA_MESSAGE = "Sorry, we serve Colorado Front Range and Phoenix metro only. Enter a ZIP in our service area to continue.";
  var SERVED_STATES = /* @__PURE__ */ new Set(["CO", "AZ"]);
  function isStateInServiceArea(rawState) {
    if (!rawState) return false;
    return SERVED_STATES.has(rawState.trim().toUpperCase());
  }
  var OUT_OF_AREA_STATE_MESSAGE = "Sorry, Pink Auto Glass serves Colorado and Arizona only. Call (720) 918-7465 if you need a referral.";

  // src/components/QuoteBookingForm.tsx
  var import_react2 = __toESM(require_react());

  // src/lib/quote/schedule-slots.ts
  var DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var US_FEDERAL_HOLIDAYS = [
    // 2026
    "2026-01-01",
    // New Year's Day
    "2026-01-19",
    // MLK Day
    "2026-02-16",
    // Presidents Day
    "2026-05-25",
    // Memorial Day
    "2026-06-19",
    // Juneteenth
    "2026-07-04",
    // Independence Day
    "2026-09-07",
    // Labor Day
    "2026-11-11",
    // Veterans Day
    "2026-11-26",
    // Thanksgiving
    "2026-12-25",
    // Christmas
    // 2027
    "2027-01-01",
    "2027-01-18",
    "2027-02-15",
    "2027-05-31",
    "2027-06-19",
    "2027-07-05",
    // Jul 4 is Sun → Mon observed
    "2027-09-06",
    "2027-11-11",
    "2027-11-25",
    "2027-12-25"
  ];
  var HOLIDAY_SET = new Set(US_FEDERAL_HOLIDAYS);
  function toIsoLocal(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  function isHoliday(date) {
    return HOLIDAY_SET.has(toIsoLocal(date));
  }
  function isWorkingDay(date) {
    if (date.getDay() === 0) return false;
    if (isHoliday(date)) return false;
    return true;
  }
  function getNextTwoWorkingDays(now) {
    const results = [];
    const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    for (let i = 0; i < 14 && results.length < 2; i += 1) {
      cursor.setDate(cursor.getDate() + 1);
      if (isWorkingDay(cursor)) results.push(new Date(cursor));
    }
    if (results.length < 2) {
      throw new Error("No working days found in the next 14 days \u2014 check holiday config.");
    }
    return [results[0], results[1]];
  }
  function isTomorrow(date, now) {
    const t = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    t.setDate(t.getDate() + 1);
    return date.getFullYear() === t.getFullYear() && date.getMonth() === t.getMonth() && date.getDate() === t.getDate();
  }
  function pillDayLabel(date, now) {
    if (isTomorrow(date, now)) return "Tomorrow";
    return DAY_NAMES[date.getDay()];
  }
  function pillDateLabel(date) {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }

  // node_modules/@supabase/functions-js/dist/module/helper.js
  var resolveFetch = (customFetch) => {
    let _fetch;
    if (customFetch) {
      _fetch = customFetch;
    } else if (typeof fetch === "undefined") {
      _fetch = (...args) => Promise.resolve().then(() => (init_browser(), browser_exports)).then(({ default: fetch3 }) => fetch3(...args));
    } else {
      _fetch = fetch;
    }
    return (...args) => _fetch(...args);
  };

  // node_modules/@supabase/functions-js/dist/module/types.js
  var FunctionsError = class extends Error {
    constructor(message, name = "FunctionsError", context) {
      super(message);
      this.name = name;
      this.context = context;
    }
  };
  var FunctionsFetchError = class extends FunctionsError {
    constructor(context) {
      super("Failed to send a request to the Edge Function", "FunctionsFetchError", context);
    }
  };
  var FunctionsRelayError = class extends FunctionsError {
    constructor(context) {
      super("Relay Error invoking the Edge Function", "FunctionsRelayError", context);
    }
  };
  var FunctionsHttpError = class extends FunctionsError {
    constructor(context) {
      super("Edge Function returned a non-2xx status code", "FunctionsHttpError", context);
    }
  };
  var FunctionRegion;
  (function(FunctionRegion2) {
    FunctionRegion2["Any"] = "any";
    FunctionRegion2["ApNortheast1"] = "ap-northeast-1";
    FunctionRegion2["ApNortheast2"] = "ap-northeast-2";
    FunctionRegion2["ApSouth1"] = "ap-south-1";
    FunctionRegion2["ApSoutheast1"] = "ap-southeast-1";
    FunctionRegion2["ApSoutheast2"] = "ap-southeast-2";
    FunctionRegion2["CaCentral1"] = "ca-central-1";
    FunctionRegion2["EuCentral1"] = "eu-central-1";
    FunctionRegion2["EuWest1"] = "eu-west-1";
    FunctionRegion2["EuWest2"] = "eu-west-2";
    FunctionRegion2["EuWest3"] = "eu-west-3";
    FunctionRegion2["SaEast1"] = "sa-east-1";
    FunctionRegion2["UsEast1"] = "us-east-1";
    FunctionRegion2["UsWest1"] = "us-west-1";
    FunctionRegion2["UsWest2"] = "us-west-2";
  })(FunctionRegion || (FunctionRegion = {}));

  // node_modules/@supabase/functions-js/dist/module/FunctionsClient.js
  var __awaiter = function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var FunctionsClient = class {
    constructor(url, { headers = {}, customFetch, region = FunctionRegion.Any } = {}) {
      this.url = url;
      this.headers = headers;
      this.region = region;
      this.fetch = resolveFetch(customFetch);
    }
    /**
     * Updates the authorization header
     * @param token - the new jwt token sent in the authorisation header
     */
    setAuth(token) {
      this.headers.Authorization = `Bearer ${token}`;
    }
    /**
     * Invokes a function
     * @param functionName - The name of the Function to invoke.
     * @param options - Options for invoking the Function.
     */
    invoke(functionName, options = {}) {
      var _a;
      return __awaiter(this, void 0, void 0, function* () {
        try {
          const { headers, method, body: functionArgs } = options;
          let _headers = {};
          let { region } = options;
          if (!region) {
            region = this.region;
          }
          const url = new URL(`${this.url}/${functionName}`);
          if (region && region !== "any") {
            _headers["x-region"] = region;
            url.searchParams.set("forceFunctionRegion", region);
          }
          let body;
          if (functionArgs && (headers && !Object.prototype.hasOwnProperty.call(headers, "Content-Type") || !headers)) {
            if (typeof Blob !== "undefined" && functionArgs instanceof Blob || functionArgs instanceof ArrayBuffer) {
              _headers["Content-Type"] = "application/octet-stream";
              body = functionArgs;
            } else if (typeof functionArgs === "string") {
              _headers["Content-Type"] = "text/plain";
              body = functionArgs;
            } else if (typeof FormData !== "undefined" && functionArgs instanceof FormData) {
              body = functionArgs;
            } else {
              _headers["Content-Type"] = "application/json";
              body = JSON.stringify(functionArgs);
            }
          }
          const response = yield this.fetch(url.toString(), {
            method: method || "POST",
            // headers priority is (high to low):
            // 1. invoke-level headers
            // 2. client-level headers
            // 3. default Content-Type header
            headers: Object.assign(Object.assign(Object.assign({}, _headers), this.headers), headers),
            body
          }).catch((fetchError) => {
            throw new FunctionsFetchError(fetchError);
          });
          const isRelayError = response.headers.get("x-relay-error");
          if (isRelayError && isRelayError === "true") {
            throw new FunctionsRelayError(response);
          }
          if (!response.ok) {
            throw new FunctionsHttpError(response);
          }
          let responseType = ((_a = response.headers.get("Content-Type")) !== null && _a !== void 0 ? _a : "text/plain").split(";")[0].trim();
          let data;
          if (responseType === "application/json") {
            data = yield response.json();
          } else if (responseType === "application/octet-stream") {
            data = yield response.blob();
          } else if (responseType === "text/event-stream") {
            data = response;
          } else if (responseType === "multipart/form-data") {
            data = yield response.formData();
          } else {
            data = yield response.text();
          }
          return { data, error: null, response };
        } catch (error) {
          return {
            data: null,
            error,
            response: error instanceof FunctionsHttpError || error instanceof FunctionsRelayError ? error.context : void 0
          };
        }
      });
    }
  };

  // node_modules/@supabase/postgrest-js/dist/esm/wrapper.mjs
  var import_cjs = __toESM(require_cjs(), 1);
  var {
    PostgrestClient,
    PostgrestQueryBuilder,
    PostgrestFilterBuilder,
    PostgrestTransformBuilder,
    PostgrestBuilder,
    PostgrestError
  } = import_cjs.default;

  // node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
  var WebSocketFactory = class {
    static detectEnvironment() {
      var _a;
      if (typeof WebSocket !== "undefined") {
        return { type: "native", constructor: WebSocket };
      }
      if (typeof globalThis !== "undefined" && typeof globalThis.WebSocket !== "undefined") {
        return { type: "native", constructor: globalThis.WebSocket };
      }
      if (typeof global !== "undefined" && typeof global.WebSocket !== "undefined") {
        return { type: "native", constructor: global.WebSocket };
      }
      if (typeof globalThis !== "undefined" && typeof globalThis.WebSocketPair !== "undefined" && typeof globalThis.WebSocket === "undefined") {
        return {
          type: "cloudflare",
          error: "Cloudflare Workers detected. WebSocket clients are not supported in Cloudflare Workers.",
          workaround: "Use Cloudflare Workers WebSocket API for server-side WebSocket handling, or deploy to a different runtime."
        };
      }
      if (typeof globalThis !== "undefined" && globalThis.EdgeRuntime || typeof navigator !== "undefined" && ((_a = navigator.userAgent) === null || _a === void 0 ? void 0 : _a.includes("Vercel-Edge"))) {
        return {
          type: "unsupported",
          error: "Edge runtime detected (Vercel Edge/Netlify Edge). WebSockets are not supported in edge functions.",
          workaround: "Use serverless functions or a different deployment target for WebSocket functionality."
        };
      }
      if (typeof process !== "undefined" && process.versions && process.versions.node) {
        const nodeVersion = parseInt(process.versions.node.split(".")[0]);
        if (nodeVersion >= 22) {
          if (typeof globalThis.WebSocket !== "undefined") {
            return { type: "native", constructor: globalThis.WebSocket };
          }
          return {
            type: "unsupported",
            error: `Node.js ${nodeVersion} detected but native WebSocket not found.`,
            workaround: "Provide a WebSocket implementation via the transport option."
          };
        }
        return {
          type: "unsupported",
          error: `Node.js ${nodeVersion} detected without native WebSocket support.`,
          workaround: 'For Node.js < 22, install "ws" package and provide it via the transport option:\nimport ws from "ws"\nnew RealtimeClient(url, { transport: ws })'
        };
      }
      return {
        type: "unsupported",
        error: "Unknown JavaScript runtime without WebSocket support.",
        workaround: "Ensure you're running in a supported environment (browser, Node.js, Deno) or provide a custom WebSocket implementation."
      };
    }
    static getWebSocketConstructor() {
      const env = this.detectEnvironment();
      if (env.constructor) {
        return env.constructor;
      }
      let errorMessage = env.error || "WebSocket not supported in this environment.";
      if (env.workaround) {
        errorMessage += `

Suggested solution: ${env.workaround}`;
      }
      throw new Error(errorMessage);
    }
    static createWebSocket(url, protocols) {
      const WS = this.getWebSocketConstructor();
      return new WS(url, protocols);
    }
    static isWebSocketSupported() {
      try {
        const env = this.detectEnvironment();
        return env.type === "native" || env.type === "ws";
      } catch (_a) {
        return false;
      }
    }
  };
  var websocket_factory_default = WebSocketFactory;

  // node_modules/@supabase/realtime-js/dist/module/lib/version.js
  var version = "2.15.1";

  // node_modules/@supabase/realtime-js/dist/module/lib/constants.js
  var DEFAULT_VERSION = `realtime-js/${version}`;
  var VSN = "1.0.0";
  var DEFAULT_TIMEOUT = 1e4;
  var WS_CLOSE_NORMAL = 1e3;
  var MAX_PUSH_BUFFER_SIZE = 100;
  var SOCKET_STATES;
  (function(SOCKET_STATES2) {
    SOCKET_STATES2[SOCKET_STATES2["connecting"] = 0] = "connecting";
    SOCKET_STATES2[SOCKET_STATES2["open"] = 1] = "open";
    SOCKET_STATES2[SOCKET_STATES2["closing"] = 2] = "closing";
    SOCKET_STATES2[SOCKET_STATES2["closed"] = 3] = "closed";
  })(SOCKET_STATES || (SOCKET_STATES = {}));
  var CHANNEL_STATES;
  (function(CHANNEL_STATES2) {
    CHANNEL_STATES2["closed"] = "closed";
    CHANNEL_STATES2["errored"] = "errored";
    CHANNEL_STATES2["joined"] = "joined";
    CHANNEL_STATES2["joining"] = "joining";
    CHANNEL_STATES2["leaving"] = "leaving";
  })(CHANNEL_STATES || (CHANNEL_STATES = {}));
  var CHANNEL_EVENTS;
  (function(CHANNEL_EVENTS2) {
    CHANNEL_EVENTS2["close"] = "phx_close";
    CHANNEL_EVENTS2["error"] = "phx_error";
    CHANNEL_EVENTS2["join"] = "phx_join";
    CHANNEL_EVENTS2["reply"] = "phx_reply";
    CHANNEL_EVENTS2["leave"] = "phx_leave";
    CHANNEL_EVENTS2["access_token"] = "access_token";
  })(CHANNEL_EVENTS || (CHANNEL_EVENTS = {}));
  var TRANSPORTS;
  (function(TRANSPORTS2) {
    TRANSPORTS2["websocket"] = "websocket";
  })(TRANSPORTS || (TRANSPORTS = {}));
  var CONNECTION_STATE;
  (function(CONNECTION_STATE2) {
    CONNECTION_STATE2["Connecting"] = "connecting";
    CONNECTION_STATE2["Open"] = "open";
    CONNECTION_STATE2["Closing"] = "closing";
    CONNECTION_STATE2["Closed"] = "closed";
  })(CONNECTION_STATE || (CONNECTION_STATE = {}));

  // node_modules/@supabase/realtime-js/dist/module/lib/serializer.js
  var Serializer = class {
    constructor() {
      this.HEADER_LENGTH = 1;
    }
    decode(rawPayload, callback) {
      if (rawPayload.constructor === ArrayBuffer) {
        return callback(this._binaryDecode(rawPayload));
      }
      if (typeof rawPayload === "string") {
        return callback(JSON.parse(rawPayload));
      }
      return callback({});
    }
    _binaryDecode(buffer) {
      const view = new DataView(buffer);
      const decoder = new TextDecoder();
      return this._decodeBroadcast(buffer, view, decoder);
    }
    _decodeBroadcast(buffer, view, decoder) {
      const topicSize = view.getUint8(1);
      const eventSize = view.getUint8(2);
      let offset = this.HEADER_LENGTH + 2;
      const topic = decoder.decode(buffer.slice(offset, offset + topicSize));
      offset = offset + topicSize;
      const event2 = decoder.decode(buffer.slice(offset, offset + eventSize));
      offset = offset + eventSize;
      const data = JSON.parse(decoder.decode(buffer.slice(offset, buffer.byteLength)));
      return { ref: null, topic, event: event2, payload: data };
    }
  };

  // node_modules/@supabase/realtime-js/dist/module/lib/timer.js
  var Timer = class {
    constructor(callback, timerCalc) {
      this.callback = callback;
      this.timerCalc = timerCalc;
      this.timer = void 0;
      this.tries = 0;
      this.callback = callback;
      this.timerCalc = timerCalc;
    }
    reset() {
      this.tries = 0;
      clearTimeout(this.timer);
      this.timer = void 0;
    }
    // Cancels any previous scheduleTimeout and schedules callback
    scheduleTimeout() {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.tries = this.tries + 1;
        this.callback();
      }, this.timerCalc(this.tries + 1));
    }
  };

  // node_modules/@supabase/realtime-js/dist/module/lib/transformers.js
  var PostgresTypes;
  (function(PostgresTypes2) {
    PostgresTypes2["abstime"] = "abstime";
    PostgresTypes2["bool"] = "bool";
    PostgresTypes2["date"] = "date";
    PostgresTypes2["daterange"] = "daterange";
    PostgresTypes2["float4"] = "float4";
    PostgresTypes2["float8"] = "float8";
    PostgresTypes2["int2"] = "int2";
    PostgresTypes2["int4"] = "int4";
    PostgresTypes2["int4range"] = "int4range";
    PostgresTypes2["int8"] = "int8";
    PostgresTypes2["int8range"] = "int8range";
    PostgresTypes2["json"] = "json";
    PostgresTypes2["jsonb"] = "jsonb";
    PostgresTypes2["money"] = "money";
    PostgresTypes2["numeric"] = "numeric";
    PostgresTypes2["oid"] = "oid";
    PostgresTypes2["reltime"] = "reltime";
    PostgresTypes2["text"] = "text";
    PostgresTypes2["time"] = "time";
    PostgresTypes2["timestamp"] = "timestamp";
    PostgresTypes2["timestamptz"] = "timestamptz";
    PostgresTypes2["timetz"] = "timetz";
    PostgresTypes2["tsrange"] = "tsrange";
    PostgresTypes2["tstzrange"] = "tstzrange";
  })(PostgresTypes || (PostgresTypes = {}));
  var convertChangeData = (columns, record, options = {}) => {
    var _a;
    const skipTypes = (_a = options.skipTypes) !== null && _a !== void 0 ? _a : [];
    return Object.keys(record).reduce((acc, rec_key) => {
      acc[rec_key] = convertColumn(rec_key, columns, record, skipTypes);
      return acc;
    }, {});
  };
  var convertColumn = (columnName, columns, record, skipTypes) => {
    const column = columns.find((x) => x.name === columnName);
    const colType = column === null || column === void 0 ? void 0 : column.type;
    const value = record[columnName];
    if (colType && !skipTypes.includes(colType)) {
      return convertCell(colType, value);
    }
    return noop(value);
  };
  var convertCell = (type, value) => {
    if (type.charAt(0) === "_") {
      const dataType = type.slice(1, type.length);
      return toArray(value, dataType);
    }
    switch (type) {
      case PostgresTypes.bool:
        return toBoolean(value);
      case PostgresTypes.float4:
      case PostgresTypes.float8:
      case PostgresTypes.int2:
      case PostgresTypes.int4:
      case PostgresTypes.int8:
      case PostgresTypes.numeric:
      case PostgresTypes.oid:
        return toNumber(value);
      case PostgresTypes.json:
      case PostgresTypes.jsonb:
        return toJson(value);
      case PostgresTypes.timestamp:
        return toTimestampString(value);
      // Format to be consistent with PostgREST
      case PostgresTypes.abstime:
      // To allow users to cast it based on Timezone
      case PostgresTypes.date:
      // To allow users to cast it based on Timezone
      case PostgresTypes.daterange:
      case PostgresTypes.int4range:
      case PostgresTypes.int8range:
      case PostgresTypes.money:
      case PostgresTypes.reltime:
      // To allow users to cast it based on Timezone
      case PostgresTypes.text:
      case PostgresTypes.time:
      // To allow users to cast it based on Timezone
      case PostgresTypes.timestamptz:
      // To allow users to cast it based on Timezone
      case PostgresTypes.timetz:
      // To allow users to cast it based on Timezone
      case PostgresTypes.tsrange:
      case PostgresTypes.tstzrange:
        return noop(value);
      default:
        return noop(value);
    }
  };
  var noop = (value) => {
    return value;
  };
  var toBoolean = (value) => {
    switch (value) {
      case "t":
        return true;
      case "f":
        return false;
      default:
        return value;
    }
  };
  var toNumber = (value) => {
    if (typeof value === "string") {
      const parsedValue = parseFloat(value);
      if (!Number.isNaN(parsedValue)) {
        return parsedValue;
      }
    }
    return value;
  };
  var toJson = (value) => {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch (error) {
        console.log(`JSON parse error: ${error}`);
        return value;
      }
    }
    return value;
  };
  var toArray = (value, type) => {
    if (typeof value !== "string") {
      return value;
    }
    const lastIdx = value.length - 1;
    const closeBrace = value[lastIdx];
    const openBrace = value[0];
    if (openBrace === "{" && closeBrace === "}") {
      let arr;
      const valTrim = value.slice(1, lastIdx);
      try {
        arr = JSON.parse("[" + valTrim + "]");
      } catch (_) {
        arr = valTrim ? valTrim.split(",") : [];
      }
      return arr.map((val) => convertCell(type, val));
    }
    return value;
  };
  var toTimestampString = (value) => {
    if (typeof value === "string") {
      return value.replace(" ", "T");
    }
    return value;
  };
  var httpEndpointURL = (socketUrl) => {
    let url = socketUrl;
    url = url.replace(/^ws/i, "http");
    url = url.replace(/(\/socket\/websocket|\/socket|\/websocket)\/?$/i, "");
    return url.replace(/\/+$/, "") + "/api/broadcast";
  };

  // node_modules/@supabase/realtime-js/dist/module/lib/push.js
  var Push = class {
    /**
     * Initializes the Push
     *
     * @param channel The Channel
     * @param event The event, for example `"phx_join"`
     * @param payload The payload, for example `{user_id: 123}`
     * @param timeout The push timeout in milliseconds
     */
    constructor(channel, event2, payload = {}, timeout = DEFAULT_TIMEOUT) {
      this.channel = channel;
      this.event = event2;
      this.payload = payload;
      this.timeout = timeout;
      this.sent = false;
      this.timeoutTimer = void 0;
      this.ref = "";
      this.receivedResp = null;
      this.recHooks = [];
      this.refEvent = null;
    }
    resend(timeout) {
      this.timeout = timeout;
      this._cancelRefEvent();
      this.ref = "";
      this.refEvent = null;
      this.receivedResp = null;
      this.sent = false;
      this.send();
    }
    send() {
      if (this._hasReceived("timeout")) {
        return;
      }
      this.startTimeout();
      this.sent = true;
      this.channel.socket.push({
        topic: this.channel.topic,
        event: this.event,
        payload: this.payload,
        ref: this.ref,
        join_ref: this.channel._joinRef()
      });
    }
    updatePayload(payload) {
      this.payload = Object.assign(Object.assign({}, this.payload), payload);
    }
    receive(status, callback) {
      var _a;
      if (this._hasReceived(status)) {
        callback((_a = this.receivedResp) === null || _a === void 0 ? void 0 : _a.response);
      }
      this.recHooks.push({ status, callback });
      return this;
    }
    startTimeout() {
      if (this.timeoutTimer) {
        return;
      }
      this.ref = this.channel.socket._makeRef();
      this.refEvent = this.channel._replyEventName(this.ref);
      const callback = (payload) => {
        this._cancelRefEvent();
        this._cancelTimeout();
        this.receivedResp = payload;
        this._matchReceive(payload);
      };
      this.channel._on(this.refEvent, {}, callback);
      this.timeoutTimer = setTimeout(() => {
        this.trigger("timeout", {});
      }, this.timeout);
    }
    trigger(status, response) {
      if (this.refEvent)
        this.channel._trigger(this.refEvent, { status, response });
    }
    destroy() {
      this._cancelRefEvent();
      this._cancelTimeout();
    }
    _cancelRefEvent() {
      if (!this.refEvent) {
        return;
      }
      this.channel._off(this.refEvent, {});
    }
    _cancelTimeout() {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = void 0;
    }
    _matchReceive({ status, response }) {
      this.recHooks.filter((h) => h.status === status).forEach((h) => h.callback(response));
    }
    _hasReceived(status) {
      return this.receivedResp && this.receivedResp.status === status;
    }
  };

  // node_modules/@supabase/realtime-js/dist/module/RealtimePresence.js
  var REALTIME_PRESENCE_LISTEN_EVENTS;
  (function(REALTIME_PRESENCE_LISTEN_EVENTS2) {
    REALTIME_PRESENCE_LISTEN_EVENTS2["SYNC"] = "sync";
    REALTIME_PRESENCE_LISTEN_EVENTS2["JOIN"] = "join";
    REALTIME_PRESENCE_LISTEN_EVENTS2["LEAVE"] = "leave";
  })(REALTIME_PRESENCE_LISTEN_EVENTS || (REALTIME_PRESENCE_LISTEN_EVENTS = {}));
  var RealtimePresence = class _RealtimePresence {
    /**
     * Initializes the Presence.
     *
     * @param channel - The RealtimeChannel
     * @param opts - The options,
     *        for example `{events: {state: 'state', diff: 'diff'}}`
     */
    constructor(channel, opts) {
      this.channel = channel;
      this.state = {};
      this.pendingDiffs = [];
      this.joinRef = null;
      this.enabled = false;
      this.caller = {
        onJoin: () => {
        },
        onLeave: () => {
        },
        onSync: () => {
        }
      };
      const events = (opts === null || opts === void 0 ? void 0 : opts.events) || {
        state: "presence_state",
        diff: "presence_diff"
      };
      this.channel._on(events.state, {}, (newState) => {
        const { onJoin, onLeave, onSync } = this.caller;
        this.joinRef = this.channel._joinRef();
        this.state = _RealtimePresence.syncState(this.state, newState, onJoin, onLeave);
        this.pendingDiffs.forEach((diff) => {
          this.state = _RealtimePresence.syncDiff(this.state, diff, onJoin, onLeave);
        });
        this.pendingDiffs = [];
        onSync();
      });
      this.channel._on(events.diff, {}, (diff) => {
        const { onJoin, onLeave, onSync } = this.caller;
        if (this.inPendingSyncState()) {
          this.pendingDiffs.push(diff);
        } else {
          this.state = _RealtimePresence.syncDiff(this.state, diff, onJoin, onLeave);
          onSync();
        }
      });
      this.onJoin((key, currentPresences, newPresences) => {
        this.channel._trigger("presence", {
          event: "join",
          key,
          currentPresences,
          newPresences
        });
      });
      this.onLeave((key, currentPresences, leftPresences) => {
        this.channel._trigger("presence", {
          event: "leave",
          key,
          currentPresences,
          leftPresences
        });
      });
      this.onSync(() => {
        this.channel._trigger("presence", { event: "sync" });
      });
    }
    /**
     * Used to sync the list of presences on the server with the
     * client's state.
     *
     * An optional `onJoin` and `onLeave` callback can be provided to
     * react to changes in the client's local presences across
     * disconnects and reconnects with the server.
     *
     * @internal
     */
    static syncState(currentState, newState, onJoin, onLeave) {
      const state = this.cloneDeep(currentState);
      const transformedState = this.transformState(newState);
      const joins = {};
      const leaves = {};
      this.map(state, (key, presences) => {
        if (!transformedState[key]) {
          leaves[key] = presences;
        }
      });
      this.map(transformedState, (key, newPresences) => {
        const currentPresences = state[key];
        if (currentPresences) {
          const newPresenceRefs = newPresences.map((m) => m.presence_ref);
          const curPresenceRefs = currentPresences.map((m) => m.presence_ref);
          const joinedPresences = newPresences.filter((m) => curPresenceRefs.indexOf(m.presence_ref) < 0);
          const leftPresences = currentPresences.filter((m) => newPresenceRefs.indexOf(m.presence_ref) < 0);
          if (joinedPresences.length > 0) {
            joins[key] = joinedPresences;
          }
          if (leftPresences.length > 0) {
            leaves[key] = leftPresences;
          }
        } else {
          joins[key] = newPresences;
        }
      });
      return this.syncDiff(state, { joins, leaves }, onJoin, onLeave);
    }
    /**
     * Used to sync a diff of presence join and leave events from the
     * server, as they happen.
     *
     * Like `syncState`, `syncDiff` accepts optional `onJoin` and
     * `onLeave` callbacks to react to a user joining or leaving from a
     * device.
     *
     * @internal
     */
    static syncDiff(state, diff, onJoin, onLeave) {
      const { joins, leaves } = {
        joins: this.transformState(diff.joins),
        leaves: this.transformState(diff.leaves)
      };
      if (!onJoin) {
        onJoin = () => {
        };
      }
      if (!onLeave) {
        onLeave = () => {
        };
      }
      this.map(joins, (key, newPresences) => {
        var _a;
        const currentPresences = (_a = state[key]) !== null && _a !== void 0 ? _a : [];
        state[key] = this.cloneDeep(newPresences);
        if (currentPresences.length > 0) {
          const joinedPresenceRefs = state[key].map((m) => m.presence_ref);
          const curPresences = currentPresences.filter((m) => joinedPresenceRefs.indexOf(m.presence_ref) < 0);
          state[key].unshift(...curPresences);
        }
        onJoin(key, currentPresences, newPresences);
      });
      this.map(leaves, (key, leftPresences) => {
        let currentPresences = state[key];
        if (!currentPresences)
          return;
        const presenceRefsToRemove = leftPresences.map((m) => m.presence_ref);
        currentPresences = currentPresences.filter((m) => presenceRefsToRemove.indexOf(m.presence_ref) < 0);
        state[key] = currentPresences;
        onLeave(key, currentPresences, leftPresences);
        if (currentPresences.length === 0)
          delete state[key];
      });
      return state;
    }
    /** @internal */
    static map(obj, func) {
      return Object.getOwnPropertyNames(obj).map((key) => func(key, obj[key]));
    }
    /**
     * Remove 'metas' key
     * Change 'phx_ref' to 'presence_ref'
     * Remove 'phx_ref' and 'phx_ref_prev'
     *
     * @example
     * // returns {
     *  abc123: [
     *    { presence_ref: '2', user_id: 1 },
     *    { presence_ref: '3', user_id: 2 }
     *  ]
     * }
     * RealtimePresence.transformState({
     *  abc123: {
     *    metas: [
     *      { phx_ref: '2', phx_ref_prev: '1' user_id: 1 },
     *      { phx_ref: '3', user_id: 2 }
     *    ]
     *  }
     * })
     *
     * @internal
     */
    static transformState(state) {
      state = this.cloneDeep(state);
      return Object.getOwnPropertyNames(state).reduce((newState, key) => {
        const presences = state[key];
        if ("metas" in presences) {
          newState[key] = presences.metas.map((presence) => {
            presence["presence_ref"] = presence["phx_ref"];
            delete presence["phx_ref"];
            delete presence["phx_ref_prev"];
            return presence;
          });
        } else {
          newState[key] = presences;
        }
        return newState;
      }, {});
    }
    /** @internal */
    static cloneDeep(obj) {
      return JSON.parse(JSON.stringify(obj));
    }
    /** @internal */
    onJoin(callback) {
      this.caller.onJoin = callback;
    }
    /** @internal */
    onLeave(callback) {
      this.caller.onLeave = callback;
    }
    /** @internal */
    onSync(callback) {
      this.caller.onSync = callback;
    }
    /** @internal */
    inPendingSyncState() {
      return !this.joinRef || this.joinRef !== this.channel._joinRef();
    }
  };

  // node_modules/@supabase/realtime-js/dist/module/RealtimeChannel.js
  var REALTIME_POSTGRES_CHANGES_LISTEN_EVENT;
  (function(REALTIME_POSTGRES_CHANGES_LISTEN_EVENT2) {
    REALTIME_POSTGRES_CHANGES_LISTEN_EVENT2["ALL"] = "*";
    REALTIME_POSTGRES_CHANGES_LISTEN_EVENT2["INSERT"] = "INSERT";
    REALTIME_POSTGRES_CHANGES_LISTEN_EVENT2["UPDATE"] = "UPDATE";
    REALTIME_POSTGRES_CHANGES_LISTEN_EVENT2["DELETE"] = "DELETE";
  })(REALTIME_POSTGRES_CHANGES_LISTEN_EVENT || (REALTIME_POSTGRES_CHANGES_LISTEN_EVENT = {}));
  var REALTIME_LISTEN_TYPES;
  (function(REALTIME_LISTEN_TYPES2) {
    REALTIME_LISTEN_TYPES2["BROADCAST"] = "broadcast";
    REALTIME_LISTEN_TYPES2["PRESENCE"] = "presence";
    REALTIME_LISTEN_TYPES2["POSTGRES_CHANGES"] = "postgres_changes";
    REALTIME_LISTEN_TYPES2["SYSTEM"] = "system";
  })(REALTIME_LISTEN_TYPES || (REALTIME_LISTEN_TYPES = {}));
  var REALTIME_SUBSCRIBE_STATES;
  (function(REALTIME_SUBSCRIBE_STATES2) {
    REALTIME_SUBSCRIBE_STATES2["SUBSCRIBED"] = "SUBSCRIBED";
    REALTIME_SUBSCRIBE_STATES2["TIMED_OUT"] = "TIMED_OUT";
    REALTIME_SUBSCRIBE_STATES2["CLOSED"] = "CLOSED";
    REALTIME_SUBSCRIBE_STATES2["CHANNEL_ERROR"] = "CHANNEL_ERROR";
  })(REALTIME_SUBSCRIBE_STATES || (REALTIME_SUBSCRIBE_STATES = {}));
  var RealtimeChannel = class _RealtimeChannel {
    constructor(topic, params = { config: {} }, socket) {
      this.topic = topic;
      this.params = params;
      this.socket = socket;
      this.bindings = {};
      this.state = CHANNEL_STATES.closed;
      this.joinedOnce = false;
      this.pushBuffer = [];
      this.subTopic = topic.replace(/^realtime:/i, "");
      this.params.config = Object.assign({
        broadcast: { ack: false, self: false },
        presence: { key: "", enabled: false },
        private: false
      }, params.config);
      this.timeout = this.socket.timeout;
      this.joinPush = new Push(this, CHANNEL_EVENTS.join, this.params, this.timeout);
      this.rejoinTimer = new Timer(() => this._rejoinUntilConnected(), this.socket.reconnectAfterMs);
      this.joinPush.receive("ok", () => {
        this.state = CHANNEL_STATES.joined;
        this.rejoinTimer.reset();
        this.pushBuffer.forEach((pushEvent) => pushEvent.send());
        this.pushBuffer = [];
      });
      this._onClose(() => {
        this.rejoinTimer.reset();
        this.socket.log("channel", `close ${this.topic} ${this._joinRef()}`);
        this.state = CHANNEL_STATES.closed;
        this.socket._remove(this);
      });
      this._onError((reason) => {
        if (this._isLeaving() || this._isClosed()) {
          return;
        }
        this.socket.log("channel", `error ${this.topic}`, reason);
        this.state = CHANNEL_STATES.errored;
        this.rejoinTimer.scheduleTimeout();
      });
      this.joinPush.receive("timeout", () => {
        if (!this._isJoining()) {
          return;
        }
        this.socket.log("channel", `timeout ${this.topic}`, this.joinPush.timeout);
        this.state = CHANNEL_STATES.errored;
        this.rejoinTimer.scheduleTimeout();
      });
      this.joinPush.receive("error", (reason) => {
        if (this._isLeaving() || this._isClosed()) {
          return;
        }
        this.socket.log("channel", `error ${this.topic}`, reason);
        this.state = CHANNEL_STATES.errored;
        this.rejoinTimer.scheduleTimeout();
      });
      this._on(CHANNEL_EVENTS.reply, {}, (payload, ref) => {
        this._trigger(this._replyEventName(ref), payload);
      });
      this.presence = new RealtimePresence(this);
      this.broadcastEndpointURL = httpEndpointURL(this.socket.endPoint);
      this.private = this.params.config.private || false;
    }
    /** Subscribe registers your client with the server */
    subscribe(callback, timeout = this.timeout) {
      var _a, _b;
      if (!this.socket.isConnected()) {
        this.socket.connect();
      }
      if (this.state == CHANNEL_STATES.closed) {
        const { config: { broadcast, presence, private: isPrivate } } = this.params;
        const postgres_changes = (_b = (_a = this.bindings.postgres_changes) === null || _a === void 0 ? void 0 : _a.map((r) => r.filter)) !== null && _b !== void 0 ? _b : [];
        const presence_enabled = !!this.bindings[REALTIME_LISTEN_TYPES.PRESENCE] && this.bindings[REALTIME_LISTEN_TYPES.PRESENCE].length > 0;
        const accessTokenPayload = {};
        const config = {
          broadcast,
          presence: Object.assign(Object.assign({}, presence), { enabled: presence_enabled }),
          postgres_changes,
          private: isPrivate
        };
        if (this.socket.accessTokenValue) {
          accessTokenPayload.access_token = this.socket.accessTokenValue;
        }
        this._onError((e) => callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR, e));
        this._onClose(() => callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.CLOSED));
        this.updateJoinPayload(Object.assign({ config }, accessTokenPayload));
        this.joinedOnce = true;
        this._rejoin(timeout);
        this.joinPush.receive("ok", async ({ postgres_changes: postgres_changes2 }) => {
          var _a2;
          this.socket.setAuth();
          if (postgres_changes2 === void 0) {
            callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.SUBSCRIBED);
            return;
          } else {
            const clientPostgresBindings = this.bindings.postgres_changes;
            const bindingsLen = (_a2 = clientPostgresBindings === null || clientPostgresBindings === void 0 ? void 0 : clientPostgresBindings.length) !== null && _a2 !== void 0 ? _a2 : 0;
            const newPostgresBindings = [];
            for (let i = 0; i < bindingsLen; i++) {
              const clientPostgresBinding = clientPostgresBindings[i];
              const { filter: { event: event2, schema, table, filter } } = clientPostgresBinding;
              const serverPostgresFilter = postgres_changes2 && postgres_changes2[i];
              if (serverPostgresFilter && serverPostgresFilter.event === event2 && serverPostgresFilter.schema === schema && serverPostgresFilter.table === table && serverPostgresFilter.filter === filter) {
                newPostgresBindings.push(Object.assign(Object.assign({}, clientPostgresBinding), { id: serverPostgresFilter.id }));
              } else {
                this.unsubscribe();
                this.state = CHANNEL_STATES.errored;
                callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR, new Error("mismatch between server and client bindings for postgres changes"));
                return;
              }
            }
            this.bindings.postgres_changes = newPostgresBindings;
            callback && callback(REALTIME_SUBSCRIBE_STATES.SUBSCRIBED);
            return;
          }
        }).receive("error", (error) => {
          this.state = CHANNEL_STATES.errored;
          callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR, new Error(JSON.stringify(Object.values(error).join(", ") || "error")));
          return;
        }).receive("timeout", () => {
          callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.TIMED_OUT);
          return;
        });
      }
      return this;
    }
    presenceState() {
      return this.presence.state;
    }
    async track(payload, opts = {}) {
      return await this.send({
        type: "presence",
        event: "track",
        payload
      }, opts.timeout || this.timeout);
    }
    async untrack(opts = {}) {
      return await this.send({
        type: "presence",
        event: "untrack"
      }, opts);
    }
    on(type, filter, callback) {
      if (this.state === CHANNEL_STATES.joined && type === REALTIME_LISTEN_TYPES.PRESENCE) {
        this.socket.log("channel", `resubscribe to ${this.topic} due to change in presence callbacks on joined channel`);
        this.unsubscribe().then(() => this.subscribe());
      }
      return this._on(type, filter, callback);
    }
    /**
     * Sends a message into the channel.
     *
     * @param args Arguments to send to channel
     * @param args.type The type of event to send
     * @param args.event The name of the event being sent
     * @param args.payload Payload to be sent
     * @param opts Options to be used during the send process
     */
    async send(args, opts = {}) {
      var _a, _b;
      if (!this._canPush() && args.type === "broadcast") {
        const { event: event2, payload: endpoint_payload } = args;
        const authorization = this.socket.accessTokenValue ? `Bearer ${this.socket.accessTokenValue}` : "";
        const options = {
          method: "POST",
          headers: {
            Authorization: authorization,
            apikey: this.socket.apiKey ? this.socket.apiKey : "",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messages: [
              {
                topic: this.subTopic,
                event: event2,
                payload: endpoint_payload,
                private: this.private
              }
            ]
          })
        };
        try {
          const response = await this._fetchWithTimeout(this.broadcastEndpointURL, options, (_a = opts.timeout) !== null && _a !== void 0 ? _a : this.timeout);
          await ((_b = response.body) === null || _b === void 0 ? void 0 : _b.cancel());
          return response.ok ? "ok" : "error";
        } catch (error) {
          if (error.name === "AbortError") {
            return "timed out";
          } else {
            return "error";
          }
        }
      } else {
        return new Promise((resolve) => {
          var _a2, _b2, _c;
          const push = this._push(args.type, args, opts.timeout || this.timeout);
          if (args.type === "broadcast" && !((_c = (_b2 = (_a2 = this.params) === null || _a2 === void 0 ? void 0 : _a2.config) === null || _b2 === void 0 ? void 0 : _b2.broadcast) === null || _c === void 0 ? void 0 : _c.ack)) {
            resolve("ok");
          }
          push.receive("ok", () => resolve("ok"));
          push.receive("error", () => resolve("error"));
          push.receive("timeout", () => resolve("timed out"));
        });
      }
    }
    updateJoinPayload(payload) {
      this.joinPush.updatePayload(payload);
    }
    /**
     * Leaves the channel.
     *
     * Unsubscribes from server events, and instructs channel to terminate on server.
     * Triggers onClose() hooks.
     *
     * To receive leave acknowledgements, use the a `receive` hook to bind to the server ack, ie:
     * channel.unsubscribe().receive("ok", () => alert("left!") )
     */
    unsubscribe(timeout = this.timeout) {
      this.state = CHANNEL_STATES.leaving;
      const onClose = () => {
        this.socket.log("channel", `leave ${this.topic}`);
        this._trigger(CHANNEL_EVENTS.close, "leave", this._joinRef());
      };
      this.joinPush.destroy();
      let leavePush = null;
      return new Promise((resolve) => {
        leavePush = new Push(this, CHANNEL_EVENTS.leave, {}, timeout);
        leavePush.receive("ok", () => {
          onClose();
          resolve("ok");
        }).receive("timeout", () => {
          onClose();
          resolve("timed out");
        }).receive("error", () => {
          resolve("error");
        });
        leavePush.send();
        if (!this._canPush()) {
          leavePush.trigger("ok", {});
        }
      }).finally(() => {
        leavePush === null || leavePush === void 0 ? void 0 : leavePush.destroy();
      });
    }
    /**
     * Teardown the channel.
     *
     * Destroys and stops related timers.
     */
    teardown() {
      this.pushBuffer.forEach((push) => push.destroy());
      this.pushBuffer = [];
      this.rejoinTimer.reset();
      this.joinPush.destroy();
      this.state = CHANNEL_STATES.closed;
      this.bindings = {};
    }
    /** @internal */
    async _fetchWithTimeout(url, options, timeout) {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      const response = await this.socket.fetch(url, Object.assign(Object.assign({}, options), { signal: controller.signal }));
      clearTimeout(id);
      return response;
    }
    /** @internal */
    _push(event2, payload, timeout = this.timeout) {
      if (!this.joinedOnce) {
        throw `tried to push '${event2}' to '${this.topic}' before joining. Use channel.subscribe() before pushing events`;
      }
      let pushEvent = new Push(this, event2, payload, timeout);
      if (this._canPush()) {
        pushEvent.send();
      } else {
        this._addToPushBuffer(pushEvent);
      }
      return pushEvent;
    }
    /** @internal */
    _addToPushBuffer(pushEvent) {
      pushEvent.startTimeout();
      this.pushBuffer.push(pushEvent);
      if (this.pushBuffer.length > MAX_PUSH_BUFFER_SIZE) {
        const removedPush = this.pushBuffer.shift();
        if (removedPush) {
          removedPush.destroy();
          this.socket.log("channel", `discarded push due to buffer overflow: ${removedPush.event}`, removedPush.payload);
        }
      }
    }
    /**
     * Overridable message hook
     *
     * Receives all events for specialized message handling before dispatching to the channel callbacks.
     * Must return the payload, modified or unmodified.
     *
     * @internal
     */
    _onMessage(_event, payload, _ref) {
      return payload;
    }
    /** @internal */
    _isMember(topic) {
      return this.topic === topic;
    }
    /** @internal */
    _joinRef() {
      return this.joinPush.ref;
    }
    /** @internal */
    _trigger(type, payload, ref) {
      var _a, _b;
      const typeLower = type.toLocaleLowerCase();
      const { close, error, leave, join } = CHANNEL_EVENTS;
      const events = [close, error, leave, join];
      if (ref && events.indexOf(typeLower) >= 0 && ref !== this._joinRef()) {
        return;
      }
      let handledPayload = this._onMessage(typeLower, payload, ref);
      if (payload && !handledPayload) {
        throw "channel onMessage callbacks must return the payload, modified or unmodified";
      }
      if (["insert", "update", "delete"].includes(typeLower)) {
        (_a = this.bindings.postgres_changes) === null || _a === void 0 ? void 0 : _a.filter((bind) => {
          var _a2, _b2, _c;
          return ((_a2 = bind.filter) === null || _a2 === void 0 ? void 0 : _a2.event) === "*" || ((_c = (_b2 = bind.filter) === null || _b2 === void 0 ? void 0 : _b2.event) === null || _c === void 0 ? void 0 : _c.toLocaleLowerCase()) === typeLower;
        }).map((bind) => bind.callback(handledPayload, ref));
      } else {
        (_b = this.bindings[typeLower]) === null || _b === void 0 ? void 0 : _b.filter((bind) => {
          var _a2, _b2, _c, _d, _e, _f;
          if (["broadcast", "presence", "postgres_changes"].includes(typeLower)) {
            if ("id" in bind) {
              const bindId = bind.id;
              const bindEvent = (_a2 = bind.filter) === null || _a2 === void 0 ? void 0 : _a2.event;
              return bindId && ((_b2 = payload.ids) === null || _b2 === void 0 ? void 0 : _b2.includes(bindId)) && (bindEvent === "*" || (bindEvent === null || bindEvent === void 0 ? void 0 : bindEvent.toLocaleLowerCase()) === ((_c = payload.data) === null || _c === void 0 ? void 0 : _c.type.toLocaleLowerCase()));
            } else {
              const bindEvent = (_e = (_d = bind === null || bind === void 0 ? void 0 : bind.filter) === null || _d === void 0 ? void 0 : _d.event) === null || _e === void 0 ? void 0 : _e.toLocaleLowerCase();
              return bindEvent === "*" || bindEvent === ((_f = payload === null || payload === void 0 ? void 0 : payload.event) === null || _f === void 0 ? void 0 : _f.toLocaleLowerCase());
            }
          } else {
            return bind.type.toLocaleLowerCase() === typeLower;
          }
        }).map((bind) => {
          if (typeof handledPayload === "object" && "ids" in handledPayload) {
            const postgresChanges = handledPayload.data;
            const { schema, table, commit_timestamp, type: type2, errors } = postgresChanges;
            const enrichedPayload = {
              schema,
              table,
              commit_timestamp,
              eventType: type2,
              new: {},
              old: {},
              errors
            };
            handledPayload = Object.assign(Object.assign({}, enrichedPayload), this._getPayloadRecords(postgresChanges));
          }
          bind.callback(handledPayload, ref);
        });
      }
    }
    /** @internal */
    _isClosed() {
      return this.state === CHANNEL_STATES.closed;
    }
    /** @internal */
    _isJoined() {
      return this.state === CHANNEL_STATES.joined;
    }
    /** @internal */
    _isJoining() {
      return this.state === CHANNEL_STATES.joining;
    }
    /** @internal */
    _isLeaving() {
      return this.state === CHANNEL_STATES.leaving;
    }
    /** @internal */
    _replyEventName(ref) {
      return `chan_reply_${ref}`;
    }
    /** @internal */
    _on(type, filter, callback) {
      const typeLower = type.toLocaleLowerCase();
      const binding = {
        type: typeLower,
        filter,
        callback
      };
      if (this.bindings[typeLower]) {
        this.bindings[typeLower].push(binding);
      } else {
        this.bindings[typeLower] = [binding];
      }
      return this;
    }
    /** @internal */
    _off(type, filter) {
      const typeLower = type.toLocaleLowerCase();
      if (this.bindings[typeLower]) {
        this.bindings[typeLower] = this.bindings[typeLower].filter((bind) => {
          var _a;
          return !(((_a = bind.type) === null || _a === void 0 ? void 0 : _a.toLocaleLowerCase()) === typeLower && _RealtimeChannel.isEqual(bind.filter, filter));
        });
      }
      return this;
    }
    /** @internal */
    static isEqual(obj1, obj2) {
      if (Object.keys(obj1).length !== Object.keys(obj2).length) {
        return false;
      }
      for (const k in obj1) {
        if (obj1[k] !== obj2[k]) {
          return false;
        }
      }
      return true;
    }
    /** @internal */
    _rejoinUntilConnected() {
      this.rejoinTimer.scheduleTimeout();
      if (this.socket.isConnected()) {
        this._rejoin();
      }
    }
    /**
     * Registers a callback that will be executed when the channel closes.
     *
     * @internal
     */
    _onClose(callback) {
      this._on(CHANNEL_EVENTS.close, {}, callback);
    }
    /**
     * Registers a callback that will be executed when the channel encounteres an error.
     *
     * @internal
     */
    _onError(callback) {
      this._on(CHANNEL_EVENTS.error, {}, (reason) => callback(reason));
    }
    /**
     * Returns `true` if the socket is connected and the channel has been joined.
     *
     * @internal
     */
    _canPush() {
      return this.socket.isConnected() && this._isJoined();
    }
    /** @internal */
    _rejoin(timeout = this.timeout) {
      if (this._isLeaving()) {
        return;
      }
      this.socket._leaveOpenTopic(this.topic);
      this.state = CHANNEL_STATES.joining;
      this.joinPush.resend(timeout);
    }
    /** @internal */
    _getPayloadRecords(payload) {
      const records = {
        new: {},
        old: {}
      };
      if (payload.type === "INSERT" || payload.type === "UPDATE") {
        records.new = convertChangeData(payload.columns, payload.record);
      }
      if (payload.type === "UPDATE" || payload.type === "DELETE") {
        records.old = convertChangeData(payload.columns, payload.old_record);
      }
      return records;
    }
  };

  // node_modules/@supabase/realtime-js/dist/module/RealtimeClient.js
  var noop2 = () => {
  };
  var CONNECTION_TIMEOUTS = {
    HEARTBEAT_INTERVAL: 25e3,
    RECONNECT_DELAY: 10,
    HEARTBEAT_TIMEOUT_FALLBACK: 100
  };
  var RECONNECT_INTERVALS = [1e3, 2e3, 5e3, 1e4];
  var DEFAULT_RECONNECT_FALLBACK = 1e4;
  var WORKER_SCRIPT = `
  addEventListener("message", (e) => {
    if (e.data.event === "start") {
      setInterval(() => postMessage({ event: "keepAlive" }), e.data.interval);
    }
  });`;
  var RealtimeClient = class {
    /**
     * Initializes the Socket.
     *
     * @param endPoint The string WebSocket endpoint, ie, "ws://example.com/socket", "wss://example.com", "/socket" (inherited host & protocol)
     * @param httpEndpoint The string HTTP endpoint, ie, "https://example.com", "/" (inherited host & protocol)
     * @param options.transport The Websocket Transport, for example WebSocket. This can be a custom implementation
     * @param options.timeout The default timeout in milliseconds to trigger push timeouts.
     * @param options.params The optional params to pass when connecting.
     * @param options.headers Deprecated: headers cannot be set on websocket connections and this option will be removed in the future.
     * @param options.heartbeatIntervalMs The millisec interval to send a heartbeat message.
     * @param options.logger The optional function for specialized logging, ie: logger: (kind, msg, data) => { console.log(`${kind}: ${msg}`, data) }
     * @param options.logLevel Sets the log level for Realtime
     * @param options.encode The function to encode outgoing messages. Defaults to JSON: (payload, callback) => callback(JSON.stringify(payload))
     * @param options.decode The function to decode incoming messages. Defaults to Serializer's decode.
     * @param options.reconnectAfterMs he optional function that returns the millsec reconnect interval. Defaults to stepped backoff off.
     * @param options.worker Use Web Worker to set a side flow. Defaults to false.
     * @param options.workerUrl The URL of the worker script. Defaults to https://realtime.supabase.com/worker.js that includes a heartbeat event call to keep the connection alive.
     */
    constructor(endPoint, options) {
      var _a;
      this.accessTokenValue = null;
      this.apiKey = null;
      this.channels = new Array();
      this.endPoint = "";
      this.httpEndpoint = "";
      this.headers = {};
      this.params = {};
      this.timeout = DEFAULT_TIMEOUT;
      this.transport = null;
      this.heartbeatIntervalMs = CONNECTION_TIMEOUTS.HEARTBEAT_INTERVAL;
      this.heartbeatTimer = void 0;
      this.pendingHeartbeatRef = null;
      this.heartbeatCallback = noop2;
      this.ref = 0;
      this.reconnectTimer = null;
      this.logger = noop2;
      this.conn = null;
      this.sendBuffer = [];
      this.serializer = new Serializer();
      this.stateChangeCallbacks = {
        open: [],
        close: [],
        error: [],
        message: []
      };
      this.accessToken = null;
      this._connectionState = "disconnected";
      this._wasManualDisconnect = false;
      this._authPromise = null;
      this._resolveFetch = (customFetch) => {
        let _fetch;
        if (customFetch) {
          _fetch = customFetch;
        } else if (typeof fetch === "undefined") {
          _fetch = (...args) => Promise.resolve().then(() => (init_browser(), browser_exports)).then(({ default: fetch3 }) => fetch3(...args)).catch((error) => {
            throw new Error(`Failed to load @supabase/node-fetch: ${error.message}. This is required for HTTP requests in Node.js environments without native fetch.`);
          });
        } else {
          _fetch = fetch;
        }
        return (...args) => _fetch(...args);
      };
      if (!((_a = options === null || options === void 0 ? void 0 : options.params) === null || _a === void 0 ? void 0 : _a.apikey)) {
        throw new Error("API key is required to connect to Realtime");
      }
      this.apiKey = options.params.apikey;
      this.endPoint = `${endPoint}/${TRANSPORTS.websocket}`;
      this.httpEndpoint = httpEndpointURL(endPoint);
      this._initializeOptions(options);
      this._setupReconnectionTimer();
      this.fetch = this._resolveFetch(options === null || options === void 0 ? void 0 : options.fetch);
    }
    /**
     * Connects the socket, unless already connected.
     */
    connect() {
      if (this.isConnecting() || this.isDisconnecting() || this.conn !== null && this.isConnected()) {
        return;
      }
      this._setConnectionState("connecting");
      this._setAuthSafely("connect");
      if (this.transport) {
        this.conn = new this.transport(this.endpointURL());
      } else {
        try {
          this.conn = websocket_factory_default.createWebSocket(this.endpointURL());
        } catch (error) {
          this._setConnectionState("disconnected");
          const errorMessage = error.message;
          if (errorMessage.includes("Node.js")) {
            throw new Error(`${errorMessage}

To use Realtime in Node.js, you need to provide a WebSocket implementation:

Option 1: Use Node.js 22+ which has native WebSocket support
Option 2: Install and provide the "ws" package:

  npm install ws

  import ws from "ws"
  const client = new RealtimeClient(url, {
    ...options,
    transport: ws
  })`);
          }
          throw new Error(`WebSocket not available: ${errorMessage}`);
        }
      }
      this._setupConnectionHandlers();
    }
    /**
     * Returns the URL of the websocket.
     * @returns string The URL of the websocket.
     */
    endpointURL() {
      return this._appendParams(this.endPoint, Object.assign({}, this.params, { vsn: VSN }));
    }
    /**
     * Disconnects the socket.
     *
     * @param code A numeric status code to send on disconnect.
     * @param reason A custom reason for the disconnect.
     */
    disconnect(code, reason) {
      if (this.isDisconnecting()) {
        return;
      }
      this._setConnectionState("disconnecting", true);
      if (this.conn) {
        const fallbackTimer = setTimeout(() => {
          this._setConnectionState("disconnected");
        }, 100);
        this.conn.onclose = () => {
          clearTimeout(fallbackTimer);
          this._setConnectionState("disconnected");
        };
        if (code) {
          this.conn.close(code, reason !== null && reason !== void 0 ? reason : "");
        } else {
          this.conn.close();
        }
        this._teardownConnection();
      } else {
        this._setConnectionState("disconnected");
      }
    }
    /**
     * Returns all created channels
     */
    getChannels() {
      return this.channels;
    }
    /**
     * Unsubscribes and removes a single channel
     * @param channel A RealtimeChannel instance
     */
    async removeChannel(channel) {
      const status = await channel.unsubscribe();
      if (this.channels.length === 0) {
        this.disconnect();
      }
      return status;
    }
    /**
     * Unsubscribes and removes all channels
     */
    async removeAllChannels() {
      const values_1 = await Promise.all(this.channels.map((channel) => channel.unsubscribe()));
      this.channels = [];
      this.disconnect();
      return values_1;
    }
    /**
     * Logs the message.
     *
     * For customized logging, `this.logger` can be overridden.
     */
    log(kind, msg, data) {
      this.logger(kind, msg, data);
    }
    /**
     * Returns the current state of the socket.
     */
    connectionState() {
      switch (this.conn && this.conn.readyState) {
        case SOCKET_STATES.connecting:
          return CONNECTION_STATE.Connecting;
        case SOCKET_STATES.open:
          return CONNECTION_STATE.Open;
        case SOCKET_STATES.closing:
          return CONNECTION_STATE.Closing;
        default:
          return CONNECTION_STATE.Closed;
      }
    }
    /**
     * Returns `true` is the connection is open.
     */
    isConnected() {
      return this.connectionState() === CONNECTION_STATE.Open;
    }
    /**
     * Returns `true` if the connection is currently connecting.
     */
    isConnecting() {
      return this._connectionState === "connecting";
    }
    /**
     * Returns `true` if the connection is currently disconnecting.
     */
    isDisconnecting() {
      return this._connectionState === "disconnecting";
    }
    channel(topic, params = { config: {} }) {
      const realtimeTopic = `realtime:${topic}`;
      const exists = this.getChannels().find((c) => c.topic === realtimeTopic);
      if (!exists) {
        const chan = new RealtimeChannel(`realtime:${topic}`, params, this);
        this.channels.push(chan);
        return chan;
      } else {
        return exists;
      }
    }
    /**
     * Push out a message if the socket is connected.
     *
     * If the socket is not connected, the message gets enqueued within a local buffer, and sent out when a connection is next established.
     */
    push(data) {
      const { topic, event: event2, payload, ref } = data;
      const callback = () => {
        this.encode(data, (result) => {
          var _a;
          (_a = this.conn) === null || _a === void 0 ? void 0 : _a.send(result);
        });
      };
      this.log("push", `${topic} ${event2} (${ref})`, payload);
      if (this.isConnected()) {
        callback();
      } else {
        this.sendBuffer.push(callback);
      }
    }
    /**
     * Sets the JWT access token used for channel subscription authorization and Realtime RLS.
     *
     * If param is null it will use the `accessToken` callback function or the token set on the client.
     *
     * On callback used, it will set the value of the token internal to the client.
     *
     * @param token A JWT string to override the token set on the client.
     */
    async setAuth(token = null) {
      this._authPromise = this._performAuth(token);
      try {
        await this._authPromise;
      } finally {
        this._authPromise = null;
      }
    }
    /**
     * Sends a heartbeat message if the socket is connected.
     */
    async sendHeartbeat() {
      var _a;
      if (!this.isConnected()) {
        this.heartbeatCallback("disconnected");
        return;
      }
      if (this.pendingHeartbeatRef) {
        this.pendingHeartbeatRef = null;
        this.log("transport", "heartbeat timeout. Attempting to re-establish connection");
        this.heartbeatCallback("timeout");
        this._wasManualDisconnect = false;
        (_a = this.conn) === null || _a === void 0 ? void 0 : _a.close(WS_CLOSE_NORMAL, "heartbeat timeout");
        setTimeout(() => {
          var _a2;
          if (!this.isConnected()) {
            (_a2 = this.reconnectTimer) === null || _a2 === void 0 ? void 0 : _a2.scheduleTimeout();
          }
        }, CONNECTION_TIMEOUTS.HEARTBEAT_TIMEOUT_FALLBACK);
        return;
      }
      this.pendingHeartbeatRef = this._makeRef();
      this.push({
        topic: "phoenix",
        event: "heartbeat",
        payload: {},
        ref: this.pendingHeartbeatRef
      });
      this.heartbeatCallback("sent");
      this._setAuthSafely("heartbeat");
    }
    onHeartbeat(callback) {
      this.heartbeatCallback = callback;
    }
    /**
     * Flushes send buffer
     */
    flushSendBuffer() {
      if (this.isConnected() && this.sendBuffer.length > 0) {
        this.sendBuffer.forEach((callback) => callback());
        this.sendBuffer = [];
      }
    }
    /**
     * Return the next message ref, accounting for overflows
     *
     * @internal
     */
    _makeRef() {
      let newRef = this.ref + 1;
      if (newRef === this.ref) {
        this.ref = 0;
      } else {
        this.ref = newRef;
      }
      return this.ref.toString();
    }
    /**
     * Unsubscribe from channels with the specified topic.
     *
     * @internal
     */
    _leaveOpenTopic(topic) {
      let dupChannel = this.channels.find((c) => c.topic === topic && (c._isJoined() || c._isJoining()));
      if (dupChannel) {
        this.log("transport", `leaving duplicate topic "${topic}"`);
        dupChannel.unsubscribe();
      }
    }
    /**
     * Removes a subscription from the socket.
     *
     * @param channel An open subscription.
     *
     * @internal
     */
    _remove(channel) {
      this.channels = this.channels.filter((c) => c.topic !== channel.topic);
    }
    /** @internal */
    _onConnMessage(rawMessage) {
      this.decode(rawMessage.data, (msg) => {
        if (msg.topic === "phoenix" && msg.event === "phx_reply") {
          this.heartbeatCallback(msg.payload.status === "ok" ? "ok" : "error");
        }
        if (msg.ref && msg.ref === this.pendingHeartbeatRef) {
          this.pendingHeartbeatRef = null;
        }
        const { topic, event: event2, payload, ref } = msg;
        const refString = ref ? `(${ref})` : "";
        const status = payload.status || "";
        this.log("receive", `${status} ${topic} ${event2} ${refString}`.trim(), payload);
        this.channels.filter((channel) => channel._isMember(topic)).forEach((channel) => channel._trigger(event2, payload, ref));
        this._triggerStateCallbacks("message", msg);
      });
    }
    /**
     * Clear specific timer
     * @internal
     */
    _clearTimer(timer) {
      var _a;
      if (timer === "heartbeat" && this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = void 0;
      } else if (timer === "reconnect") {
        (_a = this.reconnectTimer) === null || _a === void 0 ? void 0 : _a.reset();
      }
    }
    /**
     * Clear all timers
     * @internal
     */
    _clearAllTimers() {
      this._clearTimer("heartbeat");
      this._clearTimer("reconnect");
    }
    /**
     * Setup connection handlers for WebSocket events
     * @internal
     */
    _setupConnectionHandlers() {
      if (!this.conn)
        return;
      if ("binaryType" in this.conn) {
        ;
        this.conn.binaryType = "arraybuffer";
      }
      this.conn.onopen = () => this._onConnOpen();
      this.conn.onerror = (error) => this._onConnError(error);
      this.conn.onmessage = (event2) => this._onConnMessage(event2);
      this.conn.onclose = (event2) => this._onConnClose(event2);
    }
    /**
     * Teardown connection and cleanup resources
     * @internal
     */
    _teardownConnection() {
      if (this.conn) {
        this.conn.onopen = null;
        this.conn.onerror = null;
        this.conn.onmessage = null;
        this.conn.onclose = null;
        this.conn = null;
      }
      this._clearAllTimers();
      this.channels.forEach((channel) => channel.teardown());
    }
    /** @internal */
    _onConnOpen() {
      this._setConnectionState("connected");
      this.log("transport", `connected to ${this.endpointURL()}`);
      this.flushSendBuffer();
      this._clearTimer("reconnect");
      if (!this.worker) {
        this._startHeartbeat();
      } else {
        if (!this.workerRef) {
          this._startWorkerHeartbeat();
        }
      }
      this._triggerStateCallbacks("open");
    }
    /** @internal */
    _startHeartbeat() {
      this.heartbeatTimer && clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = setInterval(() => this.sendHeartbeat(), this.heartbeatIntervalMs);
    }
    /** @internal */
    _startWorkerHeartbeat() {
      if (this.workerUrl) {
        this.log("worker", `starting worker for from ${this.workerUrl}`);
      } else {
        this.log("worker", `starting default worker`);
      }
      const objectUrl = this._workerObjectUrl(this.workerUrl);
      this.workerRef = new Worker(objectUrl);
      this.workerRef.onerror = (error) => {
        this.log("worker", "worker error", error.message);
        this.workerRef.terminate();
      };
      this.workerRef.onmessage = (event2) => {
        if (event2.data.event === "keepAlive") {
          this.sendHeartbeat();
        }
      };
      this.workerRef.postMessage({
        event: "start",
        interval: this.heartbeatIntervalMs
      });
    }
    /** @internal */
    _onConnClose(event2) {
      var _a;
      this._setConnectionState("disconnected");
      this.log("transport", "close", event2);
      this._triggerChanError();
      this._clearTimer("heartbeat");
      if (!this._wasManualDisconnect) {
        (_a = this.reconnectTimer) === null || _a === void 0 ? void 0 : _a.scheduleTimeout();
      }
      this._triggerStateCallbacks("close", event2);
    }
    /** @internal */
    _onConnError(error) {
      this._setConnectionState("disconnected");
      this.log("transport", `${error}`);
      this._triggerChanError();
      this._triggerStateCallbacks("error", error);
    }
    /** @internal */
    _triggerChanError() {
      this.channels.forEach((channel) => channel._trigger(CHANNEL_EVENTS.error));
    }
    /** @internal */
    _appendParams(url, params) {
      if (Object.keys(params).length === 0) {
        return url;
      }
      const prefix = url.match(/\?/) ? "&" : "?";
      const query = new URLSearchParams(params);
      return `${url}${prefix}${query}`;
    }
    _workerObjectUrl(url) {
      let result_url;
      if (url) {
        result_url = url;
      } else {
        const blob = new Blob([WORKER_SCRIPT], { type: "application/javascript" });
        result_url = URL.createObjectURL(blob);
      }
      return result_url;
    }
    /**
     * Set connection state with proper state management
     * @internal
     */
    _setConnectionState(state, manual = false) {
      this._connectionState = state;
      if (state === "connecting") {
        this._wasManualDisconnect = false;
      } else if (state === "disconnecting") {
        this._wasManualDisconnect = manual;
      }
    }
    /**
     * Perform the actual auth operation
     * @internal
     */
    async _performAuth(token = null) {
      let tokenToSend;
      if (token) {
        tokenToSend = token;
      } else if (this.accessToken) {
        tokenToSend = await this.accessToken();
      } else {
        tokenToSend = this.accessTokenValue;
      }
      if (this.accessTokenValue != tokenToSend) {
        this.accessTokenValue = tokenToSend;
        this.channels.forEach((channel) => {
          const payload = {
            access_token: tokenToSend,
            version: DEFAULT_VERSION
          };
          tokenToSend && channel.updateJoinPayload(payload);
          if (channel.joinedOnce && channel._isJoined()) {
            channel._push(CHANNEL_EVENTS.access_token, {
              access_token: tokenToSend
            });
          }
        });
      }
    }
    /**
     * Wait for any in-flight auth operations to complete
     * @internal
     */
    async _waitForAuthIfNeeded() {
      if (this._authPromise) {
        await this._authPromise;
      }
    }
    /**
     * Safely call setAuth with standardized error handling
     * @internal
     */
    _setAuthSafely(context = "general") {
      this.setAuth().catch((e) => {
        this.log("error", `error setting auth in ${context}`, e);
      });
    }
    /**
     * Trigger state change callbacks with proper error handling
     * @internal
     */
    _triggerStateCallbacks(event2, data) {
      try {
        this.stateChangeCallbacks[event2].forEach((callback) => {
          try {
            callback(data);
          } catch (e) {
            this.log("error", `error in ${event2} callback`, e);
          }
        });
      } catch (e) {
        this.log("error", `error triggering ${event2} callbacks`, e);
      }
    }
    /**
     * Setup reconnection timer with proper configuration
     * @internal
     */
    _setupReconnectionTimer() {
      this.reconnectTimer = new Timer(async () => {
        setTimeout(async () => {
          await this._waitForAuthIfNeeded();
          if (!this.isConnected()) {
            this.connect();
          }
        }, CONNECTION_TIMEOUTS.RECONNECT_DELAY);
      }, this.reconnectAfterMs);
    }
    /**
     * Initialize client options with defaults
     * @internal
     */
    _initializeOptions(options) {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      this.transport = (_a = options === null || options === void 0 ? void 0 : options.transport) !== null && _a !== void 0 ? _a : null;
      this.timeout = (_b = options === null || options === void 0 ? void 0 : options.timeout) !== null && _b !== void 0 ? _b : DEFAULT_TIMEOUT;
      this.heartbeatIntervalMs = (_c = options === null || options === void 0 ? void 0 : options.heartbeatIntervalMs) !== null && _c !== void 0 ? _c : CONNECTION_TIMEOUTS.HEARTBEAT_INTERVAL;
      this.worker = (_d = options === null || options === void 0 ? void 0 : options.worker) !== null && _d !== void 0 ? _d : false;
      this.accessToken = (_e = options === null || options === void 0 ? void 0 : options.accessToken) !== null && _e !== void 0 ? _e : null;
      if (options === null || options === void 0 ? void 0 : options.params)
        this.params = options.params;
      if (options === null || options === void 0 ? void 0 : options.logger)
        this.logger = options.logger;
      if ((options === null || options === void 0 ? void 0 : options.logLevel) || (options === null || options === void 0 ? void 0 : options.log_level)) {
        this.logLevel = options.logLevel || options.log_level;
        this.params = Object.assign(Object.assign({}, this.params), { log_level: this.logLevel });
      }
      this.reconnectAfterMs = (_f = options === null || options === void 0 ? void 0 : options.reconnectAfterMs) !== null && _f !== void 0 ? _f : ((tries) => {
        return RECONNECT_INTERVALS[tries - 1] || DEFAULT_RECONNECT_FALLBACK;
      });
      this.encode = (_g = options === null || options === void 0 ? void 0 : options.encode) !== null && _g !== void 0 ? _g : ((payload, callback) => {
        return callback(JSON.stringify(payload));
      });
      this.decode = (_h = options === null || options === void 0 ? void 0 : options.decode) !== null && _h !== void 0 ? _h : this.serializer.decode.bind(this.serializer);
      if (this.worker) {
        if (typeof window !== "undefined" && !window.Worker) {
          throw new Error("Web Worker is not supported");
        }
        this.workerUrl = options === null || options === void 0 ? void 0 : options.workerUrl;
      }
    }
  };

  // node_modules/@supabase/storage-js/dist/module/lib/errors.js
  var StorageError = class extends Error {
    constructor(message) {
      super(message);
      this.__isStorageError = true;
      this.name = "StorageError";
    }
  };
  function isStorageError(error) {
    return typeof error === "object" && error !== null && "__isStorageError" in error;
  }
  var StorageApiError = class extends StorageError {
    constructor(message, status, statusCode) {
      super(message);
      this.name = "StorageApiError";
      this.status = status;
      this.statusCode = statusCode;
    }
    toJSON() {
      return {
        name: this.name,
        message: this.message,
        status: this.status,
        statusCode: this.statusCode
      };
    }
  };
  var StorageUnknownError = class extends StorageError {
    constructor(message, originalError) {
      super(message);
      this.name = "StorageUnknownError";
      this.originalError = originalError;
    }
  };

  // node_modules/@supabase/storage-js/dist/module/lib/helpers.js
  var __awaiter2 = function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var resolveFetch2 = (customFetch) => {
    let _fetch;
    if (customFetch) {
      _fetch = customFetch;
    } else if (typeof fetch === "undefined") {
      _fetch = (...args) => Promise.resolve().then(() => (init_browser(), browser_exports)).then(({ default: fetch3 }) => fetch3(...args));
    } else {
      _fetch = fetch;
    }
    return (...args) => _fetch(...args);
  };
  var resolveResponse = () => __awaiter2(void 0, void 0, void 0, function* () {
    if (typeof Response === "undefined") {
      return (yield Promise.resolve().then(() => (init_browser(), browser_exports))).Response;
    }
    return Response;
  });
  var recursiveToCamel = (item) => {
    if (Array.isArray(item)) {
      return item.map((el) => recursiveToCamel(el));
    } else if (typeof item === "function" || item !== Object(item)) {
      return item;
    }
    const result = {};
    Object.entries(item).forEach(([key, value]) => {
      const newKey = key.replace(/([-_][a-z])/gi, (c) => c.toUpperCase().replace(/[-_]/g, ""));
      result[newKey] = recursiveToCamel(value);
    });
    return result;
  };
  var isPlainObject = (value) => {
    if (typeof value !== "object" || value === null) {
      return false;
    }
    const prototype = Object.getPrototypeOf(value);
    return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
  };

  // node_modules/@supabase/storage-js/dist/module/lib/fetch.js
  var __awaiter3 = function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var _getErrorMessage = (err) => err.msg || err.message || err.error_description || err.error || JSON.stringify(err);
  var handleError = (error, reject, options) => __awaiter3(void 0, void 0, void 0, function* () {
    const Res = yield resolveResponse();
    if (error instanceof Res && !(options === null || options === void 0 ? void 0 : options.noResolveJson)) {
      error.json().then((err) => {
        const status = error.status || 500;
        const statusCode = (err === null || err === void 0 ? void 0 : err.statusCode) || status + "";
        reject(new StorageApiError(_getErrorMessage(err), status, statusCode));
      }).catch((err) => {
        reject(new StorageUnknownError(_getErrorMessage(err), err));
      });
    } else {
      reject(new StorageUnknownError(_getErrorMessage(error), error));
    }
  });
  var _getRequestParams = (method, options, parameters, body) => {
    const params = { method, headers: (options === null || options === void 0 ? void 0 : options.headers) || {} };
    if (method === "GET" || !body) {
      return params;
    }
    if (isPlainObject(body)) {
      params.headers = Object.assign({ "Content-Type": "application/json" }, options === null || options === void 0 ? void 0 : options.headers);
      params.body = JSON.stringify(body);
    } else {
      params.body = body;
    }
    if (options === null || options === void 0 ? void 0 : options.duplex) {
      params.duplex = options.duplex;
    }
    return Object.assign(Object.assign({}, params), parameters);
  };
  function _handleRequest(fetcher, method, url, options, parameters, body) {
    return __awaiter3(this, void 0, void 0, function* () {
      return new Promise((resolve, reject) => {
        fetcher(url, _getRequestParams(method, options, parameters, body)).then((result) => {
          if (!result.ok)
            throw result;
          if (options === null || options === void 0 ? void 0 : options.noResolveJson)
            return result;
          return result.json();
        }).then((data) => resolve(data)).catch((error) => handleError(error, reject, options));
      });
    });
  }
  function get(fetcher, url, options, parameters) {
    return __awaiter3(this, void 0, void 0, function* () {
      return _handleRequest(fetcher, "GET", url, options, parameters);
    });
  }
  function post(fetcher, url, body, options, parameters) {
    return __awaiter3(this, void 0, void 0, function* () {
      return _handleRequest(fetcher, "POST", url, options, parameters, body);
    });
  }
  function put(fetcher, url, body, options, parameters) {
    return __awaiter3(this, void 0, void 0, function* () {
      return _handleRequest(fetcher, "PUT", url, options, parameters, body);
    });
  }
  function head(fetcher, url, options, parameters) {
    return __awaiter3(this, void 0, void 0, function* () {
      return _handleRequest(fetcher, "HEAD", url, Object.assign(Object.assign({}, options), { noResolveJson: true }), parameters);
    });
  }
  function remove(fetcher, url, body, options, parameters) {
    return __awaiter3(this, void 0, void 0, function* () {
      return _handleRequest(fetcher, "DELETE", url, options, parameters, body);
    });
  }

  // node_modules/@supabase/storage-js/dist/module/packages/StorageFileApi.js
  var __awaiter4 = function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var DEFAULT_SEARCH_OPTIONS = {
    limit: 100,
    offset: 0,
    sortBy: {
      column: "name",
      order: "asc"
    }
  };
  var DEFAULT_FILE_OPTIONS = {
    cacheControl: "3600",
    contentType: "text/plain;charset=UTF-8",
    upsert: false
  };
  var StorageFileApi = class {
    constructor(url, headers = {}, bucketId, fetch3) {
      this.url = url;
      this.headers = headers;
      this.bucketId = bucketId;
      this.fetch = resolveFetch2(fetch3);
    }
    /**
     * Uploads a file to an existing bucket or replaces an existing file at the specified path with a new one.
     *
     * @param method HTTP method.
     * @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
     * @param fileBody The body of the file to be stored in the bucket.
     */
    uploadOrUpdate(method, path, fileBody, fileOptions) {
      return __awaiter4(this, void 0, void 0, function* () {
        try {
          let body;
          const options = Object.assign(Object.assign({}, DEFAULT_FILE_OPTIONS), fileOptions);
          let headers = Object.assign(Object.assign({}, this.headers), method === "POST" && { "x-upsert": String(options.upsert) });
          const metadata = options.metadata;
          if (typeof Blob !== "undefined" && fileBody instanceof Blob) {
            body = new FormData();
            body.append("cacheControl", options.cacheControl);
            if (metadata) {
              body.append("metadata", this.encodeMetadata(metadata));
            }
            body.append("", fileBody);
          } else if (typeof FormData !== "undefined" && fileBody instanceof FormData) {
            body = fileBody;
            body.append("cacheControl", options.cacheControl);
            if (metadata) {
              body.append("metadata", this.encodeMetadata(metadata));
            }
          } else {
            body = fileBody;
            headers["cache-control"] = `max-age=${options.cacheControl}`;
            headers["content-type"] = options.contentType;
            if (metadata) {
              headers["x-metadata"] = this.toBase64(this.encodeMetadata(metadata));
            }
          }
          if (fileOptions === null || fileOptions === void 0 ? void 0 : fileOptions.headers) {
            headers = Object.assign(Object.assign({}, headers), fileOptions.headers);
          }
          const cleanPath = this._removeEmptyFolders(path);
          const _path = this._getFinalPath(cleanPath);
          const data = yield (method == "PUT" ? put : post)(this.fetch, `${this.url}/object/${_path}`, body, Object.assign({ headers }, (options === null || options === void 0 ? void 0 : options.duplex) ? { duplex: options.duplex } : {}));
          return {
            data: { path: cleanPath, id: data.Id, fullPath: data.Key },
            error: null
          };
        } catch (error) {
          if (isStorageError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      });
    }
    /**
     * Uploads a file to an existing bucket.
     *
     * @param path The file path, including the file name. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
     * @param fileBody The body of the file to be stored in the bucket.
     */
    upload(path, fileBody, fileOptions) {
      return __awaiter4(this, void 0, void 0, function* () {
        return this.uploadOrUpdate("POST", path, fileBody, fileOptions);
      });
    }
    /**
     * Upload a file with a token generated from `createSignedUploadUrl`.
     * @param path The file path, including the file name. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
     * @param token The token generated from `createSignedUploadUrl`
     * @param fileBody The body of the file to be stored in the bucket.
     */
    uploadToSignedUrl(path, token, fileBody, fileOptions) {
      return __awaiter4(this, void 0, void 0, function* () {
        const cleanPath = this._removeEmptyFolders(path);
        const _path = this._getFinalPath(cleanPath);
        const url = new URL(this.url + `/object/upload/sign/${_path}`);
        url.searchParams.set("token", token);
        try {
          let body;
          const options = Object.assign({ upsert: DEFAULT_FILE_OPTIONS.upsert }, fileOptions);
          const headers = Object.assign(Object.assign({}, this.headers), { "x-upsert": String(options.upsert) });
          if (typeof Blob !== "undefined" && fileBody instanceof Blob) {
            body = new FormData();
            body.append("cacheControl", options.cacheControl);
            body.append("", fileBody);
          } else if (typeof FormData !== "undefined" && fileBody instanceof FormData) {
            body = fileBody;
            body.append("cacheControl", options.cacheControl);
          } else {
            body = fileBody;
            headers["cache-control"] = `max-age=${options.cacheControl}`;
            headers["content-type"] = options.contentType;
          }
          const data = yield put(this.fetch, url.toString(), body, { headers });
          return {
            data: { path: cleanPath, fullPath: data.Key },
            error: null
          };
        } catch (error) {
          if (isStorageError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      });
    }
    /**
     * Creates a signed upload URL.
     * Signed upload URLs can be used to upload files to the bucket without further authentication.
     * They are valid for 2 hours.
     * @param path The file path, including the current file name. For example `folder/image.png`.
     * @param options.upsert If set to true, allows the file to be overwritten if it already exists.
     */
    createSignedUploadUrl(path, options) {
      return __awaiter4(this, void 0, void 0, function* () {
        try {
          let _path = this._getFinalPath(path);
          const headers = Object.assign({}, this.headers);
          if (options === null || options === void 0 ? void 0 : options.upsert) {
            headers["x-upsert"] = "true";
          }
          const data = yield post(this.fetch, `${this.url}/object/upload/sign/${_path}`, {}, { headers });
          const url = new URL(this.url + data.url);
          const token = url.searchParams.get("token");
          if (!token) {
            throw new StorageError("No token returned by API");
          }
          return { data: { signedUrl: url.toString(), path, token }, error: null };
        } catch (error) {
          if (isStorageError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      });
    }
    /**
     * Replaces an existing file at the specified path with a new one.
     *
     * @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to update.
     * @param fileBody The body of the file to be stored in the bucket.
     */
    update(path, fileBody, fileOptions) {
      return __awaiter4(this, void 0, void 0, function* () {
        return this.uploadOrUpdate("PUT", path, fileBody, fileOptions);
      });
    }
    /**
     * Moves an existing file to a new path in the same bucket.
     *
     * @param fromPath The original file path, including the current file name. For example `folder/image.png`.
     * @param toPath The new file path, including the new file name. For example `folder/image-new.png`.
     * @param options The destination options.
     */
    move(fromPath, toPath, options) {
      return __awaiter4(this, void 0, void 0, function* () {
        try {
          const data = yield post(this.fetch, `${this.url}/object/move`, {
            bucketId: this.bucketId,
            sourceKey: fromPath,
            destinationKey: toPath,
            destinationBucket: options === null || options === void 0 ? void 0 : options.destinationBucket
          }, { headers: this.headers });
          return { data, error: null };
        } catch (error) {
          if (isStorageError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      });
    }
    /**
     * Copies an existing file to a new path in the same bucket.
     *
     * @param fromPath The original file path, including the current file name. For example `folder/image.png`.
     * @param toPath The new file path, including the new file name. For example `folder/image-copy.png`.
     * @param options The destination options.
     */
    copy(fromPath, toPath, options) {
      return __awaiter4(this, void 0, void 0, function* () {
        try {
          const data = yield post(this.fetch, `${this.url}/object/copy`, {
            bucketId: this.bucketId,
            sourceKey: fromPath,
            destinationKey: toPath,
            destinationBucket: options === null || options === void 0 ? void 0 : options.destinationBucket
          }, { headers: this.headers });
          return { data: { path: data.Key }, error: null };
        } catch (error) {
          if (isStorageError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      });
    }
    /**
     * Creates a signed URL. Use a signed URL to share a file for a fixed amount of time.
     *
     * @param path The file path, including the current file name. For example `folder/image.png`.
     * @param expiresIn The number of seconds until the signed URL expires. For example, `60` for a URL which is valid for one minute.
     * @param options.download triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
     * @param options.transform Transform the asset before serving it to the client.
     */
    createSignedUrl(path, expiresIn, options) {
      return __awaiter4(this, void 0, void 0, function* () {
        try {
          let _path = this._getFinalPath(path);
          let data = yield post(this.fetch, `${this.url}/object/sign/${_path}`, Object.assign({ expiresIn }, (options === null || options === void 0 ? void 0 : options.transform) ? { transform: options.transform } : {}), { headers: this.headers });
          const downloadQueryParam = (options === null || options === void 0 ? void 0 : options.download) ? `&download=${options.download === true ? "" : options.download}` : "";
          const signedUrl = encodeURI(`${this.url}${data.signedURL}${downloadQueryParam}`);
          data = { signedUrl };
          return { data, error: null };
        } catch (error) {
          if (isStorageError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      });
    }
    /**
     * Creates multiple signed URLs. Use a signed URL to share a file for a fixed amount of time.
     *
     * @param paths The file paths to be downloaded, including the current file names. For example `['folder/image.png', 'folder2/image2.png']`.
     * @param expiresIn The number of seconds until the signed URLs expire. For example, `60` for URLs which are valid for one minute.
     * @param options.download triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
     */
    createSignedUrls(paths, expiresIn, options) {
      return __awaiter4(this, void 0, void 0, function* () {
        try {
          const data = yield post(this.fetch, `${this.url}/object/sign/${this.bucketId}`, { expiresIn, paths }, { headers: this.headers });
          const downloadQueryParam = (options === null || options === void 0 ? void 0 : options.download) ? `&download=${options.download === true ? "" : options.download}` : "";
          return {
            data: data.map((datum) => Object.assign(Object.assign({}, datum), { signedUrl: datum.signedURL ? encodeURI(`${this.url}${datum.signedURL}${downloadQueryParam}`) : null })),
            error: null
          };
        } catch (error) {
          if (isStorageError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      });
    }
    /**
     * Downloads a file from a private bucket. For public buckets, make a request to the URL returned from `getPublicUrl` instead.
     *
     * @param path The full path and file name of the file to be downloaded. For example `folder/image.png`.
     * @param options.transform Transform the asset before serving it to the client.
     */
    download(path, options) {
      return __awaiter4(this, void 0, void 0, function* () {
        const wantsTransformation = typeof (options === null || options === void 0 ? void 0 : options.transform) !== "undefined";
        const renderPath = wantsTransformation ? "render/image/authenticated" : "object";
        const transformationQuery = this.transformOptsToQueryString((options === null || options === void 0 ? void 0 : options.transform) || {});
        const queryString = transformationQuery ? `?${transformationQuery}` : "";
        try {
          const _path = this._getFinalPath(path);
          const res = yield get(this.fetch, `${this.url}/${renderPath}/${_path}${queryString}`, {
            headers: this.headers,
            noResolveJson: true
          });
          const data = yield res.blob();
          return { data, error: null };
        } catch (error) {
          if (isStorageError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      });
    }
    /**
     * Retrieves the details of an existing file.
     * @param path
     */
    info(path) {
      return __awaiter4(this, void 0, void 0, function* () {
        const _path = this._getFinalPath(path);
        try {
          const data = yield get(this.fetch, `${this.url}/object/info/${_path}`, {
            headers: this.headers
          });
          return { data: recursiveToCamel(data), error: null };
        } catch (error) {
          if (isStorageError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      });
    }
    /**
     * Checks the existence of a file.
     * @param path
     */
    exists(path) {
      return __awaiter4(this, void 0, void 0, function* () {
        const _path = this._getFinalPath(path);
        try {
          yield head(this.fetch, `${this.url}/object/${_path}`, {
            headers: this.headers
          });
          return { data: true, error: null };
        } catch (error) {
          if (isStorageError(error) && error instanceof StorageUnknownError) {
            const originalError = error.originalError;
            if ([400, 404].includes(originalError === null || originalError === void 0 ? void 0 : originalError.status)) {
              return { data: false, error };
            }
          }
          throw error;
        }
      });
    }
    /**
     * A simple convenience function to get the URL for an asset in a public bucket. If you do not want to use this function, you can construct the public URL by concatenating the bucket URL with the path to the asset.
     * This function does not verify if the bucket is public. If a public URL is created for a bucket which is not public, you will not be able to download the asset.
     *
     * @param path The path and name of the file to generate the public URL for. For example `folder/image.png`.
     * @param options.download Triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
     * @param options.transform Transform the asset before serving it to the client.
     */
    getPublicUrl(path, options) {
      const _path = this._getFinalPath(path);
      const _queryString = [];
      const downloadQueryParam = (options === null || options === void 0 ? void 0 : options.download) ? `download=${options.download === true ? "" : options.download}` : "";
      if (downloadQueryParam !== "") {
        _queryString.push(downloadQueryParam);
      }
      const wantsTransformation = typeof (options === null || options === void 0 ? void 0 : options.transform) !== "undefined";
      const renderPath = wantsTransformation ? "render/image" : "object";
      const transformationQuery = this.transformOptsToQueryString((options === null || options === void 0 ? void 0 : options.transform) || {});
      if (transformationQuery !== "") {
        _queryString.push(transformationQuery);
      }
      let queryString = _queryString.join("&");
      if (queryString !== "") {
        queryString = `?${queryString}`;
      }
      return {
        data: { publicUrl: encodeURI(`${this.url}/${renderPath}/public/${_path}${queryString}`) }
      };
    }
    /**
     * Deletes files within the same bucket
     *
     * @param paths An array of files to delete, including the path and file name. For example [`'folder/image.png'`].
     */
    remove(paths) {
      return __awaiter4(this, void 0, void 0, function* () {
        try {
          const data = yield remove(this.fetch, `${this.url}/object/${this.bucketId}`, { prefixes: paths }, { headers: this.headers });
          return { data, error: null };
        } catch (error) {
          if (isStorageError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      });
    }
    /**
     * Get file metadata
     * @param id the file id to retrieve metadata
     */
    // async getMetadata(
    //   id: string
    // ): Promise<
    //   | {
    //       data: Metadata
    //       error: null
    //     }
    //   | {
    //       data: null
    //       error: StorageError
    //     }
    // > {
    //   try {
    //     const data = await get(this.fetch, `${this.url}/metadata/${id}`, { headers: this.headers })
    //     return { data, error: null }
    //   } catch (error) {
    //     if (isStorageError(error)) {
    //       return { data: null, error }
    //     }
    //     throw error
    //   }
    // }
    /**
     * Update file metadata
     * @param id the file id to update metadata
     * @param meta the new file metadata
     */
    // async updateMetadata(
    //   id: string,
    //   meta: Metadata
    // ): Promise<
    //   | {
    //       data: Metadata
    //       error: null
    //     }
    //   | {
    //       data: null
    //       error: StorageError
    //     }
    // > {
    //   try {
    //     const data = await post(
    //       this.fetch,
    //       `${this.url}/metadata/${id}`,
    //       { ...meta },
    //       { headers: this.headers }
    //     )
    //     return { data, error: null }
    //   } catch (error) {
    //     if (isStorageError(error)) {
    //       return { data: null, error }
    //     }
    //     throw error
    //   }
    // }
    /**
     * Lists all the files within a bucket.
     * @param path The folder path.
     * @param options Search options including limit (defaults to 100), offset, sortBy, and search
     */
    list(path, options, parameters) {
      return __awaiter4(this, void 0, void 0, function* () {
        try {
          const body = Object.assign(Object.assign(Object.assign({}, DEFAULT_SEARCH_OPTIONS), options), { prefix: path || "" });
          const data = yield post(this.fetch, `${this.url}/object/list/${this.bucketId}`, body, { headers: this.headers }, parameters);
          return { data, error: null };
        } catch (error) {
          if (isStorageError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      });
    }
    /**
     * @experimental this method signature might change in the future
     * @param options search options
     * @param parameters
     */
    listV2(options, parameters) {
      return __awaiter4(this, void 0, void 0, function* () {
        try {
          const body = Object.assign({}, options);
          const data = yield post(this.fetch, `${this.url}/object/list-v2/${this.bucketId}`, body, { headers: this.headers }, parameters);
          return { data, error: null };
        } catch (error) {
          if (isStorageError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      });
    }
    encodeMetadata(metadata) {
      return JSON.stringify(metadata);
    }
    toBase64(data) {
      if (typeof Buffer !== "undefined") {
        return Buffer.from(data).toString("base64");
      }
      return btoa(data);
    }
    _getFinalPath(path) {
      return `${this.bucketId}/${path.replace(/^\/+/, "")}`;
    }
    _removeEmptyFolders(path) {
      return path.replace(/^\/|\/$/g, "").replace(/\/+/g, "/");
    }
    transformOptsToQueryString(transform) {
      const params = [];
      if (transform.width) {
        params.push(`width=${transform.width}`);
      }
      if (transform.height) {
        params.push(`height=${transform.height}`);
      }
      if (transform.resize) {
        params.push(`resize=${transform.resize}`);
      }
      if (transform.format) {
        params.push(`format=${transform.format}`);
      }
      if (transform.quality) {
        params.push(`quality=${transform.quality}`);
      }
      return params.join("&");
    }
  };

  // node_modules/@supabase/storage-js/dist/module/lib/version.js
  var version2 = "2.11.0";

  // node_modules/@supabase/storage-js/dist/module/lib/constants.js
  var DEFAULT_HEADERS = { "X-Client-Info": `storage-js/${version2}` };

  // node_modules/@supabase/storage-js/dist/module/packages/StorageBucketApi.js
  var __awaiter5 = function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var StorageBucketApi = class {
    constructor(url, headers = {}, fetch3, opts) {
      const baseUrl = new URL(url);
      if (opts === null || opts === void 0 ? void 0 : opts.useNewHostname) {
        const isSupabaseHost = /supabase\.(co|in|red)$/.test(baseUrl.hostname);
        if (isSupabaseHost && !baseUrl.hostname.includes("storage.supabase.")) {
          baseUrl.hostname = baseUrl.hostname.replace("supabase.", "storage.supabase.");
        }
      }
      this.url = baseUrl.href;
      this.headers = Object.assign(Object.assign({}, DEFAULT_HEADERS), headers);
      this.fetch = resolveFetch2(fetch3);
    }
    /**
     * Retrieves the details of all Storage buckets within an existing project.
     */
    listBuckets() {
      return __awaiter5(this, void 0, void 0, function* () {
        try {
          const data = yield get(this.fetch, `${this.url}/bucket`, { headers: this.headers });
          return { data, error: null };
        } catch (error) {
          if (isStorageError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      });
    }
    /**
     * Retrieves the details of an existing Storage bucket.
     *
     * @param id The unique identifier of the bucket you would like to retrieve.
     */
    getBucket(id) {
      return __awaiter5(this, void 0, void 0, function* () {
        try {
          const data = yield get(this.fetch, `${this.url}/bucket/${id}`, { headers: this.headers });
          return { data, error: null };
        } catch (error) {
          if (isStorageError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      });
    }
    /**
     * Creates a new Storage bucket
     *
     * @param id A unique identifier for the bucket you are creating.
     * @param options.public The visibility of the bucket. Public buckets don't require an authorization token to download objects, but still require a valid token for all other operations. By default, buckets are private.
     * @param options.fileSizeLimit specifies the max file size in bytes that can be uploaded to this bucket.
     * The global file size limit takes precedence over this value.
     * The default value is null, which doesn't set a per bucket file size limit.
     * @param options.allowedMimeTypes specifies the allowed mime types that this bucket can accept during upload.
     * The default value is null, which allows files with all mime types to be uploaded.
     * Each mime type specified can be a wildcard, e.g. image/*, or a specific mime type, e.g. image/png.
     * @returns newly created bucket id
     * @param options.type (private-beta) specifies the bucket type. see `BucketType` for more details.
     *   - default bucket type is `STANDARD`
     */
    createBucket(id, options = {
      public: false
    }) {
      return __awaiter5(this, void 0, void 0, function* () {
        try {
          const data = yield post(this.fetch, `${this.url}/bucket`, {
            id,
            name: id,
            type: options.type,
            public: options.public,
            file_size_limit: options.fileSizeLimit,
            allowed_mime_types: options.allowedMimeTypes
          }, { headers: this.headers });
          return { data, error: null };
        } catch (error) {
          if (isStorageError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      });
    }
    /**
     * Updates a Storage bucket
     *
     * @param id A unique identifier for the bucket you are updating.
     * @param options.public The visibility of the bucket. Public buckets don't require an authorization token to download objects, but still require a valid token for all other operations.
     * @param options.fileSizeLimit specifies the max file size in bytes that can be uploaded to this bucket.
     * The global file size limit takes precedence over this value.
     * The default value is null, which doesn't set a per bucket file size limit.
     * @param options.allowedMimeTypes specifies the allowed mime types that this bucket can accept during upload.
     * The default value is null, which allows files with all mime types to be uploaded.
     * Each mime type specified can be a wildcard, e.g. image/*, or a specific mime type, e.g. image/png.
     */
    updateBucket(id, options) {
      return __awaiter5(this, void 0, void 0, function* () {
        try {
          const data = yield put(this.fetch, `${this.url}/bucket/${id}`, {
            id,
            name: id,
            public: options.public,
            file_size_limit: options.fileSizeLimit,
            allowed_mime_types: options.allowedMimeTypes
          }, { headers: this.headers });
          return { data, error: null };
        } catch (error) {
          if (isStorageError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      });
    }
    /**
     * Removes all objects inside a single bucket.
     *
     * @param id The unique identifier of the bucket you would like to empty.
     */
    emptyBucket(id) {
      return __awaiter5(this, void 0, void 0, function* () {
        try {
          const data = yield post(this.fetch, `${this.url}/bucket/${id}/empty`, {}, { headers: this.headers });
          return { data, error: null };
        } catch (error) {
          if (isStorageError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      });
    }
    /**
     * Deletes an existing bucket. A bucket can't be deleted with existing objects inside it.
     * You must first `empty()` the bucket.
     *
     * @param id The unique identifier of the bucket you would like to delete.
     */
    deleteBucket(id) {
      return __awaiter5(this, void 0, void 0, function* () {
        try {
          const data = yield remove(this.fetch, `${this.url}/bucket/${id}`, {}, { headers: this.headers });
          return { data, error: null };
        } catch (error) {
          if (isStorageError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      });
    }
  };

  // node_modules/@supabase/storage-js/dist/module/StorageClient.js
  var StorageClient = class extends StorageBucketApi {
    constructor(url, headers = {}, fetch3, opts) {
      super(url, headers, fetch3, opts);
    }
    /**
     * Perform file operation in a bucket.
     *
     * @param id The bucket id to operate on.
     */
    from(id) {
      return new StorageFileApi(this.url, this.headers, id, this.fetch);
    }
  };

  // node_modules/@supabase/supabase-js/dist/module/lib/version.js
  var version3 = "2.55.0";

  // node_modules/@supabase/supabase-js/dist/module/lib/constants.js
  var JS_ENV = "";
  if (typeof Deno !== "undefined") {
    JS_ENV = "deno";
  } else if (typeof document !== "undefined") {
    JS_ENV = "web";
  } else if (typeof navigator !== "undefined" && navigator.product === "ReactNative") {
    JS_ENV = "react-native";
  } else {
    JS_ENV = "node";
  }
  var DEFAULT_HEADERS2 = { "X-Client-Info": `supabase-js-${JS_ENV}/${version3}` };
  var DEFAULT_GLOBAL_OPTIONS = {
    headers: DEFAULT_HEADERS2
  };
  var DEFAULT_DB_OPTIONS = {
    schema: "public"
  };
  var DEFAULT_AUTH_OPTIONS = {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "implicit"
  };
  var DEFAULT_REALTIME_OPTIONS = {};

  // node_modules/@supabase/supabase-js/dist/module/lib/fetch.js
  init_browser();
  var __awaiter6 = function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var resolveFetch3 = (customFetch) => {
    let _fetch;
    if (customFetch) {
      _fetch = customFetch;
    } else if (typeof fetch === "undefined") {
      _fetch = browser_default;
    } else {
      _fetch = fetch;
    }
    return (...args) => _fetch(...args);
  };
  var resolveHeadersConstructor = () => {
    if (typeof Headers === "undefined") {
      return Headers2;
    }
    return Headers;
  };
  var fetchWithAuth = (supabaseKey2, getAccessToken, customFetch) => {
    const fetch3 = resolveFetch3(customFetch);
    const HeadersConstructor = resolveHeadersConstructor();
    return (input, init) => __awaiter6(void 0, void 0, void 0, function* () {
      var _a;
      const accessToken = (_a = yield getAccessToken()) !== null && _a !== void 0 ? _a : supabaseKey2;
      let headers = new HeadersConstructor(init === null || init === void 0 ? void 0 : init.headers);
      if (!headers.has("apikey")) {
        headers.set("apikey", supabaseKey2);
      }
      if (!headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }
      return fetch3(input, Object.assign(Object.assign({}, init), { headers }));
    });
  };

  // node_modules/@supabase/supabase-js/dist/module/lib/helpers.js
  var __awaiter7 = function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  function ensureTrailingSlash(url) {
    return url.endsWith("/") ? url : url + "/";
  }
  function applySettingDefaults(options, defaults) {
    var _a, _b;
    const { db: dbOptions, auth: authOptions, realtime: realtimeOptions, global: globalOptions } = options;
    const { db: DEFAULT_DB_OPTIONS2, auth: DEFAULT_AUTH_OPTIONS2, realtime: DEFAULT_REALTIME_OPTIONS2, global: DEFAULT_GLOBAL_OPTIONS2 } = defaults;
    const result = {
      db: Object.assign(Object.assign({}, DEFAULT_DB_OPTIONS2), dbOptions),
      auth: Object.assign(Object.assign({}, DEFAULT_AUTH_OPTIONS2), authOptions),
      realtime: Object.assign(Object.assign({}, DEFAULT_REALTIME_OPTIONS2), realtimeOptions),
      storage: {},
      global: Object.assign(Object.assign(Object.assign({}, DEFAULT_GLOBAL_OPTIONS2), globalOptions), { headers: Object.assign(Object.assign({}, (_a = DEFAULT_GLOBAL_OPTIONS2 === null || DEFAULT_GLOBAL_OPTIONS2 === void 0 ? void 0 : DEFAULT_GLOBAL_OPTIONS2.headers) !== null && _a !== void 0 ? _a : {}), (_b = globalOptions === null || globalOptions === void 0 ? void 0 : globalOptions.headers) !== null && _b !== void 0 ? _b : {}) }),
      accessToken: () => __awaiter7(this, void 0, void 0, function* () {
        return "";
      })
    };
    if (options.accessToken) {
      result.accessToken = options.accessToken;
    } else {
      delete result.accessToken;
    }
    return result;
  }

  // node_modules/@supabase/auth-js/dist/module/lib/version.js
  var version4 = "2.71.1";

  // node_modules/@supabase/auth-js/dist/module/lib/constants.js
  var AUTO_REFRESH_TICK_DURATION_MS = 30 * 1e3;
  var AUTO_REFRESH_TICK_THRESHOLD = 3;
  var EXPIRY_MARGIN_MS = AUTO_REFRESH_TICK_THRESHOLD * AUTO_REFRESH_TICK_DURATION_MS;
  var GOTRUE_URL = "http://localhost:9999";
  var STORAGE_KEY = "supabase.auth.token";
  var DEFAULT_HEADERS3 = { "X-Client-Info": `gotrue-js/${version4}` };
  var API_VERSION_HEADER_NAME = "X-Supabase-Api-Version";
  var API_VERSIONS = {
    "2024-01-01": {
      timestamp: Date.parse("2024-01-01T00:00:00.0Z"),
      name: "2024-01-01"
    }
  };
  var BASE64URL_REGEX = /^([a-z0-9_-]{4})*($|[a-z0-9_-]{3}$|[a-z0-9_-]{2}$)$/i;
  var JWKS_TTL = 10 * 60 * 1e3;

  // node_modules/@supabase/auth-js/dist/module/lib/errors.js
  var AuthError = class extends Error {
    constructor(message, status, code) {
      super(message);
      this.__isAuthError = true;
      this.name = "AuthError";
      this.status = status;
      this.code = code;
    }
  };
  function isAuthError(error) {
    return typeof error === "object" && error !== null && "__isAuthError" in error;
  }
  var AuthApiError = class extends AuthError {
    constructor(message, status, code) {
      super(message, status, code);
      this.name = "AuthApiError";
      this.status = status;
      this.code = code;
    }
  };
  function isAuthApiError(error) {
    return isAuthError(error) && error.name === "AuthApiError";
  }
  var AuthUnknownError = class extends AuthError {
    constructor(message, originalError) {
      super(message);
      this.name = "AuthUnknownError";
      this.originalError = originalError;
    }
  };
  var CustomAuthError = class extends AuthError {
    constructor(message, name, status, code) {
      super(message, status, code);
      this.name = name;
      this.status = status;
    }
  };
  var AuthSessionMissingError = class extends CustomAuthError {
    constructor() {
      super("Auth session missing!", "AuthSessionMissingError", 400, void 0);
    }
  };
  function isAuthSessionMissingError(error) {
    return isAuthError(error) && error.name === "AuthSessionMissingError";
  }
  var AuthInvalidTokenResponseError = class extends CustomAuthError {
    constructor() {
      super("Auth session or user missing", "AuthInvalidTokenResponseError", 500, void 0);
    }
  };
  var AuthInvalidCredentialsError = class extends CustomAuthError {
    constructor(message) {
      super(message, "AuthInvalidCredentialsError", 400, void 0);
    }
  };
  var AuthImplicitGrantRedirectError = class extends CustomAuthError {
    constructor(message, details = null) {
      super(message, "AuthImplicitGrantRedirectError", 500, void 0);
      this.details = null;
      this.details = details;
    }
    toJSON() {
      return {
        name: this.name,
        message: this.message,
        status: this.status,
        details: this.details
      };
    }
  };
  function isAuthImplicitGrantRedirectError(error) {
    return isAuthError(error) && error.name === "AuthImplicitGrantRedirectError";
  }
  var AuthPKCEGrantCodeExchangeError = class extends CustomAuthError {
    constructor(message, details = null) {
      super(message, "AuthPKCEGrantCodeExchangeError", 500, void 0);
      this.details = null;
      this.details = details;
    }
    toJSON() {
      return {
        name: this.name,
        message: this.message,
        status: this.status,
        details: this.details
      };
    }
  };
  var AuthRetryableFetchError = class extends CustomAuthError {
    constructor(message, status) {
      super(message, "AuthRetryableFetchError", status, void 0);
    }
  };
  function isAuthRetryableFetchError(error) {
    return isAuthError(error) && error.name === "AuthRetryableFetchError";
  }
  var AuthWeakPasswordError = class extends CustomAuthError {
    constructor(message, status, reasons) {
      super(message, "AuthWeakPasswordError", status, "weak_password");
      this.reasons = reasons;
    }
  };
  var AuthInvalidJwtError = class extends CustomAuthError {
    constructor(message) {
      super(message, "AuthInvalidJwtError", 400, "invalid_jwt");
    }
  };

  // node_modules/@supabase/auth-js/dist/module/lib/base64url.js
  var TO_BASE64URL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".split("");
  var IGNORE_BASE64URL = " 	\n\r=".split("");
  var FROM_BASE64URL = (() => {
    const charMap = new Array(128);
    for (let i = 0; i < charMap.length; i += 1) {
      charMap[i] = -1;
    }
    for (let i = 0; i < IGNORE_BASE64URL.length; i += 1) {
      charMap[IGNORE_BASE64URL[i].charCodeAt(0)] = -2;
    }
    for (let i = 0; i < TO_BASE64URL.length; i += 1) {
      charMap[TO_BASE64URL[i].charCodeAt(0)] = i;
    }
    return charMap;
  })();
  function byteToBase64URL(byte, state, emit) {
    if (byte !== null) {
      state.queue = state.queue << 8 | byte;
      state.queuedBits += 8;
      while (state.queuedBits >= 6) {
        const pos = state.queue >> state.queuedBits - 6 & 63;
        emit(TO_BASE64URL[pos]);
        state.queuedBits -= 6;
      }
    } else if (state.queuedBits > 0) {
      state.queue = state.queue << 6 - state.queuedBits;
      state.queuedBits = 6;
      while (state.queuedBits >= 6) {
        const pos = state.queue >> state.queuedBits - 6 & 63;
        emit(TO_BASE64URL[pos]);
        state.queuedBits -= 6;
      }
    }
  }
  function byteFromBase64URL(charCode, state, emit) {
    const bits = FROM_BASE64URL[charCode];
    if (bits > -1) {
      state.queue = state.queue << 6 | bits;
      state.queuedBits += 6;
      while (state.queuedBits >= 8) {
        emit(state.queue >> state.queuedBits - 8 & 255);
        state.queuedBits -= 8;
      }
    } else if (bits === -2) {
      return;
    } else {
      throw new Error(`Invalid Base64-URL character "${String.fromCharCode(charCode)}"`);
    }
  }
  function stringFromBase64URL(str) {
    const conv = [];
    const utf8Emit = (codepoint) => {
      conv.push(String.fromCodePoint(codepoint));
    };
    const utf8State = {
      utf8seq: 0,
      codepoint: 0
    };
    const b64State = { queue: 0, queuedBits: 0 };
    const byteEmit = (byte) => {
      stringFromUTF8(byte, utf8State, utf8Emit);
    };
    for (let i = 0; i < str.length; i += 1) {
      byteFromBase64URL(str.charCodeAt(i), b64State, byteEmit);
    }
    return conv.join("");
  }
  function codepointToUTF8(codepoint, emit) {
    if (codepoint <= 127) {
      emit(codepoint);
      return;
    } else if (codepoint <= 2047) {
      emit(192 | codepoint >> 6);
      emit(128 | codepoint & 63);
      return;
    } else if (codepoint <= 65535) {
      emit(224 | codepoint >> 12);
      emit(128 | codepoint >> 6 & 63);
      emit(128 | codepoint & 63);
      return;
    } else if (codepoint <= 1114111) {
      emit(240 | codepoint >> 18);
      emit(128 | codepoint >> 12 & 63);
      emit(128 | codepoint >> 6 & 63);
      emit(128 | codepoint & 63);
      return;
    }
    throw new Error(`Unrecognized Unicode codepoint: ${codepoint.toString(16)}`);
  }
  function stringToUTF8(str, emit) {
    for (let i = 0; i < str.length; i += 1) {
      let codepoint = str.charCodeAt(i);
      if (codepoint > 55295 && codepoint <= 56319) {
        const highSurrogate = (codepoint - 55296) * 1024 & 65535;
        const lowSurrogate = str.charCodeAt(i + 1) - 56320 & 65535;
        codepoint = (lowSurrogate | highSurrogate) + 65536;
        i += 1;
      }
      codepointToUTF8(codepoint, emit);
    }
  }
  function stringFromUTF8(byte, state, emit) {
    if (state.utf8seq === 0) {
      if (byte <= 127) {
        emit(byte);
        return;
      }
      for (let leadingBit = 1; leadingBit < 6; leadingBit += 1) {
        if ((byte >> 7 - leadingBit & 1) === 0) {
          state.utf8seq = leadingBit;
          break;
        }
      }
      if (state.utf8seq === 2) {
        state.codepoint = byte & 31;
      } else if (state.utf8seq === 3) {
        state.codepoint = byte & 15;
      } else if (state.utf8seq === 4) {
        state.codepoint = byte & 7;
      } else {
        throw new Error("Invalid UTF-8 sequence");
      }
      state.utf8seq -= 1;
    } else if (state.utf8seq > 0) {
      if (byte <= 127) {
        throw new Error("Invalid UTF-8 sequence");
      }
      state.codepoint = state.codepoint << 6 | byte & 63;
      state.utf8seq -= 1;
      if (state.utf8seq === 0) {
        emit(state.codepoint);
      }
    }
  }
  function base64UrlToUint8Array(str) {
    const result = [];
    const state = { queue: 0, queuedBits: 0 };
    const onByte = (byte) => {
      result.push(byte);
    };
    for (let i = 0; i < str.length; i += 1) {
      byteFromBase64URL(str.charCodeAt(i), state, onByte);
    }
    return new Uint8Array(result);
  }
  function stringToUint8Array(str) {
    const result = [];
    stringToUTF8(str, (byte) => result.push(byte));
    return new Uint8Array(result);
  }
  function bytesToBase64URL(bytes) {
    const result = [];
    const state = { queue: 0, queuedBits: 0 };
    const onChar = (char) => {
      result.push(char);
    };
    bytes.forEach((byte) => byteToBase64URL(byte, state, onChar));
    byteToBase64URL(null, state, onChar);
    return result.join("");
  }

  // node_modules/@supabase/auth-js/dist/module/lib/helpers.js
  function expiresAt(expiresIn) {
    const timeNow = Math.round(Date.now() / 1e3);
    return timeNow + expiresIn;
  }
  function uuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c == "x" ? r : r & 3 | 8;
      return v.toString(16);
    });
  }
  var isBrowser = () => typeof window !== "undefined" && typeof document !== "undefined";
  var localStorageWriteTests = {
    tested: false,
    writable: false
  };
  var supportsLocalStorage = () => {
    if (!isBrowser()) {
      return false;
    }
    try {
      if (typeof globalThis.localStorage !== "object") {
        return false;
      }
    } catch (e) {
      return false;
    }
    if (localStorageWriteTests.tested) {
      return localStorageWriteTests.writable;
    }
    const randomKey = `lswt-${Math.random()}${Math.random()}`;
    try {
      globalThis.localStorage.setItem(randomKey, randomKey);
      globalThis.localStorage.removeItem(randomKey);
      localStorageWriteTests.tested = true;
      localStorageWriteTests.writable = true;
    } catch (e) {
      localStorageWriteTests.tested = true;
      localStorageWriteTests.writable = false;
    }
    return localStorageWriteTests.writable;
  };
  function parseParametersFromURL(href) {
    const result = {};
    const url = new URL(href);
    if (url.hash && url.hash[0] === "#") {
      try {
        const hashSearchParams = new URLSearchParams(url.hash.substring(1));
        hashSearchParams.forEach((value, key) => {
          result[key] = value;
        });
      } catch (e) {
      }
    }
    url.searchParams.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }
  var resolveFetch4 = (customFetch) => {
    let _fetch;
    if (customFetch) {
      _fetch = customFetch;
    } else if (typeof fetch === "undefined") {
      _fetch = (...args) => Promise.resolve().then(() => (init_browser(), browser_exports)).then(({ default: fetch3 }) => fetch3(...args));
    } else {
      _fetch = fetch;
    }
    return (...args) => _fetch(...args);
  };
  var looksLikeFetchResponse = (maybeResponse) => {
    return typeof maybeResponse === "object" && maybeResponse !== null && "status" in maybeResponse && "ok" in maybeResponse && "json" in maybeResponse && typeof maybeResponse.json === "function";
  };
  var setItemAsync = async (storage, key, data) => {
    await storage.setItem(key, JSON.stringify(data));
  };
  var getItemAsync = async (storage, key) => {
    const value = await storage.getItem(key);
    if (!value) {
      return null;
    }
    try {
      return JSON.parse(value);
    } catch (_a) {
      return value;
    }
  };
  var removeItemAsync = async (storage, key) => {
    await storage.removeItem(key);
  };
  var Deferred = class _Deferred {
    constructor() {
      ;
      this.promise = new _Deferred.promiseConstructor((res, rej) => {
        ;
        this.resolve = res;
        this.reject = rej;
      });
    }
  };
  Deferred.promiseConstructor = Promise;
  function decodeJWT(token) {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new AuthInvalidJwtError("Invalid JWT structure");
    }
    for (let i = 0; i < parts.length; i++) {
      if (!BASE64URL_REGEX.test(parts[i])) {
        throw new AuthInvalidJwtError("JWT not in base64url format");
      }
    }
    const data = {
      // using base64url lib
      header: JSON.parse(stringFromBase64URL(parts[0])),
      payload: JSON.parse(stringFromBase64URL(parts[1])),
      signature: base64UrlToUint8Array(parts[2]),
      raw: {
        header: parts[0],
        payload: parts[1]
      }
    };
    return data;
  }
  async function sleep(time) {
    return await new Promise((accept) => {
      setTimeout(() => accept(null), time);
    });
  }
  function retryable(fn, isRetryable) {
    const promise = new Promise((accept, reject) => {
      ;
      (async () => {
        for (let attempt = 0; attempt < Infinity; attempt++) {
          try {
            const result = await fn(attempt);
            if (!isRetryable(attempt, null, result)) {
              accept(result);
              return;
            }
          } catch (e) {
            if (!isRetryable(attempt, e)) {
              reject(e);
              return;
            }
          }
        }
      })();
    });
    return promise;
  }
  function dec2hex(dec) {
    return ("0" + dec.toString(16)).substr(-2);
  }
  function generatePKCEVerifier() {
    const verifierLength = 56;
    const array = new Uint32Array(verifierLength);
    if (typeof crypto === "undefined") {
      const charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
      const charSetLen = charSet.length;
      let verifier = "";
      for (let i = 0; i < verifierLength; i++) {
        verifier += charSet.charAt(Math.floor(Math.random() * charSetLen));
      }
      return verifier;
    }
    crypto.getRandomValues(array);
    return Array.from(array, dec2hex).join("");
  }
  async function sha256(randomString) {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(randomString);
    const hash = await crypto.subtle.digest("SHA-256", encodedData);
    const bytes = new Uint8Array(hash);
    return Array.from(bytes).map((c) => String.fromCharCode(c)).join("");
  }
  async function generatePKCEChallenge(verifier) {
    const hasCryptoSupport = typeof crypto !== "undefined" && typeof crypto.subtle !== "undefined" && typeof TextEncoder !== "undefined";
    if (!hasCryptoSupport) {
      console.warn("WebCrypto API is not supported. Code challenge method will default to use plain instead of sha256.");
      return verifier;
    }
    const hashed = await sha256(verifier);
    return btoa(hashed).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  async function getCodeChallengeAndMethod(storage, storageKey, isPasswordRecovery = false) {
    const codeVerifier = generatePKCEVerifier();
    let storedCodeVerifier = codeVerifier;
    if (isPasswordRecovery) {
      storedCodeVerifier += "/PASSWORD_RECOVERY";
    }
    await setItemAsync(storage, `${storageKey}-code-verifier`, storedCodeVerifier);
    const codeChallenge = await generatePKCEChallenge(codeVerifier);
    const codeChallengeMethod = codeVerifier === codeChallenge ? "plain" : "s256";
    return [codeChallenge, codeChallengeMethod];
  }
  var API_VERSION_REGEX = /^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/i;
  function parseResponseAPIVersion(response) {
    const apiVersion = response.headers.get(API_VERSION_HEADER_NAME);
    if (!apiVersion) {
      return null;
    }
    if (!apiVersion.match(API_VERSION_REGEX)) {
      return null;
    }
    try {
      const date = /* @__PURE__ */ new Date(`${apiVersion}T00:00:00.0Z`);
      return date;
    } catch (e) {
      return null;
    }
  }
  function validateExp(exp) {
    if (!exp) {
      throw new Error("Missing exp claim");
    }
    const timeNow = Math.floor(Date.now() / 1e3);
    if (exp <= timeNow) {
      throw new Error("JWT has expired");
    }
  }
  function getAlgorithm(alg) {
    switch (alg) {
      case "RS256":
        return {
          name: "RSASSA-PKCS1-v1_5",
          hash: { name: "SHA-256" }
        };
      case "ES256":
        return {
          name: "ECDSA",
          namedCurve: "P-256",
          hash: { name: "SHA-256" }
        };
      default:
        throw new Error("Invalid alg claim");
    }
  }
  var UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
  function validateUUID(str) {
    if (!UUID_REGEX.test(str)) {
      throw new Error("@supabase/auth-js: Expected parameter to be UUID but is not");
    }
  }
  function userNotAvailableProxy() {
    const proxyTarget = {};
    return new Proxy(proxyTarget, {
      get: (target, prop) => {
        if (prop === "__isUserNotAvailableProxy") {
          return true;
        }
        if (typeof prop === "symbol") {
          const sProp = prop.toString();
          if (sProp === "Symbol(Symbol.toPrimitive)" || sProp === "Symbol(Symbol.toStringTag)" || sProp === "Symbol(util.inspect.custom)") {
            return void 0;
          }
        }
        throw new Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Accessing the "${prop}" property of the session object is not supported. Please use getUser() instead.`);
      },
      set: (_target, prop) => {
        throw new Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Setting the "${prop}" property of the session object is not supported. Please use getUser() to fetch a user object you can manipulate.`);
      },
      deleteProperty: (_target, prop) => {
        throw new Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Deleting the "${prop}" property of the session object is not supported. Please use getUser() to fetch a user object you can manipulate.`);
      }
    });
  }
  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // node_modules/@supabase/auth-js/dist/module/lib/fetch.js
  var __rest = function(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  };
  var _getErrorMessage2 = (err) => err.msg || err.message || err.error_description || err.error || JSON.stringify(err);
  var NETWORK_ERROR_CODES = [502, 503, 504];
  async function handleError2(error) {
    var _a;
    if (!looksLikeFetchResponse(error)) {
      throw new AuthRetryableFetchError(_getErrorMessage2(error), 0);
    }
    if (NETWORK_ERROR_CODES.includes(error.status)) {
      throw new AuthRetryableFetchError(_getErrorMessage2(error), error.status);
    }
    let data;
    try {
      data = await error.json();
    } catch (e) {
      throw new AuthUnknownError(_getErrorMessage2(e), e);
    }
    let errorCode = void 0;
    const responseAPIVersion = parseResponseAPIVersion(error);
    if (responseAPIVersion && responseAPIVersion.getTime() >= API_VERSIONS["2024-01-01"].timestamp && typeof data === "object" && data && typeof data.code === "string") {
      errorCode = data.code;
    } else if (typeof data === "object" && data && typeof data.error_code === "string") {
      errorCode = data.error_code;
    }
    if (!errorCode) {
      if (typeof data === "object" && data && typeof data.weak_password === "object" && data.weak_password && Array.isArray(data.weak_password.reasons) && data.weak_password.reasons.length && data.weak_password.reasons.reduce((a, i) => a && typeof i === "string", true)) {
        throw new AuthWeakPasswordError(_getErrorMessage2(data), error.status, data.weak_password.reasons);
      }
    } else if (errorCode === "weak_password") {
      throw new AuthWeakPasswordError(_getErrorMessage2(data), error.status, ((_a = data.weak_password) === null || _a === void 0 ? void 0 : _a.reasons) || []);
    } else if (errorCode === "session_not_found") {
      throw new AuthSessionMissingError();
    }
    throw new AuthApiError(_getErrorMessage2(data), error.status || 500, errorCode);
  }
  var _getRequestParams2 = (method, options, parameters, body) => {
    const params = { method, headers: (options === null || options === void 0 ? void 0 : options.headers) || {} };
    if (method === "GET") {
      return params;
    }
    params.headers = Object.assign({ "Content-Type": "application/json;charset=UTF-8" }, options === null || options === void 0 ? void 0 : options.headers);
    params.body = JSON.stringify(body);
    return Object.assign(Object.assign({}, params), parameters);
  };
  async function _request(fetcher, method, url, options) {
    var _a;
    const headers = Object.assign({}, options === null || options === void 0 ? void 0 : options.headers);
    if (!headers[API_VERSION_HEADER_NAME]) {
      headers[API_VERSION_HEADER_NAME] = API_VERSIONS["2024-01-01"].name;
    }
    if (options === null || options === void 0 ? void 0 : options.jwt) {
      headers["Authorization"] = `Bearer ${options.jwt}`;
    }
    const qs = (_a = options === null || options === void 0 ? void 0 : options.query) !== null && _a !== void 0 ? _a : {};
    if (options === null || options === void 0 ? void 0 : options.redirectTo) {
      qs["redirect_to"] = options.redirectTo;
    }
    const queryString = Object.keys(qs).length ? "?" + new URLSearchParams(qs).toString() : "";
    const data = await _handleRequest2(fetcher, method, url + queryString, {
      headers,
      noResolveJson: options === null || options === void 0 ? void 0 : options.noResolveJson
    }, {}, options === null || options === void 0 ? void 0 : options.body);
    return (options === null || options === void 0 ? void 0 : options.xform) ? options === null || options === void 0 ? void 0 : options.xform(data) : { data: Object.assign({}, data), error: null };
  }
  async function _handleRequest2(fetcher, method, url, options, parameters, body) {
    const requestParams = _getRequestParams2(method, options, parameters, body);
    let result;
    try {
      result = await fetcher(url, Object.assign({}, requestParams));
    } catch (e) {
      console.error(e);
      throw new AuthRetryableFetchError(_getErrorMessage2(e), 0);
    }
    if (!result.ok) {
      await handleError2(result);
    }
    if (options === null || options === void 0 ? void 0 : options.noResolveJson) {
      return result;
    }
    try {
      return await result.json();
    } catch (e) {
      await handleError2(e);
    }
  }
  function _sessionResponse(data) {
    var _a;
    let session = null;
    if (hasSession(data)) {
      session = Object.assign({}, data);
      if (!data.expires_at) {
        session.expires_at = expiresAt(data.expires_in);
      }
    }
    const user = (_a = data.user) !== null && _a !== void 0 ? _a : data;
    return { data: { session, user }, error: null };
  }
  function _sessionResponsePassword(data) {
    const response = _sessionResponse(data);
    if (!response.error && data.weak_password && typeof data.weak_password === "object" && Array.isArray(data.weak_password.reasons) && data.weak_password.reasons.length && data.weak_password.message && typeof data.weak_password.message === "string" && data.weak_password.reasons.reduce((a, i) => a && typeof i === "string", true)) {
      response.data.weak_password = data.weak_password;
    }
    return response;
  }
  function _userResponse(data) {
    var _a;
    const user = (_a = data.user) !== null && _a !== void 0 ? _a : data;
    return { data: { user }, error: null };
  }
  function _ssoResponse(data) {
    return { data, error: null };
  }
  function _generateLinkResponse(data) {
    const { action_link, email_otp, hashed_token, redirect_to, verification_type } = data, rest = __rest(data, ["action_link", "email_otp", "hashed_token", "redirect_to", "verification_type"]);
    const properties = {
      action_link,
      email_otp,
      hashed_token,
      redirect_to,
      verification_type
    };
    const user = Object.assign({}, rest);
    return {
      data: {
        properties,
        user
      },
      error: null
    };
  }
  function _noResolveJsonResponse(data) {
    return data;
  }
  function hasSession(data) {
    return data.access_token && data.refresh_token && data.expires_in;
  }

  // node_modules/@supabase/auth-js/dist/module/lib/types.js
  var SIGN_OUT_SCOPES = ["global", "local", "others"];

  // node_modules/@supabase/auth-js/dist/module/GoTrueAdminApi.js
  var __rest2 = function(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  };
  var GoTrueAdminApi = class {
    constructor({ url = "", headers = {}, fetch: fetch3 }) {
      this.url = url;
      this.headers = headers;
      this.fetch = resolveFetch4(fetch3);
      this.mfa = {
        listFactors: this._listFactors.bind(this),
        deleteFactor: this._deleteFactor.bind(this)
      };
    }
    /**
     * Removes a logged-in session.
     * @param jwt A valid, logged-in JWT.
     * @param scope The logout sope.
     */
    async signOut(jwt, scope = SIGN_OUT_SCOPES[0]) {
      if (SIGN_OUT_SCOPES.indexOf(scope) < 0) {
        throw new Error(`@supabase/auth-js: Parameter scope must be one of ${SIGN_OUT_SCOPES.join(", ")}`);
      }
      try {
        await _request(this.fetch, "POST", `${this.url}/logout?scope=${scope}`, {
          headers: this.headers,
          jwt,
          noResolveJson: true
        });
        return { data: null, error: null };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    }
    /**
     * Sends an invite link to an email address.
     * @param email The email address of the user.
     * @param options Additional options to be included when inviting.
     */
    async inviteUserByEmail(email, options = {}) {
      try {
        return await _request(this.fetch, "POST", `${this.url}/invite`, {
          body: { email, data: options.data },
          headers: this.headers,
          redirectTo: options.redirectTo,
          xform: _userResponse
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null }, error };
        }
        throw error;
      }
    }
    /**
     * Generates email links and OTPs to be sent via a custom email provider.
     * @param email The user's email.
     * @param options.password User password. For signup only.
     * @param options.data Optional user metadata. For signup only.
     * @param options.redirectTo The redirect url which should be appended to the generated link
     */
    async generateLink(params) {
      try {
        const { options } = params, rest = __rest2(params, ["options"]);
        const body = Object.assign(Object.assign({}, rest), options);
        if ("newEmail" in rest) {
          body.new_email = rest === null || rest === void 0 ? void 0 : rest.newEmail;
          delete body["newEmail"];
        }
        return await _request(this.fetch, "POST", `${this.url}/admin/generate_link`, {
          body,
          headers: this.headers,
          xform: _generateLinkResponse,
          redirectTo: options === null || options === void 0 ? void 0 : options.redirectTo
        });
      } catch (error) {
        if (isAuthError(error)) {
          return {
            data: {
              properties: null,
              user: null
            },
            error
          };
        }
        throw error;
      }
    }
    // User Admin API
    /**
     * Creates a new user.
     * This function should only be called on a server. Never expose your `service_role` key in the browser.
     */
    async createUser(attributes) {
      try {
        return await _request(this.fetch, "POST", `${this.url}/admin/users`, {
          body: attributes,
          headers: this.headers,
          xform: _userResponse
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null }, error };
        }
        throw error;
      }
    }
    /**
     * Get a list of users.
     *
     * This function should only be called on a server. Never expose your `service_role` key in the browser.
     * @param params An object which supports `page` and `perPage` as numbers, to alter the paginated results.
     */
    async listUsers(params) {
      var _a, _b, _c, _d, _e, _f, _g;
      try {
        const pagination = { nextPage: null, lastPage: 0, total: 0 };
        const response = await _request(this.fetch, "GET", `${this.url}/admin/users`, {
          headers: this.headers,
          noResolveJson: true,
          query: {
            page: (_b = (_a = params === null || params === void 0 ? void 0 : params.page) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : "",
            per_page: (_d = (_c = params === null || params === void 0 ? void 0 : params.perPage) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : ""
          },
          xform: _noResolveJsonResponse
        });
        if (response.error)
          throw response.error;
        const users = await response.json();
        const total = (_e = response.headers.get("x-total-count")) !== null && _e !== void 0 ? _e : 0;
        const links = (_g = (_f = response.headers.get("link")) === null || _f === void 0 ? void 0 : _f.split(",")) !== null && _g !== void 0 ? _g : [];
        if (links.length > 0) {
          links.forEach((link) => {
            const page = parseInt(link.split(";")[0].split("=")[1].substring(0, 1));
            const rel = JSON.parse(link.split(";")[1].split("=")[1]);
            pagination[`${rel}Page`] = page;
          });
          pagination.total = parseInt(total);
        }
        return { data: Object.assign(Object.assign({}, users), pagination), error: null };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { users: [] }, error };
        }
        throw error;
      }
    }
    /**
     * Get user by id.
     *
     * @param uid The user's unique identifier
     *
     * This function should only be called on a server. Never expose your `service_role` key in the browser.
     */
    async getUserById(uid) {
      validateUUID(uid);
      try {
        return await _request(this.fetch, "GET", `${this.url}/admin/users/${uid}`, {
          headers: this.headers,
          xform: _userResponse
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null }, error };
        }
        throw error;
      }
    }
    /**
     * Updates the user data.
     *
     * @param attributes The data you want to update.
     *
     * This function should only be called on a server. Never expose your `service_role` key in the browser.
     */
    async updateUserById(uid, attributes) {
      validateUUID(uid);
      try {
        return await _request(this.fetch, "PUT", `${this.url}/admin/users/${uid}`, {
          body: attributes,
          headers: this.headers,
          xform: _userResponse
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null }, error };
        }
        throw error;
      }
    }
    /**
     * Delete a user. Requires a `service_role` key.
     *
     * @param id The user id you want to remove.
     * @param shouldSoftDelete If true, then the user will be soft-deleted from the auth schema. Soft deletion allows user identification from the hashed user ID but is not reversible.
     * Defaults to false for backward compatibility.
     *
     * This function should only be called on a server. Never expose your `service_role` key in the browser.
     */
    async deleteUser(id, shouldSoftDelete = false) {
      validateUUID(id);
      try {
        return await _request(this.fetch, "DELETE", `${this.url}/admin/users/${id}`, {
          headers: this.headers,
          body: {
            should_soft_delete: shouldSoftDelete
          },
          xform: _userResponse
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null }, error };
        }
        throw error;
      }
    }
    async _listFactors(params) {
      validateUUID(params.userId);
      try {
        const { data, error } = await _request(this.fetch, "GET", `${this.url}/admin/users/${params.userId}/factors`, {
          headers: this.headers,
          xform: (factors) => {
            return { data: { factors }, error: null };
          }
        });
        return { data, error };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    }
    async _deleteFactor(params) {
      validateUUID(params.userId);
      validateUUID(params.id);
      try {
        const data = await _request(this.fetch, "DELETE", `${this.url}/admin/users/${params.userId}/factors/${params.id}`, {
          headers: this.headers
        });
        return { data, error: null };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    }
  };

  // node_modules/@supabase/auth-js/dist/module/lib/local-storage.js
  function memoryLocalStorageAdapter(store = {}) {
    return {
      getItem: (key) => {
        return store[key] || null;
      },
      setItem: (key, value) => {
        store[key] = value;
      },
      removeItem: (key) => {
        delete store[key];
      }
    };
  }

  // node_modules/@supabase/auth-js/dist/module/lib/polyfills.js
  function polyfillGlobalThis() {
    if (typeof globalThis === "object")
      return;
    try {
      Object.defineProperty(Object.prototype, "__magic__", {
        get: function() {
          return this;
        },
        configurable: true
      });
      __magic__.globalThis = __magic__;
      delete Object.prototype.__magic__;
    } catch (e) {
      if (typeof self !== "undefined") {
        self.globalThis = self;
      }
    }
  }

  // node_modules/@supabase/auth-js/dist/module/lib/locks.js
  var internals = {
    /**
     * @experimental
     */
    debug: !!(globalThis && supportsLocalStorage() && globalThis.localStorage && globalThis.localStorage.getItem("supabase.gotrue-js.locks.debug") === "true")
  };
  var LockAcquireTimeoutError = class extends Error {
    constructor(message) {
      super(message);
      this.isAcquireTimeout = true;
    }
  };
  var NavigatorLockAcquireTimeoutError = class extends LockAcquireTimeoutError {
  };
  async function navigatorLock(name, acquireTimeout, fn) {
    if (internals.debug) {
      console.log("@supabase/gotrue-js: navigatorLock: acquire lock", name, acquireTimeout);
    }
    const abortController = new globalThis.AbortController();
    if (acquireTimeout > 0) {
      setTimeout(() => {
        abortController.abort();
        if (internals.debug) {
          console.log("@supabase/gotrue-js: navigatorLock acquire timed out", name);
        }
      }, acquireTimeout);
    }
    return await Promise.resolve().then(() => globalThis.navigator.locks.request(name, acquireTimeout === 0 ? {
      mode: "exclusive",
      ifAvailable: true
    } : {
      mode: "exclusive",
      signal: abortController.signal
    }, async (lock) => {
      if (lock) {
        if (internals.debug) {
          console.log("@supabase/gotrue-js: navigatorLock: acquired", name, lock.name);
        }
        try {
          return await fn();
        } finally {
          if (internals.debug) {
            console.log("@supabase/gotrue-js: navigatorLock: released", name, lock.name);
          }
        }
      } else {
        if (acquireTimeout === 0) {
          if (internals.debug) {
            console.log("@supabase/gotrue-js: navigatorLock: not immediately available", name);
          }
          throw new NavigatorLockAcquireTimeoutError(`Acquiring an exclusive Navigator LockManager lock "${name}" immediately failed`);
        } else {
          if (internals.debug) {
            try {
              const result = await globalThis.navigator.locks.query();
              console.log("@supabase/gotrue-js: Navigator LockManager state", JSON.stringify(result, null, "  "));
            } catch (e) {
              console.warn("@supabase/gotrue-js: Error when querying Navigator LockManager state", e);
            }
          }
          console.warn("@supabase/gotrue-js: Navigator LockManager returned a null lock when using #request without ifAvailable set to true, it appears this browser is not following the LockManager spec https://developer.mozilla.org/en-US/docs/Web/API/LockManager/request");
          return await fn();
        }
      }
    }));
  }

  // node_modules/@supabase/auth-js/dist/module/GoTrueClient.js
  polyfillGlobalThis();
  var DEFAULT_OPTIONS = {
    url: GOTRUE_URL,
    storageKey: STORAGE_KEY,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    headers: DEFAULT_HEADERS3,
    flowType: "implicit",
    debug: false,
    hasCustomAuthorizationHeader: false
  };
  async function lockNoOp(name, acquireTimeout, fn) {
    return await fn();
  }
  var GLOBAL_JWKS = {};
  var GoTrueClient = class _GoTrueClient {
    /**
     * Create a new client for use in the browser.
     */
    constructor(options) {
      var _a, _b;
      this.userStorage = null;
      this.memoryStorage = null;
      this.stateChangeEmitters = /* @__PURE__ */ new Map();
      this.autoRefreshTicker = null;
      this.visibilityChangedCallback = null;
      this.refreshingDeferred = null;
      this.initializePromise = null;
      this.detectSessionInUrl = true;
      this.hasCustomAuthorizationHeader = false;
      this.suppressGetSessionWarning = false;
      this.lockAcquired = false;
      this.pendingInLock = [];
      this.broadcastChannel = null;
      this.logger = console.log;
      this.instanceID = _GoTrueClient.nextInstanceID;
      _GoTrueClient.nextInstanceID += 1;
      if (this.instanceID > 0 && isBrowser()) {
        console.warn("Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key.");
      }
      const settings = Object.assign(Object.assign({}, DEFAULT_OPTIONS), options);
      this.logDebugMessages = !!settings.debug;
      if (typeof settings.debug === "function") {
        this.logger = settings.debug;
      }
      this.persistSession = settings.persistSession;
      this.storageKey = settings.storageKey;
      this.autoRefreshToken = settings.autoRefreshToken;
      this.admin = new GoTrueAdminApi({
        url: settings.url,
        headers: settings.headers,
        fetch: settings.fetch
      });
      this.url = settings.url;
      this.headers = settings.headers;
      this.fetch = resolveFetch4(settings.fetch);
      this.lock = settings.lock || lockNoOp;
      this.detectSessionInUrl = settings.detectSessionInUrl;
      this.flowType = settings.flowType;
      this.hasCustomAuthorizationHeader = settings.hasCustomAuthorizationHeader;
      if (settings.lock) {
        this.lock = settings.lock;
      } else if (isBrowser() && ((_a = globalThis === null || globalThis === void 0 ? void 0 : globalThis.navigator) === null || _a === void 0 ? void 0 : _a.locks)) {
        this.lock = navigatorLock;
      } else {
        this.lock = lockNoOp;
      }
      if (!this.jwks) {
        this.jwks = { keys: [] };
        this.jwks_cached_at = Number.MIN_SAFE_INTEGER;
      }
      this.mfa = {
        verify: this._verify.bind(this),
        enroll: this._enroll.bind(this),
        unenroll: this._unenroll.bind(this),
        challenge: this._challenge.bind(this),
        listFactors: this._listFactors.bind(this),
        challengeAndVerify: this._challengeAndVerify.bind(this),
        getAuthenticatorAssuranceLevel: this._getAuthenticatorAssuranceLevel.bind(this)
      };
      if (this.persistSession) {
        if (settings.storage) {
          this.storage = settings.storage;
        } else {
          if (supportsLocalStorage()) {
            this.storage = globalThis.localStorage;
          } else {
            this.memoryStorage = {};
            this.storage = memoryLocalStorageAdapter(this.memoryStorage);
          }
        }
        if (settings.userStorage) {
          this.userStorage = settings.userStorage;
        }
      } else {
        this.memoryStorage = {};
        this.storage = memoryLocalStorageAdapter(this.memoryStorage);
      }
      if (isBrowser() && globalThis.BroadcastChannel && this.persistSession && this.storageKey) {
        try {
          this.broadcastChannel = new globalThis.BroadcastChannel(this.storageKey);
        } catch (e) {
          console.error("Failed to create a new BroadcastChannel, multi-tab state changes will not be available", e);
        }
        (_b = this.broadcastChannel) === null || _b === void 0 ? void 0 : _b.addEventListener("message", async (event2) => {
          this._debug("received broadcast notification from other tab or client", event2);
          await this._notifyAllSubscribers(event2.data.event, event2.data.session, false);
        });
      }
      this.initialize();
    }
    /**
     * The JWKS used for verifying asymmetric JWTs
     */
    get jwks() {
      var _a, _b;
      return (_b = (_a = GLOBAL_JWKS[this.storageKey]) === null || _a === void 0 ? void 0 : _a.jwks) !== null && _b !== void 0 ? _b : { keys: [] };
    }
    set jwks(value) {
      GLOBAL_JWKS[this.storageKey] = Object.assign(Object.assign({}, GLOBAL_JWKS[this.storageKey]), { jwks: value });
    }
    get jwks_cached_at() {
      var _a, _b;
      return (_b = (_a = GLOBAL_JWKS[this.storageKey]) === null || _a === void 0 ? void 0 : _a.cachedAt) !== null && _b !== void 0 ? _b : Number.MIN_SAFE_INTEGER;
    }
    set jwks_cached_at(value) {
      GLOBAL_JWKS[this.storageKey] = Object.assign(Object.assign({}, GLOBAL_JWKS[this.storageKey]), { cachedAt: value });
    }
    _debug(...args) {
      if (this.logDebugMessages) {
        this.logger(`GoTrueClient@${this.instanceID} (${version4}) ${(/* @__PURE__ */ new Date()).toISOString()}`, ...args);
      }
      return this;
    }
    /**
     * Initializes the client session either from the url or from storage.
     * This method is automatically called when instantiating the client, but should also be called
     * manually when checking for an error from an auth redirect (oauth, magiclink, password recovery, etc).
     */
    async initialize() {
      if (this.initializePromise) {
        return await this.initializePromise;
      }
      this.initializePromise = (async () => {
        return await this._acquireLock(-1, async () => {
          return await this._initialize();
        });
      })();
      return await this.initializePromise;
    }
    /**
     * IMPORTANT:
     * 1. Never throw in this method, as it is called from the constructor
     * 2. Never return a session from this method as it would be cached over
     *    the whole lifetime of the client
     */
    async _initialize() {
      var _a;
      try {
        const params = parseParametersFromURL(window.location.href);
        let callbackUrlType = "none";
        if (this._isImplicitGrantCallback(params)) {
          callbackUrlType = "implicit";
        } else if (await this._isPKCECallback(params)) {
          callbackUrlType = "pkce";
        }
        if (isBrowser() && this.detectSessionInUrl && callbackUrlType !== "none") {
          const { data, error } = await this._getSessionFromURL(params, callbackUrlType);
          if (error) {
            this._debug("#_initialize()", "error detecting session from URL", error);
            if (isAuthImplicitGrantRedirectError(error)) {
              const errorCode = (_a = error.details) === null || _a === void 0 ? void 0 : _a.code;
              if (errorCode === "identity_already_exists" || errorCode === "identity_not_found" || errorCode === "single_identity_not_deletable") {
                return { error };
              }
            }
            await this._removeSession();
            return { error };
          }
          const { session, redirectType } = data;
          this._debug("#_initialize()", "detected session in URL", session, "redirect type", redirectType);
          await this._saveSession(session);
          setTimeout(async () => {
            if (redirectType === "recovery") {
              await this._notifyAllSubscribers("PASSWORD_RECOVERY", session);
            } else {
              await this._notifyAllSubscribers("SIGNED_IN", session);
            }
          }, 0);
          return { error: null };
        }
        await this._recoverAndRefresh();
        return { error: null };
      } catch (error) {
        if (isAuthError(error)) {
          return { error };
        }
        return {
          error: new AuthUnknownError("Unexpected error during initialization", error)
        };
      } finally {
        await this._handleVisibilityChange();
        this._debug("#_initialize()", "end");
      }
    }
    /**
     * Creates a new anonymous user.
     *
     * @returns A session where the is_anonymous claim in the access token JWT set to true
     */
    async signInAnonymously(credentials) {
      var _a, _b, _c;
      try {
        const res = await _request(this.fetch, "POST", `${this.url}/signup`, {
          headers: this.headers,
          body: {
            data: (_b = (_a = credentials === null || credentials === void 0 ? void 0 : credentials.options) === null || _a === void 0 ? void 0 : _a.data) !== null && _b !== void 0 ? _b : {},
            gotrue_meta_security: { captcha_token: (_c = credentials === null || credentials === void 0 ? void 0 : credentials.options) === null || _c === void 0 ? void 0 : _c.captchaToken }
          },
          xform: _sessionResponse
        });
        const { data, error } = res;
        if (error || !data) {
          return { data: { user: null, session: null }, error };
        }
        const session = data.session;
        const user = data.user;
        if (data.session) {
          await this._saveSession(data.session);
          await this._notifyAllSubscribers("SIGNED_IN", session);
        }
        return { data: { user, session }, error: null };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null, session: null }, error };
        }
        throw error;
      }
    }
    /**
     * Creates a new user.
     *
     * Be aware that if a user account exists in the system you may get back an
     * error message that attempts to hide this information from the user.
     * This method has support for PKCE via email signups. The PKCE flow cannot be used when autoconfirm is enabled.
     *
     * @returns A logged-in session if the server has "autoconfirm" ON
     * @returns A user if the server has "autoconfirm" OFF
     */
    async signUp(credentials) {
      var _a, _b, _c;
      try {
        let res;
        if ("email" in credentials) {
          const { email, password, options } = credentials;
          let codeChallenge = null;
          let codeChallengeMethod = null;
          if (this.flowType === "pkce") {
            ;
            [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
          }
          res = await _request(this.fetch, "POST", `${this.url}/signup`, {
            headers: this.headers,
            redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo,
            body: {
              email,
              password,
              data: (_a = options === null || options === void 0 ? void 0 : options.data) !== null && _a !== void 0 ? _a : {},
              gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
              code_challenge: codeChallenge,
              code_challenge_method: codeChallengeMethod
            },
            xform: _sessionResponse
          });
        } else if ("phone" in credentials) {
          const { phone, password, options } = credentials;
          res = await _request(this.fetch, "POST", `${this.url}/signup`, {
            headers: this.headers,
            body: {
              phone,
              password,
              data: (_b = options === null || options === void 0 ? void 0 : options.data) !== null && _b !== void 0 ? _b : {},
              channel: (_c = options === null || options === void 0 ? void 0 : options.channel) !== null && _c !== void 0 ? _c : "sms",
              gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken }
            },
            xform: _sessionResponse
          });
        } else {
          throw new AuthInvalidCredentialsError("You must provide either an email or phone number and a password");
        }
        const { data, error } = res;
        if (error || !data) {
          return { data: { user: null, session: null }, error };
        }
        const session = data.session;
        const user = data.user;
        if (data.session) {
          await this._saveSession(data.session);
          await this._notifyAllSubscribers("SIGNED_IN", session);
        }
        return { data: { user, session }, error: null };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null, session: null }, error };
        }
        throw error;
      }
    }
    /**
     * Log in an existing user with an email and password or phone and password.
     *
     * Be aware that you may get back an error message that will not distinguish
     * between the cases where the account does not exist or that the
     * email/phone and password combination is wrong or that the account can only
     * be accessed via social login.
     */
    async signInWithPassword(credentials) {
      try {
        let res;
        if ("email" in credentials) {
          const { email, password, options } = credentials;
          res = await _request(this.fetch, "POST", `${this.url}/token?grant_type=password`, {
            headers: this.headers,
            body: {
              email,
              password,
              gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken }
            },
            xform: _sessionResponsePassword
          });
        } else if ("phone" in credentials) {
          const { phone, password, options } = credentials;
          res = await _request(this.fetch, "POST", `${this.url}/token?grant_type=password`, {
            headers: this.headers,
            body: {
              phone,
              password,
              gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken }
            },
            xform: _sessionResponsePassword
          });
        } else {
          throw new AuthInvalidCredentialsError("You must provide either an email or phone number and a password");
        }
        const { data, error } = res;
        if (error) {
          return { data: { user: null, session: null }, error };
        } else if (!data || !data.session || !data.user) {
          return { data: { user: null, session: null }, error: new AuthInvalidTokenResponseError() };
        }
        if (data.session) {
          await this._saveSession(data.session);
          await this._notifyAllSubscribers("SIGNED_IN", data.session);
        }
        return {
          data: Object.assign({ user: data.user, session: data.session }, data.weak_password ? { weakPassword: data.weak_password } : null),
          error
        };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null, session: null }, error };
        }
        throw error;
      }
    }
    /**
     * Log in an existing user via a third-party provider.
     * This method supports the PKCE flow.
     */
    async signInWithOAuth(credentials) {
      var _a, _b, _c, _d;
      return await this._handleProviderSignIn(credentials.provider, {
        redirectTo: (_a = credentials.options) === null || _a === void 0 ? void 0 : _a.redirectTo,
        scopes: (_b = credentials.options) === null || _b === void 0 ? void 0 : _b.scopes,
        queryParams: (_c = credentials.options) === null || _c === void 0 ? void 0 : _c.queryParams,
        skipBrowserRedirect: (_d = credentials.options) === null || _d === void 0 ? void 0 : _d.skipBrowserRedirect
      });
    }
    /**
     * Log in an existing user by exchanging an Auth Code issued during the PKCE flow.
     */
    async exchangeCodeForSession(authCode) {
      await this.initializePromise;
      return this._acquireLock(-1, async () => {
        return this._exchangeCodeForSession(authCode);
      });
    }
    /**
     * Signs in a user by verifying a message signed by the user's private key.
     * Only Solana supported at this time, using the Sign in with Solana standard.
     */
    async signInWithWeb3(credentials) {
      const { chain } = credentials;
      if (chain === "solana") {
        return await this.signInWithSolana(credentials);
      }
      throw new Error(`@supabase/auth-js: Unsupported chain "${chain}"`);
    }
    async signInWithSolana(credentials) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
      let message;
      let signature;
      if ("message" in credentials) {
        message = credentials.message;
        signature = credentials.signature;
      } else {
        const { chain, wallet, statement, options } = credentials;
        let resolvedWallet;
        if (!isBrowser()) {
          if (typeof wallet !== "object" || !(options === null || options === void 0 ? void 0 : options.url)) {
            throw new Error("@supabase/auth-js: Both wallet and url must be specified in non-browser environments.");
          }
          resolvedWallet = wallet;
        } else if (typeof wallet === "object") {
          resolvedWallet = wallet;
        } else {
          const windowAny = window;
          if ("solana" in windowAny && typeof windowAny.solana === "object" && ("signIn" in windowAny.solana && typeof windowAny.solana.signIn === "function" || "signMessage" in windowAny.solana && typeof windowAny.solana.signMessage === "function")) {
            resolvedWallet = windowAny.solana;
          } else {
            throw new Error(`@supabase/auth-js: No compatible Solana wallet interface on the window object (window.solana) detected. Make sure the user already has a wallet installed and connected for this app. Prefer passing the wallet interface object directly to signInWithWeb3({ chain: 'solana', wallet: resolvedUserWallet }) instead.`);
          }
        }
        const url = new URL((_a = options === null || options === void 0 ? void 0 : options.url) !== null && _a !== void 0 ? _a : window.location.href);
        if ("signIn" in resolvedWallet && resolvedWallet.signIn) {
          const output = await resolvedWallet.signIn(Object.assign(Object.assign(Object.assign({ issuedAt: (/* @__PURE__ */ new Date()).toISOString() }, options === null || options === void 0 ? void 0 : options.signInWithSolana), {
            // non-overridable properties
            version: "1",
            domain: url.host,
            uri: url.href
          }), statement ? { statement } : null));
          let outputToProcess;
          if (Array.isArray(output) && output[0] && typeof output[0] === "object") {
            outputToProcess = output[0];
          } else if (output && typeof output === "object" && "signedMessage" in output && "signature" in output) {
            outputToProcess = output;
          } else {
            throw new Error("@supabase/auth-js: Wallet method signIn() returned unrecognized value");
          }
          if ("signedMessage" in outputToProcess && "signature" in outputToProcess && (typeof outputToProcess.signedMessage === "string" || outputToProcess.signedMessage instanceof Uint8Array) && outputToProcess.signature instanceof Uint8Array) {
            message = typeof outputToProcess.signedMessage === "string" ? outputToProcess.signedMessage : new TextDecoder().decode(outputToProcess.signedMessage);
            signature = outputToProcess.signature;
          } else {
            throw new Error("@supabase/auth-js: Wallet method signIn() API returned object without signedMessage and signature fields");
          }
        } else {
          if (!("signMessage" in resolvedWallet) || typeof resolvedWallet.signMessage !== "function" || !("publicKey" in resolvedWallet) || typeof resolvedWallet !== "object" || !resolvedWallet.publicKey || !("toBase58" in resolvedWallet.publicKey) || typeof resolvedWallet.publicKey.toBase58 !== "function") {
            throw new Error("@supabase/auth-js: Wallet does not have a compatible signMessage() and publicKey.toBase58() API");
          }
          message = [
            `${url.host} wants you to sign in with your Solana account:`,
            resolvedWallet.publicKey.toBase58(),
            ...statement ? ["", statement, ""] : [""],
            "Version: 1",
            `URI: ${url.href}`,
            `Issued At: ${(_c = (_b = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _b === void 0 ? void 0 : _b.issuedAt) !== null && _c !== void 0 ? _c : (/* @__PURE__ */ new Date()).toISOString()}`,
            ...((_d = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _d === void 0 ? void 0 : _d.notBefore) ? [`Not Before: ${options.signInWithSolana.notBefore}`] : [],
            ...((_e = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _e === void 0 ? void 0 : _e.expirationTime) ? [`Expiration Time: ${options.signInWithSolana.expirationTime}`] : [],
            ...((_f = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _f === void 0 ? void 0 : _f.chainId) ? [`Chain ID: ${options.signInWithSolana.chainId}`] : [],
            ...((_g = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _g === void 0 ? void 0 : _g.nonce) ? [`Nonce: ${options.signInWithSolana.nonce}`] : [],
            ...((_h = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _h === void 0 ? void 0 : _h.requestId) ? [`Request ID: ${options.signInWithSolana.requestId}`] : [],
            ...((_k = (_j = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _j === void 0 ? void 0 : _j.resources) === null || _k === void 0 ? void 0 : _k.length) ? [
              "Resources",
              ...options.signInWithSolana.resources.map((resource) => `- ${resource}`)
            ] : []
          ].join("\n");
          const maybeSignature = await resolvedWallet.signMessage(new TextEncoder().encode(message), "utf8");
          if (!maybeSignature || !(maybeSignature instanceof Uint8Array)) {
            throw new Error("@supabase/auth-js: Wallet signMessage() API returned an recognized value");
          }
          signature = maybeSignature;
        }
      }
      try {
        const { data, error } = await _request(this.fetch, "POST", `${this.url}/token?grant_type=web3`, {
          headers: this.headers,
          body: Object.assign({ chain: "solana", message, signature: bytesToBase64URL(signature) }, ((_l = credentials.options) === null || _l === void 0 ? void 0 : _l.captchaToken) ? { gotrue_meta_security: { captcha_token: (_m = credentials.options) === null || _m === void 0 ? void 0 : _m.captchaToken } } : null),
          xform: _sessionResponse
        });
        if (error) {
          throw error;
        }
        if (!data || !data.session || !data.user) {
          return {
            data: { user: null, session: null },
            error: new AuthInvalidTokenResponseError()
          };
        }
        if (data.session) {
          await this._saveSession(data.session);
          await this._notifyAllSubscribers("SIGNED_IN", data.session);
        }
        return { data: Object.assign({}, data), error };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null, session: null }, error };
        }
        throw error;
      }
    }
    async _exchangeCodeForSession(authCode) {
      const storageItem = await getItemAsync(this.storage, `${this.storageKey}-code-verifier`);
      const [codeVerifier, redirectType] = (storageItem !== null && storageItem !== void 0 ? storageItem : "").split("/");
      try {
        const { data, error } = await _request(this.fetch, "POST", `${this.url}/token?grant_type=pkce`, {
          headers: this.headers,
          body: {
            auth_code: authCode,
            code_verifier: codeVerifier
          },
          xform: _sessionResponse
        });
        await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
        if (error) {
          throw error;
        }
        if (!data || !data.session || !data.user) {
          return {
            data: { user: null, session: null, redirectType: null },
            error: new AuthInvalidTokenResponseError()
          };
        }
        if (data.session) {
          await this._saveSession(data.session);
          await this._notifyAllSubscribers("SIGNED_IN", data.session);
        }
        return { data: Object.assign(Object.assign({}, data), { redirectType: redirectType !== null && redirectType !== void 0 ? redirectType : null }), error };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null, session: null, redirectType: null }, error };
        }
        throw error;
      }
    }
    /**
     * Allows signing in with an OIDC ID token. The authentication provider used
     * should be enabled and configured.
     */
    async signInWithIdToken(credentials) {
      try {
        const { options, provider, token, access_token, nonce } = credentials;
        const res = await _request(this.fetch, "POST", `${this.url}/token?grant_type=id_token`, {
          headers: this.headers,
          body: {
            provider,
            id_token: token,
            access_token,
            nonce,
            gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken }
          },
          xform: _sessionResponse
        });
        const { data, error } = res;
        if (error) {
          return { data: { user: null, session: null }, error };
        } else if (!data || !data.session || !data.user) {
          return {
            data: { user: null, session: null },
            error: new AuthInvalidTokenResponseError()
          };
        }
        if (data.session) {
          await this._saveSession(data.session);
          await this._notifyAllSubscribers("SIGNED_IN", data.session);
        }
        return { data, error };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null, session: null }, error };
        }
        throw error;
      }
    }
    /**
     * Log in a user using magiclink or a one-time password (OTP).
     *
     * If the `{{ .ConfirmationURL }}` variable is specified in the email template, a magiclink will be sent.
     * If the `{{ .Token }}` variable is specified in the email template, an OTP will be sent.
     * If you're using phone sign-ins, only an OTP will be sent. You won't be able to send a magiclink for phone sign-ins.
     *
     * Be aware that you may get back an error message that will not distinguish
     * between the cases where the account does not exist or, that the account
     * can only be accessed via social login.
     *
     * Do note that you will need to configure a Whatsapp sender on Twilio
     * if you are using phone sign in with the 'whatsapp' channel. The whatsapp
     * channel is not supported on other providers
     * at this time.
     * This method supports PKCE when an email is passed.
     */
    async signInWithOtp(credentials) {
      var _a, _b, _c, _d, _e;
      try {
        if ("email" in credentials) {
          const { email, options } = credentials;
          let codeChallenge = null;
          let codeChallengeMethod = null;
          if (this.flowType === "pkce") {
            ;
            [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
          }
          const { error } = await _request(this.fetch, "POST", `${this.url}/otp`, {
            headers: this.headers,
            body: {
              email,
              data: (_a = options === null || options === void 0 ? void 0 : options.data) !== null && _a !== void 0 ? _a : {},
              create_user: (_b = options === null || options === void 0 ? void 0 : options.shouldCreateUser) !== null && _b !== void 0 ? _b : true,
              gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
              code_challenge: codeChallenge,
              code_challenge_method: codeChallengeMethod
            },
            redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo
          });
          return { data: { user: null, session: null }, error };
        }
        if ("phone" in credentials) {
          const { phone, options } = credentials;
          const { data, error } = await _request(this.fetch, "POST", `${this.url}/otp`, {
            headers: this.headers,
            body: {
              phone,
              data: (_c = options === null || options === void 0 ? void 0 : options.data) !== null && _c !== void 0 ? _c : {},
              create_user: (_d = options === null || options === void 0 ? void 0 : options.shouldCreateUser) !== null && _d !== void 0 ? _d : true,
              gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
              channel: (_e = options === null || options === void 0 ? void 0 : options.channel) !== null && _e !== void 0 ? _e : "sms"
            }
          });
          return { data: { user: null, session: null, messageId: data === null || data === void 0 ? void 0 : data.message_id }, error };
        }
        throw new AuthInvalidCredentialsError("You must provide either an email or phone number.");
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null, session: null }, error };
        }
        throw error;
      }
    }
    /**
     * Log in a user given a User supplied OTP or TokenHash received through mobile or email.
     */
    async verifyOtp(params) {
      var _a, _b;
      try {
        let redirectTo = void 0;
        let captchaToken = void 0;
        if ("options" in params) {
          redirectTo = (_a = params.options) === null || _a === void 0 ? void 0 : _a.redirectTo;
          captchaToken = (_b = params.options) === null || _b === void 0 ? void 0 : _b.captchaToken;
        }
        const { data, error } = await _request(this.fetch, "POST", `${this.url}/verify`, {
          headers: this.headers,
          body: Object.assign(Object.assign({}, params), { gotrue_meta_security: { captcha_token: captchaToken } }),
          redirectTo,
          xform: _sessionResponse
        });
        if (error) {
          throw error;
        }
        if (!data) {
          throw new Error("An error occurred on token verification.");
        }
        const session = data.session;
        const user = data.user;
        if (session === null || session === void 0 ? void 0 : session.access_token) {
          await this._saveSession(session);
          await this._notifyAllSubscribers(params.type == "recovery" ? "PASSWORD_RECOVERY" : "SIGNED_IN", session);
        }
        return { data: { user, session }, error: null };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null, session: null }, error };
        }
        throw error;
      }
    }
    /**
     * Attempts a single-sign on using an enterprise Identity Provider. A
     * successful SSO attempt will redirect the current page to the identity
     * provider authorization page. The redirect URL is implementation and SSO
     * protocol specific.
     *
     * You can use it by providing a SSO domain. Typically you can extract this
     * domain by asking users for their email address. If this domain is
     * registered on the Auth instance the redirect will use that organization's
     * currently active SSO Identity Provider for the login.
     *
     * If you have built an organization-specific login page, you can use the
     * organization's SSO Identity Provider UUID directly instead.
     */
    async signInWithSSO(params) {
      var _a, _b, _c;
      try {
        let codeChallenge = null;
        let codeChallengeMethod = null;
        if (this.flowType === "pkce") {
          ;
          [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
        }
        return await _request(this.fetch, "POST", `${this.url}/sso`, {
          body: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, "providerId" in params ? { provider_id: params.providerId } : null), "domain" in params ? { domain: params.domain } : null), { redirect_to: (_b = (_a = params.options) === null || _a === void 0 ? void 0 : _a.redirectTo) !== null && _b !== void 0 ? _b : void 0 }), ((_c = params === null || params === void 0 ? void 0 : params.options) === null || _c === void 0 ? void 0 : _c.captchaToken) ? { gotrue_meta_security: { captcha_token: params.options.captchaToken } } : null), { skip_http_redirect: true, code_challenge: codeChallenge, code_challenge_method: codeChallengeMethod }),
          headers: this.headers,
          xform: _ssoResponse
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    }
    /**
     * Sends a reauthentication OTP to the user's email or phone number.
     * Requires the user to be signed-in.
     */
    async reauthenticate() {
      await this.initializePromise;
      return await this._acquireLock(-1, async () => {
        return await this._reauthenticate();
      });
    }
    async _reauthenticate() {
      try {
        return await this._useSession(async (result) => {
          const { data: { session }, error: sessionError } = result;
          if (sessionError)
            throw sessionError;
          if (!session)
            throw new AuthSessionMissingError();
          const { error } = await _request(this.fetch, "GET", `${this.url}/reauthenticate`, {
            headers: this.headers,
            jwt: session.access_token
          });
          return { data: { user: null, session: null }, error };
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null, session: null }, error };
        }
        throw error;
      }
    }
    /**
     * Resends an existing signup confirmation email, email change email, SMS OTP or phone change OTP.
     */
    async resend(credentials) {
      try {
        const endpoint = `${this.url}/resend`;
        if ("email" in credentials) {
          const { email, type, options } = credentials;
          const { error } = await _request(this.fetch, "POST", endpoint, {
            headers: this.headers,
            body: {
              email,
              type,
              gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken }
            },
            redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo
          });
          return { data: { user: null, session: null }, error };
        } else if ("phone" in credentials) {
          const { phone, type, options } = credentials;
          const { data, error } = await _request(this.fetch, "POST", endpoint, {
            headers: this.headers,
            body: {
              phone,
              type,
              gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken }
            }
          });
          return { data: { user: null, session: null, messageId: data === null || data === void 0 ? void 0 : data.message_id }, error };
        }
        throw new AuthInvalidCredentialsError("You must provide either an email or phone number and a type");
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null, session: null }, error };
        }
        throw error;
      }
    }
    /**
     * Returns the session, refreshing it if necessary.
     *
     * The session returned can be null if the session is not detected which can happen in the event a user is not signed-in or has logged out.
     *
     * **IMPORTANT:** This method loads values directly from the storage attached
     * to the client. If that storage is based on request cookies for example,
     * the values in it may not be authentic and therefore it's strongly advised
     * against using this method and its results in such circumstances. A warning
     * will be emitted if this is detected. Use {@link #getUser()} instead.
     */
    async getSession() {
      await this.initializePromise;
      const result = await this._acquireLock(-1, async () => {
        return this._useSession(async (result2) => {
          return result2;
        });
      });
      return result;
    }
    /**
     * Acquires a global lock based on the storage key.
     */
    async _acquireLock(acquireTimeout, fn) {
      this._debug("#_acquireLock", "begin", acquireTimeout);
      try {
        if (this.lockAcquired) {
          const last = this.pendingInLock.length ? this.pendingInLock[this.pendingInLock.length - 1] : Promise.resolve();
          const result = (async () => {
            await last;
            return await fn();
          })();
          this.pendingInLock.push((async () => {
            try {
              await result;
            } catch (e) {
            }
          })());
          return result;
        }
        return await this.lock(`lock:${this.storageKey}`, acquireTimeout, async () => {
          this._debug("#_acquireLock", "lock acquired for storage key", this.storageKey);
          try {
            this.lockAcquired = true;
            const result = fn();
            this.pendingInLock.push((async () => {
              try {
                await result;
              } catch (e) {
              }
            })());
            await result;
            while (this.pendingInLock.length) {
              const waitOn = [...this.pendingInLock];
              await Promise.all(waitOn);
              this.pendingInLock.splice(0, waitOn.length);
            }
            return await result;
          } finally {
            this._debug("#_acquireLock", "lock released for storage key", this.storageKey);
            this.lockAcquired = false;
          }
        });
      } finally {
        this._debug("#_acquireLock", "end");
      }
    }
    /**
     * Use instead of {@link #getSession} inside the library. It is
     * semantically usually what you want, as getting a session involves some
     * processing afterwards that requires only one client operating on the
     * session at once across multiple tabs or processes.
     */
    async _useSession(fn) {
      this._debug("#_useSession", "begin");
      try {
        const result = await this.__loadSession();
        return await fn(result);
      } finally {
        this._debug("#_useSession", "end");
      }
    }
    /**
     * NEVER USE DIRECTLY!
     *
     * Always use {@link #_useSession}.
     */
    async __loadSession() {
      this._debug("#__loadSession()", "begin");
      if (!this.lockAcquired) {
        this._debug("#__loadSession()", "used outside of an acquired lock!", new Error().stack);
      }
      try {
        let currentSession = null;
        const maybeSession = await getItemAsync(this.storage, this.storageKey);
        this._debug("#getSession()", "session from storage", maybeSession);
        if (maybeSession !== null) {
          if (this._isValidSession(maybeSession)) {
            currentSession = maybeSession;
          } else {
            this._debug("#getSession()", "session from storage is not valid");
            await this._removeSession();
          }
        }
        if (!currentSession) {
          return { data: { session: null }, error: null };
        }
        const hasExpired = currentSession.expires_at ? currentSession.expires_at * 1e3 - Date.now() < EXPIRY_MARGIN_MS : false;
        this._debug("#__loadSession()", `session has${hasExpired ? "" : " not"} expired`, "expires_at", currentSession.expires_at);
        if (!hasExpired) {
          if (this.userStorage) {
            const maybeUser = await getItemAsync(this.userStorage, this.storageKey + "-user");
            if (maybeUser === null || maybeUser === void 0 ? void 0 : maybeUser.user) {
              currentSession.user = maybeUser.user;
            } else {
              currentSession.user = userNotAvailableProxy();
            }
          }
          if (this.storage.isServer && currentSession.user) {
            let suppressWarning = this.suppressGetSessionWarning;
            const proxySession = new Proxy(currentSession, {
              get: (target, prop, receiver) => {
                if (!suppressWarning && prop === "user") {
                  console.warn("Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.");
                  suppressWarning = true;
                  this.suppressGetSessionWarning = true;
                }
                return Reflect.get(target, prop, receiver);
              }
            });
            currentSession = proxySession;
          }
          return { data: { session: currentSession }, error: null };
        }
        const { session, error } = await this._callRefreshToken(currentSession.refresh_token);
        if (error) {
          return { data: { session: null }, error };
        }
        return { data: { session }, error: null };
      } finally {
        this._debug("#__loadSession()", "end");
      }
    }
    /**
     * Gets the current user details if there is an existing session. This method
     * performs a network request to the Supabase Auth server, so the returned
     * value is authentic and can be used to base authorization rules on.
     *
     * @param jwt Takes in an optional access token JWT. If no JWT is provided, the JWT from the current session is used.
     */
    async getUser(jwt) {
      if (jwt) {
        return await this._getUser(jwt);
      }
      await this.initializePromise;
      const result = await this._acquireLock(-1, async () => {
        return await this._getUser();
      });
      return result;
    }
    async _getUser(jwt) {
      try {
        if (jwt) {
          return await _request(this.fetch, "GET", `${this.url}/user`, {
            headers: this.headers,
            jwt,
            xform: _userResponse
          });
        }
        return await this._useSession(async (result) => {
          var _a, _b, _c;
          const { data, error } = result;
          if (error) {
            throw error;
          }
          if (!((_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token) && !this.hasCustomAuthorizationHeader) {
            return { data: { user: null }, error: new AuthSessionMissingError() };
          }
          return await _request(this.fetch, "GET", `${this.url}/user`, {
            headers: this.headers,
            jwt: (_c = (_b = data.session) === null || _b === void 0 ? void 0 : _b.access_token) !== null && _c !== void 0 ? _c : void 0,
            xform: _userResponse
          });
        });
      } catch (error) {
        if (isAuthError(error)) {
          if (isAuthSessionMissingError(error)) {
            await this._removeSession();
            await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
          }
          return { data: { user: null }, error };
        }
        throw error;
      }
    }
    /**
     * Updates user data for a logged in user.
     */
    async updateUser(attributes, options = {}) {
      await this.initializePromise;
      return await this._acquireLock(-1, async () => {
        return await this._updateUser(attributes, options);
      });
    }
    async _updateUser(attributes, options = {}) {
      try {
        return await this._useSession(async (result) => {
          const { data: sessionData, error: sessionError } = result;
          if (sessionError) {
            throw sessionError;
          }
          if (!sessionData.session) {
            throw new AuthSessionMissingError();
          }
          const session = sessionData.session;
          let codeChallenge = null;
          let codeChallengeMethod = null;
          if (this.flowType === "pkce" && attributes.email != null) {
            ;
            [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
          }
          const { data, error: userError } = await _request(this.fetch, "PUT", `${this.url}/user`, {
            headers: this.headers,
            redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo,
            body: Object.assign(Object.assign({}, attributes), { code_challenge: codeChallenge, code_challenge_method: codeChallengeMethod }),
            jwt: session.access_token,
            xform: _userResponse
          });
          if (userError)
            throw userError;
          session.user = data.user;
          await this._saveSession(session);
          await this._notifyAllSubscribers("USER_UPDATED", session);
          return { data: { user: session.user }, error: null };
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null }, error };
        }
        throw error;
      }
    }
    /**
     * Sets the session data from the current session. If the current session is expired, setSession will take care of refreshing it to obtain a new session.
     * If the refresh token or access token in the current session is invalid, an error will be thrown.
     * @param currentSession The current session that minimally contains an access token and refresh token.
     */
    async setSession(currentSession) {
      await this.initializePromise;
      return await this._acquireLock(-1, async () => {
        return await this._setSession(currentSession);
      });
    }
    async _setSession(currentSession) {
      try {
        if (!currentSession.access_token || !currentSession.refresh_token) {
          throw new AuthSessionMissingError();
        }
        const timeNow = Date.now() / 1e3;
        let expiresAt2 = timeNow;
        let hasExpired = true;
        let session = null;
        const { payload } = decodeJWT(currentSession.access_token);
        if (payload.exp) {
          expiresAt2 = payload.exp;
          hasExpired = expiresAt2 <= timeNow;
        }
        if (hasExpired) {
          const { session: refreshedSession, error } = await this._callRefreshToken(currentSession.refresh_token);
          if (error) {
            return { data: { user: null, session: null }, error };
          }
          if (!refreshedSession) {
            return { data: { user: null, session: null }, error: null };
          }
          session = refreshedSession;
        } else {
          const { data, error } = await this._getUser(currentSession.access_token);
          if (error) {
            throw error;
          }
          session = {
            access_token: currentSession.access_token,
            refresh_token: currentSession.refresh_token,
            user: data.user,
            token_type: "bearer",
            expires_in: expiresAt2 - timeNow,
            expires_at: expiresAt2
          };
          await this._saveSession(session);
          await this._notifyAllSubscribers("SIGNED_IN", session);
        }
        return { data: { user: session.user, session }, error: null };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { session: null, user: null }, error };
        }
        throw error;
      }
    }
    /**
     * Returns a new session, regardless of expiry status.
     * Takes in an optional current session. If not passed in, then refreshSession() will attempt to retrieve it from getSession().
     * If the current session's refresh token is invalid, an error will be thrown.
     * @param currentSession The current session. If passed in, it must contain a refresh token.
     */
    async refreshSession(currentSession) {
      await this.initializePromise;
      return await this._acquireLock(-1, async () => {
        return await this._refreshSession(currentSession);
      });
    }
    async _refreshSession(currentSession) {
      try {
        return await this._useSession(async (result) => {
          var _a;
          if (!currentSession) {
            const { data, error: error2 } = result;
            if (error2) {
              throw error2;
            }
            currentSession = (_a = data.session) !== null && _a !== void 0 ? _a : void 0;
          }
          if (!(currentSession === null || currentSession === void 0 ? void 0 : currentSession.refresh_token)) {
            throw new AuthSessionMissingError();
          }
          const { session, error } = await this._callRefreshToken(currentSession.refresh_token);
          if (error) {
            return { data: { user: null, session: null }, error };
          }
          if (!session) {
            return { data: { user: null, session: null }, error: null };
          }
          return { data: { user: session.user, session }, error: null };
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null, session: null }, error };
        }
        throw error;
      }
    }
    /**
     * Gets the session data from a URL string
     */
    async _getSessionFromURL(params, callbackUrlType) {
      try {
        if (!isBrowser())
          throw new AuthImplicitGrantRedirectError("No browser detected.");
        if (params.error || params.error_description || params.error_code) {
          throw new AuthImplicitGrantRedirectError(params.error_description || "Error in URL with unspecified error_description", {
            error: params.error || "unspecified_error",
            code: params.error_code || "unspecified_code"
          });
        }
        switch (callbackUrlType) {
          case "implicit":
            if (this.flowType === "pkce") {
              throw new AuthPKCEGrantCodeExchangeError("Not a valid PKCE flow url.");
            }
            break;
          case "pkce":
            if (this.flowType === "implicit") {
              throw new AuthImplicitGrantRedirectError("Not a valid implicit grant flow url.");
            }
            break;
          default:
        }
        if (callbackUrlType === "pkce") {
          this._debug("#_initialize()", "begin", "is PKCE flow", true);
          if (!params.code)
            throw new AuthPKCEGrantCodeExchangeError("No code detected.");
          const { data: data2, error: error2 } = await this._exchangeCodeForSession(params.code);
          if (error2)
            throw error2;
          const url = new URL(window.location.href);
          url.searchParams.delete("code");
          window.history.replaceState(window.history.state, "", url.toString());
          return { data: { session: data2.session, redirectType: null }, error: null };
        }
        const { provider_token, provider_refresh_token, access_token, refresh_token, expires_in, expires_at, token_type } = params;
        if (!access_token || !expires_in || !refresh_token || !token_type) {
          throw new AuthImplicitGrantRedirectError("No session defined in URL");
        }
        const timeNow = Math.round(Date.now() / 1e3);
        const expiresIn = parseInt(expires_in);
        let expiresAt2 = timeNow + expiresIn;
        if (expires_at) {
          expiresAt2 = parseInt(expires_at);
        }
        const actuallyExpiresIn = expiresAt2 - timeNow;
        if (actuallyExpiresIn * 1e3 <= AUTO_REFRESH_TICK_DURATION_MS) {
          console.warn(`@supabase/gotrue-js: Session as retrieved from URL expires in ${actuallyExpiresIn}s, should have been closer to ${expiresIn}s`);
        }
        const issuedAt = expiresAt2 - expiresIn;
        if (timeNow - issuedAt >= 120) {
          console.warn("@supabase/gotrue-js: Session as retrieved from URL was issued over 120s ago, URL could be stale", issuedAt, expiresAt2, timeNow);
        } else if (timeNow - issuedAt < 0) {
          console.warn("@supabase/gotrue-js: Session as retrieved from URL was issued in the future? Check the device clock for skew", issuedAt, expiresAt2, timeNow);
        }
        const { data, error } = await this._getUser(access_token);
        if (error)
          throw error;
        const session = {
          provider_token,
          provider_refresh_token,
          access_token,
          expires_in: expiresIn,
          expires_at: expiresAt2,
          refresh_token,
          token_type,
          user: data.user
        };
        window.location.hash = "";
        this._debug("#_getSessionFromURL()", "clearing window.location.hash");
        return { data: { session, redirectType: params.type }, error: null };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { session: null, redirectType: null }, error };
        }
        throw error;
      }
    }
    /**
     * Checks if the current URL contains parameters given by an implicit oauth grant flow (https://www.rfc-editor.org/rfc/rfc6749.html#section-4.2)
     */
    _isImplicitGrantCallback(params) {
      return Boolean(params.access_token || params.error_description);
    }
    /**
     * Checks if the current URL and backing storage contain parameters given by a PKCE flow
     */
    async _isPKCECallback(params) {
      const currentStorageContent = await getItemAsync(this.storage, `${this.storageKey}-code-verifier`);
      return !!(params.code && currentStorageContent);
    }
    /**
     * Inside a browser context, `signOut()` will remove the logged in user from the browser session and log them out - removing all items from localstorage and then trigger a `"SIGNED_OUT"` event.
     *
     * For server-side management, you can revoke all refresh tokens for a user by passing a user's JWT through to `auth.api.signOut(JWT: string)`.
     * There is no way to revoke a user's access token jwt until it expires. It is recommended to set a shorter expiry on the jwt for this reason.
     *
     * If using `others` scope, no `SIGNED_OUT` event is fired!
     */
    async signOut(options = { scope: "global" }) {
      await this.initializePromise;
      return await this._acquireLock(-1, async () => {
        return await this._signOut(options);
      });
    }
    async _signOut({ scope } = { scope: "global" }) {
      return await this._useSession(async (result) => {
        var _a;
        const { data, error: sessionError } = result;
        if (sessionError) {
          return { error: sessionError };
        }
        const accessToken = (_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token;
        if (accessToken) {
          const { error } = await this.admin.signOut(accessToken, scope);
          if (error) {
            if (!(isAuthApiError(error) && (error.status === 404 || error.status === 401 || error.status === 403))) {
              return { error };
            }
          }
        }
        if (scope !== "others") {
          await this._removeSession();
          await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
        }
        return { error: null };
      });
    }
    /**
     * Receive a notification every time an auth event happens.
     * @param callback A callback function to be invoked when an auth event happens.
     */
    onAuthStateChange(callback) {
      const id = uuid();
      const subscription = {
        id,
        callback,
        unsubscribe: () => {
          this._debug("#unsubscribe()", "state change callback with id removed", id);
          this.stateChangeEmitters.delete(id);
        }
      };
      this._debug("#onAuthStateChange()", "registered callback with id", id);
      this.stateChangeEmitters.set(id, subscription);
      (async () => {
        await this.initializePromise;
        await this._acquireLock(-1, async () => {
          this._emitInitialSession(id);
        });
      })();
      return { data: { subscription } };
    }
    async _emitInitialSession(id) {
      return await this._useSession(async (result) => {
        var _a, _b;
        try {
          const { data: { session }, error } = result;
          if (error)
            throw error;
          await ((_a = this.stateChangeEmitters.get(id)) === null || _a === void 0 ? void 0 : _a.callback("INITIAL_SESSION", session));
          this._debug("INITIAL_SESSION", "callback id", id, "session", session);
        } catch (err) {
          await ((_b = this.stateChangeEmitters.get(id)) === null || _b === void 0 ? void 0 : _b.callback("INITIAL_SESSION", null));
          this._debug("INITIAL_SESSION", "callback id", id, "error", err);
          console.error(err);
        }
      });
    }
    /**
     * Sends a password reset request to an email address. This method supports the PKCE flow.
     *
     * @param email The email address of the user.
     * @param options.redirectTo The URL to send the user to after they click the password reset link.
     * @param options.captchaToken Verification token received when the user completes the captcha on the site.
     */
    async resetPasswordForEmail(email, options = {}) {
      let codeChallenge = null;
      let codeChallengeMethod = null;
      if (this.flowType === "pkce") {
        ;
        [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(
          this.storage,
          this.storageKey,
          true
          // isPasswordRecovery
        );
      }
      try {
        return await _request(this.fetch, "POST", `${this.url}/recover`, {
          body: {
            email,
            code_challenge: codeChallenge,
            code_challenge_method: codeChallengeMethod,
            gotrue_meta_security: { captcha_token: options.captchaToken }
          },
          headers: this.headers,
          redirectTo: options.redirectTo
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    }
    /**
     * Gets all the identities linked to a user.
     */
    async getUserIdentities() {
      var _a;
      try {
        const { data, error } = await this.getUser();
        if (error)
          throw error;
        return { data: { identities: (_a = data.user.identities) !== null && _a !== void 0 ? _a : [] }, error: null };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    }
    /**
     * Links an oauth identity to an existing user.
     * This method supports the PKCE flow.
     */
    async linkIdentity(credentials) {
      var _a;
      try {
        const { data, error } = await this._useSession(async (result) => {
          var _a2, _b, _c, _d, _e;
          const { data: data2, error: error2 } = result;
          if (error2)
            throw error2;
          const url = await this._getUrlForProvider(`${this.url}/user/identities/authorize`, credentials.provider, {
            redirectTo: (_a2 = credentials.options) === null || _a2 === void 0 ? void 0 : _a2.redirectTo,
            scopes: (_b = credentials.options) === null || _b === void 0 ? void 0 : _b.scopes,
            queryParams: (_c = credentials.options) === null || _c === void 0 ? void 0 : _c.queryParams,
            skipBrowserRedirect: true
          });
          return await _request(this.fetch, "GET", url, {
            headers: this.headers,
            jwt: (_e = (_d = data2.session) === null || _d === void 0 ? void 0 : _d.access_token) !== null && _e !== void 0 ? _e : void 0
          });
        });
        if (error)
          throw error;
        if (isBrowser() && !((_a = credentials.options) === null || _a === void 0 ? void 0 : _a.skipBrowserRedirect)) {
          window.location.assign(data === null || data === void 0 ? void 0 : data.url);
        }
        return { data: { provider: credentials.provider, url: data === null || data === void 0 ? void 0 : data.url }, error: null };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { provider: credentials.provider, url: null }, error };
        }
        throw error;
      }
    }
    /**
     * Unlinks an identity from a user by deleting it. The user will no longer be able to sign in with that identity once it's unlinked.
     */
    async unlinkIdentity(identity) {
      try {
        return await this._useSession(async (result) => {
          var _a, _b;
          const { data, error } = result;
          if (error) {
            throw error;
          }
          return await _request(this.fetch, "DELETE", `${this.url}/user/identities/${identity.identity_id}`, {
            headers: this.headers,
            jwt: (_b = (_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token) !== null && _b !== void 0 ? _b : void 0
          });
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    }
    /**
     * Generates a new JWT.
     * @param refreshToken A valid refresh token that was returned on login.
     */
    async _refreshAccessToken(refreshToken) {
      const debugName = `#_refreshAccessToken(${refreshToken.substring(0, 5)}...)`;
      this._debug(debugName, "begin");
      try {
        const startedAt = Date.now();
        return await retryable(async (attempt) => {
          if (attempt > 0) {
            await sleep(200 * Math.pow(2, attempt - 1));
          }
          this._debug(debugName, "refreshing attempt", attempt);
          return await _request(this.fetch, "POST", `${this.url}/token?grant_type=refresh_token`, {
            body: { refresh_token: refreshToken },
            headers: this.headers,
            xform: _sessionResponse
          });
        }, (attempt, error) => {
          const nextBackOffInterval = 200 * Math.pow(2, attempt);
          return error && isAuthRetryableFetchError(error) && // retryable only if the request can be sent before the backoff overflows the tick duration
          Date.now() + nextBackOffInterval - startedAt < AUTO_REFRESH_TICK_DURATION_MS;
        });
      } catch (error) {
        this._debug(debugName, "error", error);
        if (isAuthError(error)) {
          return { data: { session: null, user: null }, error };
        }
        throw error;
      } finally {
        this._debug(debugName, "end");
      }
    }
    _isValidSession(maybeSession) {
      const isValidSession = typeof maybeSession === "object" && maybeSession !== null && "access_token" in maybeSession && "refresh_token" in maybeSession && "expires_at" in maybeSession;
      return isValidSession;
    }
    async _handleProviderSignIn(provider, options) {
      const url = await this._getUrlForProvider(`${this.url}/authorize`, provider, {
        redirectTo: options.redirectTo,
        scopes: options.scopes,
        queryParams: options.queryParams
      });
      this._debug("#_handleProviderSignIn()", "provider", provider, "options", options, "url", url);
      if (isBrowser() && !options.skipBrowserRedirect) {
        window.location.assign(url);
      }
      return { data: { provider, url }, error: null };
    }
    /**
     * Recovers the session from LocalStorage and refreshes the token
     * Note: this method is async to accommodate for AsyncStorage e.g. in React native.
     */
    async _recoverAndRefresh() {
      var _a, _b;
      const debugName = "#_recoverAndRefresh()";
      this._debug(debugName, "begin");
      try {
        const currentSession = await getItemAsync(this.storage, this.storageKey);
        if (currentSession && this.userStorage) {
          let maybeUser = await getItemAsync(this.userStorage, this.storageKey + "-user");
          if (!this.storage.isServer && Object.is(this.storage, this.userStorage) && !maybeUser) {
            maybeUser = { user: currentSession.user };
            await setItemAsync(this.userStorage, this.storageKey + "-user", maybeUser);
          }
          currentSession.user = (_a = maybeUser === null || maybeUser === void 0 ? void 0 : maybeUser.user) !== null && _a !== void 0 ? _a : userNotAvailableProxy();
        } else if (currentSession && !currentSession.user) {
          if (!currentSession.user) {
            const separateUser = await getItemAsync(this.storage, this.storageKey + "-user");
            if (separateUser && (separateUser === null || separateUser === void 0 ? void 0 : separateUser.user)) {
              currentSession.user = separateUser.user;
              await removeItemAsync(this.storage, this.storageKey + "-user");
              await setItemAsync(this.storage, this.storageKey, currentSession);
            } else {
              currentSession.user = userNotAvailableProxy();
            }
          }
        }
        this._debug(debugName, "session from storage", currentSession);
        if (!this._isValidSession(currentSession)) {
          this._debug(debugName, "session is not valid");
          if (currentSession !== null) {
            await this._removeSession();
          }
          return;
        }
        const expiresWithMargin = ((_b = currentSession.expires_at) !== null && _b !== void 0 ? _b : Infinity) * 1e3 - Date.now() < EXPIRY_MARGIN_MS;
        this._debug(debugName, `session has${expiresWithMargin ? "" : " not"} expired with margin of ${EXPIRY_MARGIN_MS}s`);
        if (expiresWithMargin) {
          if (this.autoRefreshToken && currentSession.refresh_token) {
            const { error } = await this._callRefreshToken(currentSession.refresh_token);
            if (error) {
              console.error(error);
              if (!isAuthRetryableFetchError(error)) {
                this._debug(debugName, "refresh failed with a non-retryable error, removing the session", error);
                await this._removeSession();
              }
            }
          }
        } else if (currentSession.user && currentSession.user.__isUserNotAvailableProxy === true) {
          try {
            const { data, error: userError } = await this._getUser(currentSession.access_token);
            if (!userError && (data === null || data === void 0 ? void 0 : data.user)) {
              currentSession.user = data.user;
              await this._saveSession(currentSession);
              await this._notifyAllSubscribers("SIGNED_IN", currentSession);
            } else {
              this._debug(debugName, "could not get user data, skipping SIGNED_IN notification");
            }
          } catch (getUserError) {
            console.error("Error getting user data:", getUserError);
            this._debug(debugName, "error getting user data, skipping SIGNED_IN notification", getUserError);
          }
        } else {
          await this._notifyAllSubscribers("SIGNED_IN", currentSession);
        }
      } catch (err) {
        this._debug(debugName, "error", err);
        console.error(err);
        return;
      } finally {
        this._debug(debugName, "end");
      }
    }
    async _callRefreshToken(refreshToken) {
      var _a, _b;
      if (!refreshToken) {
        throw new AuthSessionMissingError();
      }
      if (this.refreshingDeferred) {
        return this.refreshingDeferred.promise;
      }
      const debugName = `#_callRefreshToken(${refreshToken.substring(0, 5)}...)`;
      this._debug(debugName, "begin");
      try {
        this.refreshingDeferred = new Deferred();
        const { data, error } = await this._refreshAccessToken(refreshToken);
        if (error)
          throw error;
        if (!data.session)
          throw new AuthSessionMissingError();
        await this._saveSession(data.session);
        await this._notifyAllSubscribers("TOKEN_REFRESHED", data.session);
        const result = { session: data.session, error: null };
        this.refreshingDeferred.resolve(result);
        return result;
      } catch (error) {
        this._debug(debugName, "error", error);
        if (isAuthError(error)) {
          const result = { session: null, error };
          if (!isAuthRetryableFetchError(error)) {
            await this._removeSession();
          }
          (_a = this.refreshingDeferred) === null || _a === void 0 ? void 0 : _a.resolve(result);
          return result;
        }
        (_b = this.refreshingDeferred) === null || _b === void 0 ? void 0 : _b.reject(error);
        throw error;
      } finally {
        this.refreshingDeferred = null;
        this._debug(debugName, "end");
      }
    }
    async _notifyAllSubscribers(event2, session, broadcast = true) {
      const debugName = `#_notifyAllSubscribers(${event2})`;
      this._debug(debugName, "begin", session, `broadcast = ${broadcast}`);
      try {
        if (this.broadcastChannel && broadcast) {
          this.broadcastChannel.postMessage({ event: event2, session });
        }
        const errors = [];
        const promises = Array.from(this.stateChangeEmitters.values()).map(async (x) => {
          try {
            await x.callback(event2, session);
          } catch (e) {
            errors.push(e);
          }
        });
        await Promise.all(promises);
        if (errors.length > 0) {
          for (let i = 0; i < errors.length; i += 1) {
            console.error(errors[i]);
          }
          throw errors[0];
        }
      } finally {
        this._debug(debugName, "end");
      }
    }
    /**
     * set currentSession and currentUser
     * process to _startAutoRefreshToken if possible
     */
    async _saveSession(session) {
      this._debug("#_saveSession()", session);
      this.suppressGetSessionWarning = true;
      const sessionToProcess = Object.assign({}, session);
      const userIsProxy = sessionToProcess.user && sessionToProcess.user.__isUserNotAvailableProxy === true;
      if (this.userStorage) {
        if (!userIsProxy && sessionToProcess.user) {
          await setItemAsync(this.userStorage, this.storageKey + "-user", {
            user: sessionToProcess.user
          });
        } else if (userIsProxy) {
        }
        const mainSessionData = Object.assign({}, sessionToProcess);
        delete mainSessionData.user;
        const clonedMainSessionData = deepClone(mainSessionData);
        await setItemAsync(this.storage, this.storageKey, clonedMainSessionData);
      } else {
        const clonedSession = deepClone(sessionToProcess);
        await setItemAsync(this.storage, this.storageKey, clonedSession);
      }
    }
    async _removeSession() {
      this._debug("#_removeSession()");
      await removeItemAsync(this.storage, this.storageKey);
      await removeItemAsync(this.storage, this.storageKey + "-code-verifier");
      await removeItemAsync(this.storage, this.storageKey + "-user");
      if (this.userStorage) {
        await removeItemAsync(this.userStorage, this.storageKey + "-user");
      }
      await this._notifyAllSubscribers("SIGNED_OUT", null);
    }
    /**
     * Removes any registered visibilitychange callback.
     *
     * {@see #startAutoRefresh}
     * {@see #stopAutoRefresh}
     */
    _removeVisibilityChangedCallback() {
      this._debug("#_removeVisibilityChangedCallback()");
      const callback = this.visibilityChangedCallback;
      this.visibilityChangedCallback = null;
      try {
        if (callback && isBrowser() && (window === null || window === void 0 ? void 0 : window.removeEventListener)) {
          window.removeEventListener("visibilitychange", callback);
        }
      } catch (e) {
        console.error("removing visibilitychange callback failed", e);
      }
    }
    /**
     * This is the private implementation of {@link #startAutoRefresh}. Use this
     * within the library.
     */
    async _startAutoRefresh() {
      await this._stopAutoRefresh();
      this._debug("#_startAutoRefresh()");
      const ticker = setInterval(() => this._autoRefreshTokenTick(), AUTO_REFRESH_TICK_DURATION_MS);
      this.autoRefreshTicker = ticker;
      if (ticker && typeof ticker === "object" && typeof ticker.unref === "function") {
        ticker.unref();
      } else if (typeof Deno !== "undefined" && typeof Deno.unrefTimer === "function") {
        Deno.unrefTimer(ticker);
      }
      setTimeout(async () => {
        await this.initializePromise;
        await this._autoRefreshTokenTick();
      }, 0);
    }
    /**
     * This is the private implementation of {@link #stopAutoRefresh}. Use this
     * within the library.
     */
    async _stopAutoRefresh() {
      this._debug("#_stopAutoRefresh()");
      const ticker = this.autoRefreshTicker;
      this.autoRefreshTicker = null;
      if (ticker) {
        clearInterval(ticker);
      }
    }
    /**
     * Starts an auto-refresh process in the background. The session is checked
     * every few seconds. Close to the time of expiration a process is started to
     * refresh the session. If refreshing fails it will be retried for as long as
     * necessary.
     *
     * If you set the {@link GoTrueClientOptions#autoRefreshToken} you don't need
     * to call this function, it will be called for you.
     *
     * On browsers the refresh process works only when the tab/window is in the
     * foreground to conserve resources as well as prevent race conditions and
     * flooding auth with requests. If you call this method any managed
     * visibility change callback will be removed and you must manage visibility
     * changes on your own.
     *
     * On non-browser platforms the refresh process works *continuously* in the
     * background, which may not be desirable. You should hook into your
     * platform's foreground indication mechanism and call these methods
     * appropriately to conserve resources.
     *
     * {@see #stopAutoRefresh}
     */
    async startAutoRefresh() {
      this._removeVisibilityChangedCallback();
      await this._startAutoRefresh();
    }
    /**
     * Stops an active auto refresh process running in the background (if any).
     *
     * If you call this method any managed visibility change callback will be
     * removed and you must manage visibility changes on your own.
     *
     * See {@link #startAutoRefresh} for more details.
     */
    async stopAutoRefresh() {
      this._removeVisibilityChangedCallback();
      await this._stopAutoRefresh();
    }
    /**
     * Runs the auto refresh token tick.
     */
    async _autoRefreshTokenTick() {
      this._debug("#_autoRefreshTokenTick()", "begin");
      try {
        await this._acquireLock(0, async () => {
          try {
            const now = Date.now();
            try {
              return await this._useSession(async (result) => {
                const { data: { session } } = result;
                if (!session || !session.refresh_token || !session.expires_at) {
                  this._debug("#_autoRefreshTokenTick()", "no session");
                  return;
                }
                const expiresInTicks = Math.floor((session.expires_at * 1e3 - now) / AUTO_REFRESH_TICK_DURATION_MS);
                this._debug("#_autoRefreshTokenTick()", `access token expires in ${expiresInTicks} ticks, a tick lasts ${AUTO_REFRESH_TICK_DURATION_MS}ms, refresh threshold is ${AUTO_REFRESH_TICK_THRESHOLD} ticks`);
                if (expiresInTicks <= AUTO_REFRESH_TICK_THRESHOLD) {
                  await this._callRefreshToken(session.refresh_token);
                }
              });
            } catch (e) {
              console.error("Auto refresh tick failed with error. This is likely a transient error.", e);
            }
          } finally {
            this._debug("#_autoRefreshTokenTick()", "end");
          }
        });
      } catch (e) {
        if (e.isAcquireTimeout || e instanceof LockAcquireTimeoutError) {
          this._debug("auto refresh token tick lock not available");
        } else {
          throw e;
        }
      }
    }
    /**
     * Registers callbacks on the browser / platform, which in-turn run
     * algorithms when the browser window/tab are in foreground. On non-browser
     * platforms it assumes always foreground.
     */
    async _handleVisibilityChange() {
      this._debug("#_handleVisibilityChange()");
      if (!isBrowser() || !(window === null || window === void 0 ? void 0 : window.addEventListener)) {
        if (this.autoRefreshToken) {
          this.startAutoRefresh();
        }
        return false;
      }
      try {
        this.visibilityChangedCallback = async () => await this._onVisibilityChanged(false);
        window === null || window === void 0 ? void 0 : window.addEventListener("visibilitychange", this.visibilityChangedCallback);
        await this._onVisibilityChanged(true);
      } catch (error) {
        console.error("_handleVisibilityChange", error);
      }
    }
    /**
     * Callback registered with `window.addEventListener('visibilitychange')`.
     */
    async _onVisibilityChanged(calledFromInitialize) {
      const methodName = `#_onVisibilityChanged(${calledFromInitialize})`;
      this._debug(methodName, "visibilityState", document.visibilityState);
      if (document.visibilityState === "visible") {
        if (this.autoRefreshToken) {
          this._startAutoRefresh();
        }
        if (!calledFromInitialize) {
          await this.initializePromise;
          await this._acquireLock(-1, async () => {
            if (document.visibilityState !== "visible") {
              this._debug(methodName, "acquired the lock to recover the session, but the browser visibilityState is no longer visible, aborting");
              return;
            }
            await this._recoverAndRefresh();
          });
        }
      } else if (document.visibilityState === "hidden") {
        if (this.autoRefreshToken) {
          this._stopAutoRefresh();
        }
      }
    }
    /**
     * Generates the relevant login URL for a third-party provider.
     * @param options.redirectTo A URL or mobile address to send the user to after they are confirmed.
     * @param options.scopes A space-separated list of scopes granted to the OAuth application.
     * @param options.queryParams An object of key-value pairs containing query parameters granted to the OAuth application.
     */
    async _getUrlForProvider(url, provider, options) {
      const urlParams = [`provider=${encodeURIComponent(provider)}`];
      if (options === null || options === void 0 ? void 0 : options.redirectTo) {
        urlParams.push(`redirect_to=${encodeURIComponent(options.redirectTo)}`);
      }
      if (options === null || options === void 0 ? void 0 : options.scopes) {
        urlParams.push(`scopes=${encodeURIComponent(options.scopes)}`);
      }
      if (this.flowType === "pkce") {
        const [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
        const flowParams = new URLSearchParams({
          code_challenge: `${encodeURIComponent(codeChallenge)}`,
          code_challenge_method: `${encodeURIComponent(codeChallengeMethod)}`
        });
        urlParams.push(flowParams.toString());
      }
      if (options === null || options === void 0 ? void 0 : options.queryParams) {
        const query = new URLSearchParams(options.queryParams);
        urlParams.push(query.toString());
      }
      if (options === null || options === void 0 ? void 0 : options.skipBrowserRedirect) {
        urlParams.push(`skip_http_redirect=${options.skipBrowserRedirect}`);
      }
      return `${url}?${urlParams.join("&")}`;
    }
    async _unenroll(params) {
      try {
        return await this._useSession(async (result) => {
          var _a;
          const { data: sessionData, error: sessionError } = result;
          if (sessionError) {
            return { data: null, error: sessionError };
          }
          return await _request(this.fetch, "DELETE", `${this.url}/factors/${params.factorId}`, {
            headers: this.headers,
            jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token
          });
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    }
    async _enroll(params) {
      try {
        return await this._useSession(async (result) => {
          var _a, _b;
          const { data: sessionData, error: sessionError } = result;
          if (sessionError) {
            return { data: null, error: sessionError };
          }
          const body = Object.assign({ friendly_name: params.friendlyName, factor_type: params.factorType }, params.factorType === "phone" ? { phone: params.phone } : { issuer: params.issuer });
          const { data, error } = await _request(this.fetch, "POST", `${this.url}/factors`, {
            body,
            headers: this.headers,
            jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token
          });
          if (error) {
            return { data: null, error };
          }
          if (params.factorType === "totp" && ((_b = data === null || data === void 0 ? void 0 : data.totp) === null || _b === void 0 ? void 0 : _b.qr_code)) {
            data.totp.qr_code = `data:image/svg+xml;utf-8,${data.totp.qr_code}`;
          }
          return { data, error: null };
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    }
    /**
     * {@see GoTrueMFAApi#verify}
     */
    async _verify(params) {
      return this._acquireLock(-1, async () => {
        try {
          return await this._useSession(async (result) => {
            var _a;
            const { data: sessionData, error: sessionError } = result;
            if (sessionError) {
              return { data: null, error: sessionError };
            }
            const { data, error } = await _request(this.fetch, "POST", `${this.url}/factors/${params.factorId}/verify`, {
              body: { code: params.code, challenge_id: params.challengeId },
              headers: this.headers,
              jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token
            });
            if (error) {
              return { data: null, error };
            }
            await this._saveSession(Object.assign({ expires_at: Math.round(Date.now() / 1e3) + data.expires_in }, data));
            await this._notifyAllSubscribers("MFA_CHALLENGE_VERIFIED", data);
            return { data, error };
          });
        } catch (error) {
          if (isAuthError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      });
    }
    /**
     * {@see GoTrueMFAApi#challenge}
     */
    async _challenge(params) {
      return this._acquireLock(-1, async () => {
        try {
          return await this._useSession(async (result) => {
            var _a;
            const { data: sessionData, error: sessionError } = result;
            if (sessionError) {
              return { data: null, error: sessionError };
            }
            return await _request(this.fetch, "POST", `${this.url}/factors/${params.factorId}/challenge`, {
              body: { channel: params.channel },
              headers: this.headers,
              jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token
            });
          });
        } catch (error) {
          if (isAuthError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      });
    }
    /**
     * {@see GoTrueMFAApi#challengeAndVerify}
     */
    async _challengeAndVerify(params) {
      const { data: challengeData, error: challengeError } = await this._challenge({
        factorId: params.factorId
      });
      if (challengeError) {
        return { data: null, error: challengeError };
      }
      return await this._verify({
        factorId: params.factorId,
        challengeId: challengeData.id,
        code: params.code
      });
    }
    /**
     * {@see GoTrueMFAApi#listFactors}
     */
    async _listFactors() {
      const { data: { user }, error: userError } = await this.getUser();
      if (userError) {
        return { data: null, error: userError };
      }
      const factors = (user === null || user === void 0 ? void 0 : user.factors) || [];
      const totp = factors.filter((factor) => factor.factor_type === "totp" && factor.status === "verified");
      const phone = factors.filter((factor) => factor.factor_type === "phone" && factor.status === "verified");
      return {
        data: {
          all: factors,
          totp,
          phone
        },
        error: null
      };
    }
    /**
     * {@see GoTrueMFAApi#getAuthenticatorAssuranceLevel}
     */
    async _getAuthenticatorAssuranceLevel() {
      return this._acquireLock(-1, async () => {
        return await this._useSession(async (result) => {
          var _a, _b;
          const { data: { session }, error: sessionError } = result;
          if (sessionError) {
            return { data: null, error: sessionError };
          }
          if (!session) {
            return {
              data: { currentLevel: null, nextLevel: null, currentAuthenticationMethods: [] },
              error: null
            };
          }
          const { payload } = decodeJWT(session.access_token);
          let currentLevel = null;
          if (payload.aal) {
            currentLevel = payload.aal;
          }
          let nextLevel = currentLevel;
          const verifiedFactors = (_b = (_a = session.user.factors) === null || _a === void 0 ? void 0 : _a.filter((factor) => factor.status === "verified")) !== null && _b !== void 0 ? _b : [];
          if (verifiedFactors.length > 0) {
            nextLevel = "aal2";
          }
          const currentAuthenticationMethods = payload.amr || [];
          return { data: { currentLevel, nextLevel, currentAuthenticationMethods }, error: null };
        });
      });
    }
    async fetchJwk(kid, jwks = { keys: [] }) {
      let jwk = jwks.keys.find((key) => key.kid === kid);
      if (jwk) {
        return jwk;
      }
      const now = Date.now();
      jwk = this.jwks.keys.find((key) => key.kid === kid);
      if (jwk && this.jwks_cached_at + JWKS_TTL > now) {
        return jwk;
      }
      const { data, error } = await _request(this.fetch, "GET", `${this.url}/.well-known/jwks.json`, {
        headers: this.headers
      });
      if (error) {
        throw error;
      }
      if (!data.keys || data.keys.length === 0) {
        return null;
      }
      this.jwks = data;
      this.jwks_cached_at = now;
      jwk = data.keys.find((key) => key.kid === kid);
      if (!jwk) {
        return null;
      }
      return jwk;
    }
    /**
     * Extracts the JWT claims present in the access token by first verifying the
     * JWT against the server's JSON Web Key Set endpoint
     * `/.well-known/jwks.json` which is often cached, resulting in significantly
     * faster responses. Prefer this method over {@link #getUser} which always
     * sends a request to the Auth server for each JWT.
     *
     * If the project is not using an asymmetric JWT signing key (like ECC or
     * RSA) it always sends a request to the Auth server (similar to {@link
     * #getUser}) to verify the JWT.
     *
     * @param jwt An optional specific JWT you wish to verify, not the one you
     *            can obtain from {@link #getSession}.
     * @param options Various additional options that allow you to customize the
     *                behavior of this method.
     */
    async getClaims(jwt, options = {}) {
      try {
        let token = jwt;
        if (!token) {
          const { data, error } = await this.getSession();
          if (error || !data.session) {
            return { data: null, error };
          }
          token = data.session.access_token;
        }
        const { header, payload, signature, raw: { header: rawHeader, payload: rawPayload } } = decodeJWT(token);
        if (!(options === null || options === void 0 ? void 0 : options.allowExpired)) {
          validateExp(payload.exp);
        }
        const signingKey = !header.alg || header.alg.startsWith("HS") || !header.kid || !("crypto" in globalThis && "subtle" in globalThis.crypto) ? null : await this.fetchJwk(header.kid, (options === null || options === void 0 ? void 0 : options.keys) ? { keys: options.keys } : options === null || options === void 0 ? void 0 : options.jwks);
        if (!signingKey) {
          const { error } = await this.getUser(token);
          if (error) {
            throw error;
          }
          return {
            data: {
              claims: payload,
              header,
              signature
            },
            error: null
          };
        }
        const algorithm = getAlgorithm(header.alg);
        const publicKey = await crypto.subtle.importKey("jwk", signingKey, algorithm, true, [
          "verify"
        ]);
        const isValid = await crypto.subtle.verify(algorithm, publicKey, signature, stringToUint8Array(`${rawHeader}.${rawPayload}`));
        if (!isValid) {
          throw new AuthInvalidJwtError("Invalid JWT signature");
        }
        return {
          data: {
            claims: payload,
            header,
            signature
          },
          error: null
        };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    }
  };
  GoTrueClient.nextInstanceID = 0;

  // node_modules/@supabase/auth-js/dist/module/AuthClient.js
  var AuthClient = GoTrueClient;
  var AuthClient_default = AuthClient;

  // node_modules/@supabase/supabase-js/dist/module/lib/SupabaseAuthClient.js
  var SupabaseAuthClient = class extends AuthClient_default {
    constructor(options) {
      super(options);
    }
  };

  // node_modules/@supabase/supabase-js/dist/module/SupabaseClient.js
  var __awaiter8 = function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var SupabaseClient = class {
    /**
     * Create a new client for use in the browser.
     * @param supabaseUrl The unique Supabase URL which is supplied when you create a new project in your project dashboard.
     * @param supabaseKey The unique Supabase Key which is supplied when you create a new project in your project dashboard.
     * @param options.db.schema You can switch in between schemas. The schema needs to be on the list of exposed schemas inside Supabase.
     * @param options.auth.autoRefreshToken Set to "true" if you want to automatically refresh the token before expiring.
     * @param options.auth.persistSession Set to "true" if you want to automatically save the user session into local storage.
     * @param options.auth.detectSessionInUrl Set to "true" if you want to automatically detects OAuth grants in the URL and signs in the user.
     * @param options.realtime Options passed along to realtime-js constructor.
     * @param options.storage Options passed along to the storage-js constructor.
     * @param options.global.fetch A custom fetch implementation.
     * @param options.global.headers Any additional headers to send with each network request.
     */
    constructor(supabaseUrl2, supabaseKey2, options) {
      var _a, _b, _c;
      this.supabaseUrl = supabaseUrl2;
      this.supabaseKey = supabaseKey2;
      if (!supabaseUrl2)
        throw new Error("supabaseUrl is required.");
      if (!supabaseKey2)
        throw new Error("supabaseKey is required.");
      const _supabaseUrl = ensureTrailingSlash(supabaseUrl2);
      const baseUrl = new URL(_supabaseUrl);
      this.realtimeUrl = new URL("realtime/v1", baseUrl);
      this.realtimeUrl.protocol = this.realtimeUrl.protocol.replace("http", "ws");
      this.authUrl = new URL("auth/v1", baseUrl);
      this.storageUrl = new URL("storage/v1", baseUrl);
      this.functionsUrl = new URL("functions/v1", baseUrl);
      const defaultStorageKey = `sb-${baseUrl.hostname.split(".")[0]}-auth-token`;
      const DEFAULTS = {
        db: DEFAULT_DB_OPTIONS,
        realtime: DEFAULT_REALTIME_OPTIONS,
        auth: Object.assign(Object.assign({}, DEFAULT_AUTH_OPTIONS), { storageKey: defaultStorageKey }),
        global: DEFAULT_GLOBAL_OPTIONS
      };
      const settings = applySettingDefaults(options !== null && options !== void 0 ? options : {}, DEFAULTS);
      this.storageKey = (_a = settings.auth.storageKey) !== null && _a !== void 0 ? _a : "";
      this.headers = (_b = settings.global.headers) !== null && _b !== void 0 ? _b : {};
      if (!settings.accessToken) {
        this.auth = this._initSupabaseAuthClient((_c = settings.auth) !== null && _c !== void 0 ? _c : {}, this.headers, settings.global.fetch);
      } else {
        this.accessToken = settings.accessToken;
        this.auth = new Proxy({}, {
          get: (_, prop) => {
            throw new Error(`@supabase/supabase-js: Supabase Client is configured with the accessToken option, accessing supabase.auth.${String(prop)} is not possible`);
          }
        });
      }
      this.fetch = fetchWithAuth(supabaseKey2, this._getAccessToken.bind(this), settings.global.fetch);
      this.realtime = this._initRealtimeClient(Object.assign({ headers: this.headers, accessToken: this._getAccessToken.bind(this) }, settings.realtime));
      this.rest = new PostgrestClient(new URL("rest/v1", baseUrl).href, {
        headers: this.headers,
        schema: settings.db.schema,
        fetch: this.fetch
      });
      this.storage = new StorageClient(this.storageUrl.href, this.headers, this.fetch, options === null || options === void 0 ? void 0 : options.storage);
      if (!settings.accessToken) {
        this._listenForAuthEvents();
      }
    }
    /**
     * Supabase Functions allows you to deploy and invoke edge functions.
     */
    get functions() {
      return new FunctionsClient(this.functionsUrl.href, {
        headers: this.headers,
        customFetch: this.fetch
      });
    }
    /**
     * Perform a query on a table or a view.
     *
     * @param relation - The table or view name to query
     */
    from(relation) {
      return this.rest.from(relation);
    }
    // NOTE: signatures must be kept in sync with PostgrestClient.schema
    /**
     * Select a schema to query or perform an function (rpc) call.
     *
     * The schema needs to be on the list of exposed schemas inside Supabase.
     *
     * @param schema - The schema to query
     */
    schema(schema) {
      return this.rest.schema(schema);
    }
    // NOTE: signatures must be kept in sync with PostgrestClient.rpc
    /**
     * Perform a function call.
     *
     * @param fn - The function name to call
     * @param args - The arguments to pass to the function call
     * @param options - Named parameters
     * @param options.head - When set to `true`, `data` will not be returned.
     * Useful if you only need the count.
     * @param options.get - When set to `true`, the function will be called with
     * read-only access mode.
     * @param options.count - Count algorithm to use to count rows returned by the
     * function. Only applicable for [set-returning
     * functions](https://www.postgresql.org/docs/current/functions-srf.html).
     *
     * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
     * hood.
     *
     * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
     * statistics under the hood.
     *
     * `"estimated"`: Uses exact count for low numbers and planned count for high
     * numbers.
     */
    rpc(fn, args = {}, options = {}) {
      return this.rest.rpc(fn, args, options);
    }
    /**
     * Creates a Realtime channel with Broadcast, Presence, and Postgres Changes.
     *
     * @param {string} name - The name of the Realtime channel.
     * @param {Object} opts - The options to pass to the Realtime channel.
     *
     */
    channel(name, opts = { config: {} }) {
      return this.realtime.channel(name, opts);
    }
    /**
     * Returns all Realtime channels.
     */
    getChannels() {
      return this.realtime.getChannels();
    }
    /**
     * Unsubscribes and removes Realtime channel from Realtime client.
     *
     * @param {RealtimeChannel} channel - The name of the Realtime channel.
     *
     */
    removeChannel(channel) {
      return this.realtime.removeChannel(channel);
    }
    /**
     * Unsubscribes and removes all Realtime channels from Realtime client.
     */
    removeAllChannels() {
      return this.realtime.removeAllChannels();
    }
    _getAccessToken() {
      var _a, _b;
      return __awaiter8(this, void 0, void 0, function* () {
        if (this.accessToken) {
          return yield this.accessToken();
        }
        const { data } = yield this.auth.getSession();
        return (_b = (_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token) !== null && _b !== void 0 ? _b : this.supabaseKey;
      });
    }
    _initSupabaseAuthClient({ autoRefreshToken, persistSession, detectSessionInUrl, storage, storageKey, flowType, lock, debug }, headers, fetch3) {
      const authHeaders = {
        Authorization: `Bearer ${this.supabaseKey}`,
        apikey: `${this.supabaseKey}`
      };
      return new SupabaseAuthClient({
        url: this.authUrl.href,
        headers: Object.assign(Object.assign({}, authHeaders), headers),
        storageKey,
        autoRefreshToken,
        persistSession,
        detectSessionInUrl,
        storage,
        flowType,
        lock,
        debug,
        fetch: fetch3,
        // auth checks if there is a custom authorizaiton header using this flag
        // so it knows whether to return an error when getUser is called with no session
        hasCustomAuthorizationHeader: "Authorization" in this.headers
      });
    }
    _initRealtimeClient(options) {
      return new RealtimeClient(this.realtimeUrl.href, Object.assign(Object.assign({}, options), { params: Object.assign({ apikey: this.supabaseKey }, options === null || options === void 0 ? void 0 : options.params) }));
    }
    _listenForAuthEvents() {
      let data = this.auth.onAuthStateChange((event2, session) => {
        this._handleTokenChanged(event2, "CLIENT", session === null || session === void 0 ? void 0 : session.access_token);
      });
      return data;
    }
    _handleTokenChanged(event2, source, token) {
      if ((event2 === "TOKEN_REFRESHED" || event2 === "SIGNED_IN") && this.changedAccessToken !== token) {
        this.changedAccessToken = token;
      } else if (event2 === "SIGNED_OUT") {
        this.realtime.setAuth();
        if (source == "STORAGE")
          this.auth.signOut();
        this.changedAccessToken = void 0;
      }
    }
  };

  // node_modules/@supabase/supabase-js/dist/module/index.js
  var createClient = (supabaseUrl2, supabaseKey2, options) => {
    return new SupabaseClient(supabaseUrl2, supabaseKey2, options);
  };
  function shouldShowDeprecationWarning() {
    if (typeof window !== "undefined") {
      return false;
    }
    if (typeof process === "undefined") {
      return false;
    }
    const processVersion = process["version"];
    if (processVersion === void 0 || processVersion === null) {
      return false;
    }
    const versionMatch = processVersion.match(/^v(\d+)\./);
    if (!versionMatch) {
      return false;
    }
    const majorVersion = parseInt(versionMatch[1], 10);
    return majorVersion <= 18;
  }
  if (shouldShowDeprecationWarning()) {
    console.warn(`\u26A0\uFE0F  Node.js 18 and below are deprecated and will no longer be supported in future versions of @supabase/supabase-js. Please upgrade to Node.js 20 or later. For more information, visit: https://github.com/orgs/supabase/discussions/37217`);
  }

  // src/lib/analytics.ts
  var GOOGLE_ADS_CONVERSION_ID = "AW-17667607828";
  var GOOGLE_ADS_LEAD_FORM_LABEL = "3CXNCJaG9cEbEJSayehB";
  var BOOKING_CONVERSION_VALUE_USD = 150;
  var FORM_CONVERSION_VALUE_USD = 91;
  var event = ({
    action,
    category,
    label,
    value
  }) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", action, {
        event_category: category,
        event_label: label,
        value
      });
    }
  };
  var trackPurchase = (transactionId, valueDollars, vehicleInfo) => {
    if (typeof window === "undefined" || !window.gtag) return;
    window.gtag("event", "purchase", {
      transaction_id: transactionId,
      value: valueDollars,
      currency: "USD",
      items: [{
        item_id: "windshield_service",
        item_name: `Windshield Service \u2014 ${vehicleInfo}`,
        price: valueDollars,
        quantity: 1
      }]
    });
  };
  var trackGoogleAdsConversion = (transactionId, conversionLabel, value) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "conversion", {
        "send_to": `${GOOGLE_ADS_CONVERSION_ID}/${conversionLabel}`,
        "transaction_id": transactionId,
        "value": value,
        "currency": "USD"
      });
    }
  };
  var setEnhancedConversionData = (userData) => {
    var _a, _b;
    if (typeof window === "undefined" || !window.gtag) return;
    const normalizedEmail = (_a = userData.email) == null ? void 0 : _a.trim().toLowerCase();
    const digits = ((_b = userData.phone) == null ? void 0 : _b.replace(/\D/g, "")) || "";
    let normalizedPhone;
    if (digits.length === 10) normalizedPhone = `+1${digits}`;
    else if (digits.length === 11 && digits.startsWith("1")) normalizedPhone = `+${digits}`;
    else if (digits.length > 11) normalizedPhone = `+${digits}`;
    const payload = {};
    if (normalizedEmail) payload.email = normalizedEmail;
    if (normalizedPhone) payload.phone_number = normalizedPhone;
    if (Object.keys(payload).length > 0) {
      window.gtag("set", "user_data", payload);
    }
  };
  var trackLeadFormConversion = (leadId, userData, value = FORM_CONVERSION_VALUE_USD) => {
    if (userData) setEnhancedConversionData(userData);
    trackGoogleAdsConversion(leadId, GOOGLE_ADS_LEAD_FORM_LABEL, value);
  };
  var trackMicrosoftAdsEvent = (eventAction, eventCategory = "conversion", eventLabel, eventValue, transactionId) => {
    if (typeof window !== "undefined" && window.uetq) {
      const eventData = {
        event_category: eventCategory,
        event_label: eventLabel,
        event_value: eventValue
      };
      if (transactionId) {
        eventData.event_id = transactionId;
      }
      window.uetq.push("event", eventAction, eventData);
    }
  };
  var trackMicrosoftAdsLeadForm = (formName, value = FORM_CONVERSION_VALUE_USD, transactionId) => {
    trackMicrosoftAdsEvent("form_submit", "conversion", formName, value, transactionId);
  };

  // src/lib/market.ts
  var COLORADO_SATELLITE_SOURCES = [
    "windshieldcostcalculator",
    "windshielddenver",
    "chiprepairdenver",
    "chiprepairboulder",
    "aurorawindshield",
    "mobilewindshielddenver",
    "cheapestwindshield",
    "newwindshieldcost",
    "getawindshieldquote",
    "newwindshieldnearme",
    "windshieldpricecompare",
    "coloradospringswindshield",
    "autoglasscoloradosprings",
    "mobilewindshieldcoloradosprings",
    "windshieldreplacementfortcollins"
  ];
  var ARIZONA_SATELLITE_SOURCES = [
    "chiprepairmesa",
    "chiprepairphoenix",
    "chiprepairscottsdale",
    "chiprepairtempe",
    "windshieldcostphoenix",
    "mobilewindshieldphoenix"
  ];
  var COLORADO_CAMPAIGN_PATTERNS = [
    /\bdenver\b/i,
    /\bboulder\b/i,
    /\baurora\b/i,
    /\bfort collins\b/i,
    /\bcolorado\b/i,
    // covers "colorado springs" too — no need for a separate pattern
    /\bco\b/i
  ];
  var ARIZONA_CAMPAIGN_PATTERNS = [
    /\bphoenix\b/i,
    /\bscottsdale\b/i,
    /\bmesa\b/i,
    /\btempe\b/i,
    /\barizona\b/i,
    /\baz\b/i
  ];
  function getMarketFromPath(pathname) {
    if (!pathname) return null;
    const path = pathname.toLowerCase();
    if (path.includes("/phoenix") || path.includes("-az") || path.includes("/arizona")) return "arizona";
    if (path.includes("/denver") || path.includes("/boulder") || path.includes("/aurora") || path.includes("/colorado-springs") || path.includes("/colorado") || path.includes("-co")) {
      return "colorado";
    }
    return null;
  }
  function normalizeHostname(value) {
    if (!value) return null;
    try {
      const parsed = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
      return parsed.hostname.toLowerCase().replace(/^www\./, "");
    } catch (e) {
      return null;
    }
  }
  function matchSatelliteHost(host) {
    if (COLORADO_SATELLITE_SOURCES.some((s) => host.includes(s))) return "colorado";
    if (ARIZONA_SATELLITE_SOURCES.some((s) => host.includes(s))) return "arizona";
    return null;
  }
  function matchSatelliteSource(value) {
    if (COLORADO_SATELLITE_SOURCES.some((s) => value.includes(s))) return "colorado";
    if (ARIZONA_SATELLITE_SOURCES.some((s) => value.includes(s))) return "arizona";
    return null;
  }
  function classifySessionMarket(session) {
    var _a, _b;
    const utmCampaign = (_a = session.utm_campaign) == null ? void 0 : _a.trim();
    if (utmCampaign) {
      const isColorado = COLORADO_CAMPAIGN_PATTERNS.some((p) => p.test(utmCampaign));
      const isArizona = ARIZONA_CAMPAIGN_PATTERNS.some((p) => p.test(utmCampaign));
      if (isColorado && !isArizona) return "colorado";
      if (isArizona && !isColorado) return "arizona";
    }
    const utmSource = (_b = session.utm_source) == null ? void 0 : _b.trim().toLowerCase();
    if (utmSource) {
      const m = matchSatelliteSource(utmSource);
      if (m) return m;
    }
    const referrerHost = normalizeHostname(session.referrer);
    if (referrerHost) {
      const m = matchSatelliteHost(referrerHost);
      if (m) return m;
    }
    const fromPath = getMarketFromPath(session.landing_page);
    if (fromPath) return fromPath;
    return null;
  }

  // src/lib/tracking.ts
  var SESSION_MARKET_KEY = "pag_session_market";
  function getSessionMarket() {
    if (typeof window === "undefined") return null;
    try {
      const stored = sessionStorage.getItem(SESSION_MARKET_KEY);
      if (stored === "colorado" || stored === "arizona") return stored;
    } catch (e) {
    }
    return null;
  }
  function setSessionMarket(market) {
    if (typeof window === "undefined" || market === null) return;
    try {
      sessionStorage.setItem(SESSION_MARKET_KEY, market);
    } catch (e) {
    }
  }
  var supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  var supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  var isBuildTime = !supabaseUrl || !supabaseKey;
  if (!isBuildTime && typeof window !== "undefined" && (!supabaseUrl || !supabaseKey)) {
    console.error("\u274C Supabase environment variables not loaded!", { supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey });
  }
  var supabase = isBuildTime ? null : createClient(supabaseUrl, supabaseKey);
  var CLICK_ID_EXPIRY_DAYS = 90;
  function storeClickId(key, value) {
    if (typeof window === "undefined") return;
    const data = {
      value,
      timestamp: Date.now(),
      landingPage: window.location.pathname + window.location.search
    };
    localStorage.setItem(key, JSON.stringify(data));
  }
  function getStoredClickId(key, expiryDays = CLICK_ID_EXPIRY_DAYS) {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    try {
      const data = JSON.parse(stored);
      const expiryMs = expiryDays * 24 * 60 * 60 * 1e3;
      if (Date.now() - data.timestamp > expiryMs) {
        localStorage.removeItem(key);
        return null;
      }
      return data.value;
    } catch (e) {
      localStorage.removeItem(key);
      return null;
    }
  }
  function hasConversionFired(eventType) {
    if (typeof window === "undefined") return false;
    const sessionId = getSessionId();
    const key = `conversion_fired_${sessionId}_${eventType}`;
    return sessionStorage.getItem(key) === "true";
  }
  function markConversionFired(eventType) {
    if (typeof window === "undefined") return;
    const sessionId = getSessionId();
    const key = `conversion_fired_${sessionId}_${eventType}`;
    sessionStorage.setItem(key, "true");
  }
  function hasBookingFired(bookingToken) {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(`booking_event_fired_${bookingToken}`) === "true";
    } catch (e) {
      return false;
    }
  }
  function markBookingFired(bookingToken) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(`booking_event_fired_${bookingToken}`, "true");
    } catch (e) {
    }
  }
  function getSessionId() {
    if (typeof window === "undefined") return "";
    let sessionId = sessionStorage.getItem("analytics_session_id");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem("analytics_session_id", sessionId);
      sessionStorage.setItem("session_start", (/* @__PURE__ */ new Date()).toISOString());
    }
    return sessionId;
  }
  function getVisitorId() {
    if (typeof window === "undefined") return "";
    let visitorId = localStorage.getItem("analytics_visitor_id");
    if (!visitorId) {
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("analytics_visitor_id", visitorId);
    }
    return visitorId;
  }
  function getUTMParams() {
    if (typeof window === "undefined") return {};
    const params = new URLSearchParams(window.location.search);
    const utmParams = {
      source: params.get("utm_source") || void 0,
      medium: params.get("utm_medium") || void 0,
      campaign: params.get("utm_campaign") || void 0,
      term: params.get("utm_term") || void 0,
      content: params.get("utm_content") || void 0
    };
    if (utmParams.source) {
      sessionStorage.setItem("utm_params", JSON.stringify(utmParams));
    } else {
      const stored = sessionStorage.getItem("utm_params");
      if (stored) {
        return JSON.parse(stored);
      }
    }
    return utmParams;
  }
  function getGclid() {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    const gclid = params.get("gclid");
    if (gclid) {
      storeClickId("gclid", gclid);
      sessionStorage.setItem("gclid", gclid);
      return gclid;
    }
    const storedGclid = getStoredClickId("gclid", 90);
    if (storedGclid) return storedGclid;
    return sessionStorage.getItem("gclid");
  }
  function getMsclkid() {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    const msclkid = params.get("msclkid");
    if (msclkid) {
      storeClickId("msclkid", msclkid);
      sessionStorage.setItem("msclkid", msclkid);
      return msclkid;
    }
    const storedMsclkid = getStoredClickId("msclkid", 90);
    if (storedMsclkid) return storedMsclkid;
    return sessionStorage.getItem("msclkid");
  }
  function getFbclid() {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    const fbclid = params.get("fbclid");
    if (fbclid) {
      storeClickId("fbclid", fbclid);
      sessionStorage.setItem("fbclid", fbclid);
      return fbclid;
    }
    const storedFbclid = getStoredClickId("fbclid", 28);
    if (storedFbclid) return storedFbclid;
    return sessionStorage.getItem("fbclid");
  }
  function getDeviceInfo() {
    if (typeof window === "undefined") {
      return {
        deviceType: "desktop",
        browser: "unknown",
        os: "unknown",
        userAgent: ""
      };
    }
    const userAgent = navigator.userAgent;
    const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
    const isTablet = /iPad|Android/i.test(userAgent) && !/Mobile/i.test(userAgent);
    return {
      deviceType: isTablet ? "tablet" : isMobile ? "mobile" : "desktop",
      browser: getBrowser(userAgent),
      os: getOS(userAgent),
      userAgent
    };
  }
  function getBrowser(userAgent) {
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Edge")) return "Edge";
    return "Other";
  }
  function getOS(userAgent) {
    if (userAgent.includes("Win")) return "Windows";
    if (userAgent.includes("Mac")) return "macOS";
    if (userAgent.includes("Linux")) return "Linux";
    if (userAgent.includes("Android")) return "Android";
    if (userAgent.includes("iOS")) return "iOS";
    return "Other";
  }
  async function initializeSession() {
    var _a, _b, _c;
    const sessionId = getSessionId();
    const visitorId = getVisitorId();
    const utmParams = getUTMParams();
    const gclid = getGclid();
    const deviceInfo = getDeviceInfo();
    const sessionData = {
      sessionId,
      visitorId,
      startedAt: /* @__PURE__ */ new Date(),
      utmParams,
      deviceInfo,
      geoInfo: {}
    };
    const sessionInsertedKey = `session_inserted_${sessionId}`;
    if (typeof window !== "undefined" && sessionStorage.getItem(sessionInsertedKey)) {
      return sessionData;
    }
    const landingPage = window.location.pathname + window.location.search;
    const market = classifySessionMarket({
      utm_campaign: utmParams.campaign,
      utm_source: utmParams.source,
      referrer: document.referrer || null,
      landing_page: landingPage
    });
    setSessionMarket(market);
    const { error: sessionInsertError } = await supabase.from("user_sessions").insert({
      session_id: sessionId,
      visitor_id: visitorId,
      landing_page: landingPage,
      utm_source: utmParams.source,
      utm_medium: utmParams.medium,
      utm_campaign: utmParams.campaign,
      utm_term: utmParams.term,
      utm_content: utmParams.content,
      gclid: getGclid(),
      msclkid: getMsclkid(),
      fbclid: getFbclid(),
      referrer: document.referrer || null,
      device_type: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      market
    });
    if (sessionInsertError) {
      const isDuplicate = sessionInsertError.code === "23505" || sessionInsertError.code === "PGRST409" || ((_a = sessionInsertError.message) == null ? void 0 : _a.includes("duplicate")) || ((_b = sessionInsertError.message) == null ? void 0 : _b.includes("unique constraint")) || ((_c = sessionInsertError.message) == null ? void 0 : _c.includes("already exists"));
      if (!isDuplicate) {
        console.warn("Failed to insert user_session:", sessionInsertError.message);
      }
    }
    if (typeof window !== "undefined") {
      sessionStorage.setItem(sessionInsertedKey, "true");
    }
    return sessionData;
  }
  async function trackConversion(event2) {
    var _a, _b, _c, _d, _e, _f;
    if (typeof window === "undefined") return false;
    const sessionId = getSessionId();
    const visitorId = getVisitorId();
    const utmParams = getUTMParams();
    const deviceInfo = getDeviceInfo();
    const formSubmitStage = ((_a = event2.metadata) == null ? void 0 : _a.stage) || "default";
    if (event2.eventType === "form_submit") {
      if (formSubmitStage === "booked") {
        const bookingToken = ((_b = event2.metadata) == null ? void 0 : _b.booking_token) || null;
        if (bookingToken && hasBookingFired(bookingToken)) {
          console.log("\u26A0\uFE0F Duplicate booking form_submit blocked for token:", bookingToken);
          return false;
        }
      } else if (hasConversionFired("form_submit_" + formSubmitStage)) {
        console.log("\u26A0\uFE0F Duplicate form_submit blocked for session/stage:", sessionId, formSubmitStage);
        return false;
      }
    }
    const dbEventType = event2.eventType === "form_submit" && formSubmitStage === "priced" ? "quote_priced" : event2.eventType;
    const { data, error } = await supabase.from("conversion_events").insert({
      session_id: sessionId,
      visitor_id: visitorId,
      event_type: dbEventType,
      event_category: "conversion",
      page_path: window.location.pathname,
      button_text: event2.buttonText,
      button_location: event2.buttonLocation,
      phone_number: event2.phoneNumber,
      utm_source: utmParams.source,
      utm_medium: utmParams.medium,
      utm_campaign: utmParams.campaign,
      utm_term: utmParams.term,
      utm_content: utmParams.content,
      gclid: getGclid(),
      msclkid: getMsclkid(),
      fbclid: getFbclid(),
      device_type: deviceInfo.deviceType,
      event_value: event2.eventValue,
      metadata: event2.metadata,
      market: getSessionMarket()
    });
    if (error) {
      console.error("\u274C Failed to track conversion in DB (ad conversions will still fire):", error);
    }
    if (event2.eventType === "form_submit") {
      if (formSubmitStage === "booked") {
        const bookingToken = ((_c = event2.metadata) == null ? void 0 : _c.booking_token) || null;
        if (bookingToken) {
          markBookingFired(bookingToken);
        } else {
          console.warn("\u26A0\uFE0F form_submit booked has no booking_token \u2014 falling back to session dedup");
          markConversionFired("form_submit_booked");
        }
      } else {
        markConversionFired("form_submit_" + formSubmitStage);
      }
    }
    console.log("\u2705 Conversion tracked:", event2.eventType, event2.buttonLocation);
    const gaEventMap = {
      phone_click: "click_to_call",
      text_click: "click_to_text",
      form_submit: "form_submit",
      quote_generated: "quote_generated"
    };
    if (event2.eventType === "form_submit" && (((_d = event2.metadata) == null ? void 0 : _d.stage) === "priced" || ((_e = event2.metadata) == null ? void 0 : _e.stage) === "booked")) {
      return true;
    }
    if (typeof window !== "undefined" && window.gtag) {
      const gaParams = {
        event_category: "conversion",
        event_label: event2.buttonLocation || window.location.pathname,
        value: event2.eventValue
      };
      const CUSTOM_DIMS = [
        "stage",
        "flow_mode",
        "market",
        "surface",
        "vehicle_make",
        "vehicle_model",
        "vehicle_year"
      ];
      for (const dim of CUSTOM_DIMS) {
        const val = (_f = event2.metadata) == null ? void 0 : _f[dim];
        if (val != null) gaParams[dim] = val;
      }
      window.gtag("event", gaEventMap[event2.eventType], gaParams);
    }
    return true;
  }
  async function trackEvent(event2) {
    if (typeof window === "undefined") return;
    const sessionId = getSessionId();
    const visitorId = getVisitorId();
    await supabase.from("analytics_events").insert({
      session_id: sessionId,
      visitor_id: visitorId,
      event_name: event2.eventName,
      event_category: event2.eventCategory,
      event_label: event2.eventLabel,
      event_value: event2.eventValue,
      page_path: window.location.pathname,
      metadata: event2.metadata
    });
    if (event2.eventCategory) {
      event({
        action: event2.eventName,
        category: event2.eventCategory,
        label: event2.eventLabel,
        value: event2.eventValue
      });
    }
  }
  async function trackFormSubmission(formName, metadata, opts) {
    const tracked = await trackConversion({
      eventType: "form_submit",
      buttonLocation: formName,
      metadata
    });
    if (!tracked) return;
    if ((opts == null ? void 0 : opts.fireAds) === false) return;
    const transactionId = (metadata == null ? void 0 : metadata.booking_token) || (metadata == null ? void 0 : metadata.leadId) || (metadata == null ? void 0 : metadata.lead_id) || getSessionId();
    const stage = (metadata == null ? void 0 : metadata.stage) || "default";
    const conversionValue = stage === "booked" ? BOOKING_CONVERSION_VALUE_USD : void 0;
    const email = metadata == null ? void 0 : metadata.email;
    const phone = metadata == null ? void 0 : metadata.phone;
    trackLeadFormConversion(transactionId, { email, phone }, conversionValue);
    trackMicrosoftAdsLeadForm(formName, conversionValue, transactionId ? `form_${transactionId}` : void 0);
  }
  async function trackQuoteGeneratedConversion(serviceType, vehicleInfo, metadata) {
    await trackConversion({
      eventType: "quote_generated",
      // Preserve the label format analytics.trackQuoteGenerated() used for GA4.
      buttonLocation: vehicleInfo ? `${serviceType}:${vehicleInfo}` : serviceType,
      eventValue: (metadata == null ? void 0 : metadata.quote_total_cents) != null ? metadata.quote_total_cents / 100 : void 0,
      metadata
    });
  }

  // src/components/QuoteBookingForm.tsx
  var import_jsx_runtime = __toESM(require_jsx_runtime());
  function buildSlotOptions(now = /* @__PURE__ */ new Date()) {
    const [day1, day2] = getNextTwoWorkingDays(now);
    const day1Label = pillDayLabel(day1, now);
    const day2Label = pillDayLabel(day2, now);
    return [
      { key: "day1_am", date: toIsoLocal(day1), window: "AM", dayLabel: day1Label, dateLabel: pillDateLabel(day1), timeLabel: "8a-12p" },
      { key: "day1_pm", date: toIsoLocal(day1), window: "PM", dayLabel: day1Label, dateLabel: pillDateLabel(day1), timeLabel: "12p-5p" },
      { key: "day2_am", date: toIsoLocal(day2), window: "AM", dayLabel: day2Label, dateLabel: pillDateLabel(day2), timeLabel: "8a-12p" },
      { key: "day2_pm", date: toIsoLocal(day2), window: "PM", dayLabel: day2Label, dateLabel: pillDateLabel(day2), timeLabel: "12p-5p" }
    ];
  }
  function readVariantCookie() {
    if (typeof document === "undefined") return "control";
    const match = document.cookie.split("; ").find((c) => c.startsWith("pag_variant="));
    if (!match) return "control";
    return decodeURIComponent(match.split("=")[1]) || "control";
  }
  function QuoteBookingForm({
    quoteToken,
    totalDollars,
    trackingContext
  }) {
    const [submit, setSubmit] = (0, import_react2.useState)({ kind: "idle" });
    const slots = (0, import_react2.useMemo)(buildSlotOptions, []);
    const [selectedSlot, setSelectedSlot] = (0, import_react2.useState)("day1_am");
    const [fullName, setFullName] = (0, import_react2.useState)("");
    const [phone, setPhone] = (0, import_react2.useState)("");
    const [email, setEmail] = (0, import_react2.useState)("");
    const [street, setStreet] = (0, import_react2.useState)("");
    const [installZip, setInstallZip] = (0, import_react2.useState)("");
    const [smsConsent, setSmsConsent] = (0, import_react2.useState)(true);
    const [honeypot, setHoneypot] = (0, import_react2.useState)("");
    const phoneDigits = phone.replace(/\D/g, "");
    const emailTrimmed = email.trim();
    const emailValid = emailTrimmed === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed);
    const ready = fullName.trim().length >= 2 && phoneDigits.length === 10 && street.trim().length >= 3 && /^\d{5}(-\d{4})?$/.test(installZip.trim()) && emailValid;
    function formatPhoneInput(raw) {
      const d = raw.replace(/\D/g, "").slice(0, 10);
      if (d.length === 0) return "";
      if (d.length < 4) return `(${d}`;
      if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
      return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
    }
    if (submit.kind === "success") {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookingConfirmation, { success: submit.result, submitted: submit.submitted });
    }
    async function onSubmit(event2) {
      var _a, _b;
      event2.preventDefault();
      if (!ready) return;
      const slot = slots.find((s) => s.key === selectedSlot);
      if (!slot) return;
      setSubmit({ kind: "submitting" });
      try {
        const response = await fetch("/api/quote/book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quoteToken,
            customer: { fullName, phone, email: emailTrimmed || void 0 },
            install: { street, zip: installZip.trim(), date: slot.date, window: slot.window },
            smsConsent,
            honeypot,
            variantId: readVariantCookie()
          })
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          setSubmit({ kind: "error", message: data.error || "We could not complete the booking. Please call (720) 918-7465." });
          return;
        }
        setSubmit({
          kind: "success",
          result: { bookingToken: data.bookingToken, status: (_a = data.notification) == null ? void 0 : _a.status, channels: ((_b = data.notification) == null ? void 0 : _b.channels) || [] },
          submitted: { fullName, street, date: slot.date, window: slot.window, dayLabel: `${slot.dayLabel} ${slot.dateLabel}` }
        });
        trackPurchase(
          data.bookingToken,
          parseFloat(totalDollars) || 150,
          "Windshield Service"
        );
        trackFormSubmission("quote_form", {
          stage: "booked",
          booking_token: data.bookingToken,
          phone,
          install_date: slot.date,
          install_window: slot.window,
          ...trackingContext
        }).catch(() => {
        });
      } catch (e) {
        setSubmit({ kind: "error", message: "Booking is temporarily unavailable. Please call (720) 918-7465." });
      }
    }
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", { onSubmit, className: "space-y-3", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "grid grid-cols-4 gap-2", children: slots.map((slot) => {
        const active = slot.key === selectedSlot;
        return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "button",
          {
            type: "button",
            onClick: () => setSelectedSlot(slot.key),
            className: "rounded-md px-1 py-2 text-center transition " + (active ? "border-2 border-pink-500 bg-pink-50 ring-2 ring-pink-200" : "border border-gray-300 bg-white hover:border-pink-300"),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "block text-xs font-bold text-gray-900", children: slot.dayLabel }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "block text-[10px] text-gray-500", children: slot.dateLabel }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "block text-[11px] font-semibold text-gray-700 mt-0.5", children: slot.timeLabel })
            ]
          },
          slot.key
        );
      }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "block", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600", children: "Name" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              value: fullName,
              onChange: (e) => setFullName(e.target.value),
              className: "w-full rounded-md border border-gray-300 px-3 py-3 text-base focus:border-pink-500 focus:outline-none",
              placeholder: "Jane Doe",
              "aria-label": "Your name",
              required: true,
              minLength: 2,
              autoComplete: "name"
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "block", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600", children: "Phone" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              value: phone,
              onChange: (e) => setPhone(formatPhoneInput(e.target.value)),
              onKeyDown: (e) => {
                if (e.metaKey || e.ctrlKey || e.altKey) return;
                const allowed = [
                  "Backspace",
                  "Delete",
                  "Tab",
                  "Enter",
                  "Home",
                  "End",
                  "ArrowLeft",
                  "ArrowRight",
                  "ArrowUp",
                  "ArrowDown"
                ];
                if (allowed.includes(e.key)) return;
                if (/^\d$/.test(e.key)) return;
                e.preventDefault();
              },
              className: "w-full rounded-md border border-gray-300 px-3 py-3 text-base focus:border-pink-500 focus:outline-none",
              placeholder: "(720) 555-1234",
              "aria-label": "Phone",
              type: "tel",
              required: true,
              autoComplete: "tel",
              inputMode: "numeric",
              pattern: "[0-9() \\-]*",
              maxLength: 14
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid grid-cols-[1fr_100px] gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "block", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600", children: "Install address" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              value: street,
              onChange: (e) => setStreet(e.target.value),
              className: "w-full rounded-md border border-gray-300 px-3 py-3 text-base focus:border-pink-500 focus:outline-none",
              placeholder: "1234 Main St",
              "aria-label": "Install address",
              required: true,
              minLength: 3,
              autoComplete: "street-address"
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "block", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600", children: "ZIP" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              value: installZip,
              onChange: (e) => setInstallZip(e.target.value.replace(/[^0-9-]/g, "").slice(0, 10)),
              className: "w-full rounded-md border border-gray-300 px-3 py-3 text-base focus:border-pink-500 focus:outline-none",
              placeholder: "80202",
              "aria-label": "ZIP",
              required: true,
              inputMode: "numeric",
              autoComplete: "postal-code"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "block", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600", children: [
          "Email ",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-gray-400 font-normal normal-case tracking-normal", children: "(optional \u2014 for confirmation)" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "input",
          {
            value: email,
            onChange: (e) => setEmail(e.target.value),
            className: `w-full rounded-md border px-3 py-3 text-base focus:border-pink-500 focus:outline-none ${emailValid ? "border-gray-300" : "border-red-400"}`,
            placeholder: "you@example.com",
            "aria-label": "Email (optional)",
            type: "email",
            autoComplete: "email",
            inputMode: "email"
          }
        ),
        !emailValid && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-1 block text-xs text-red-600", children: "Please enter a valid email or leave blank." })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "flex items-start gap-2 text-xs text-gray-600", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "input",
          {
            type: "checkbox",
            checked: smsConsent,
            onChange: (e) => setSmsConsent(e.target.checked),
            className: "mt-0.5 h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Text me booking updates \xB7 Reply STOP to opt out" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "input",
        {
          type: "text",
          name: "website",
          value: honeypot,
          onChange: (e) => setHoneypot(e.target.value),
          className: "absolute -left-[9999px] h-0 w-0 opacity-0",
          tabIndex: -1,
          autoComplete: "off",
          "aria-hidden": "true"
        }
      ),
      submit.kind === "error" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900", children: submit.message }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "button",
        {
          type: "submit",
          disabled: !ready || submit.kind === "submitting",
          className: "inline-flex w-full items-center justify-between gap-2 rounded-lg bg-pink-600 px-5 py-5 text-lg font-bold text-white shadow-sm hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-gray-300",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "flex items-center gap-2", children: [
              submit.kind === "submitting" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader2, { className: "h-5 w-5 animate-spin" }),
              "Book my install"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
              "$",
              totalDollars
            ] })
          ]
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "a",
        {
          href: "tel:+17209187465",
          className: "block w-full text-center text-sm font-semibold text-gray-500 hover:text-pink-600",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "inline h-4 w-4 mr-1 -mt-0.5" }),
            "Prefer to call? (720) 918-7465"
          ]
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-center text-xs text-gray-500", children: "No charge today. We'll confirm by phone or text before arrival." })
    ] });
  }
  function BookingConfirmation({ success, submitted }) {
    const window2 = submitted.window === "AM" ? "8a-12p" : "12p-5p";
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rounded-md border border-green-200 bg-green-50 p-5", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCircle2, { className: "mb-3 h-9 w-9 text-green-600" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { className: "text-lg font-bold text-gray-900", children: [
        "You're booked, ",
        submitted.fullName.split(" ")[0],
        "."
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "mt-1 text-sm text-gray-700", children: [
        "Reference: ",
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-mono font-semibold", children: success.bookingToken })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mt-4 space-y-2 rounded-md border border-green-200 bg-white p-3 text-sm", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex justify-between gap-4", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-gray-600", children: "When" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "font-semibold text-gray-900", children: [
            submitted.dayLabel,
            ", ",
            window2
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex justify-between gap-4", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-gray-600", children: "Where" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-semibold text-gray-900", children: submitted.street })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "mt-4 text-sm text-gray-700", children: [
        "We'll text you a heads-up about 30 minutes before arrival. Need to change something? Call",
        " ",
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: "tel:+17209187465", className: "font-semibold text-pink-700", children: "(720) 918-7465" }),
        " and mention reference ",
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: success.bookingToken }),
        "."
      ] })
    ] });
  }

  // src/components/AutomatedQuoteForm.tsx
  var import_jsx_runtime2 = __toESM(require_jsx_runtime());
  function quoteSurface(trackingContext) {
    if (trackingContext == null ? void 0 : trackingContext.surface) return trackingContext.surface;
    if (typeof window === "undefined") return "unknown";
    return window.location.pathname || "unknown";
  }
  function resolveQuoteMarket(plateState, trackingContext) {
    var _a;
    if (plateState === "CO") return "colorado";
    if (plateState === "AZ") return "arizona";
    if ((trackingContext == null ? void 0 : trackingContext.marketHint) === "colorado" || (trackingContext == null ? void 0 : trackingContext.marketHint) === "arizona") {
      return trackingContext.marketHint;
    }
    if (typeof window !== "undefined") return (_a = getMarketFromPath(window.location.pathname)) != null ? _a : void 0;
    return void 0;
  }
  var STATE_OPTIONS = [
    "AL",
    "AK",
    "AZ",
    "AR",
    "CA",
    "CO",
    "CT",
    "DE",
    "DC",
    "FL",
    "GA",
    "HI",
    "ID",
    "IL",
    "IN",
    "IA",
    "KS",
    "KY",
    "LA",
    "ME",
    "MD",
    "MA",
    "MI",
    "MN",
    "MS",
    "MO",
    "MT",
    "NE",
    "NV",
    "NH",
    "NJ",
    "NM",
    "NY",
    "NC",
    "ND",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VT",
    "VA",
    "WA",
    "WV",
    "WI",
    "WY"
  ];
  function currentSessionId() {
    if (typeof window === "undefined") return void 0;
    return getSessionId();
  }
  function AutomatedQuoteForm({
    flowMode = "standard",
    trackingContext
  }) {
    const [stage, setStage] = (0, import_react3.useState)("vehicle");
    const [vehicleMode, setVehicleMode] = (0, import_react3.useState)("plate");
    const [plate, setPlate] = (0, import_react3.useState)("");
    const [plateState, setPlateState] = (0, import_react3.useState)("");
    const [vehicle, setVehicle] = (0, import_react3.useState)({ vin: "", year: "", make: "", model: "", trim: "" });
    const [busy, setBusy] = (0, import_react3.useState)(false);
    const [notice, setNotice] = (0, import_react3.useState)("");
    const [quote, setQuote] = (0, import_react3.useState)(null);
    const [retryAfter, setRetryAfter] = (0, import_react3.useState)(null);
    const [cooldownSeconds, setCooldownSeconds] = (0, import_react3.useState)(0);
    (0, import_react3.useEffect)(() => {
      if (!retryAfter) return;
      const tick = () => {
        const remaining = Math.ceil((retryAfter - Date.now()) / 1e3);
        if (remaining <= 0) {
          setCooldownSeconds(0);
          setRetryAfter(null);
        } else setCooldownSeconds(remaining);
      };
      tick();
      const id = setInterval(tick, 1e3);
      return () => clearInterval(id);
    }, [retryAfter]);
    function fireQuoteDiagnostic(eventName, extra) {
      trackEvent({
        eventName,
        eventCategory: "quote_funnel_diagnostic",
        metadata: {
          surface: quoteSurface(trackingContext),
          market: resolveQuoteMarket(plateState, trackingContext),
          flow_mode: flowMode,
          ...trackingContext,
          ...extra
        }
      }).catch(() => {
      });
    }
    async function lookupPlate() {
      var _a, _b, _c, _d, _e;
      if (!isStateInServiceArea(plateState)) {
        setNotice(OUT_OF_AREA_STATE_MESSAGE);
        return;
      }
      setNotice("");
      fireQuoteDiagnostic("quote_attempt_plate");
      setBusy(true);
      try {
        const response = await fetch("/api/quote/identify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plate, state: plateState })
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          setNotice(data.message || data.error || "We couldn't find that plate. Try a VIN below, or call (720) 918-7465.");
          setRetryAfter(Date.now() + 6e4);
          return;
        }
        const v = {
          vin: ((_a = data.vehicle) == null ? void 0 : _a.vin) || "",
          year: ((_b = data.vehicle) == null ? void 0 : _b.year) ? String(data.vehicle.year) : "",
          make: ((_c = data.vehicle) == null ? void 0 : _c.make) || "",
          model: ((_d = data.vehicle) == null ? void 0 : _d.model) || "",
          trim: ((_e = data.vehicle) == null ? void 0 : _e.trim) || ""
        };
        setVehicle(v);
        await requestPrice(v, "plate");
      } catch (e) {
        setNotice("Plate lookup is temporarily unavailable. Try a VIN below, or call (720) 918-7465.");
      } finally {
        setBusy(false);
      }
    }
    async function lookupVin() {
      var _a, _b, _c, _d, _e;
      setNotice("");
      fireQuoteDiagnostic("quote_attempt_vin");
      setBusy(true);
      try {
        const response = await fetch("/api/quote/decode-vin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vin: vehicle.vin })
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          setNotice(data.message || data.error || "We couldn't decode that VIN. Double-check it or call (720) 918-7465.");
          return;
        }
        const v = {
          vin: ((_a = data.vehicle) == null ? void 0 : _a.vin) || vehicle.vin,
          year: ((_b = data.vehicle) == null ? void 0 : _b.year) ? String(data.vehicle.year) : "",
          make: ((_c = data.vehicle) == null ? void 0 : _c.make) || "",
          model: ((_d = data.vehicle) == null ? void 0 : _d.model) || "",
          trim: ((_e = data.vehicle) == null ? void 0 : _e.trim) || ""
        };
        setVehicle(v);
        await requestPrice(v, "vin");
      } catch (e) {
        setNotice("VIN lookup is temporarily unavailable. Call (720) 918-7465.");
      } finally {
        setBusy(false);
      }
    }
    async function requestPrice(v, mode) {
      var _a;
      try {
        const response = await fetch("/api/quote/price", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: currentSessionId(),
            vehicle: {
              vin: v.vin || void 0,
              year: Number.parseInt(v.year, 10),
              make: v.make,
              model: v.model,
              trim: v.trim || void 0
            },
            state: plateState,
            plateLast4: plate.slice(-4)
          })
        });
        const data = await response.json();
        if (!response.ok) {
          setNotice(data.error || "Quote pricing is unavailable. Call (720) 918-7465.");
          return;
        }
        if (data == null ? void 0 : data.vehicle) {
          setVehicle({
            vin: data.vehicle.vin || v.vin,
            year: data.vehicle.year ? String(data.vehicle.year) : v.year,
            make: data.vehicle.make || v.make,
            model: data.vehicle.model || v.model,
            trim: (_a = data.vehicle.trim) != null ? _a : v.trim
          });
        }
        setQuote(data);
        setStage("priced");
        if (data.status !== "manual_review" && data.pricing) {
          trackQuoteGeneratedConversion(
            "windshield",
            `${v.year} ${v.make} ${v.model}`.trim(),
            {
              quote_id: data == null ? void 0 : data.id,
              quote_total_cents: data == null ? void 0 : data.totalCents,
              vehicle_year: v.year ? Number.parseInt(v.year, 10) : void 0,
              vehicle_make: v.make,
              vehicle_model: v.model,
              surface: quoteSurface(trackingContext),
              market: resolveQuoteMarket(plateState, trackingContext),
              flow_mode: flowMode,
              ...trackingContext
            }
          ).catch(() => {
          });
          trackFormSubmission("quote_form", {
            stage: "priced",
            quote_total_cents: data == null ? void 0 : data.totalCents,
            quote_id: data == null ? void 0 : data.id,
            vehicle_year: v.year ? Number.parseInt(v.year, 10) : void 0,
            vehicle_make: v.make,
            vehicle_model: v.model,
            surface: quoteSurface(trackingContext),
            market: resolveQuoteMarket(plateState, trackingContext),
            flow_mode: flowMode,
            ...trackingContext
          }, { fireAds: false }).catch(() => {
          });
        } else {
          fireQuoteDiagnostic("diagnostic_manual_review", {
            via: mode,
            quote_token: data == null ? void 0 : data.quoteToken
          });
        }
      } catch (e) {
        setNotice("Quote pricing is unavailable. Call (720) 918-7465.");
      }
    }
    function newQuote() {
      setStage("vehicle");
      setQuote(null);
      setVehicle({ vin: "", year: "", make: "", model: "", trim: "" });
      setPlate("");
      setNotice("");
    }
    if (stage === "priced" && quote) {
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        PricedHero,
        {
          quote,
          vehicle,
          onNewQuote: newQuote,
          onDiagnostic: fireQuoteDiagnostic,
          trackingContext
        }
      );
    }
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "rounded-lg border border-gray-200 bg-white p-5 shadow-sm", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        VehicleStage,
        {
          mode: vehicleMode,
          setMode: setVehicleMode,
          plate,
          setPlate,
          plateState,
          setPlateState,
          vinInput: vehicle.vin,
          setVinInput: (vin) => setVehicle((prev) => ({ ...prev, vin })),
          onLookupPlate: lookupPlate,
          onLookupVin: lookupVin,
          busy,
          notice,
          cooldownSeconds
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("aside", { className: "rounded-lg border border-gray-200 bg-gray-50 p-5", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h2", { className: "text-xl font-bold text-gray-900", children: "Your quote will appear here" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "mt-4 space-y-3 text-sm text-gray-700", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(ShieldCheck, { className: "h-5 w-5 text-green-600" }),
            "Mobile service included"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(ShieldCheck, { className: "h-5 w-5 text-green-600" }),
            "ADAS calibration added when required"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(ShieldCheck, { className: "h-5 w-5 text-green-600" }),
            "No payment collected online"
          ] })
        ] })
      ] })
    ] });
  }
  function VehicleStage({
    mode,
    setMode,
    plate,
    setPlate,
    plateState,
    setPlateState,
    vinInput,
    setVinInput,
    onLookupPlate,
    onLookupVin,
    busy,
    notice,
    cooldownSeconds
  }) {
    const plateReady = plate.trim().length >= 2 && plateState.length === 2;
    const vinReady = vinInput.trim().length === 17;
    const tabClass = (active) => `flex-1 rounded-md border px-3 py-2.5 text-sm font-semibold transition-colors ${active ? "shadow-sm" : "border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200"}`;
    const tabStyle = (active) => active ? {
      backgroundColor: "#be185d",
      borderColor: "#831843",
      color: "#ffffff",
      boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.18)"
    } : void 0;
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "mb-4 flex gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: tabClass(mode === "plate"), style: tabStyle(mode === "plate"), onClick: () => setMode("plate"), children: "License plate" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: tabClass(mode === "vin"), style: tabStyle(mode === "vin"), onClick: () => setMode("vin"), children: "VIN" })
      ] }),
      mode === "plate" && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "grid gap-3", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "grid grid-cols-[1fr_120px] gap-3", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("label", { className: "block", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "mb-1 block text-sm font-semibold text-gray-700", children: "License plate" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "input",
              {
                value: plate,
                onChange: (event2) => setPlate(event2.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8)),
                className: "w-full rounded-md border border-gray-300 px-3 py-3 text-lg font-semibold tracking-wide focus:border-pink-500 focus:outline-none",
                placeholder: "ABC1234",
                autoComplete: "off"
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("label", { className: "block", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "mb-1 block text-sm font-semibold text-gray-700", children: "State" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
              "select",
              {
                value: plateState,
                onChange: (event2) => setPlateState(event2.target.value),
                className: "w-full rounded-md border border-gray-300 px-3 py-3 text-lg font-semibold focus:border-pink-500 focus:outline-none",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: "", children: "\u2014" }),
                  STATE_OPTIONS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { children: s }, s))
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
          "button",
          {
            type: "button",
            onClick: onLookupPlate,
            disabled: busy || !plateReady || cooldownSeconds > 0,
            className: "inline-flex w-full items-center justify-center gap-2 rounded-md bg-pink-600 px-4 py-4 text-lg font-bold text-white hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-gray-300",
            children: [
              busy ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Loader2, { className: "h-5 w-5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Search, { className: "h-5 w-5" }),
              busy ? "Looking up your price\u2026" : cooldownSeconds > 0 ? `Try again in ${cooldownSeconds}s` : plate.trim().length < 2 ? "Enter plate to continue" : !plateState ? "Select state to continue" : "Get my price"
            ]
          }
        )
      ] }),
      mode === "vin" && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "grid gap-3", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("label", { className: "block", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "mb-1 block text-sm font-semibold text-gray-700", children: "VIN (17 characters)" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "input",
            {
              value: vinInput,
              onChange: (event2) => setVinInput(event2.target.value.toUpperCase().slice(0, 17)),
              className: "w-full rounded-md border border-gray-300 px-3 py-3 font-mono text-base tracking-wider focus:border-pink-500 focus:outline-none",
              maxLength: 17,
              placeholder: "1HGCV1F30NA000000",
              autoComplete: "off"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "mt-1 block text-xs text-gray-500", children: "Look on the dashboard near the windshield, or the door jamb." })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
          "button",
          {
            type: "button",
            onClick: onLookupVin,
            disabled: busy || !vinReady,
            className: "inline-flex w-full items-center justify-center gap-2 rounded-md bg-pink-600 px-4 py-4 text-lg font-bold text-white hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-gray-300",
            children: [
              busy ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Loader2, { className: "h-5 w-5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Search, { className: "h-5 w-5" }),
              busy ? "Looking up your price\u2026" : !vinReady ? `${vinInput.length}/17 characters` : "Get my price"
            ]
          }
        )
      ] }),
      notice && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(AlertTriangle, { className: "mt-0.5 h-4 w-4 flex-shrink-0" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: notice })
        ] }),
        mode === "plate" && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "button",
          {
            type: "button",
            onClick: () => setMode("vin"),
            className: "mt-2 ml-6 font-semibold text-pink-700 hover:underline",
            children: "Enter VIN instead \u2192"
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "mt-6 border-t border-gray-100 pt-4 text-center text-sm text-gray-500", children: [
        "Can't find your plate or VIN?",
        " ",
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("a", { href: "tel:+17209187465", className: "font-semibold text-pink-700 hover:underline", children: "Call (720) 918-7465" })
      ] })
    ] });
  }
  function PricedHero({
    quote,
    vehicle,
    onNewQuote,
    onDiagnostic,
    trackingContext
  }) {
    var _a;
    const [breakdownOpen, setBreakdownOpen] = (0, import_react3.useState)(false);
    if (quote.status === "manual_review" || !quote.pricing) {
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "rounded-lg border border-amber-200 bg-amber-50 p-6", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Phone, { className: "mb-4 h-9 w-9 text-amber-700" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h2", { className: "text-2xl font-bold text-gray-900", children: "Please call for accurate pricing" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "mt-2 text-sm text-gray-700", children: quote.message || "We need a few more details to price this vehicle. Call us and we'll quote you on the phone." }),
        quote.quoteToken && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "mt-4 rounded-md border border-amber-200 bg-white p-3 text-sm", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "font-semibold text-gray-900", children: "Reference" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "font-mono text-base text-gray-700", children: quote.quoteToken.slice(0, 8).toUpperCase() }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "mt-1 text-gray-600", children: "Mention this when you call." })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
          "a",
          {
            href: "tel:+17209187465",
            className: "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-pink-600 px-5 py-4 text-lg font-bold text-white hover:bg-pink-700",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Phone, { className: "h-5 w-5" }),
              "(720) 918-7465"
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "button",
          {
            type: "button",
            onClick: onNewQuote,
            className: "mt-3 inline-flex w-full items-center justify-center text-sm text-gray-500 underline hover:text-pink-600",
            children: "Start a new quote"
          }
        )
      ] });
    }
    const vehicleLine = [vehicle.year, vehicle.make, vehicle.model, vehicle.trim].filter(Boolean).join(" ");
    const totalDollars = (quote.pricing.totalCents / 100).toFixed(2);
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "rounded-xl border-2 border-pink-500 bg-white p-5 shadow-sm", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-green-700", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(CheckCircle2, { className: "h-5 w-5" }),
          " Installed price, we come to you"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "mt-2 text-6xl font-extrabold leading-none text-gray-900 tracking-tight sm:text-7xl", children: [
          "$",
          totalDollars
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("p", { className: "mt-3 text-sm text-gray-600", children: [
          "for your ",
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "font-semibold text-gray-900", children: vehicleLine || "vehicle" }),
          " \xB7 + sales tax"
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "mt-5 text-center", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "text-xl font-bold text-gray-900", children: "Lock in this price." }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "mt-1 text-sm text-gray-600", children: "Quick form below \u2014 we come to you, no shop visit." })
      ] }),
      quote.quoteToken && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "mt-5", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        QuoteBookingForm,
        {
          quoteToken: quote.quoteToken,
          totalDollars,
          trackingContext
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "button",
        {
          type: "button",
          onClick: () => setBreakdownOpen((v) => !v),
          className: "mt-5 text-sm text-gray-500 underline hover:text-pink-600",
          children: breakdownOpen ? "Hide price breakdown" : "See price breakdown"
        }
      ),
      breakdownOpen && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "mt-3 divide-y divide-gray-100 rounded-md border border-gray-200 text-sm", children: [
        quote.pricing.lineItems.map((item) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex justify-between gap-4 px-3 py-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "text-gray-700", children: item.description }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "font-semibold text-gray-900", children: [
            "$",
            (item.amountCents / 100).toFixed(2)
          ] })
        ] }, `${item.kind}-${item.description}`)),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex justify-between gap-4 bg-gray-50 px-3 py-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "font-semibold text-gray-900", children: "Total" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "font-bold text-gray-900", children: [
            "$",
            totalDollars
          ] })
        ] }),
        ((_a = quote.adas) == null ? void 0 : _a.requiresCalibration) && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "px-3 py-2 text-xs text-blue-900", children: "Calibration included \u2014 we detected lane-assist or camera sensors on your vehicle." })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "mt-4 text-xs text-gray-500", children: [
        vehicleLine && `Quoted for ${vehicleLine}. `,
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", onClick: onNewQuote, className: "underline hover:text-pink-600", children: "Not your car?" })
      ] })
    ] });
  }

  // src/components/satellite/ZipFirstGate.tsx
  var import_react4 = __toESM(require_react());
  var import_jsx_runtime3 = __toESM(require_jsx_runtime());
  function ZipFirstGate({
    config,
    trackingContext,
    onPass
  }) {
    const [zip, setZip] = (0, import_react4.useState)("");
    const [notice, setNotice] = (0, import_react4.useState)("");
    const wrapperCopy = config.wrapperCopy;
    const canSubmit = /^\d{5}(-\d{4})?$/.test(zip.trim());
    const metadata = (0, import_react4.useMemo)(
      () => ({
        flow_mode: "zip-first",
        ...trackingContext
      }),
      [trackingContext]
    );
    function logEvent(eventName, extra) {
      trackEvent({
        eventName,
        eventCategory: "satellite_quoter",
        metadata: {
          ...metadata,
          ...extra
        }
      }).catch(() => {
      });
    }
    function handleSubmit() {
      if (!canSubmit) return;
      const result = isInServiceArea(zip.trim());
      if (!result.inServiceArea) {
        setNotice(result.reason === "invalid_zip" ? "Please enter a valid ZIP code." : OUT_OF_AREA_MESSAGE);
        logEvent("satellite_quoter_zip_failed", {
          zip3: result.zip3,
          reason: result.reason
        });
        return;
      }
      setNotice("");
      logEvent("satellite_quoter_zip_passed", { zip3: result.zip3 });
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      onPass(zip.trim());
    }
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "rounded-3xl border border-teal-100 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "text-sm font-semibold uppercase tracking-[0.2em] text-teal-700", children: (wrapperCopy == null ? void 0 : wrapperCopy.startLabel) || "Start here" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h3", { className: "mt-3 text-3xl font-bold tracking-tight text-slate-950", children: (wrapperCopy == null ? void 0 : wrapperCopy.zipTitle) || "Get an instant quote" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "mt-3 text-base leading-7 text-slate-600", children: (wrapperCopy == null ? void 0 : wrapperCopy.zipBody) || "If we serve your ZIP, you can quote and book online right now." }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("label", { className: "mt-6 block", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "mb-2 block text-sm font-semibold text-slate-900", children: "Service ZIP" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "grid gap-3 sm:grid-cols-[1fr_auto]", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center rounded-2xl border border-slate-200 bg-white px-4", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MapPin, { className: "mr-2 h-5 w-5 text-slate-400" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              "input",
              {
                value: zip,
                onChange: (event2) => {
                  setZip(event2.target.value.replace(/[^0-9-]/g, "").slice(0, 10));
                  if (notice) setNotice("");
                },
                inputMode: "numeric",
                placeholder: "80212",
                className: "w-full border-0 py-4 text-lg text-slate-950 outline-none placeholder:text-slate-400",
                "aria-label": "Service ZIP"
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            "button",
            {
              type: "button",
              onClick: handleSubmit,
              disabled: !canSubmit,
              className: "rounded-2xl bg-teal-700 px-6 py-4 text-lg font-bold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300",
              children: (wrapperCopy == null ? void 0 : wrapperCopy.zipCta) || "Check My ZIP"
            }
          )
        ] })
      ] }),
      notice && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "mt-4 flex gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(AlertTriangle, { className: "mt-0.5 h-4 w-4 flex-shrink-0" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: notice })
      ] })
    ] });
  }

  // src/components/satellite/SatelliteQuoterShell.tsx
  var import_jsx_runtime4 = __toESM(require_jsx_runtime());
  function SatelliteQuoterShell({ config }) {
    const [zipPassed, setZipPassed] = (0, import_react5.useState)(false);
    const wrapperCopy = config.wrapperCopy;
    const sectionRef = (0, import_react5.useRef)(null);
    const trackingContext = (0, import_react5.useMemo)(
      () => ({
        siteKey: config.siteKey,
        mode: config.mode,
        utmSource: config.utmSource,
        marketHint: config.marketHint,
        surface: `satellite:${config.siteKey}`
      }),
      [config.marketHint, config.mode, config.siteKey, config.utmSource]
    );
    const showZipFirstGate = config.mode === "zip-first" && !zipPassed;
    const flowMode = config.mode === "zip-first" ? "zip-first-unlocked" : "standard";
    const showUnlockedQuoteIntro = config.mode === "zip-first" && zipPassed;
    const quoteCardTitle = (wrapperCopy == null ? void 0 : wrapperCopy.quoteCardTitle) || "Get your instant quote";
    const quoteCardBody = (wrapperCopy == null ? void 0 : wrapperCopy.quoteCardBody) || "Enter your license plate and state, or switch to VIN if you have it handy.";
    (0, import_react5.useEffect)(() => {
      initializeSession().catch(() => {
      });
    }, []);
    (0, import_react5.useEffect)(() => {
      if (!showUnlockedQuoteIntro) return;
      const resetScroll = () => {
        if (typeof window === "undefined") return;
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        if (document.scrollingElement) {
          document.scrollingElement.scrollTop = 0;
        }
      };
      const frameOne = window.requestAnimationFrame(() => {
        resetScroll();
        window.requestAnimationFrame(resetScroll);
      });
      return () => {
        window.cancelAnimationFrame(frameOne);
      };
    }, [showUnlockedQuoteIntro]);
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("section", { ref: sectionRef, className: "bg-white py-10", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: [
      ((wrapperCopy == null ? void 0 : wrapperCopy.headline) || (wrapperCopy == null ? void 0 : wrapperCopy.subhead)) && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "mx-auto mb-8 max-w-3xl text-center", children: [
        (wrapperCopy == null ? void 0 : wrapperCopy.headline) && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h2", { className: "whitespace-pre-line text-balance text-4xl font-black tracking-tight text-slate-950 sm:text-5xl", children: wrapperCopy.headline }),
        (wrapperCopy == null ? void 0 : wrapperCopy.subhead) && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600", children: wrapperCopy.subhead })
      ] }),
      showZipFirstGate ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "mx-auto max-w-3xl", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        ZipFirstGate,
        {
          config,
          trackingContext,
          onPass: () => setZipPassed(true)
        }
      ) }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
        showUnlockedQuoteIntro && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "mx-auto mb-6 max-w-3xl rounded-3xl border border-teal-100 bg-teal-50/60 p-5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "text-sm font-semibold uppercase tracking-[0.2em] text-teal-700", children: "Next step" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h3", { className: "mt-2 text-2xl font-bold tracking-tight text-slate-950", children: quoteCardTitle }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "mt-2 text-base leading-7 text-slate-600", children: quoteCardBody })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          AutomatedQuoteForm,
          {
            flowMode,
            trackingContext
          }
        )
      ] })
    ] }) });
  }

  // src/embed/satellite-quoter-entry.tsx
  var import_jsx_runtime5 = __toESM(require_jsx_runtime());
  var mountedRoots = /* @__PURE__ */ new WeakMap();
  var EMBED_VERSION = "1.0.0";
  var STYLE_LINK_ID = "pag-satellite-quoter-styles";
  var MOUNT_NODE_ATTR = "data-pag-satellite-quoter-root";
  var EMBED_ASSET_BASE = (() => {
    if (typeof document === "undefined") return "";
    const currentScript = document.currentScript;
    if (currentScript instanceof HTMLScriptElement && currentScript.src) {
      return new URL(".", currentScript.src).toString();
    }
    return "";
  })();
  function resolveTarget(target) {
    if (typeof document === "undefined") return null;
    if (typeof target === "string") return document.querySelector(target);
    return target;
  }
  function validateConfig(config) {
    if (!config || typeof config !== "object") {
      throw new Error("Satellite quoter config is required.");
    }
    if (!config.siteKey || typeof config.siteKey !== "string") {
      throw new Error("Satellite quoter config requires a string siteKey.");
    }
    if (config.mode !== "standard" && config.mode !== "zip-first") {
      throw new Error("Satellite quoter config mode must be 'standard' or 'zip-first'.");
    }
  }
  function reportMountError(message, error) {
    console.error(`[PAGSatelliteQuoter] ${message}`, error);
    return false;
  }
  function getAssetUrl(filename) {
    if (EMBED_ASSET_BASE) return new URL(filename, EMBED_ASSET_BASE).toString();
    return `/embed/${filename}`;
  }
  function ensureShadowMount(target) {
    var _a;
    const host = target;
    const shadowRoot = (_a = host.shadowRoot) != null ? _a : host.attachShadow({ mode: "open" });
    let styleLink = shadowRoot.getElementById(STYLE_LINK_ID);
    if (!styleLink) {
      styleLink = document.createElement("link");
      styleLink.id = STYLE_LINK_ID;
      styleLink.rel = "stylesheet";
      styleLink.href = getAssetUrl("satellite-quoter.v1.css");
      shadowRoot.appendChild(styleLink);
    }
    let mountNode = shadowRoot.querySelector(`[${MOUNT_NODE_ATTR}]`);
    if (!mountNode) {
      mountNode = document.createElement("div");
      mountNode.setAttribute(MOUNT_NODE_ATTR, "true");
      mountNode.className = "pag-satellite-quoter-root";
      shadowRoot.appendChild(mountNode);
    }
    return mountNode;
  }
  function mount(target, config) {
    const element = resolveTarget(target);
    if (!element) return reportMountError("Satellite quoter mount target was not found.");
    try {
      validateConfig(config);
    } catch (error) {
      return reportMountError("Satellite quoter config validation failed.", error);
    }
    let mounted = mountedRoots.get(element);
    if (!mounted) {
      const mountNode = ensureShadowMount(element);
      mounted = {
        root: (0, import_client.createRoot)(mountNode),
        mountNode
      };
      mountedRoots.set(element, mounted);
    }
    mounted.root.render(
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_react6.default.StrictMode, { children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(SatelliteQuoterShell, { config }) })
    );
    return true;
  }
  function unmount(target) {
    const element = resolveTarget(target);
    if (!element) return;
    const mounted = mountedRoots.get(element);
    if (!mounted) return;
    mounted.root.unmount();
    mountedRoots.delete(element);
  }
  var PAGSatelliteQuoter = {
    version: EMBED_VERSION,
    mount,
    unmount
  };
  if (typeof window !== "undefined") {
    window.PAGSatelliteQuoter = PAGSatelliteQuoter;
    window.PAGSatelliteQuoterV1 = PAGSatelliteQuoter;
  }
})();
//# sourceMappingURL=satellite-quoter.v1.js.map
