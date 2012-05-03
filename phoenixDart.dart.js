function $defProp(obj, prop, value) {
  Object.defineProperty(obj, prop,
      {value: value, enumerable: false, writable: true, configurable: true});
}
function $throw(e) {
  // If e is not a value, we can use V8's captureStackTrace utility method.
  // TODO(jmesserly): capture the stack trace on other JS engines.
  if (e && (typeof e == 'object') && Error.captureStackTrace) {
    // TODO(jmesserly): this will clobber the e.stack property
    Error.captureStackTrace(e, $throw);
  }
  throw e;
}
$defProp(Object.prototype, '$index', function(i) {
  $throw(new NoSuchMethodException(this, "operator []", [i]));
});
$defProp(Array.prototype, '$index', function(index) {
  var i = index | 0;
  if (i !== index) {
    throw new IllegalArgumentException('index is not int');
  } else if (i < 0 || i >= this.length) {
    throw new IndexOutOfRangeException(index);
  }
  return this[i];
});
$defProp(String.prototype, '$index', function(i) {
  return this[i];
});
$defProp(Object.prototype, '$setindex', function(i, value) {
  $throw(new NoSuchMethodException(this, "operator []=", [i, value]));
});
$defProp(Array.prototype, '$setindex', function(index, value) {
  var i = index | 0;
  if (i !== index) {
    throw new IllegalArgumentException('index is not int');
  } else if (i < 0 || i >= this.length) {
    throw new IndexOutOfRangeException(index);
  }
  return this[i] = value;
});
function $add$complex$(x, y) {
  if (typeof(x) == 'number') {
    $throw(new IllegalArgumentException(y));
  } else if (typeof(x) == 'string') {
    var str = (y == null) ? 'null' : y.toString();
    if (typeof(str) != 'string') {
      throw new Error("calling toString() on right hand operand of operator " +
      "+ did not return a String");
    }
    return x + str;
  } else if (typeof(x) == 'object') {
    return x.$add(y);
  } else {
    $throw(new NoSuchMethodException(x, "operator +", [y]));
  }
}

function $add$(x, y) {
  if (typeof(x) == 'number' && typeof(y) == 'number') return x + y;
  return $add$complex$(x, y);
}
function $bit_and$complex$(x, y) {
  if (typeof(x) == 'number') {
    $throw(new IllegalArgumentException(y));
  } else if (typeof(x) == 'object') {
    return x.$bit_and(y);
  } else {
    $throw(new NoSuchMethodException(x, "operator &", [y]));
  }
}
function $bit_and$(x, y) {
  if (typeof(x) == 'number' && typeof(y) == 'number') return x & y;
  return $bit_and$complex$(x, y);
}
function $eq$(x, y) {
  if (x == null) return y == null;
  return (typeof(x) != 'object') ? x === y : x.$eq(y);
}
// TODO(jimhug): Should this or should it not match equals?
$defProp(Object.prototype, '$eq', function(other) {
  return this === other;
});
function $mod$(x, y) {
  if (typeof(x) == 'number') {
    if (typeof(y) == 'number') {
      var result = x % y;
      if (result == 0) {
        return 0;  // Make sure we don't return -0.0.
      } else if (result < 0) {
        if (y < 0) {
          return result - y;
        } else {
          return result + y;
        }
      }
      return result;
    } else {
      $throw(new IllegalArgumentException(y));
    }
  } else if (typeof(x) == 'object') {
    return x.$mod(y);
  } else {
    $throw(new NoSuchMethodException(x, "operator %", [y]));
  }
}
function $mul$complex$(x, y) {
  if (typeof(x) == 'number') {
    $throw(new IllegalArgumentException(y));
  } else if (typeof(x) == 'object') {
    return x.$mul(y);
  } else {
    $throw(new NoSuchMethodException(x, "operator *", [y]));
  }
}
function $mul$(x, y) {
  if (typeof(x) == 'number' && typeof(y) == 'number') return x * y;
  return $mul$complex$(x, y);
}
function $ne$(x, y) {
  if (x == null) return y != null;
  return (typeof(x) != 'object') ? x !== y : !x.$eq(y);
}
function $negate$(x) {
  if (typeof(x) == 'number') return -x;
  if (typeof(x) == 'object') return x.$negate();
  $throw(new NoSuchMethodException(x, "operator negate", []));
}
function $shl$complex$(x, y) {
  if (typeof(x) == 'number') {
    $throw(new IllegalArgumentException(y));
  } else if (typeof(x) == 'object') {
    return x.$shl(y);
  } else {
    $throw(new NoSuchMethodException(x, "operator <<", [y]));
  }
}
function $shl$(x, y) {
  if (typeof(x) == 'number' && typeof(y) == 'number') return x << y;
  return $shl$complex$(x, y);
}
function $truncdiv$(x, y) {
  if (typeof(x) == 'number') {
    if (typeof(y) == 'number') {
      if (y == 0) $throw(new IntegerDivisionByZeroException());
      var tmp = x / y;
      return (tmp < 0) ? Math.ceil(tmp) : Math.floor(tmp);
    } else {
      $throw(new IllegalArgumentException(y));
    }
  } else if (typeof(x) == 'object') {
    return x.$truncdiv(y);
  } else {
    $throw(new NoSuchMethodException(x, "operator ~/", [y]));
  }
}
/** Implements extends for Dart classes on JavaScript prototypes. */
function $inherits(child, parent) {
  if (child.prototype.__proto__) {
    child.prototype.__proto__ = parent.prototype;
  } else {
    function tmp() {};
    tmp.prototype = parent.prototype;
    child.prototype = new tmp();
    child.prototype.constructor = child;
  }
}
$defProp(Object.prototype, '$typeNameOf', (function() {
  function constructorNameWithFallback(obj) {
    var constructor = obj.constructor;
    if (typeof(constructor) == 'function') {
      // The constructor isn't null or undefined at this point. Try
      // to grab hold of its name.
      var name = constructor.name;
      // If the name is a non-empty string, we use that as the type
      // name of this object. On Firefox, we often get 'Object' as
      // the constructor name even for more specialized objects so
      // we have to fall through to the toString() based implementation
      // below in that case.
      if (typeof(name) == 'string' && name && name != 'Object') return name;
    }
    var string = Object.prototype.toString.call(obj);
    return string.substring(8, string.length - 1);
  }

  function chrome$typeNameOf() {
    var name = this.constructor.name;
    if (name == 'Window') return 'DOMWindow';
    if (name == 'CanvasPixelArray') return 'Uint8ClampedArray';
    return name;
  }

  function firefox$typeNameOf() {
    var name = constructorNameWithFallback(this);
    if (name == 'Window') return 'DOMWindow';
    if (name == 'Document') return 'HTMLDocument';
    if (name == 'XMLDocument') return 'Document';
    if (name == 'WorkerMessageEvent') return 'MessageEvent';
    return name;
  }

  function ie$typeNameOf() {
    var name = constructorNameWithFallback(this);
    if (name == 'Window') return 'DOMWindow';
    // IE calls both HTML and XML documents 'Document', so we check for the
    // xmlVersion property, which is the empty string on HTML documents.
    if (name == 'Document' && this.xmlVersion) return 'Document';
    if (name == 'Document') return 'HTMLDocument';
    if (name == 'HTMLTableDataCellElement') return 'HTMLTableCellElement';
    if (name == 'HTMLTableHeaderCellElement') return 'HTMLTableCellElement';
    if (name == 'MSStyleCSSProperties') return 'CSSStyleDeclaration';
    return name;
  }

  // If we're not in the browser, we're almost certainly running on v8.
  if (typeof(navigator) != 'object') return chrome$typeNameOf;

  var userAgent = navigator.userAgent;
  if (/Chrome|DumpRenderTree/.test(userAgent)) return chrome$typeNameOf;
  if (/Firefox/.test(userAgent)) return firefox$typeNameOf;
  if (/MSIE/.test(userAgent)) return ie$typeNameOf;
  return function() { return constructorNameWithFallback(this); };
})());
function $dynamic(name) {
  var f = Object.prototype[name];
  if (f && f.methods) return f.methods;

  var methods = {};
  if (f) methods.Object = f;
  function $dynamicBind() {
    // Find the target method
    var obj = this;
    var tag = obj.$typeNameOf();
    var method = methods[tag];
    if (!method) {
      var table = $dynamicMetadata;
      for (var i = 0; i < table.length; i++) {
        var entry = table[i];
        if (entry.map.hasOwnProperty(tag)) {
          method = methods[entry.tag];
          if (method) break;
        }
      }
    }
    method = method || methods.Object;

    var proto = Object.getPrototypeOf(obj);

    if (method == null) {
      // Trampoline to throw NoSuchMethodException (TODO: call noSuchMethod).
      method = function(){
        // Exact type check to prevent this code shadowing the dispatcher from a
        // subclass.
        if (Object.getPrototypeOf(this) === proto) {
          // TODO(sra): 'name' is the jsname, should be the Dart name.
          $throw(new NoSuchMethodException(
              obj, name, Array.prototype.slice.call(arguments)));
        }
        return Object.prototype[name].apply(this, arguments);
      };
    }

    if (!proto.hasOwnProperty(name)) {
      $defProp(proto, name, method);
    }

    return method.apply(this, Array.prototype.slice.call(arguments));
  };
  $dynamicBind.methods = methods;
  $defProp(Object.prototype, name, $dynamicBind);
  return methods;
}
if (typeof $dynamicMetadata == 'undefined') $dynamicMetadata = [];
Function.prototype.bind = Function.prototype.bind ||
  function(thisObj) {
    var func = this;
    var funcLength = func.$length || func.length;
    var argsLength = arguments.length;
    if (argsLength > 1) {
      var boundArgs = Array.prototype.slice.call(arguments, 1);
      var bound = function() {
        // Prepend the bound arguments to the current arguments.
        var newArgs = Array.prototype.slice.call(arguments);
        Array.prototype.unshift.apply(newArgs, boundArgs);
        return func.apply(thisObj, newArgs);
      };
      bound.$length = Math.max(0, funcLength - (argsLength - 1));
      return bound;
    } else {
      var bound = function() {
        return func.apply(thisObj, arguments);
      };
      bound.$length = funcLength;
      return bound;
    }
  };
function $dynamicSetMetadata(inputTable) {
  // TODO: Deal with light isolates.
  var table = [];
  for (var i = 0; i < inputTable.length; i++) {
    var tag = inputTable[i][0];
    var tags = inputTable[i][1];
    var map = {};
    var tagNames = tags.split('|');
    for (var j = 0; j < tagNames.length; j++) {
      map[tagNames[j]] = true;
    }
    table.push({tag: tag, tags: tags, map: map});
  }
  $dynamicMetadata = table;
}
$defProp(Object.prototype, "noSuchMethod", function(name, args) {
  $throw(new NoSuchMethodException(this, name, args));
});
$defProp(Object.prototype, "addEventListener$2", function($0, $1) {
  return this.noSuchMethod("addEventListener", [$0, $1]);
});
$defProp(Object.prototype, "is$Collection", function() {
  return false;
});
$defProp(Object.prototype, "is$List", function() {
  return false;
});
$defProp(Object.prototype, "is$Map", function() {
  return false;
});
$defProp(Object.prototype, "open$3", function($0, $1, $2) {
  return this.noSuchMethod("open", [$0, $1, $2]);
});
$defProp(Object.prototype, "send$0", function() {
  return this.noSuchMethod("send", []);
});
function Clock() {}
Clock.now = function() {
  return new Date().getTime();
}
Clock.frequency = function() {
  return (1000);
}
function IndexOutOfRangeException(_index) {
  this._index = _index;
}
IndexOutOfRangeException.prototype.is$IndexOutOfRangeException = function(){return true};
IndexOutOfRangeException.prototype.toString = function() {
  return ("IndexOutOfRangeException: " + this._index);
}
function IllegalAccessException() {

}
IllegalAccessException.prototype.toString = function() {
  return "Attempt to modify an immutable object";
}
function NoSuchMethodException(_receiver, _functionName, _arguments, _existingArgumentNames) {
  this._receiver = _receiver;
  this._functionName = _functionName;
  this._arguments = _arguments;
  this._existingArgumentNames = _existingArgumentNames;
}
NoSuchMethodException.prototype.is$NoSuchMethodException = function(){return true};
NoSuchMethodException.prototype.toString = function() {
  var sb = new StringBufferImpl("");
  for (var i = (0);
   i < this._arguments.get$length(); i++) {
    if (i > (0)) {
      sb.add(", ");
    }
    sb.add(this._arguments.$index(i));
  }
  if (null == this._existingArgumentNames) {
    return (("NoSuchMethodException : method not found: '" + this._functionName + "'\n") + ("Receiver: " + this._receiver + "\n") + ("Arguments: [" + sb + "]"));
  }
  else {
    var actualParameters = sb.toString();
    sb = new StringBufferImpl("");
    for (var i = (0);
     i < this._existingArgumentNames.get$length(); i++) {
      if (i > (0)) {
        sb.add(", ");
      }
      sb.add(this._existingArgumentNames.$index(i));
    }
    var formalParameters = sb.toString();
    return ("NoSuchMethodException: incorrect number of arguments passed to " + ("method named '" + this._functionName + "'\nReceiver: " + this._receiver + "\n") + ("Tried calling: " + this._functionName + "(" + actualParameters + ")\n") + ("Found: " + this._functionName + "(" + formalParameters + ")"));
  }
}
function ClosureArgumentMismatchException() {

}
ClosureArgumentMismatchException.prototype.toString = function() {
  return "Closure argument mismatch";
}
function IllegalArgumentException(arg) {
  this._arg = arg;
}
IllegalArgumentException.prototype.is$IllegalArgumentException = function(){return true};
IllegalArgumentException.prototype.toString = function() {
  return ("Illegal argument(s): " + this._arg);
}
function BadNumberFormatException(_s) {
  this._s = _s;
}
BadNumberFormatException.prototype.toString = function() {
  return ("BadNumberFormatException: '" + this._s + "'");
}
function NoMoreElementsException() {

}
NoMoreElementsException.prototype.toString = function() {
  return "NoMoreElementsException";
}
function EmptyQueueException() {

}
EmptyQueueException.prototype.toString = function() {
  return "EmptyQueueException";
}
function UnsupportedOperationException(_message) {
  this._message = _message;
}
UnsupportedOperationException.prototype.toString = function() {
  return ("UnsupportedOperationException: " + this._message);
}
function IntegerDivisionByZeroException() {

}
IntegerDivisionByZeroException.prototype.is$IntegerDivisionByZeroException = function(){return true};
IntegerDivisionByZeroException.prototype.toString = function() {
  return "IntegerDivisionByZeroException";
}
Function.prototype.to$call$0 = function() {
  this.call$0 = this._genStub(0);
  this.to$call$0 = function() { return this.call$0; };
  return this.call$0;
};
Function.prototype.call$0 = function() {
  return this.to$call$0()();
};
function to$call$0(f) { return f && f.to$call$0(); }
Function.prototype.to$call$1 = function() {
  this.call$1 = this._genStub(1);
  this.to$call$1 = function() { return this.call$1; };
  return this.call$1;
};
Function.prototype.call$1 = function($0) {
  return this.to$call$1()($0);
};
function to$call$1(f) { return f && f.to$call$1(); }
Function.prototype.to$call$2 = function() {
  this.call$2 = this._genStub(2);
  this.to$call$2 = function() { return this.call$2; };
  return this.call$2;
};
Function.prototype.call$2 = function($0, $1) {
  return this.to$call$2()($0, $1);
};
function to$call$2(f) { return f && f.to$call$2(); }
function print$(obj) {
  return _print(obj);
}
function _print(obj) {
  if (typeof console == 'object') {
    if (obj) obj = obj.toString();
    console.log(obj);
  } else if (typeof write === 'function') {
    write(obj);
    write('\n');
  }
}
var ListFactory = Array;
$defProp(ListFactory.prototype, "is$List", function(){return true});
$defProp(ListFactory.prototype, "is$Collection", function(){return true});
$defProp(ListFactory.prototype, "get$length", function() { return this.length; });
$defProp(ListFactory.prototype, "set$length", function(value) { return this.length = value; });
$defProp(ListFactory.prototype, "add", function(value) {
  this.push(value);
});
$defProp(ListFactory.prototype, "clear$_", function() {
  this.set$length((0));
});
$defProp(ListFactory.prototype, "removeLast", function() {
  return this.pop();
});
$defProp(ListFactory.prototype, "iterator", function() {
  return new ListIterator(this);
});
$defProp(ListFactory.prototype, "toString", function() {
  return Collections.collectionToString(this);
});
function ListIterator(array) {
  this._array = array;
  this._pos = (0);
}
ListIterator.prototype.hasNext = function() {
  return this._array.get$length() > this._pos;
}
ListIterator.prototype.next = function() {
  if (!this.hasNext()) {
    $throw(const$0001);
  }
  return this._array.$index(this._pos++);
}
$inherits(ImmutableList, ListFactory);
function ImmutableList(length) {
  Array.call(this, length);
}
ImmutableList.ImmutableList$from$factory = function(other) {
  return _constList(other);
}
ImmutableList.prototype.get$length = function() {
  return this.length;
}
ImmutableList.prototype.set$length = function(length) {
  $throw(const$0006);
}
ImmutableList.prototype.$setindex = function(index, value) {
  $throw(const$0006);
}
ImmutableList.prototype.add = function(element) {
  $throw(const$0006);
}
ImmutableList.prototype.clear$_ = function() {
  $throw(const$0006);
}
ImmutableList.prototype.removeLast = function() {
  $throw(const$0006);
}
ImmutableList.prototype.toString = function() {
  return Collections.collectionToString(this);
}
function ImmutableMap(keyValuePairs) {
  this._internal = _map(keyValuePairs);
}
ImmutableMap.prototype.is$Map = function(){return true};
ImmutableMap.prototype.$index = function(key) {
  return this._internal.$index(key);
}
ImmutableMap.prototype.get$length = function() {
  return this._internal.get$length();
}
ImmutableMap.prototype.forEach = function(f) {
  this._internal.forEach(f);
}
ImmutableMap.prototype.containsKey = function(key) {
  return this._internal.containsKey(key);
}
ImmutableMap.prototype.$setindex = function(key, value) {
  $throw(const$0006);
}
ImmutableMap.prototype.toString = function() {
  return Maps.mapToString(this);
}
function JSSyntaxRegExp(pattern, multiLine, ignoreCase) {
  JSSyntaxRegExp._create$ctor.call(this, pattern, $add$(($eq$(multiLine, true) ? "m" : ""), ($eq$(ignoreCase, true) ? "i" : "")));
}
JSSyntaxRegExp._create$ctor = function(pattern, flags) {
  this.re = new RegExp(pattern, flags);
      this.pattern = pattern;
      this.multiLine = this.re.multiline;
      this.ignoreCase = this.re.ignoreCase;
}
JSSyntaxRegExp._create$ctor.prototype = JSSyntaxRegExp.prototype;
JSSyntaxRegExp.prototype.hasMatch = function(str) {
  return this.re.test(str);
}
var NumImplementation = Number;
NumImplementation.prototype.$negate = function() {
  'use strict'; return -this;
}
NumImplementation.prototype.floor = function() {
  'use strict'; return Math.floor(this);
}
NumImplementation.prototype.hashCode = function() {
  'use strict'; return this & 0x1FFFFFFF;
}
NumImplementation.prototype.toInt = function() {
    'use strict';
    if (isNaN(this)) $throw(new BadNumberFormatException("NaN"));
    if ((this == Infinity) || (this == -Infinity)) {
      $throw(new BadNumberFormatException("Infinity"));
    }
    var truncated = (this < 0) ? Math.ceil(this) : Math.floor(this);
    if (truncated == -0.0) return 0;
    return truncated;
}
function Collections() {}
Collections.collectionToString = function(c) {
  var result = new StringBufferImpl("");
  Collections._emitCollection(c, result, new Array());
  return result.toString();
}
Collections._emitCollection = function(c, result, visiting) {
  visiting.add(c);
  var isList = !!(c && c.is$List());
  result.add(isList ? "[" : "{");
  var first = true;
  for (var $$i = c.iterator(); $$i.hasNext(); ) {
    var e = $$i.next();
    if (!first) {
      result.add(", ");
    }
    first = false;
    Collections._emitObject(e, result, visiting);
  }
  result.add(isList ? "]" : "}");
  visiting.removeLast();
}
Collections._emitObject = function(o, result, visiting) {
  if (!!(o && o.is$Collection())) {
    if (Collections._containsRef(visiting, o)) {
      result.add(!!(o && o.is$List()) ? "[...]" : "{...}");
    }
    else {
      Collections._emitCollection(o, result, visiting);
    }
  }
  else if (!!(o && o.is$Map())) {
    if (Collections._containsRef(visiting, o)) {
      result.add("{...}");
    }
    else {
      Maps._emitMap(o, result, visiting);
    }
  }
  else {
    result.add($eq$(o) ? "null" : o);
  }
}
Collections._containsRef = function(c, ref) {
  for (var $$i = c.iterator(); $$i.hasNext(); ) {
    var e = $$i.next();
    if ((null == e ? null == (ref) : e === ref)) return true;
  }
  return false;
}
function HashMapImplementation() {}
HashMapImplementation.prototype.is$Map = function(){return true};
HashMapImplementation._computeLoadLimit = function(capacity) {
  return $truncdiv$((capacity * (3)), (4));
}
HashMapImplementation._firstProbe = function(hashCode, length) {
  return hashCode & (length - (1));
}
HashMapImplementation._nextProbe = function(currentProbe, numberOfProbes, length) {
  return (currentProbe + numberOfProbes) & (length - (1));
}
HashMapImplementation.prototype._probeForAdding = function(key) {
  var hash = HashMapImplementation._firstProbe(key.hashCode(), this._keys.get$length());
  var numberOfProbes = (1);
  var initialHash = hash;
  var insertionIndex = (-1);
  while (true) {
    var existingKey = this._keys.$index(hash);
    if (null == existingKey) {
      if (insertionIndex < (0)) return hash;
      return insertionIndex;
    }
    else if ($eq$(existingKey, key)) {
      return hash;
    }
    else if ((insertionIndex < (0)) && ((null == const$0000 ? null == (existingKey) : const$0000 === existingKey))) {
      insertionIndex = hash;
    }
    hash = HashMapImplementation._nextProbe(hash, numberOfProbes++, this._keys.get$length());
  }
}
HashMapImplementation.prototype._probeForLookup = function(key) {
  var hash = HashMapImplementation._firstProbe(key.hashCode(), this._keys.get$length());
  var numberOfProbes = (1);
  var initialHash = hash;
  while (true) {
    var existingKey = this._keys.$index(hash);
    if (null == existingKey) return (-1);
    if ($eq$(existingKey, key)) return hash;
    hash = HashMapImplementation._nextProbe(hash, numberOfProbes++, this._keys.get$length());
  }
}
HashMapImplementation.prototype._ensureCapacity = function() {
  var newNumberOfEntries = this._numberOfEntries + (1);
  if (newNumberOfEntries >= this._loadLimit) {
    this._grow(this._keys.get$length() * (2));
    return;
  }
  var capacity = this._keys.get$length();
  var numberOfFreeOrDeleted = capacity - newNumberOfEntries;
  var numberOfFree = numberOfFreeOrDeleted - this._numberOfDeleted;
  if (this._numberOfDeleted > numberOfFree) {
    this._grow(this._keys.get$length());
  }
}
HashMapImplementation._isPowerOfTwo = function(x) {
  return ((x & (x - (1))) == (0));
}
HashMapImplementation.prototype._grow = function(newCapacity) {
  var capacity = this._keys.get$length();
  this._loadLimit = HashMapImplementation._computeLoadLimit(newCapacity);
  var oldKeys = this._keys;
  var oldValues = this._values;
  this._keys = new Array(newCapacity);
  this._values = new Array(newCapacity);
  for (var i = (0);
   i < capacity; i++) {
    var key = oldKeys.$index(i);
    if (null == key || (null == key ? null == (const$0000) : key === const$0000)) {
      continue;
    }
    var value = oldValues.$index(i);
    var newIndex = this._probeForAdding(key);
    this._keys.$setindex(newIndex, key);
    this._values.$setindex(newIndex, value);
  }
  this._numberOfDeleted = (0);
}
HashMapImplementation.prototype.$setindex = function(key, value) {
  var $0;
  this._ensureCapacity();
  var index = this._probeForAdding(key);
  if ((null == this._keys.$index(index)) || ((($0 = this._keys.$index(index)) == null ? null == (const$0000) : $0 === const$0000))) {
    this._numberOfEntries++;
  }
  this._keys.$setindex(index, key);
  this._values.$setindex(index, value);
}
HashMapImplementation.prototype.$index = function(key) {
  var index = this._probeForLookup(key);
  if (index < (0)) return null;
  return this._values.$index(index);
}
HashMapImplementation.prototype.get$length = function() {
  return this._numberOfEntries;
}
HashMapImplementation.prototype.forEach = function(f) {
  var length = this._keys.get$length();
  for (var i = (0);
   i < length; i++) {
    var key = this._keys.$index(i);
    if ((null != key) && ((null == key ? null != (const$0000) : key !== const$0000))) {
      f(key, this._values.$index(i));
    }
  }
}
HashMapImplementation.prototype.containsKey = function(key) {
  return (this._probeForLookup(key) != (-1));
}
HashMapImplementation.prototype.toString = function() {
  return Maps.mapToString(this);
}
$inherits(HashMapImplementation_Dynamic$DoubleLinkedQueueEntry_KeyValuePair, HashMapImplementation);
function HashMapImplementation_Dynamic$DoubleLinkedQueueEntry_KeyValuePair() {
  this._numberOfEntries = (0);
  this._numberOfDeleted = (0);
  this._loadLimit = HashMapImplementation._computeLoadLimit((8));
  this._keys = new Array((8));
  this._values = new Array((8));
}
function HashSetImplementation() {}
HashSetImplementation.prototype.is$Collection = function(){return true};
HashSetImplementation.prototype.get$length = function() {
  return this._backingMap.get$length();
}
HashSetImplementation.prototype.iterator = function() {
  return new HashSetIterator(this);
}
HashSetImplementation.prototype.toString = function() {
  return Collections.collectionToString(this);
}
function HashSetIterator(set_) {
  this._nextValidIndex = (-1);
  this._entries = set_._backingMap._keys;
  this._advance();
}
HashSetIterator.prototype.hasNext = function() {
  var $0;
  if (this._nextValidIndex >= this._entries.get$length()) return false;
  if ((($0 = this._entries.$index(this._nextValidIndex)) == null ? null == (const$0000) : $0 === const$0000)) {
    this._advance();
  }
  return this._nextValidIndex < this._entries.get$length();
}
HashSetIterator.prototype.next = function() {
  if (!this.hasNext()) {
    $throw(const$0001);
  }
  var res = this._entries.$index(this._nextValidIndex);
  this._advance();
  return res;
}
HashSetIterator.prototype._advance = function() {
  var length = this._entries.get$length();
  var entry;
  var deletedKey = const$0000;
  do {
    if (++this._nextValidIndex >= length) break;
    entry = this._entries.$index(this._nextValidIndex);
  }
  while ((null == entry) || ((null == entry ? null == (deletedKey) : entry === deletedKey)))
}
function _DeletedKeySentinel() {

}
function KeyValuePair(key, value) {
  this.key$_ = key;
  this.value = value;
}
KeyValuePair.prototype.get$value = function() { return this.value; };
KeyValuePair.prototype.set$value = function(value) { return this.value = value; };
function LinkedHashMapImplementation() {
  this._map = new HashMapImplementation_Dynamic$DoubleLinkedQueueEntry_KeyValuePair();
  this._list = new DoubleLinkedQueue_KeyValuePair();
}
LinkedHashMapImplementation.prototype.is$Map = function(){return true};
LinkedHashMapImplementation.prototype.$setindex = function(key, value) {
  if (this._map.containsKey(key)) {
    this._map.$index(key).get$element().set$value(value);
  }
  else {
    this._list.addLast(new KeyValuePair(key, value));
    this._map.$setindex(key, this._list.lastEntry());
  }
}
LinkedHashMapImplementation.prototype.$index = function(key) {
  var entry = this._map.$index(key);
  if (null == entry) return null;
  return entry.get$element().get$value();
}
LinkedHashMapImplementation.prototype.forEach = function(f) {
  this._list.forEach(function _(entry) {
    f(entry.key$_, entry.value);
  }
  );
}
LinkedHashMapImplementation.prototype.containsKey = function(key) {
  return this._map.containsKey(key);
}
LinkedHashMapImplementation.prototype.get$length = function() {
  return this._map.get$length();
}
LinkedHashMapImplementation.prototype.toString = function() {
  return Maps.mapToString(this);
}
function Maps() {}
Maps.mapToString = function(m) {
  var result = new StringBufferImpl("");
  Maps._emitMap(m, result, new Array());
  return result.toString();
}
Maps._emitMap = function(m, result, visiting) {
  visiting.add(m);
  result.add("{");
  var first = true;
  m.forEach((function (k, v) {
    if (!first) {
      result.add(", ");
    }
    first = false;
    Collections._emitObject(k, result, visiting);
    result.add(": ");
    Collections._emitObject(v, result, visiting);
  })
  );
  result.add("}");
  visiting.removeLast();
}
function DoubleLinkedQueueEntry(e) {
  this._element = e;
}
DoubleLinkedQueueEntry.prototype._link = function(p, n) {
  this._next = n;
  this._previous = p;
  p._next = this;
  n._previous = this;
}
DoubleLinkedQueueEntry.prototype.prepend = function(e) {
  new DoubleLinkedQueueEntry(e)._link(this._previous, this);
}
DoubleLinkedQueueEntry.prototype._asNonSentinelEntry = function() {
  return this;
}
DoubleLinkedQueueEntry.prototype.previousEntry = function() {
  return this._previous._asNonSentinelEntry();
}
DoubleLinkedQueueEntry.prototype.get$element = function() {
  return this._element;
}
$inherits(DoubleLinkedQueueEntry_KeyValuePair, DoubleLinkedQueueEntry);
function DoubleLinkedQueueEntry_KeyValuePair(e) {
  this._element = e;
}
$inherits(_DoubleLinkedQueueEntrySentinel, DoubleLinkedQueueEntry);
function _DoubleLinkedQueueEntrySentinel() {}
_DoubleLinkedQueueEntrySentinel.prototype._asNonSentinelEntry = function() {
  return null;
}
_DoubleLinkedQueueEntrySentinel.prototype.get$element = function() {
  $throw(const$0005);
}
$inherits(_DoubleLinkedQueueEntrySentinel_KeyValuePair, _DoubleLinkedQueueEntrySentinel);
function _DoubleLinkedQueueEntrySentinel_KeyValuePair() {
  DoubleLinkedQueueEntry_KeyValuePair.call(this, null);
  this._link(this, this);
}
function DoubleLinkedQueue() {}
DoubleLinkedQueue.prototype.is$Collection = function(){return true};
DoubleLinkedQueue.prototype.addLast = function(value) {
  this._sentinel.prepend(value);
}
DoubleLinkedQueue.prototype.lastEntry = function() {
  return this._sentinel.previousEntry();
}
DoubleLinkedQueue.prototype.get$length = function() {
  var counter = (0);
  this.forEach(function _(element) {
    counter++;
  }
  );
  return counter;
}
DoubleLinkedQueue.prototype.forEach = function(f) {
  var entry = this._sentinel._next;
  while ((null == entry ? null != (this._sentinel) : entry !== this._sentinel)) {
    var nextEntry = entry._next;
    f(entry._element);
    entry = nextEntry;
  }
}
DoubleLinkedQueue.prototype.iterator = function() {
  return new _DoubleLinkedQueueIterator(this._sentinel);
}
DoubleLinkedQueue.prototype.toString = function() {
  return Collections.collectionToString(this);
}
$inherits(DoubleLinkedQueue_KeyValuePair, DoubleLinkedQueue);
function DoubleLinkedQueue_KeyValuePair() {
  this._sentinel = new _DoubleLinkedQueueEntrySentinel_KeyValuePair();
}
function _DoubleLinkedQueueIterator(_sentinel) {
  this._sentinel = _sentinel;
  this._currentEntry = this._sentinel;
}
_DoubleLinkedQueueIterator.prototype.hasNext = function() {
  var $0;
  return (($0 = this._currentEntry._next) == null ? null != (this._sentinel) : $0 !== this._sentinel);
}
_DoubleLinkedQueueIterator.prototype.next = function() {
  if (!this.hasNext()) {
    $throw(const$0001);
  }
  this._currentEntry = this._currentEntry._next;
  return this._currentEntry.get$element();
}
function StringBufferImpl(content) {
  this.clear$_();
  this.add(content);
}
StringBufferImpl.prototype.get$length = function() {
  return this._length;
}
StringBufferImpl.prototype.add = function(obj) {
  var str = obj.toString();
  if (null == str || str.isEmpty()) return this;
  this._buffer.add(str);
  this._length = this._length + str.length;
  return this;
}
StringBufferImpl.prototype.clear$_ = function() {
  this._buffer = new Array();
  this._length = (0);
  return this;
}
StringBufferImpl.prototype.toString = function() {
  if (this._buffer.get$length() == (0)) return "";
  if (this._buffer.get$length() == (1)) return this._buffer.$index((0));
  var result = StringBase.concatAll(this._buffer);
  this._buffer.clear$_();
  this._buffer.add(result);
  return result;
}
function StringBase() {}
StringBase.join = function(strings, separator) {
  if (strings.get$length() == (0)) return "";
  var s = strings.$index((0));
  for (var i = (1);
   i < strings.get$length(); i++) {
    s = $add$($add$(s, separator), strings.$index(i));
  }
  return s;
}
StringBase.concatAll = function(strings) {
  return StringBase.join(strings, "");
}
var StringImplementation = String;
StringImplementation.prototype.get$length = function() { return this.length; };
StringImplementation.prototype.isEmpty = function() {
  return this.length == (0);
}
StringImplementation.prototype.hashCode = function() {
      'use strict';
      var hash = 0;
      for (var i = 0; i < this.length; i++) {
        hash = 0x1fffffff & (hash + this.charCodeAt(i));
        hash = 0x1fffffff & (hash + ((0x0007ffff & hash) << 10));
        hash ^= hash >> 6;
      }

      hash = 0x1fffffff & (hash + ((0x03ffffff & hash) << 3));
      hash ^= hash >> 11;
      return 0x1fffffff & (hash + ((0x00003fff & hash) << 15));
}
$inherits(_ArgumentMismatchException, ClosureArgumentMismatchException);
function _ArgumentMismatchException(_message) {
  this._dart_coreimpl_message = _message;
  ClosureArgumentMismatchException.call(this);
}
_ArgumentMismatchException.prototype.toString = function() {
  return ("Closure argument mismatch: " + this._dart_coreimpl_message);
}
var _FunctionImplementation = Function;
_FunctionImplementation.prototype._genStub = function(argsLength, names) {
      // Fast path #1: if no named arguments and arg count matches.
      var thisLength = this.$length || this.length;
      if (thisLength == argsLength && !names) {
        return this;
      }

      var paramsNamed = this.$optional ? (this.$optional.length / 2) : 0;
      var paramsBare = thisLength - paramsNamed;
      var argsNamed = names ? names.length : 0;
      var argsBare = argsLength - argsNamed;

      // Check we got the right number of arguments
      if (argsBare < paramsBare || argsLength > thisLength ||
          argsNamed > paramsNamed) {
        return function() {
          $throw(new _ArgumentMismatchException(
            'Wrong number of arguments to function. Expected ' + paramsBare +
            ' positional arguments and at most ' + paramsNamed +
            ' named arguments, but got ' + argsBare +
            ' positional arguments and ' + argsNamed + ' named arguments.'));
        };
      }

      // First, fill in all of the default values
      var p = new Array(paramsBare);
      if (paramsNamed) {
        p = p.concat(this.$optional.slice(paramsNamed));
      }
      // Fill in positional args
      var a = new Array(argsLength);
      for (var i = 0; i < argsBare; i++) {
        p[i] = a[i] = '$' + i;
      }
      // Then overwrite with supplied values for optional args
      var lastParameterIndex;
      var namesInOrder = true;
      for (var i = 0; i < argsNamed; i++) {
        var name = names[i];
        a[i + argsBare] = name;
        var j = this.$optional.indexOf(name);
        if (j < 0 || j >= paramsNamed) {
          return function() {
            $throw(new _ArgumentMismatchException(
              'Named argument "' + name + '" was not expected by function.' +
              ' Did you forget to mark the function parameter [optional]?'));
          };
        } else if (lastParameterIndex && lastParameterIndex > j) {
          namesInOrder = false;
        }
        p[j + paramsBare] = name;
        lastParameterIndex = j;
      }

      if (thisLength == argsLength && namesInOrder) {
        // Fast path #2: named arguments, but they're in order and all supplied.
        return this;
      }

      // Note: using Function instead of 'eval' to get a clean scope.
      // TODO(jmesserly): evaluate the performance of these stubs.
      var f = 'function(' + a.join(',') + '){return $f(' + p.join(',') + ');}';
      return new Function('$f', 'return ' + f + '').call(null, this);
    
}
function _constList(other) {
    other.__proto__ = ImmutableList.prototype;
    return other;
}
function _map(itemsAndKeys) {
  var ret = new LinkedHashMapImplementation();
  for (var i = (0);
   i < itemsAndKeys.get$length(); ) {
    ret.$setindex(itemsAndKeys.$index(i++), itemsAndKeys.$index(i++));
  }
  return ret;
}
function _constMap(itemsAndKeys) {
  return new ImmutableMap(itemsAndKeys);
}
$dynamic("get$nodes").Node = function() {
  return new _ChildNodeListLazy(this);
}
$dynamic("get$$$dom_attributes").Node = function() {
  return this.attributes;
}
$dynamic("get$$$dom_childNodes").Node = function() {
  return this.childNodes;
}
$dynamic("set$text").Node = function(value) {
  this.textContent = value;
}
$dynamic("get$attributes").Element = function() {
  return new _ElementAttributeMap(this);
}
$dynamic("get$on").Element = function() {
  return new _ElementEventsImpl(this);
}
$dynamic("get$name").HTMLAnchorElement = function() { return this.name; };
$dynamic("get$name").WebKitAnimation = function() { return this.name; };
$dynamic("get$length").WebKitAnimationList = function() { return this.length; };
$dynamic("get$name").HTMLAppletElement = function() { return this.name; };
$dynamic("get$name").Attr = function() { return this.name; };
$dynamic("get$value").Attr = function() { return this.value; };
$dynamic("set$value").Attr = function(value) { return this.value = value; };
$dynamic("get$length").AudioBuffer = function() { return this.length; };
$dynamic("get$on").HTMLMediaElement = function() {
  return new _MediaElementEventsImpl(this);
}
$dynamic("get$name").AudioParam = function() { return this.name; };
$dynamic("get$value").AudioParam = function() { return this.value; };
$dynamic("set$value").AudioParam = function(value) { return this.value = value; };
$dynamic("get$on").HTMLBodyElement = function() {
  return new _BodyElementEventsImpl(this);
}
function _EventsImpl(_ptr) {
  this._ptr = _ptr;
}
_EventsImpl.prototype.$index = function(type) {
  return this._get(type.toLowerCase());
}
_EventsImpl.prototype._get = function(type) {
  return new _EventListenerListImpl(this._ptr, type);
}
$inherits(_ElementEventsImpl, _EventsImpl);
function _ElementEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
_ElementEventsImpl.prototype.get$keyDown = function() {
  return this._get("keydown");
}
$inherits(_BodyElementEventsImpl, _ElementEventsImpl);
function _BodyElementEventsImpl(_ptr) {
  _ElementEventsImpl.call(this, _ptr);
}
$dynamic("get$name").HTMLButtonElement = function() { return this.name; };
$dynamic("get$value").HTMLButtonElement = function() { return this.value; };
$dynamic("set$value").HTMLButtonElement = function(value) { return this.value = value; };
$dynamic("get$length").CharacterData = function() { return this.length; };
$dynamic("get$name").WebKitCSSKeyframesRule = function() { return this.name; };
$dynamic("get$length").CSSRuleList = function() { return this.length; };
$dynamic("get$length").CSSStyleDeclaration = function() { return this.length; };
$dynamic("get$length").CSSValueList = function() { return this.length; };
$dynamic("get$length").ClientRectList = function() { return this.length; };
$dynamic("get$name").DOMException = function() { return this.name; };
$dynamic("get$name").DOMFileSystem = function() { return this.name; };
$dynamic("get$name").DOMFileSystemSync = function() { return this.name; };
$dynamic("get$length").DOMMimeTypeArray = function() { return this.length; };
$dynamic("get$length").DOMPlugin = function() { return this.length; };
$dynamic("get$name").DOMPlugin = function() { return this.name; };
$dynamic("get$length").DOMPluginArray = function() { return this.length; };
$dynamic("get$length").DOMTokenList = function() { return this.length; };
$dynamic("get$value").DOMSettableTokenList = function() { return this.value; };
$dynamic("set$value").DOMSettableTokenList = function(value) { return this.value = value; };
$dynamic("is$List").DOMStringList = function(){return true};
$dynamic("is$Collection").DOMStringList = function(){return true};
$dynamic("get$length").DOMStringList = function() { return this.length; };
$dynamic("$index").DOMStringList = function(index) {
  return this[index];
}
$dynamic("$setindex").DOMStringList = function(index, value) {
  $throw(new UnsupportedOperationException("Cannot assign element of immutable List."));
}
$dynamic("iterator").DOMStringList = function() {
  return new _FixedSizeListIterator_dart_core_String(this);
}
$dynamic("add").DOMStringList = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("removeLast").DOMStringList = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("get$length").DataTransferItemList = function() { return this.length; };
$dynamic("get$name").Entry = function() { return this.name; };
$dynamic("get$name").EntrySync = function() { return this.name; };
$dynamic("query").HTMLDocument = function(selectors) {
  if (const$0004.hasMatch(selectors)) {
    return this.getElementById(selectors.substring((1)));
  }
  return this.$dom_querySelector(selectors);
}
$dynamic("$dom_querySelector").HTMLDocument = function(selectors) {
  return this.querySelector(selectors);
}
$dynamic("get$attributes").DocumentFragment = function() {
  return const$0007;
}
$dynamic("focus").DocumentFragment = function() {

}
$dynamic("get$name").DocumentType = function() { return this.name; };
function _ElementAttributeMap(_element) {
  this._html_element = _element;
}
_ElementAttributeMap.prototype.is$Map = function(){return true};
_ElementAttributeMap.prototype.containsKey = function(key) {
  return this._html_element.hasAttribute(key);
}
_ElementAttributeMap.prototype.$index = function(key) {
  return this._html_element.getAttribute(key);
}
_ElementAttributeMap.prototype.$setindex = function(key, value) {
  this._html_element.setAttribute(key, ("" + value));
}
_ElementAttributeMap.prototype.forEach = function(f) {
  var attributes = this._html_element.get$$$dom_attributes();
  for (var i = (0), len = attributes.get$length();
   i < len; i++) {
    var item = attributes.$index(i);
    f(item.get$name(), item.get$value());
  }
}
_ElementAttributeMap.prototype.get$length = function() {
  return this._html_element.get$$$dom_attributes().length;
}
function _ElementFactoryProvider() {}
_ElementFactoryProvider.Element$tag$factory = function(tag) {
  return document.createElement(tag)
}
$dynamic("get$name").HTMLEmbedElement = function() { return this.name; };
$dynamic("get$length").EntryArray = function() { return this.length; };
$dynamic("get$length").EntryArraySync = function() { return this.length; };
$dynamic("get$name").EventException = function() { return this.name; };
function _EventListenerListImpl(_ptr, _type) {
  this._ptr = _ptr;
  this._type = _type;
}
_EventListenerListImpl.prototype.add = function(listener, useCapture) {
  this._add(listener, useCapture);
  return this;
}
_EventListenerListImpl.prototype._add = function(listener, useCapture) {
  this._ptr.addEventListener(this._type, listener, useCapture);
}
$dynamic("get$name").HTMLFieldSetElement = function() { return this.name; };
$dynamic("get$name").File = function() { return this.name; };
$dynamic("get$name").FileException = function() { return this.name; };
$dynamic("get$length").FileList = function() { return this.length; };
$dynamic("get$length").FileWriter = function() { return this.length; };
$dynamic("get$length").FileWriterSync = function() { return this.length; };
$dynamic("is$List").Float32Array = function(){return true};
$dynamic("is$Collection").Float32Array = function(){return true};
$dynamic("get$length").Float32Array = function() { return this.length; };
$dynamic("$index").Float32Array = function(index) {
  return this[index];
}
$dynamic("$setindex").Float32Array = function(index, value) {
  this[index] = value
}
$dynamic("iterator").Float32Array = function() {
  return new _FixedSizeListIterator_num(this);
}
$dynamic("add").Float32Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("removeLast").Float32Array = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("is$List").Float64Array = function(){return true};
$dynamic("is$Collection").Float64Array = function(){return true};
$dynamic("get$length").Float64Array = function() { return this.length; };
$dynamic("$index").Float64Array = function(index) {
  return this[index];
}
$dynamic("$setindex").Float64Array = function(index, value) {
  this[index] = value
}
$dynamic("iterator").Float64Array = function() {
  return new _FixedSizeListIterator_num(this);
}
$dynamic("add").Float64Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("removeLast").Float64Array = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("get$length").HTMLFormElement = function() { return this.length; };
$dynamic("get$name").HTMLFormElement = function() { return this.name; };
$dynamic("get$name").HTMLFrameElement = function() { return this.name; };
$dynamic("get$on").HTMLFrameSetElement = function() {
  return new _FrameSetElementEventsImpl(this);
}
$inherits(_FrameSetElementEventsImpl, _ElementEventsImpl);
function _FrameSetElementEventsImpl(_ptr) {
  _ElementEventsImpl.call(this, _ptr);
}
$dynamic("get$length").HTMLAllCollection = function() { return this.length; };
$dynamic("is$List").HTMLCollection = function(){return true};
$dynamic("is$Collection").HTMLCollection = function(){return true};
$dynamic("get$length").HTMLCollection = function() { return this.length; };
$dynamic("$index").HTMLCollection = function(index) {
  return this[index];
}
$dynamic("$setindex").HTMLCollection = function(index, value) {
  $throw(new UnsupportedOperationException("Cannot assign element of immutable List."));
}
$dynamic("iterator").HTMLCollection = function() {
  return new _FixedSizeListIterator_html_Node(this);
}
$dynamic("add").HTMLCollection = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("removeLast").HTMLCollection = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("get$length").HTMLOptionsCollection = function() {
  return this.length;
}
$dynamic("get$length").History = function() { return this.length; };
$dynamic("get$value").IDBCursorWithValue = function() { return this.value; };
$dynamic("get$name").IDBDatabase = function() { return this.name; };
$dynamic("get$name").IDBDatabaseException = function() { return this.name; };
$dynamic("get$name").IDBIndex = function() { return this.name; };
$dynamic("get$name").IDBObjectStore = function() { return this.name; };
$dynamic("get$name").HTMLIFrameElement = function() { return this.name; };
$dynamic("get$name").HTMLImageElement = function() { return this.name; };
$dynamic("get$on").HTMLInputElement = function() {
  return new _InputElementEventsImpl(this);
}
$dynamic("get$name").HTMLInputElement = function() { return this.name; };
$dynamic("get$value").HTMLInputElement = function() { return this.value; };
$dynamic("set$value").HTMLInputElement = function(value) { return this.value = value; };
$inherits(_InputElementEventsImpl, _ElementEventsImpl);
function _InputElementEventsImpl(_ptr) {
  _ElementEventsImpl.call(this, _ptr);
}
$dynamic("is$List").Int16Array = function(){return true};
$dynamic("is$Collection").Int16Array = function(){return true};
$dynamic("get$length").Int16Array = function() { return this.length; };
$dynamic("$index").Int16Array = function(index) {
  return this[index];
}
$dynamic("$setindex").Int16Array = function(index, value) {
  this[index] = value
}
$dynamic("iterator").Int16Array = function() {
  return new _FixedSizeListIterator_int(this);
}
$dynamic("add").Int16Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("removeLast").Int16Array = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("is$List").Int32Array = function(){return true};
$dynamic("is$Collection").Int32Array = function(){return true};
$dynamic("get$length").Int32Array = function() { return this.length; };
$dynamic("$index").Int32Array = function(index) {
  return this[index];
}
$dynamic("$setindex").Int32Array = function(index, value) {
  this[index] = value
}
$dynamic("iterator").Int32Array = function() {
  return new _FixedSizeListIterator_int(this);
}
$dynamic("add").Int32Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("removeLast").Int32Array = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("is$List").Int8Array = function(){return true};
$dynamic("is$Collection").Int8Array = function(){return true};
$dynamic("get$length").Int8Array = function() { return this.length; };
$dynamic("$index").Int8Array = function(index) {
  return this[index];
}
$dynamic("$setindex").Int8Array = function(index, value) {
  this[index] = value
}
$dynamic("iterator").Int8Array = function() {
  return new _FixedSizeListIterator_int(this);
}
$dynamic("add").Int8Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("removeLast").Int8Array = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("get$name").HTMLKeygenElement = function() { return this.name; };
$dynamic("get$value").HTMLLIElement = function() { return this.value; };
$dynamic("set$value").HTMLLIElement = function(value) { return this.value = value; };
$dynamic("get$name").HTMLMapElement = function() { return this.name; };
$inherits(_MediaElementEventsImpl, _ElementEventsImpl);
function _MediaElementEventsImpl(_ptr) {
  _ElementEventsImpl.call(this, _ptr);
}
$dynamic("is$List").MediaList = function(){return true};
$dynamic("is$Collection").MediaList = function(){return true};
$dynamic("get$length").MediaList = function() { return this.length; };
$dynamic("$index").MediaList = function(index) {
  return this[index];
}
$dynamic("$setindex").MediaList = function(index, value) {
  $throw(new UnsupportedOperationException("Cannot assign element of immutable List."));
}
$dynamic("iterator").MediaList = function() {
  return new _FixedSizeListIterator_dart_core_String(this);
}
$dynamic("add").MediaList = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("removeLast").MediaList = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("get$length").MediaStreamList = function() { return this.length; };
$dynamic("get$length").MediaStreamTrackList = function() { return this.length; };
$dynamic("get$name").HTMLMetaElement = function() { return this.name; };
$dynamic("get$value").HTMLMeterElement = function() { return this.value; };
$dynamic("set$value").HTMLMeterElement = function(value) { return this.value = value; };
$dynamic("is$List").NamedNodeMap = function(){return true};
$dynamic("is$Collection").NamedNodeMap = function(){return true};
$dynamic("get$length").NamedNodeMap = function() { return this.length; };
$dynamic("$index").NamedNodeMap = function(index) {
  return this[index];
}
$dynamic("$setindex").NamedNodeMap = function(index, value) {
  $throw(new UnsupportedOperationException("Cannot assign element of immutable List."));
}
$dynamic("iterator").NamedNodeMap = function() {
  return new _FixedSizeListIterator_html_Node(this);
}
$dynamic("add").NamedNodeMap = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("removeLast").NamedNodeMap = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
function _ChildNodeListLazy(_this) {
  this._this = _this;
}
_ChildNodeListLazy.prototype.is$List = function(){return true};
_ChildNodeListLazy.prototype.is$Collection = function(){return true};
_ChildNodeListLazy.prototype.last = function() {
  return this._this.lastChild;
}
_ChildNodeListLazy.prototype.add = function(value) {
  this._this.appendChild(value);
}
_ChildNodeListLazy.prototype.removeLast = function() {
  var result = this.last();
  if ($ne$(result)) {
    this._this.removeChild(result);
  }
  return result;
}
_ChildNodeListLazy.prototype.clear$_ = function() {
  this._this.set$text("");
}
_ChildNodeListLazy.prototype.$setindex = function(index, value) {
  this._this.replaceChild(value, this.$index(index));
}
_ChildNodeListLazy.prototype.iterator = function() {
  return this._this.get$$$dom_childNodes().iterator();
}
_ChildNodeListLazy.prototype.get$length = function() {
  return this._this.get$$$dom_childNodes().length;
}
_ChildNodeListLazy.prototype.$index = function(index) {
  return this._this.get$$$dom_childNodes().$index(index);
}
function _ListWrapper() {}
_ListWrapper.prototype.is$List = function(){return true};
_ListWrapper.prototype.is$Collection = function(){return true};
_ListWrapper.prototype.iterator = function() {
  return this._html_list.iterator();
}
_ListWrapper.prototype.get$length = function() {
  return this._html_list.get$length();
}
_ListWrapper.prototype.$index = function(index) {
  return this._html_list.$index(index);
}
_ListWrapper.prototype.$setindex = function(index, value) {
  this._html_list.$setindex(index, value);
}
_ListWrapper.prototype.add = function(value) {
  return this._html_list.add(value);
}
_ListWrapper.prototype.clear$_ = function() {
  return this._html_list.clear$_();
}
_ListWrapper.prototype.removeLast = function() {
  return this._html_list.removeLast();
}
$dynamic("is$List").NodeList = function(){return true};
$dynamic("is$Collection").NodeList = function(){return true};
$dynamic("iterator").NodeList = function() {
  return new _FixedSizeListIterator_html_Node(this);
}
$dynamic("add").NodeList = function(value) {
  this._parent.appendChild(value);
}
$dynamic("removeLast").NodeList = function() {
  var result = this.last();
  if ($ne$(result)) {
    this._parent.removeChild(result);
  }
  return result;
}
$dynamic("clear$_").NodeList = function() {
  this._parent.set$text("");
}
$dynamic("$setindex").NodeList = function(index, value) {
  this._parent.replaceChild(value, this.$index(index));
}
$dynamic("last").NodeList = function() {
  return this.$index(this.length - (1));
}
$dynamic("get$length").NodeList = function() { return this.length; };
$dynamic("$index").NodeList = function(index) {
  return this[index];
}
$dynamic("get$name").HTMLObjectElement = function() { return this.name; };
$dynamic("get$name").OperationNotAllowedException = function() { return this.name; };
$dynamic("get$value").HTMLOptionElement = function() { return this.value; };
$dynamic("set$value").HTMLOptionElement = function(value) { return this.value = value; };
$dynamic("get$name").HTMLOutputElement = function() { return this.name; };
$dynamic("get$value").HTMLOutputElement = function() { return this.value; };
$dynamic("set$value").HTMLOutputElement = function(value) { return this.value = value; };
$dynamic("get$name").HTMLParamElement = function() { return this.name; };
$dynamic("get$value").HTMLParamElement = function() { return this.value; };
$dynamic("set$value").HTMLParamElement = function(value) { return this.value = value; };
$dynamic("get$value").HTMLProgressElement = function() { return this.value; };
$dynamic("set$value").HTMLProgressElement = function(value) { return this.value = value; };
$dynamic("get$name").RangeException = function() { return this.name; };
$dynamic("get$length").SQLResultSetRowList = function() { return this.length; };
$dynamic("get$value").SVGAngle = function() { return this.value; };
$dynamic("set$value").SVGAngle = function(value) { return this.value = value; };
$dynamic("addEventListener$2").SVGElementInstance = function($0, $1) {
  return this.addEventListener($0, to$call$1($1));
};
$dynamic("get$length").SVGElementInstanceList = function() { return this.length; };
$dynamic("get$name").SVGException = function() { return this.name; };
$dynamic("get$value").SVGLength = function() { return this.value; };
$dynamic("set$value").SVGLength = function(value) { return this.value = value; };
$dynamic("get$value").SVGNumber = function() { return this.value; };
$dynamic("set$value").SVGNumber = function(value) { return this.value = value; };
$dynamic("get$length").HTMLSelectElement = function() { return this.length; };
$dynamic("get$name").HTMLSelectElement = function() { return this.name; };
$dynamic("get$value").HTMLSelectElement = function() { return this.value; };
$dynamic("set$value").HTMLSelectElement = function(value) { return this.value = value; };
$dynamic("get$name").SharedWorkerContext = function() { return this.name; };
$dynamic("get$length").SpeechGrammarList = function() { return this.length; };
$dynamic("get$length").SpeechInputResultList = function() { return this.length; };
$dynamic("get$length").SpeechRecognitionResult = function() { return this.length; };
$dynamic("get$length").SpeechRecognitionResultList = function() { return this.length; };
$dynamic("is$Map").Storage = function(){return true};
$dynamic("containsKey").Storage = function(key) {
  return this.getItem(key) != null;
}
$dynamic("$index").Storage = function(key) {
  return this.getItem(key);
}
$dynamic("$setindex").Storage = function(key, value) {
  return this.setItem(key, value);
}
$dynamic("forEach").Storage = function(f) {
  for (var i = (0);
   true; i = $add$(i, (1))) {
    var key = this.key(i);
    if ($eq$(key)) return;
    f(key, this.$index(key));
  }
}
$dynamic("get$length").Storage = function() {
  return this.get$$$dom_length();
}
$dynamic("get$$$dom_length").Storage = function() {
  return this.length;
}
$dynamic("is$List").StyleSheetList = function(){return true};
$dynamic("is$Collection").StyleSheetList = function(){return true};
$dynamic("get$length").StyleSheetList = function() { return this.length; };
$dynamic("$index").StyleSheetList = function(index) {
  return this[index];
}
$dynamic("$setindex").StyleSheetList = function(index, value) {
  $throw(new UnsupportedOperationException("Cannot assign element of immutable List."));
}
$dynamic("iterator").StyleSheetList = function() {
  return new _FixedSizeListIterator_html_StyleSheet(this);
}
$dynamic("add").StyleSheetList = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("removeLast").StyleSheetList = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("get$name").HTMLTextAreaElement = function() { return this.name; };
$dynamic("get$value").HTMLTextAreaElement = function() { return this.value; };
$dynamic("set$value").HTMLTextAreaElement = function(value) { return this.value = value; };
$dynamic("get$length").TextTrackCueList = function() { return this.length; };
$dynamic("get$length").TextTrackList = function() { return this.length; };
$dynamic("get$length").TimeRanges = function() { return this.length; };
$dynamic("is$List").TouchList = function(){return true};
$dynamic("is$Collection").TouchList = function(){return true};
$dynamic("get$length").TouchList = function() { return this.length; };
$dynamic("$index").TouchList = function(index) {
  return this[index];
}
$dynamic("$setindex").TouchList = function(index, value) {
  $throw(new UnsupportedOperationException("Cannot assign element of immutable List."));
}
$dynamic("iterator").TouchList = function() {
  return new _FixedSizeListIterator_html_Touch(this);
}
$dynamic("add").TouchList = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("removeLast").TouchList = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("is$List").Uint16Array = function(){return true};
$dynamic("is$Collection").Uint16Array = function(){return true};
$dynamic("get$length").Uint16Array = function() { return this.length; };
$dynamic("$index").Uint16Array = function(index) {
  return this[index];
}
$dynamic("$setindex").Uint16Array = function(index, value) {
  this[index] = value
}
$dynamic("iterator").Uint16Array = function() {
  return new _FixedSizeListIterator_int(this);
}
$dynamic("add").Uint16Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("removeLast").Uint16Array = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("is$List").Uint32Array = function(){return true};
$dynamic("is$Collection").Uint32Array = function(){return true};
$dynamic("get$length").Uint32Array = function() { return this.length; };
$dynamic("$index").Uint32Array = function(index) {
  return this[index];
}
$dynamic("$setindex").Uint32Array = function(index, value) {
  this[index] = value
}
$dynamic("iterator").Uint32Array = function() {
  return new _FixedSizeListIterator_int(this);
}
$dynamic("add").Uint32Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("removeLast").Uint32Array = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("is$List").Uint8Array = function(){return true};
$dynamic("is$Collection").Uint8Array = function(){return true};
$dynamic("get$length").Uint8Array = function() { return this.length; };
$dynamic("$index").Uint8Array = function(index) {
  return this[index];
}
$dynamic("$setindex").Uint8Array = function(index, value) {
  this[index] = value
}
$dynamic("iterator").Uint8Array = function() {
  return new _FixedSizeListIterator_int(this);
}
$dynamic("add").Uint8Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("removeLast").Uint8Array = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("get$name").WebGLActiveInfo = function() { return this.name; };
$dynamic("get$length").DOMWindow = function() { return this.length; };
$dynamic("get$name").DOMWindow = function() { return this.name; };
$dynamic("open$3").DOMWindow = function($0, $1, $2) {
  return this.open($0, $1, $2);
};
$dynamic("get$response").XMLHttpRequest = function() { return this.response; };
$dynamic("set$responseType").XMLHttpRequest = function(value) { return this.responseType = value; };
$dynamic("open$3").XMLHttpRequest = function($0, $1, $2) {
  return this.open($0, $1, $2);
};
$dynamic("send$0").XMLHttpRequest = function() {
  return this.send();
};
$dynamic("get$name").XMLHttpRequestException = function() { return this.name; };
$dynamic("get$name").XPathException = function() { return this.name; };
function _XMLHttpRequestFactoryProvider() {}
_XMLHttpRequestFactoryProvider.XMLHttpRequest$factory = function() {
  return new XMLHttpRequest();
}
function _TypedArrayFactoryProvider() {}
_TypedArrayFactoryProvider.Uint8Array$fromBuffer$factory = function(buffer, byteOffset, length) {
  if (length == null) return _TypedArrayFactoryProvider._U8_2(buffer, byteOffset);
  return _TypedArrayFactoryProvider._U8_3(buffer, byteOffset, length);
}
_TypedArrayFactoryProvider._U8_2 = function(arg1, arg2) {
  return new Uint8Array(arg1, arg2);
}
_TypedArrayFactoryProvider._U8_3 = function(arg1, arg2, arg3) {
  return new Uint8Array(arg1, arg2, arg3);
}
function _VariableSizeListIterator() {}
_VariableSizeListIterator.prototype.hasNext = function() {
  return this._html_array.get$length() > this._html_pos;
}
_VariableSizeListIterator.prototype.next = function() {
  if (!this.hasNext()) {
    $throw(const$0001);
  }
  return this._html_array.$index(this._html_pos++);
}
$inherits(_FixedSizeListIterator, _VariableSizeListIterator);
function _FixedSizeListIterator() {}
_FixedSizeListIterator.prototype.hasNext = function() {
  return this._html_length > this._html_pos;
}
$inherits(_VariableSizeListIterator_dart_core_String, _VariableSizeListIterator);
function _VariableSizeListIterator_dart_core_String(array) {
  this._html_array = array;
  this._html_pos = (0);
}
$inherits(_FixedSizeListIterator_dart_core_String, _FixedSizeListIterator);
function _FixedSizeListIterator_dart_core_String(array) {
  this._html_length = array.get$length();
  _VariableSizeListIterator_dart_core_String.call(this, array);
}
$inherits(_VariableSizeListIterator_int, _VariableSizeListIterator);
function _VariableSizeListIterator_int(array) {
  this._html_array = array;
  this._html_pos = (0);
}
$inherits(_FixedSizeListIterator_int, _FixedSizeListIterator);
function _FixedSizeListIterator_int(array) {
  this._html_length = array.get$length();
  _VariableSizeListIterator_int.call(this, array);
}
$inherits(_VariableSizeListIterator_num, _VariableSizeListIterator);
function _VariableSizeListIterator_num(array) {
  this._html_array = array;
  this._html_pos = (0);
}
$inherits(_FixedSizeListIterator_num, _FixedSizeListIterator);
function _FixedSizeListIterator_num(array) {
  this._html_length = array.get$length();
  _VariableSizeListIterator_num.call(this, array);
}
$inherits(_VariableSizeListIterator_html_Node, _VariableSizeListIterator);
function _VariableSizeListIterator_html_Node(array) {
  this._html_array = array;
  this._html_pos = (0);
}
$inherits(_FixedSizeListIterator_html_Node, _FixedSizeListIterator);
function _FixedSizeListIterator_html_Node(array) {
  this._html_length = array.get$length();
  _VariableSizeListIterator_html_Node.call(this, array);
}
$inherits(_VariableSizeListIterator_html_StyleSheet, _VariableSizeListIterator);
function _VariableSizeListIterator_html_StyleSheet(array) {
  this._html_array = array;
  this._html_pos = (0);
}
$inherits(_FixedSizeListIterator_html_StyleSheet, _FixedSizeListIterator);
function _FixedSizeListIterator_html_StyleSheet(array) {
  this._html_length = array.get$length();
  _VariableSizeListIterator_html_StyleSheet.call(this, array);
}
$inherits(_VariableSizeListIterator_html_Touch, _VariableSizeListIterator);
function _VariableSizeListIterator_html_Touch(array) {
  this._html_array = array;
  this._html_pos = (0);
}
$inherits(_FixedSizeListIterator_html_Touch, _FixedSizeListIterator);
function _FixedSizeListIterator_html_Touch(array) {
  this._html_length = array.get$length();
  _VariableSizeListIterator_html_Touch.call(this, array);
}
function get$$window() {
  return window;
}
function get$$document() {
  return document;
}
var _cachedBrowserPrefix;
var _pendingRequests;
var _pendingMeasurementFrameCallbacks;
function PhoenixDart() {

}
PhoenixDart.prototype.runStep = function() {
  var $0;
  this.timeBefore = Clock.now();
  var busy = false;
  while (true) {
    ($0 = this.phoenix).cycles = $add$($0.cycles, (1));
    var pc = this.phoenix.PC();
    if ((!busy) && (pc == (128))) busy = true;
    else if (busy && (pc == (128))) {
      this.phoenix.cycles = (0);
    }
    if ($eq$(this.phoenix.cycles, (0))) {
      this.phoenix.interrupt();
      this.timeNow = Clock.now();
      var msPerFrame = ((this.timeNow - this.timeBefore) / (1000)).toInt();
      this.sleepTime = ((16.666666666666668) - msPerFrame).toInt();
      this.phoenix.cycles = $negate$(this.phoenix.cyclesPerInterrupt);
      if (this.phoenix.isAutoFrameSkip()) {
        if (this.phoenix.getFramesPerSecond() > (60)) {
          var frameSkip = this.phoenix.getFrameSkip();
          this.phoenix.setFrameSkip(frameSkip > (1) ? frameSkip - (1) : (1));
        }
        else if (this.phoenix.getFramesPerSecond() < (60)) {
          var frameSkip = this.phoenix.getFrameSkip();
          this.phoenix.setFrameSkip(frameSkip < (5) ? frameSkip + (1) : (5));
        }
      }
      if (this.phoenix.isRealSpeed() && (this.sleepTime > (0))) {
        get$$window().setTimeout(this.get$runStep(), this.sleepTime);
      }
      else {
        get$$window().setTimeout(this.get$runStep(), (1));
      }
      break;
    }
    this.phoenix.execute();
  }
}
PhoenixDart.prototype.get$runStep = function() {
  return this.runStep.bind(this);
}
PhoenixDart.prototype.initializeCanvas = function() {
  var surface = _ElementFactoryProvider.Element$tag$factory("canvas");
  surface.width = $globals.Phoenix_WIDTH;
  surface.height = $globals.Phoenix_HEIGHT;
  get$$document().query("#canvas-content").get$nodes().add(surface);
  surface.get$attributes().$setindex("style", ("width: " + $globals.Phoenix_WIDTH + " px;"));
  surface.focus();
  return surface;
}
PhoenixDart.prototype.run = function() {
  var $this = this;
  var req = _XMLHttpRequestFactoryProvider.XMLHttpRequest$factory();
  req.open$3("GET", "fullprogram.rom", true);
  req.set$responseType("arraybuffer");
  print$("loading rom...");
  req.addEventListener$2("load", (function (e) {
    var arrayview = _TypedArrayFactoryProvider.Uint8Array$fromBuffer$factory(req.get$response(), (0));
    print$(("rom loaded: " + arrayview.get$length() + " unsigned bytes"));
    $this.phoenix = new Phoenix($this.initializeCanvas());
    $this.phoenix.loadRoms(arrayview);
    $this.phoenix.decodeChars();
    get$$document().body.get$on().get$keyDown().add((function (ev) {
      $this.phoenix.doKey(ev);
    })
    , false);
    get$$window().setTimeout($this.get$runStep(), (1000));
  })
  );
  req.send$0();
}
function i8080(clockFrequencyInMHz) {
  this._A = (0);
  this._B = (0);
  this._C = (0);
  this._DE = (0);
  this._HL = (0);
  this.f5 = false;
  this.fH = false;
  this.fS = false;
  this.fZ = false;
  this.f3 = false;
  this.fC = false;
  this.fN = false;
  this.fPV = false;
  this._AF_ = (0);
  this._BC_ = (0);
  this._DE_ = (0);
  this._HL_ = (0);
  this._PC = (0);
  this._SP = (0);
  this.cyclesPerInterrupt = ((clockFrequencyInMHz * (1000000.0)) / (60)).toInt();
  this.cycles = $negate$(this.cyclesPerInterrupt);
  this.mem = new Array((65536));
  this.parity = new Array((256));
  Util.initializeIntList(this.mem);
  Util.initializeIntList(this.parity);
}
i8080.prototype.AF = function() {
  return (this.A() << (8)) | this.F();
}
i8080.prototype.AF_param = function(word) {
  this.A_param(word >> (8));
  this.F_param(word & (255));
}
i8080.prototype.BC = function() {
  return (this.B() << (8)) | this.C();
}
i8080.prototype.BC_param = function(word) {
  this.B_param(word >> (8));
  this.C_param(word & (255));
}
i8080.prototype.DE = function() {
  return this._DE;
}
i8080.prototype.DE_param = function(word) {
  this._DE = word;
}
i8080.prototype.HL = function() {
  return this._HL;
}
i8080.prototype.HL_param = function(word) {
  this._HL = word;
}
i8080.prototype.PC = function() {
  return this._PC;
}
i8080.prototype.PC_param = function(word) {
  this._PC = word;
}
i8080.prototype.SP = function() {
  return this._SP;
}
i8080.prototype.SP_param = function(word) {
  this._SP = word;
}
i8080.prototype.F = function() {
  return (this.Sset() ? (128) : (0)) | (this.Zset() ? (64) : (0)) | (this.f5 ? (32) : (0)) | (this.Hset() ? (16) : (0)) | (this.f3 ? (8) : (0)) | (this.PVset() ? (4) : (0)) | (this.Nset() ? (2) : (0)) | (this.Cset() ? (1) : (0));
}
i8080.prototype.F_param = function(bite) {
  this.fS = (bite & (128)) != (0);
  this.fZ = (bite & (64)) != (0);
  this.f5 = (bite & (32)) != (0);
  this.fH = (bite & (16)) != (0);
  this.f3 = (bite & (8)) != (0);
  this.fPV = (bite & (4)) != (0);
  this.fN = (bite & (2)) != (0);
  this.fC = (bite & (1)) != (0);
}
i8080.prototype.A = function() {
  return this._A;
}
i8080.prototype.A_param = function(bite) {
  this._A = bite;
}
i8080.prototype.B = function() {
  return this._B;
}
i8080.prototype.B_param = function(bite) {
  this._B = bite;
}
i8080.prototype.C = function() {
  return this._C;
}
i8080.prototype.C_param = function(bite) {
  this._C = bite;
}
i8080.prototype.D = function() {
  return (this._DE >> (8));
}
i8080.prototype.D_param = function(bite) {
  this._DE = (bite << (8)) | (this._DE & (255));
}
i8080.prototype.E = function() {
  return (this._DE & (255));
}
i8080.prototype.E_param = function(bite) {
  this._DE = (this._DE & (65280)) | bite;
}
i8080.prototype.H = function() {
  return (this._HL >> (8));
}
i8080.prototype.H_param = function(bite) {
  this._HL = (bite << (8)) | (this._HL & (255));
}
i8080.prototype.L = function() {
  return (this._HL & (255));
}
i8080.prototype.L_param = function(bite) {
  this._HL = (this._HL & (65280)) | bite;
}
i8080.prototype.setZ = function(f) {
  this.fZ = f;
}
i8080.prototype.setC = function(f) {
  this.fC = f;
}
i8080.prototype.setS = function(f) {
  this.fS = f;
}
i8080.prototype.setH = function(f) {
  this.fH = f;
}
i8080.prototype.setN = function(f) {
  this.fN = f;
}
i8080.prototype.setPV = function(f) {
  this.fPV = f;
}
i8080.prototype.set3 = function(f) {
  this.f3 = f;
}
i8080.prototype.set5 = function(f) {
  this.f5 = f;
}
i8080.prototype.Zset = function() {
  return this.fZ;
}
i8080.prototype.Cset = function() {
  return this.fC;
}
i8080.prototype.Sset = function() {
  return this.fS;
}
i8080.prototype.Hset = function() {
  return this.fH;
}
i8080.prototype.Nset = function() {
  return this.fN;
}
i8080.prototype.PVset = function() {
  return this.fPV;
}
i8080.prototype.peekb = function(addr) {
  return this.mem.$index(addr);
}
i8080.prototype.pokeb = function(addr, newByte) {
  this.mem.$setindex(addr, newByte);
}
i8080.prototype.pokew = function(addr, word) {
  this.pokeb(addr, word & (255));
  addr++;
  this.pokeb(addr & (65535), word >> (8));
}
i8080.prototype.peekw = function(addr) {
  var t = this.peekb(addr);
  addr++;
  return t | (this.peekb(addr & (65535)) << (8));
}
i8080.prototype.pushw = function(word) {
  var sp = ((this.SP() - (2)) & (65535));
  this.SP_param(sp);
  this.pokew(sp, word);
}
i8080.prototype.popw = function() {
  var sp = this.SP();
  var t = this.peekb(sp);
  sp++;
  t |= (this.peekb(sp & (65535)) << (8));
  this.SP_param(++sp & (65535));
  return t;
}
i8080.prototype.pushpc = function() {
  this.pushw(this.PC());
}
i8080.prototype.poppc = function() {
  this.PC_param(this.popw());
}
i8080.prototype.nxtpcb = function() {
  var pc = this.PC();
  var t = this.peekb(pc);
  this.PC_param(++pc & (65535));
  return t;
}
i8080.prototype.nxtpcw = function() {
  var pc = this.PC();
  var t = this.peekb(pc);
  t |= (this.peekb(++pc & (65535)) << (8));
  this.PC_param(++pc & (65535));
  return t;
}
i8080.prototype.outb = function(port, bite) {

}
i8080.prototype.inb = function(port) {
  return (255);
}
i8080.prototype.interrupt = function() {
  return (0);
}
i8080.prototype.execute = function() {
  switch (this.nxtpcb()) {
    case (0):

      {
        break;
      }

    case (1):

      {
        this.BC_param(this.nxtpcw());
        break;
      }

    case (9):

      {
        this.HL_param(this.add16(this.HL(), this.BC()));
        break;
      }

    case (17):

      {
        this.DE_param(this.nxtpcw());
        break;
      }

    case (25):

      {
        this.HL_param(this.add16(this.HL(), this.DE()));
        break;
      }

    case (33):

      {
        this.HL_param(this.nxtpcw());
        break;
      }

    case (41):

      {
        var hl = this.HL();
        this.HL_param(this.add16(hl, hl));
        break;
      }

    case (49):

      {
        this.SP_param(this.nxtpcw());
        break;
      }

    case (57):

      {
        this.HL_param(this.add16(this.HL(), this.SP()));
        break;
      }

    case (2):

      {
        this.pokeb(this.BC(), this.A());
        break;
      }

    case (10):

      {
        this.A_param(this.peekb(this.BC()));
        break;
      }

    case (18):

      {
        this.pokeb(this.DE(), this.A());
        break;
      }

    case (26):

      {
        this.A_param(this.peekb(this.DE()));
        break;
      }

    case (34):

      {
        this.pokew(this.nxtpcw(), this.HL());
        break;
      }

    case (42):

      {
        this.HL_param(this.peekw(this.nxtpcw()));
        break;
      }

    case (50):

      {
        this.pokeb(this.nxtpcw(), this.A());
        break;
      }

    case (58):

      {
        this.A_param(this.peekb(this.nxtpcw()));
        break;
      }

    case (3):

      {
        this.BC_param(i8080.inc16(this.BC()));
        break;
      }

    case (11):

      {
        this.BC_param(i8080.dec16(this.BC()));
        break;
      }

    case (19):

      {
        this.DE_param(i8080.inc16(this.DE()));
        break;
      }

    case (27):

      {
        this.DE_param(i8080.dec16(this.DE()));
        break;
      }

    case (35):

      {
        this.HL_param(i8080.inc16(this.HL()));
        break;
      }

    case (43):

      {
        this.HL_param(i8080.dec16(this.HL()));
        break;
      }

    case (51):

      {
        this.SP_param(i8080.inc16(this.SP()));
        break;
      }

    case (59):

      {
        this.SP_param(i8080.dec16(this.SP()));
        break;
      }

    case (4):

      {
        this.B_param(this.inc8(this.B()));
        break;
      }

    case (12):

      {
        this.C_param(this.inc8(this.C()));
        break;
      }

    case (20):

      {
        this.D_param(this.inc8(this.D()));
        break;
      }

    case (28):

      {
        this.E_param(this.inc8(this.E()));
        break;
      }

    case (36):

      {
        this.H_param(this.inc8(this.H()));
        break;
      }

    case (44):

      {
        this.L_param(this.inc8(this.L()));
        break;
      }

    case (52):

      {
        var hl = this.HL();
        this.pokeb(hl, this.inc8(this.peekb(hl)));
        break;
      }

    case (60):

      {
        this.A_param(this.inc8(this.A()));
        break;
      }

    case (5):

      {
        this.B_param(this.dec8(this.B()));
        break;
      }

    case (13):

      {
        this.C_param(this.dec8(this.C()));
        break;
      }

    case (21):

      {
        this.D_param(this.dec8(this.D()));
        break;
      }

    case (29):

      {
        this.E_param(this.dec8(this.E()));
        break;
      }

    case (37):

      {
        this.H_param(this.dec8(this.H()));
        break;
      }

    case (45):

      {
        this.L_param(this.dec8(this.L()));
        break;
      }

    case (53):

      {
        var hl = this.HL();
        this.pokeb(hl, this.dec8(this.peekb(hl)));
        break;
      }

    case (61):

      {
        this.A_param(this.dec8(this.A()));
        break;
      }

    case (6):

      {
        this.B_param(this.nxtpcb());
        break;
      }

    case (14):

      {
        this.C_param(this.nxtpcb());
        break;
      }

    case (22):

      {
        this.D_param(this.nxtpcb());
        break;
      }

    case (30):

      {
        this.E_param(this.nxtpcb());
        break;
      }

    case (38):

      {
        this.H_param(this.nxtpcb());
        break;
      }

    case (46):

      {
        this.L_param(this.nxtpcb());
        break;
      }

    case (54):

      {
        this.pokeb(this.HL(), this.nxtpcb());
        break;
      }

    case (62):

      {
        this.A_param(this.nxtpcb());
        break;
      }

    case (7):

      {
        this.rlc();
        break;
      }

    case (15):

      {
        this.rrc();
        break;
      }

    case (23):

      {
        this.ral();
        break;
      }

    case (31):

      {
        this.rar();
        break;
      }

    case (39):

      {
        this.daa();
        break;
      }

    case (47):

      {
        this.cma();
        break;
      }

    case (55):

      {
        this.stc();
        break;
      }

    case (63):

      {
        this.cmc();
        break;
      }

    case (64):

      {
        break;
      }

    case (65):

      {
        this.B_param(this.C());
        break;
      }

    case (66):

      {
        this.B_param(this.D());
        break;
      }

    case (67):

      {
        this.B_param(this.E());
        break;
      }

    case (68):

      {
        this.B_param(this.H());
        break;
      }

    case (69):

      {
        this.B_param(this.L());
        break;
      }

    case (70):

      {
        this.B_param(this.peekb(this.HL()));
        break;
      }

    case (71):

      {
        this.B_param(this.A());
        break;
      }

    case (72):

      {
        this.C_param(this.B());
        break;
      }

    case (73):

      {
        break;
      }

    case (74):

      {
        this.C_param(this.D());
        break;
      }

    case (75):

      {
        this.C_param(this.E());
        break;
      }

    case (76):

      {
        this.C_param(this.H());
        break;
      }

    case (77):

      {
        this.C_param(this.L());
        break;
      }

    case (78):

      {
        this.C_param(this.peekb(this.HL()));
        break;
      }

    case (79):

      {
        this.C_param(this.A());
        break;
      }

    case (80):

      {
        this.D_param(this.B());
        break;
      }

    case (81):

      {
        this.D_param(this.C());
        break;
      }

    case (82):

      {
        break;
      }

    case (83):

      {
        this.D_param(this.E());
        break;
      }

    case (84):

      {
        this.D_param(this.H());
        break;
      }

    case (85):

      {
        this.D_param(this.L());
        break;
      }

    case (86):

      {
        this.D_param(this.peekb(this.HL()));
        break;
      }

    case (87):

      {
        this.D_param(this.A());
        break;
      }

    case (88):

      {
        this.E_param(this.B());
        break;
      }

    case (89):

      {
        this.E_param(this.C());
        break;
      }

    case (90):

      {
        this.E_param(this.D());
        break;
      }

    case (91):

      {
        break;
      }

    case (92):

      {
        this.E_param(this.H());
        break;
      }

    case (93):

      {
        this.E_param(this.L());
        break;
      }

    case (94):

      {
        this.E_param(this.peekb(this.HL()));
        break;
      }

    case (95):

      {
        this.E_param(this.A());
        break;
      }

    case (96):

      {
        this.H_param(this.B());
        break;
      }

    case (97):

      {
        this.H_param(this.C());
        break;
      }

    case (98):

      {
        this.H_param(this.D());
        break;
      }

    case (99):

      {
        this.H_param(this.E());
        break;
      }

    case (100):

      {
        break;
      }

    case (101):

      {
        this.H_param(this.L());
        break;
      }

    case (102):

      {
        this.H_param(this.peekb(this.HL()));
        break;
      }

    case (103):

      {
        this.H_param(this.A());
        break;
      }

    case (104):

      {
        this.L_param(this.B());
        break;
      }

    case (105):

      {
        this.L_param(this.C());
        break;
      }

    case (106):

      {
        this.L_param(this.D());
        break;
      }

    case (107):

      {
        this.L_param(this.E());
        break;
      }

    case (108):

      {
        this.L_param(this.H());
        break;
      }

    case (109):

      {
        break;
      }

    case (110):

      {
        this.L_param(this.peekb(this.HL()));
        break;
      }

    case (111):

      {
        this.L_param(this.A());
        break;
      }

    case (112):

      {
        this.pokeb(this.HL(), this.B());
        break;
      }

    case (113):

      {
        this.pokeb(this.HL(), this.C());
        break;
      }

    case (114):

      {
        this.pokeb(this.HL(), this.D());
        break;
      }

    case (115):

      {
        this.pokeb(this.HL(), this.E());
        break;
      }

    case (116):

      {
        this.pokeb(this.HL(), this.H());
        break;
      }

    case (117):

      {
        this.pokeb(this.HL(), this.L());
        break;
      }

    case (118):

      {
        break;
      }

    case (119):

      {
        this.pokeb(this.HL(), this.A());
        break;
      }

    case (120):

      {
        this.A_param(this.B());
        break;
      }

    case (121):

      {
        this.A_param(this.C());
        break;
      }

    case (122):

      {
        this.A_param(this.D());
        break;
      }

    case (123):

      {
        this.A_param(this.E());
        break;
      }

    case (124):

      {
        this.A_param(this.H());
        break;
      }

    case (125):

      {
        this.A_param(this.L());
        break;
      }

    case (126):

      {
        this.A_param(this.peekb(this.HL()));
        break;
      }

    case (127):

      {
        break;
      }

    case (128):

      {
        this.add_a(this.B());
        break;
      }

    case (129):

      {
        this.add_a(this.C());
        break;
      }

    case (130):

      {
        this.add_a(this.D());
        break;
      }

    case (131):

      {
        this.add_a(this.E());
        break;
      }

    case (132):

      {
        this.add_a(this.H());
        break;
      }

    case (133):

      {
        this.add_a(this.L());
        break;
      }

    case (134):

      {
        this.add_a(this.peekb(this.HL()));
        break;
      }

    case (135):

      {
        this.add_a(this.A());
        break;
      }

    case (136):

      {
        this.adc_a(this.B());
        break;
      }

    case (137):

      {
        this.adc_a(this.C());
        break;
      }

    case (138):

      {
        this.adc_a(this.D());
        break;
      }

    case (139):

      {
        this.adc_a(this.E());
        break;
      }

    case (140):

      {
        this.adc_a(this.H());
        break;
      }

    case (141):

      {
        this.adc_a(this.L());
        break;
      }

    case (142):

      {
        this.adc_a(this.peekb(this.HL()));
        break;
      }

    case (143):

      {
        this.adc_a(this.A());
        break;
      }

    case (144):

      {
        this.sub_a(this.B());
        break;
      }

    case (145):

      {
        this.sub_a(this.C());
        break;
      }

    case (146):

      {
        this.sub_a(this.D());
        break;
      }

    case (147):

      {
        this.sub_a(this.E());
        break;
      }

    case (148):

      {
        this.sub_a(this.H());
        break;
      }

    case (149):

      {
        this.sub_a(this.L());
        break;
      }

    case (150):

      {
        this.sub_a(this.peekb(this.HL()));
        break;
      }

    case (151):

      {
        this.sub_a(this.A());
        break;
      }

    case (152):

      {
        this.sbc_a(this.B());
        break;
      }

    case (153):

      {
        this.sbc_a(this.C());
        break;
      }

    case (154):

      {
        this.sbc_a(this.D());
        break;
      }

    case (155):

      {
        this.sbc_a(this.E());
        break;
      }

    case (156):

      {
        this.sbc_a(this.H());
        break;
      }

    case (157):

      {
        this.sbc_a(this.L());
        break;
      }

    case (158):

      {
        this.sbc_a(this.peekb(this.HL()));
        break;
      }

    case (159):

      {
        this.sbc_a(this.A());
        break;
      }

    case (160):

      {
        this.and_a(this.B());
        break;
      }

    case (161):

      {
        this.and_a(this.C());
        break;
      }

    case (162):

      {
        this.and_a(this.D());
        break;
      }

    case (163):

      {
        this.and_a(this.E());
        break;
      }

    case (164):

      {
        this.and_a(this.H());
        break;
      }

    case (165):

      {
        this.and_a(this.L());
        break;
      }

    case (166):

      {
        this.and_a(this.peekb(this.HL()));
        break;
      }

    case (167):

      {
        this.and_a(this.A());
        break;
      }

    case (168):

      {
        this.xor_a(this.B());
        break;
      }

    case (169):

      {
        this.xor_a(this.C());
        break;
      }

    case (170):

      {
        this.xor_a(this.D());
        break;
      }

    case (171):

      {
        this.xor_a(this.E());
        break;
      }

    case (172):

      {
        this.xor_a(this.H());
        break;
      }

    case (173):

      {
        this.xor_a(this.L());
        break;
      }

    case (174):

      {
        this.xor_a(this.peekb(this.HL()));
        break;
      }

    case (175):

      {
        this.xor_a(this.A());
        break;
      }

    case (176):

      {
        this.or_a(this.B());
        break;
      }

    case (177):

      {
        this.or_a(this.C());
        break;
      }

    case (178):

      {
        this.or_a(this.D());
        break;
      }

    case (179):

      {
        this.or_a(this.E());
        break;
      }

    case (180):

      {
        this.or_a(this.H());
        break;
      }

    case (181):

      {
        this.or_a(this.L());
        break;
      }

    case (182):

      {
        this.or_a(this.peekb(this.HL()));
        break;
      }

    case (183):

      {
        this.or_a(this.A());
        break;
      }

    case (184):

      {
        this.cp_a(this.B());
        break;
      }

    case (185):

      {
        this.cp_a(this.C());
        break;
      }

    case (186):

      {
        this.cp_a(this.D());
        break;
      }

    case (187):

      {
        this.cp_a(this.E());
        break;
      }

    case (188):

      {
        this.cp_a(this.H());
        break;
      }

    case (189):

      {
        this.cp_a(this.L());
        break;
      }

    case (190):

      {
        this.cp_a(this.peekb(this.HL()));
        break;
      }

    case (191):

      {
        this.cp_a(this.A());
        break;
      }

    case (192):

      {
        if (!this.Zset()) {
          this.poppc();
        }
        else {
        }
        break;
      }

    case (200):

      {
        if (this.Zset()) {
          this.poppc();
        }
        else {
        }
        break;
      }

    case (208):

      {
        if (!this.Cset()) {
          this.poppc();
        }
        else {
        }
        break;
      }

    case (216):

      {
        if (this.Cset()) {
          this.poppc();
        }
        else {
        }
        break;
      }

    case (224):

      {
        if (!this.PVset()) {
          this.poppc();
        }
        else {
        }
        break;
      }

    case (232):

      {
        if (this.PVset()) {
          this.poppc();
        }
        else {
        }
        break;
      }

    case (240):

      {
        if (!this.Sset()) {
          this.poppc();
        }
        else {
        }
        break;
      }

    case (248):

      {
        if (this.Sset()) {
          this.poppc();
        }
        else {
        }
        break;
      }

    case (193):

      {
        this.BC_param(this.popw());
        break;
      }

    case (201):

      {
        this.poppc();
        break;
      }

    case (209):

      {
        this.DE_param(this.popw());
        break;
      }

    case (225):

      {
        this.HL_param(this.popw());
        break;
      }

    case (233):

      {
        this.PC_param(this.HL());
        break;
      }

    case (241):

      {
        this.AF_param(this.popw());
        break;
      }

    case (249):

      {
        this.SP_param(this.HL());
        break;
      }

    case (194):

      {
        if (!this.Zset()) {
          this.PC_param(this.nxtpcw());
        }
        else {
          this.PC_param((this.PC() + (2)) & (65535));
        }
        break;
      }

    case (202):

      {
        if (this.Zset()) {
          this.PC_param(this.nxtpcw());
        }
        else {
          this.PC_param((this.PC() + (2)) & (65535));
        }
        break;
      }

    case (210):

      {
        if (!this.Cset()) {
          this.PC_param(this.nxtpcw());
        }
        else {
          this.PC_param((this.PC() + (2)) & (65535));
        }
        break;
      }

    case (218):

      {
        if (this.Cset()) {
          this.PC_param(this.nxtpcw());
        }
        else {
          this.PC_param((this.PC() + (2)) & (65535));
        }
        break;
      }

    case (226):

      {
        if (!this.PVset()) {
          this.PC_param(this.nxtpcw());
        }
        else {
          this.PC_param((this.PC() + (2)) & (65535));
        }
        break;
      }

    case (234):

      {
        if (this.PVset()) {
          this.PC_param(this.nxtpcw());
        }
        else {
          this.PC_param((this.PC() + (2)) & (65535));
        }
        break;
      }

    case (242):

      {
        if (!this.Sset()) {
          this.PC_param(this.nxtpcw());
        }
        else {
          this.PC_param((this.PC() + (2)) & (65535));
        }
        break;
      }

    case (250):

      {
        if (this.Sset()) {
          this.PC_param(this.nxtpcw());
        }
        else {
          this.PC_param((this.PC() + (2)) & (65535));
        }
        break;
      }

    case (195):

      {
        this.PC_param(this.peekw(this.PC()));
        break;
      }

    case (211):

      {
        this.outb(this.nxtpcb(), this.A());
        break;
      }

    case (219):

      {
        this.A_param(this.inb((this.A() << (8)) | this.nxtpcb()));
        break;
      }

    case (227):

      {
        var t = this.HL();
        var sp = this.SP();
        this.HL_param(this.peekw(sp));
        this.pokew(sp, t);
        break;
      }

    case (235):

      {
        var t = this.HL();
        this.HL_param(this.DE());
        this.DE_param(t);
        break;
      }

    case (243):

      {
        break;
      }

    case (251):

      {
        break;
      }

    case (196):

      {
        if (!this.Zset()) {
          var t = this.nxtpcw();
          this.pushpc();
          this.PC_param(t);
        }
        else {
          this.PC_param((this.PC() + (2)) & (65535));
        }
        break;
      }

    case (204):

      {
        if (this.Zset()) {
          var t = this.nxtpcw();
          this.pushpc();
          this.PC_param(t);
        }
        else {
          this.PC_param((this.PC() + (2)) & (65535));
        }
        break;
      }

    case (212):

      {
        if (!this.Cset()) {
          var t = this.nxtpcw();
          this.pushpc();
          this.PC_param(t);
        }
        else {
          this.PC_param((this.PC() + (2)) & (65535));
        }
        break;
      }

    case (220):

      {
        if (this.Cset()) {
          var t = this.nxtpcw();
          this.pushpc();
          this.PC_param(t);
        }
        else {
          this.PC_param((this.PC() + (2)) & (65535));
        }
        break;
      }

    case (228):

      {
        if (!this.PVset()) {
          var t = this.nxtpcw();
          this.pushpc();
          this.PC_param(t);
        }
        else {
          this.PC_param((this.PC() + (2)) & (65535));
        }
        break;
      }

    case (236):

      {
        if (this.PVset()) {
          var t = this.nxtpcw();
          this.pushpc();
          this.PC_param(t);
        }
        else {
          this.PC_param((this.PC() + (2)) & (65535));
        }
        break;
      }

    case (244):

      {
        if (!this.Sset()) {
          var t = this.nxtpcw();
          this.pushpc();
          this.PC_param(t);
        }
        else {
          this.PC_param((this.PC() + (2)) & (65535));
        }
        break;
      }

    case (252):

      {
        if (this.Sset()) {
          var t = this.nxtpcw();
          this.pushpc();
          this.PC_param(t);
        }
        else {
          this.PC_param((this.PC() + (2)) & (65535));
        }
        break;
      }

    case (197):

      {
        this.pushw(this.BC());
        break;
      }

    case (205):

      {
        var t = this.nxtpcw();
        this.pushpc();
        this.PC_param(t);
        break;
      }

    case (213):

      {
        this.pushw(this.DE());
        break;
      }

    case (229):

      {
        this.pushw(this.HL());
        break;
      }

    case (245):

      {
        this.pushw(this.AF());
        break;
      }

    case (198):

      {
        this.add_a(this.nxtpcb());
        break;
      }

    case (206):

      {
        this.adc_a(this.nxtpcb());
        break;
      }

    case (214):

      {
        this.sub_a(this.nxtpcb());
        break;
      }

    case (222):

      {
        this.sbc_a(this.nxtpcb());
        break;
      }

    case (230):

      {
        this.and_a(this.nxtpcb());
        break;
      }

    case (238):

      {
        this.xor_a(this.nxtpcb());
        break;
      }

    case (246):

      {
        this.or_a(this.nxtpcb());
        break;
      }

    case (254):

      {
        this.cp_a(this.nxtpcb());
        break;
      }

    case (199):

      {
        this.pushpc();
        this.PC_param((0));
        break;
      }

    case (207):

      {
        this.pushpc();
        this.PC_param((8));
        break;
      }

    case (215):

      {
        this.pushpc();
        this.PC_param((16));
        break;
      }

    case (223):

      {
        this.pushpc();
        this.PC_param((24));
        break;
      }

    case (231):

      {
        this.pushpc();
        this.PC_param((32));
        break;
      }

    case (239):

      {
        this.pushpc();
        this.PC_param((40));
        break;
      }

    case (247):

      {
        this.pushpc();
        this.PC_param((48));
        break;
      }

    case (255):

      {
        this.pushpc();
        this.PC_param((56));
        break;
      }

  }
}
i8080.prototype.adc_a = function(b) {
  var a = this.A();
  var c = this.Cset() ? (1) : (0);
  var wans = a + b + c;
  var ans = wans & (255);
  this.setS((ans & (128)) != (0));
  this.set3((ans & (8)) != (0));
  this.set5((ans & (32)) != (0));
  this.setZ((ans) == (0));
  this.setC((wans & (256)) != (0));
  this.setPV(((a ^ ~b) & (a ^ ans) & (128)) != (0));
  this.setH((((a & (15)) + (b & (15)) + c) & (16)) != (0));
  this.setN(false);
  this.A_param(ans);
}
i8080.prototype.add_a = function(b) {
  var a = this.A();
  var wans = a + b;
  var ans = wans & (255);
  this.setS((ans & (128)) != (0));
  this.set3((ans & (8)) != (0));
  this.set5((ans & (32)) != (0));
  this.setZ((ans) == (0));
  this.setC((wans & (256)) != (0));
  this.setPV(((a ^ ~b) & (a ^ ans) & (128)) != (0));
  this.setH((((a & (15)) + (b & (15))) & (16)) != (0));
  this.setN(false);
  this.A_param(ans);
}
i8080.prototype.sbc_a = function(b) {
  var a = this.A();
  var c = this.Cset() ? (1) : (0);
  var wans = a - b - c;
  var ans = wans & (255);
  this.setS((ans & (128)) != (0));
  this.set3((ans & (8)) != (0));
  this.set5((ans & (32)) != (0));
  this.setZ((ans) == (0));
  this.setC((wans & (256)) != (0));
  this.setPV(((a ^ b) & (a ^ ans) & (128)) != (0));
  this.setH((((a & (15)) - (b & (15)) - c) & (16)) != (0));
  this.setN(true);
  this.A_param(ans);
}
i8080.prototype.sub_a = function(b) {
  var a = this.A();
  var wans = a - b;
  var ans = wans & (255);
  this.setS((ans & (128)) != (0));
  this.set3((ans & (8)) != (0));
  this.set5((ans & (32)) != (0));
  this.setZ((ans) == (0));
  this.setC((wans & (256)) != (0));
  this.setPV(((a ^ b) & (a ^ ans) & (128)) != (0));
  this.setH((((a & (15)) - (b & (15))) & (16)) != (0));
  this.setN(true);
  this.A_param(ans);
}
i8080.prototype.rlc = function() {
  var ans = this.A();
  var c = (ans & (128)) != (0);
  if (c) {
    ans = (ans << (1)) | (1);
  }
  else {
    ans <<= (1);
  }
  ans &= (255);
  this.set3((ans & (8)) != (0));
  this.set5((ans & (32)) != (0));
  this.setN(false);
  this.setH(false);
  this.setC(c);
  this.A_param(ans);
}
i8080.prototype.rrc = function() {
  var ans = this.A();
  var c = (ans & (1)) != (0);
  if (c) {
    ans = (ans >> (1)) | (128);
  }
  else {
    ans >>= (1);
  }
  this.set3((ans & (8)) != (0));
  this.set5((ans & (32)) != (0));
  this.setN(false);
  this.setH(false);
  this.setC(c);
  this.A_param(ans);
}
i8080.prototype.ral = function() {
  var ans = this.A();
  var c = (ans & (128)) != (0);
  if (this.Cset()) {
    ans = (ans << (1)) | (1);
  }
  else {
    ans <<= (1);
  }
  ans &= (255);
  this.set3((ans & (8)) != (0));
  this.set5((ans & (32)) != (0));
  this.setN(false);
  this.setH(false);
  this.setC(c);
  this.A_param(ans);
}
i8080.prototype.rar = function() {
  var ans = this.A();
  var c = (ans & (1)) != (0);
  if (this.Cset()) {
    ans = (ans >> (1)) | (128);
  }
  else {
    ans >>= (1);
  }
  this.set3((ans & (8)) != (0));
  this.set5((ans & (32)) != (0));
  this.setN(false);
  this.setH(false);
  this.setC(c);
  this.A_param(ans);
}
i8080.prototype.cp_a = function(b) {
  var a = this.A();
  var wans = a - b;
  var ans = wans & (255);
  this.setS((ans & (128)) != (0));
  this.set3((b & (8)) != (0));
  this.set5((b & (32)) != (0));
  this.setN(true);
  this.setZ(ans == (0));
  this.setC((wans & (256)) != (0));
  this.setH((((a & (15)) - (b & (15))) & (16)) != (0));
  this.setPV(((a ^ b) & (a ^ ans) & (128)) != (0));
}
i8080.prototype.and_a = function(b) {
  var ans = this.A() & b;
  this.setS((ans & (128)) != (0));
  this.set3((ans & (8)) != (0));
  this.set5((ans & (32)) != (0));
  this.setH(true);
  this.setPV(this.parity.$index(ans));
  this.setZ(ans == (0));
  this.setN(false);
  this.setC(false);
  this.A_param(ans);
}
i8080.prototype.or_a = function(b) {
  var ans = this.A() | b;
  this.setS((ans & (128)) != (0));
  this.set3((ans & (8)) != (0));
  this.set5((ans & (32)) != (0));
  this.setH(false);
  this.setPV(this.parity.$index(ans));
  this.setZ(ans == (0));
  this.setN(false);
  this.setC(false);
  this.A_param(ans);
}
i8080.prototype.xor_a = function(b) {
  var ans = (this.A() ^ b) & (255);
  this.setS((ans & (128)) != (0));
  this.set3((ans & (8)) != (0));
  this.set5((ans & (32)) != (0));
  this.setH(false);
  this.setPV(this.parity.$index(ans));
  this.setZ(ans == (0));
  this.setN(false);
  this.setC(false);
  this.A_param(ans);
}
i8080.prototype.cma = function() {
  var ans = this.A() ^ (255);
  this.set3((ans & (8)) != (0));
  this.set5((ans & (32)) != (0));
  this.setH(true);
  this.setN(true);
  this.A_param(ans);
}
i8080.prototype.daa = function() {
  var ans = this.A();
  var incr = (0);
  var carry = this.Cset();
  if ((this.Hset()) || ((ans & (15)) > (9))) {
    incr |= (6);
  }
  if (carry || (ans > (159)) || ((ans > (143)) && ((ans & (15)) > (9)))) {
    incr |= (96);
  }
  if (ans > (153)) {
    carry = true;
  }
  if (this.Nset()) {
    this.sub_a(incr);
  }
  else {
    this.add_a(incr);
  }
  ans = this.A();
  this.setC(carry);
  this.setPV(this.parity.$index(ans));
}
i8080.prototype.stc = function() {
  var ans = this.A();
  this.set3((ans & (8)) != (0));
  this.set5((ans & (32)) != (0));
  this.setN(false);
  this.setH(false);
  this.setC(true);
}
i8080.prototype.cmc = function() {
  var ans = this.A();
  this.set3((ans & (8)) != (0));
  this.set5((ans & (32)) != (0));
  this.setN(false);
  this.setC(this.Cset() ? false : true);
}
i8080.prototype.dec8 = function(ans) {
  var pv = (ans == (128));
  var h = (((ans & (15)) - (1)) & (16)) != (0);
  ans = (ans - (1)) & (255);
  this.setS((ans & (128)) != (0));
  this.set3((ans & (8)) != (0));
  this.set5((ans & (32)) != (0));
  this.setZ((ans) == (0));
  this.setPV(pv);
  this.setH(h);
  this.setN(true);
  return (ans);
}
i8080.prototype.inc8 = function(ans) {
  var pv = (ans == (127));
  var h = (((ans & (15)) + (1)) & (16)) != (0);
  ans = (ans + (1)) & (255);
  this.setS((ans & (128)) != (0));
  this.set3((ans & (8)) != (0));
  this.set5((ans & (32)) != (0));
  this.setZ((ans) == (0));
  this.setPV(pv);
  this.setH(h);
  this.setN(false);
  return (ans);
}
i8080.prototype.add16 = function(a, b) {
  var lans = a + b;
  var ans = lans & (65535);
  this.set3((ans & (2048)) != (0));
  this.set5((ans & (8192)) != (0));
  this.setC((lans & (65536)) != (0));
  this.setH((((a & (4095)) + (b & (4095))) & (4096)) != (0));
  this.setN(false);
  return (ans);
}
i8080.inc16 = function(a) {
  return (a + (1)) & (65535);
}
i8080.dec16 = function(a) {
  return (a - (1)) & (65535);
}
$inherits(Phoenix, i8080);
function Phoenix(canvas) {
  this.vBlank = false;
  this.scrollRegister = (0);
  this.oldScrollRegister = (0);
  this.palette = (0);
  this.backgroundRefresh = true;
  this.foregroundRefresh = true;
  this.interruptCounter = (0);
  this.autoFrameSkip = true;
  this.realSpeed = true;
  this.mute = false;
  this.frameSkip = (1);
  this.timeOfLastFrameInterrupt = (0);
  this.timeNow = (0);
  this.timeBefore = (0);
  i8080.call(this, (0.74));
  this.canvasGraphics = canvas.getContext("2d");
  this.msPerFrame = (16.666666666666668).toInt();
  this.backCanvas = _ElementFactoryProvider.Element$tag$factory("canvas");
  this.backCanvas.width = $globals.Phoenix_WIDTH;
  this.backCanvas.height = $globals.Phoenix_HEIGHT;
  this.backGraphics = this.backCanvas.getContext("2d");
  this.backImageData = this.backGraphics.createImageData($globals.Phoenix_WIDTH, $globals.Phoenix_HEIGHT);
  this.frontCanvas = _ElementFactoryProvider.Element$tag$factory("canvas");
  this.frontCanvas.width = $globals.Phoenix_WIDTH;
  this.frontCanvas.height = $globals.Phoenix_HEIGHT;
  this.frontGraphics = this.frontCanvas.getContext("2d");
  this.frontImageData = this.frontGraphics.createImageData($globals.Phoenix_WIDTH, $globals.Phoenix_HEIGHT);
  this.gameControl = new Array((8));
  this.desiredGameControlForNextLoop = new Array((8));
  this.dirtyForeground = new Array();
  this.dirtyBackground = new Array();
  this.chr = new Array((8192));
  Util.initializeIntList(this.chr);
  Util.initializeIntList(this.gameControl);
  Util.initializeBoolList(this.desiredGameControlForNextLoop);
  this.framesPerSecond = (0.0);
  this.initSFX();
}
Phoenix.prototype.pokeb = function(addr, newByte) {
  addr &= (65535);
  if (addr >= (22528) && addr <= (23551)) {
    this.scrollRegister = newByte;
    if (this.scrollRegister != this.oldScrollRegister) {
      this.oldScrollRegister = this.scrollRegister;
      this.scrollRefresh = true;
    }
  }
  if ((addr >= (16384)) && (addr <= (17216))) {
    this.dirtyForeground.add(addr);
    this.foregroundRefresh = true;
  }
  if ((addr >= (18432)) && (addr <= (19264))) {
    this.dirtyBackground.add(addr);
    this.backgroundRefresh = true;
  }
  if (addr >= (20480) && addr <= (21503)) {
    this.palette = newByte & (1);
  }
  if (addr >= (24576) && addr <= (25599)) {
    if (this.peekb(addr) != newByte) {
      this.mem.$setindex(addr, newByte);
      if (!this.isMute()) {
        if (newByte == (143)) this.explosionSFX.play();
        if ((newByte > (101)) && (newByte < (107))) this.play(this.laserSFX);
        if (newByte == (80)) this.blowSFX.play();
      }
    }
  }
  if (addr >= (26624) && addr <= (27647)) {
    if (this.peekb(addr) != newByte) {
      this.mem.$setindex(addr, newByte);
      if (!this.isMute()) {
        if (newByte == (12)) this.shieldSFX.play();
        if (newByte == (2)) this.hitSFX.play();
      }
    }
  }
  if (addr == (17292)) {
    if (newByte == (15)) {
      this.mem.$setindex(addr, newByte);
    }
  }
  if (addr >= (16384)) {
    this.mem.$setindex(addr, newByte);
  }
  return;
}
Phoenix.prototype.pokew = function(addr, word) {
  addr &= (65535);
  var _mem = this.mem;
  if (addr >= (16384)) {
    _mem.$setindex(addr, word & (255));
    if (++addr != (65536)) {
      _mem.$setindex(addr, word >> (8));
    }
  }
  return;
}
Phoenix.prototype.peekb = function(addr) {
  addr &= (65535);
  if (addr >= (30720) && addr <= (31743)) {
    if (this.vBlank) {
      this.vBlank = false;
      return (128);
    }
    else return (0);
  }
  if (addr >= (28672) && addr <= (29695)) {
    var c = (0);
    for (var i = (0);
     i < (8); i++) c |= ($shl$(this.gameControl.$index(i), i));
    return c;
  }
  else return this.mem.$index(addr);
}
Phoenix.prototype.peekw = function(addr) {
  addr &= (65535);
  var t = this.peekb(addr);
  addr++;
  return t | (this.peekb(addr) << (8));
}
Phoenix.prototype.initSFX = function() {
  this.laserSFX = this.loadSFX("laser");
  this.explosionSFX = this.loadSFX("explo");
  this.blowSFX = this.loadSFX("blow");
  this.shieldSFX = this.loadSFX("shield");
  this.hitSFX = this.loadSFX("hit");
}
Phoenix.prototype.play = function(el) {
  var _s = el.src;
  el.src = null;
  el.src = _s;
  el.play();
}
Phoenix.prototype.loadSFX = function(name) {
  var sfx = _ElementFactoryProvider.Element$tag$factory("audio");
  sfx.src = ("" + name + ".ogg");
  get$$document().query("#canvas-content").get$nodes().add(sfx);
  print$(("read " + name + ".ogg"));
  sfx.load();
  return sfx;
}
Phoenix.prototype.loadRoms = function(buffer) {
  for (var i = (0);
   i <= (16383); i++) {
    this.mem.$setindex(i, $bit_and$(($add$(buffer.$index(i), (256))), (255)));
  }
  for (var i = (0);
   i <= (8191); i++) {
    this.chr.$setindex(i, buffer.$index(i + (16384)));
  }
}
Phoenix.prototype.interrupt = function() {
  this.interruptCounter++;
  this.vBlank = true;
  this.refreshGameControls();
  if ($mod$(this.interruptCounter, this.getFrameSkip()) == (0)) {
    this.refreshScreen();
  }
  if (($mod$(this.interruptCounter, (10))) == (0)) {
    this.resetGameControls();
  }
  if (($mod$(this.interruptCounter, (60))) == (0)) {
    this.timeNow = Clock.now();
    this.msPerFrame = this.timeNow - this.timeBefore;
    this.framesPerSecond = Clock.frequency() / (this.msPerFrame / (60));
    this.timeBefore = this.timeNow;
  }
  return i8080.prototype.interrupt.call(this);
}
Phoenix.prototype.refreshGameControls = function() {
  for (var i = (0);
   i < this.gameControl.get$length(); i++) {
    this.gameControl.$setindex(i, this.desiredGameControlForNextLoop.$index(i) ? (0) : (1));
  }
}
Phoenix.prototype.resetGameControls = function() {
  for (var i = (0);
   i < this.gameControl.get$length(); i++) {
    this.gameControl.$setindex(i, this.desiredGameControlForNextLoop.$index(i) ? (0) : (1));
    this.desiredGameControlForNextLoop.$setindex(i, false);
  }
}
Phoenix.prototype.refreshScreen = function() {
  if ((!this.backgroundRefresh && !this.foregroundRefresh) && !this.scrollRefresh) return;
  var paletteChars = this.palette == (0) ? this.characters0 : this.characters1;
  if (this.backgroundRefresh) {
    for (var a_i = (0);
     a_i < this.dirtyBackground.get$length(); a_i++) {
      var a = this.dirtyBackground.$index(a_i);
      var base = a - (18432);
      var x = (25) - (base / (32)).floor().toInt();
      if (x < (0)) {
        x = (0);
      }
      var y = $mod$(base, (32));
      var character = this.mem.$index(a);
      for (var i = (0);
       i < (8); i++) {
        for (var j = (0);
         j < (8); j++) {
          var c = paletteChars.$index(character * (64) + j + i * (8));
          var __x = x * (8) + j;
          var __y = y * (8) + i;
          var baseaddr = (4) * (__y * $globals.Phoenix_WIDTH + __x);
          this.backImageData.data.$setindex(baseaddr, c.r);
          this.backImageData.data.$setindex(baseaddr + (1), c.g);
          this.backImageData.data.$setindex(baseaddr + (2), c.b);
          this.backImageData.data.$setindex(baseaddr + (3), ((255) * c.alpha).toInt());
        }
      }
    }
    this.backGraphics.putImageData(this.backImageData, (0), (0));
    this.backgroundRefresh = false;
    this.dirtyBackground.clear$_();
  }
  if (this.foregroundRefresh) {
    for (var a_i = (0);
     a_i < this.dirtyForeground.get$length(); a_i++) {
      var a = this.dirtyForeground.$index(a_i);
      var base = a - (16384);
      var x = (25) - (base / (32)).toInt();
      if (x < (0)) {
        x = (0);
      }
      var y = $mod$(base, (32));
      var character = this.mem.$index(a);
      for (var i = (0);
       i < (8); i++) {
        for (var j = (0);
         j < (8); j++) {
          var c = paletteChars.$index((16384) + character * (64) + j + i * (8));
          var __x = x * (8) + j;
          var __y = y * (8) + i;
          var baseaddr = (4) * (__y * $globals.Phoenix_WIDTH + __x);
          this.frontImageData.data.$setindex(baseaddr, c.r);
          this.frontImageData.data.$setindex(baseaddr + (1), c.g);
          this.frontImageData.data.$setindex(baseaddr + (2), c.b);
          this.frontImageData.data.$setindex(baseaddr + (3), ((255) * c.alpha).toInt());
        }
      }
    }
    this.frontGraphics.putImageData(this.frontImageData, (0), (0));
    this.foregroundRefresh = false;
    this.dirtyForeground.clear$_();
  }
  this.canvasGraphics.setFillColor(const$0023.get$dr(), const$0023.get$dg(), const$0023.get$db(), const$0023.alpha);
  this.canvasGraphics.fillRect((0), (0), $globals.Phoenix_WIDTH, $globals.Phoenix_HEIGHT);
  this.canvasGraphics.drawImage(this.backCanvas, (0), $globals.Phoenix_HEIGHT - this.scrollRegister);
  this.canvasGraphics.drawImage(this.backCanvas, (0), -this.scrollRegister);
  this.scrollRefresh = false;
  this.canvasGraphics.drawImage(this.frontCanvas, (0), (0));
  this.canvasGraphics.setFillColor(const$0024.get$dr(), const$0024.get$dg(), const$0024.get$db(), const$0024.alpha);
  this.canvasGraphics.fillText(this.framesPerSecond.toInt().toString(), (0), (255));
  if (!this.isRealSpeed()) this.canvasGraphics.fillText("S", $globals.Phoenix_WIDTH - (24), (255));
  if ((this.isAutoFrameSkip()) && (this.getFrameSkip() != (1))) this.canvasGraphics.fillText("A", $globals.Phoenix_WIDTH - (32), (255));
  if (this.isMute()) this.canvasGraphics.fillText("M", $globals.Phoenix_WIDTH - (48), (255));
  if (this.getFrameSkip() != (1)) this.canvasGraphics.fillText(this.getFrameSkip().toString(), $globals.Phoenix_WIDTH - (16), (255));
}
Phoenix.prototype.decodeChars = function() {
  var $0;
  this.characters0 = new Array((32768));
  this.characters1 = new Array((32768));
  for (var s = (0);
   s < (2); s++) {
    for (var c = (0);
     c < (256); c++) {
      var block = new Array((8));
      for (var _c = (0);
       _c < block.get$length(); _c++) {
        block.$setindex(_c, new Array((8)));
        Util.initializeIntList(block.$index(_c));
      }
      for (var plane = (0);
       plane < (2); plane++) {
        for (var line = (0);
         line < (8); line++) {
          var b = this.chr.$index(s * (4096) + c * (8) + plane * (256) * (8) + line);
          var bin = new Array((8));
          Util.initializeIntList(bin);
          bin.$setindex((0), (b & (1)) >> (0));
          bin.$setindex((1), ((b & (2)) >> (1)));
          bin.$setindex((2), ((b & (4)) >> (2)));
          bin.$setindex((3), ((b & (8)) >> (3)));
          bin.$setindex((4), ((b & (16)) >> (4)));
          bin.$setindex((5), ((b & (32)) >> (5)));
          bin.$setindex((6), ((b & (64)) >> (6)));
          bin.$setindex((7), ((b & (128)) >> (7)));
          for (var col = (0);
           col < (8); col++) {
            ($0 = block.$index(line)).$setindex(col, $add$($0.$index(col), ($mul$(((1) + ((1) - plane)), bin.$index(col)))));
            var pixelColorIndex = (0);
            pixelColorIndex = (((c & (255)) >> (5)) & (255)) * (4);
            pixelColorIndex = $add$(pixelColorIndex, block.$index(line).$index(col));
            pixelColorIndex += (((1) - s) * (64));
            var color = const$0021.$index(pixelColorIndex);
            if (color.r == const$0008.r && color.g == const$0008.g && color.b == const$0008.b) color = const$0022;
            this.characters0.$setindex(s * (256) * (64) + c * (64) + col * (8) + (7) - line, color);
            color = const$0021.$index(pixelColorIndex + (32));
            if (color.r == const$0008.r && color.g == const$0008.g && color.b == const$0008.b) color = const$0022;
            this.characters1.$setindex(s * (256) * (64) + c * (64) + col * (8) + (7) - line, color);
          }
        }
      }
    }
  }
}
Phoenix.prototype.doKey = function(e) {
  var pos = (-1);
  switch (e.keyCode) {
    case (51):

      pos = (0);
      break;

    case (49):

      pos = (1);
      break;

    case (50):

      pos = (2);
      break;

    case (32):

      pos = (4);
      break;

    case (39):

      pos = (5);
      break;

    case (37):

      pos = (6);
      break;

    case (40):

      pos = (7);
      break;

  }
  if (pos >= (0)) this.desiredGameControlForNextLoop.$setindex(pos, true);
}
Phoenix.prototype.setFrameSkip = function(fs) {
  this.frameSkip = fs;
}
Phoenix.prototype.getFrameSkip = function() {
  return this.frameSkip;
}
Phoenix.prototype.getFramesPerSecond = function() {
  return this.framesPerSecond;
}
Phoenix.prototype.isAutoFrameSkip = function() {
  return this.autoFrameSkip;
}
Phoenix.prototype.isRealSpeed = function() {
  return this.realSpeed;
}
Phoenix.prototype.isMute = function() {
  return this.mute;
}
function Color(r, g, b, alpha) {
  this.r = r;
  this.g = g;
  this.b = b;
  this.alpha = alpha;
}
Color.prototype.get$dr = function() {
  return this.r / (255);
}
Color.prototype.get$dg = function() {
  return this.g / (255);
}
Color.prototype.get$db = function() {
  return this.b / (255);
}
function Util() {}
Util.initializeIntList = function(list) {
  for (var i = (0);
   i < list.get$length(); i++) {
    list.$setindex(i, (0));
  }
}
Util.initializeBoolList = function(list) {
  for (var i = (0);
   i < list.get$length(); i++) {
    list.$setindex(i, false);
  }
}
function main() {
  new PhoenixDart().run();
}
(function(){
  var v0/*HTMLMediaElement*/ = 'HTMLMediaElement|HTMLAudioElement|HTMLVideoElement';
  var v1/*CharacterData*/ = 'CharacterData|Comment|Text|CDATASection';
  var v2/*HTMLDocument*/ = 'HTMLDocument|SVGDocument';
  var v3/*DocumentFragment*/ = 'DocumentFragment|ShadowRoot';
  var v4/*Element*/ = [v0/*HTMLMediaElement*/,'Element|HTMLElement|HTMLAnchorElement|HTMLAppletElement|HTMLAreaElement|HTMLBRElement|HTMLBaseElement|HTMLBaseFontElement|HTMLBodyElement|HTMLButtonElement|HTMLCanvasElement|HTMLContentElement|HTMLDListElement|HTMLDetailsElement|HTMLDirectoryElement|HTMLDivElement|HTMLEmbedElement|HTMLFieldSetElement|HTMLFontElement|HTMLFormElement|HTMLFrameElement|HTMLFrameSetElement|HTMLHRElement|HTMLHeadElement|HTMLHeadingElement|HTMLHtmlElement|HTMLIFrameElement|HTMLImageElement|HTMLInputElement|HTMLKeygenElement|HTMLLIElement|HTMLLabelElement|HTMLLegendElement|HTMLLinkElement|HTMLMapElement|HTMLMarqueeElement|HTMLMenuElement|HTMLMetaElement|HTMLMeterElement|HTMLModElement|HTMLOListElement|HTMLObjectElement|HTMLOptGroupElement|HTMLOptionElement|HTMLOutputElement|HTMLParagraphElement|HTMLParamElement|HTMLPreElement|HTMLProgressElement|HTMLQuoteElement|SVGElement|SVGAElement|SVGAltGlyphDefElement|SVGAltGlyphItemElement|SVGAnimationElement|SVGAnimateColorElement|SVGAnimateElement|SVGAnimateMotionElement|SVGAnimateTransformElement|SVGSetElement|SVGCircleElement|SVGClipPathElement|SVGComponentTransferFunctionElement|SVGFEFuncAElement|SVGFEFuncBElement|SVGFEFuncGElement|SVGFEFuncRElement|SVGCursorElement|SVGDefsElement|SVGDescElement|SVGEllipseElement|SVGFEBlendElement|SVGFEColorMatrixElement|SVGFEComponentTransferElement|SVGFECompositeElement|SVGFEConvolveMatrixElement|SVGFEDiffuseLightingElement|SVGFEDisplacementMapElement|SVGFEDistantLightElement|SVGFEDropShadowElement|SVGFEFloodElement|SVGFEGaussianBlurElement|SVGFEImageElement|SVGFEMergeElement|SVGFEMergeNodeElement|SVGFEMorphologyElement|SVGFEOffsetElement|SVGFEPointLightElement|SVGFESpecularLightingElement|SVGFESpotLightElement|SVGFETileElement|SVGFETurbulenceElement|SVGFilterElement|SVGFontElement|SVGFontFaceElement|SVGFontFaceFormatElement|SVGFontFaceNameElement|SVGFontFaceSrcElement|SVGFontFaceUriElement|SVGForeignObjectElement|SVGGElement|SVGGlyphElement|SVGGlyphRefElement|SVGGradientElement|SVGLinearGradientElement|SVGRadialGradientElement|SVGHKernElement|SVGImageElement|SVGLineElement|SVGMPathElement|SVGMarkerElement|SVGMaskElement|SVGMetadataElement|SVGMissingGlyphElement|SVGPathElement|SVGPatternElement|SVGPolygonElement|SVGPolylineElement|SVGRectElement|SVGSVGElement|SVGScriptElement|SVGStopElement|SVGStyleElement|SVGSwitchElement|SVGSymbolElement|SVGTextContentElement|SVGTextPathElement|SVGTextPositioningElement|SVGAltGlyphElement|SVGTRefElement|SVGTSpanElement|SVGTextElement|SVGTitleElement|SVGUseElement|SVGVKernElement|SVGViewElement|HTMLScriptElement|HTMLSelectElement|HTMLShadowElement|HTMLSourceElement|HTMLSpanElement|HTMLStyleElement|HTMLTableCaptionElement|HTMLTableCellElement|HTMLTableColElement|HTMLTableElement|HTMLTableRowElement|HTMLTableSectionElement|HTMLTextAreaElement|HTMLTitleElement|HTMLTrackElement|HTMLUListElement|HTMLUnknownElement'].join('|');
  var table = [
    ['AudioParam', 'AudioParam|AudioGain']
    , ['CSSValueList', 'CSSValueList|WebKitCSSTransformValue|WebKitCSSFilterValue']
    , ['CharacterData', v1/*CharacterData*/]
    , ['DOMTokenList', 'DOMTokenList|DOMSettableTokenList']
    , ['HTMLDocument', v2/*HTMLDocument*/]
    , ['DocumentFragment', v3/*DocumentFragment*/]
    , ['HTMLMediaElement', v0/*HTMLMediaElement*/]
    , ['Element', v4/*Element*/]
    , ['Entry', 'Entry|DirectoryEntry|FileEntry']
    , ['EntrySync', 'EntrySync|DirectoryEntrySync|FileEntrySync']
    , ['HTMLCollection', 'HTMLCollection|HTMLOptionsCollection']
    , ['Node', [v1/*CharacterData*/,v2/*HTMLDocument*/,v3/*DocumentFragment*/,v4/*Element*/,'Node|Attr|DocumentType|Entity|EntityReference|Notation|ProcessingInstruction'].join('|')]
    , ['Uint8Array', 'Uint8Array|Uint8ClampedArray']
  ];
  $dynamicSetMetadata(table);
})();
function $static_init(){
  $globals.Phoenix_HEIGHT = (256);
  $globals.Phoenix_WIDTH = (208);
}
var const$0000 = Object.create(_DeletedKeySentinel.prototype, {});
var const$0001 = Object.create(NoMoreElementsException.prototype, {});
var const$0004 = new JSSyntaxRegExp("^#[_a-zA-Z]\\w*$");
var const$0005 = Object.create(EmptyQueueException.prototype, {});
var const$0006 = Object.create(IllegalAccessException.prototype, {});
var const$0007 = _constMap([]);
var const$0008 = Object.create(Color.prototype, {alpha: {"value": (0.0), writeable: false}, b: {"value": (0), writeable: false}, g: {"value": (0), writeable: false}, r: {"value": (0), writeable: false}});
var const$0009 = Object.create(Color.prototype, {alpha: {"value": (1.0), writeable: false}, b: {"value": (219), writeable: false}, g: {"value": (255), writeable: false}, r: {"value": (0), writeable: false}});
var const$0010 = Object.create(Color.prototype, {alpha: {"value": (1.0), writeable: false}, b: {"value": (0), writeable: false}, g: {"value": (255), writeable: false}, r: {"value": (255), writeable: false}});
var const$0011 = Object.create(Color.prototype, {alpha: {"value": (1.0), writeable: false}, b: {"value": (0), writeable: false}, g: {"value": (0), writeable: false}, r: {"value": (255), writeable: false}});
var const$0012 = Object.create(Color.prototype, {alpha: {"value": (1.0), writeable: false}, b: {"value": (219), writeable: false}, g: {"value": (219), writeable: false}, r: {"value": (219), writeable: false}});
var const$0013 = Object.create(Color.prototype, {alpha: {"value": (1.0), writeable: false}, b: {"value": (219), writeable: false}, g: {"value": (182), writeable: false}, r: {"value": (255), writeable: false}});
var const$0014 = Object.create(Color.prototype, {alpha: {"value": (1.0), writeable: false}, b: {"value": (255), writeable: false}, g: {"value": (0), writeable: false}, r: {"value": (255), writeable: false}});
var const$0015 = Object.create(Color.prototype, {alpha: {"value": (1.0), writeable: false}, b: {"value": (0), writeable: false}, g: {"value": (255), writeable: false}, r: {"value": (0), writeable: false}});
var const$0016 = Object.create(Color.prototype, {alpha: {"value": (1.0), writeable: false}, b: {"value": (219), writeable: false}, g: {"value": (36), writeable: false}, r: {"value": (36), writeable: false}});
var const$0017 = Object.create(Color.prototype, {alpha: {"value": (1.0), writeable: false}, b: {"value": (255), writeable: false}, g: {"value": (149), writeable: false}, r: {"value": (149), writeable: false}});
var const$0018 = Object.create(Color.prototype, {alpha: {"value": (1.0), writeable: false}, b: {"value": (0), writeable: false}, g: {"value": (182), writeable: false}, r: {"value": (255), writeable: false}});
var const$0019 = Object.create(Color.prototype, {alpha: {"value": (1.0), writeable: false}, b: {"value": (255), writeable: false}, g: {"value": (36), writeable: false}, r: {"value": (182), writeable: false}});
var const$0020 = Object.create(Color.prototype, {alpha: {"value": (1.0), writeable: false}, b: {"value": (182), writeable: false}, g: {"value": (36), writeable: false}, r: {"value": (255), writeable: false}});
var const$0022 = Object.create(Color.prototype, {alpha: {"value": (0), writeable: false}, b: {"value": (0), writeable: false}, g: {"value": (0), writeable: false}, r: {"value": (0), writeable: false}});
var const$0023 = Object.create(Color.prototype, {alpha: {"value": (1.0), writeable: false}, b: {"value": (0), writeable: false}, g: {"value": (0), writeable: false}, r: {"value": (0), writeable: false}});
var const$0024 = Object.create(Color.prototype, {alpha: {"value": (1.0), writeable: false}, b: {"value": (0), writeable: false}, g: {"value": (219), writeable: false}, r: {"value": (219), writeable: false}});
var const$0021 = ImmutableList.ImmutableList$from$factory([const$0008, const$0008, const$0009, const$0009, const$0008, const$0010, const$0011, const$0012, const$0008, const$0010, const$0011, const$0012, const$0008, const$0013, const$0014, const$0010, const$0008, const$0013, const$0014, const$0010, const$0008, const$0013, const$0014, const$0010, const$0008, const$0012, const$0014, const$0010, const$0008, const$0014, const$0015, const$0012, const$0008, const$0016, const$0009, const$0009, const$0008, const$0010, const$0011, const$0012, const$0008, const$0010, const$0011, const$0012, const$0008, const$0010, const$0015, const$0014, const$0008, const$0010, const$0015, const$0014, const$0008, const$0010, const$0015, const$0014, const$0008, const$0012, const$0011, const$0014, const$0008, const$0014, const$0015, const$0012, const$0008, const$0011, const$0016, const$0012, const$0008, const$0014, const$0017, const$0018, const$0008, const$0019, const$0015, const$0018, const$0008, const$0017, const$0019, const$0020, const$0008, const$0014, const$0017, const$0015, const$0008, const$0014, const$0017, const$0015, const$0008, const$0014, const$0017, const$0015, const$0008, const$0014, const$0017, const$0015, const$0008, const$0011, const$0016, const$0012, const$0008, const$0014, const$0017, const$0018, const$0008, const$0019, const$0015, const$0018, const$0008, const$0017, const$0019, const$0020, const$0008, const$0017, const$0020, const$0015, const$0008, const$0017, const$0020, const$0015, const$0008, const$0017, const$0020, const$0015, const$0008, const$0017, const$0020, const$0015]);
var $globals = {};
$static_init();
if (typeof window != 'undefined' && typeof document != 'undefined' &&
    window.addEventListener && document.readyState == 'loading') {
  window.addEventListener('DOMContentLoaded', function(e) {
    main();
  });
} else {
  main();
}
