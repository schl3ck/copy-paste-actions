var enableRemoteConsole = false;

function customStringify(inp) {
  var cache = [];
  return JSON.stringify(inp, function(key, value) {
    while (cache.length > 0 && this !== cache[cache.length - 1]) {
      cache.pop();
    }
    if (typeof value === "object" && value !== null) {
      if (cache.indexOf(value) !== -1) {
        // Circular reference found, discard key
        return "<circular ref>";
      }
      // Store value in our collection
      cache.push(value);
    }

    if (value instanceof Error) {
      return {
        message: value.message,
        name: value.name,
        stack: value.stack,
        line: value.line || value.lineNumber,
        column: value.column || value.columnNumber,
        type: value.type
      };
    } else if (value instanceof Set) {
      return Array.from(value);
    } else if (value instanceof Map) {
      return Array.from(value);
    }
    return value;
  });
}
function logToServer(level, callee, params) {
  var json = customStringify({ level: level, callee: callee, params: params });
  try {
    var xmlHttp = new XMLHttpRequest();
    // the url is inserted by the chainWebpack function
    xmlHttp.open("POST", "REMOTE_CONSOLE_URL", true);
    xmlHttp.setRequestHeader("Content-Type", "application/json");
    xmlHttp.send(json);
  } catch (err) { }
};

try {
  if (module && module.exports) {
    module.exports = {
      customStringify: customStringify,
      logToServer: logToServer
    };
  }
} catch (err) { }

try {
  if (window && enableRemoteConsole) {
    var handler = function(level) {
      var func = console[level].bind(console);
      return new Proxy(func, {
        apply: function(target, thisArg, args) {
          target.apply(thisArg, args);
          var stack = new Error().stack;
          if (stack) {
            stack = stack.split("\n")[1];
          }
          logToServer(level, stack, args);
        }
      });
    };
    if (console.debug) console.debug = handler("debug");
    if (console.info) console.info = handler("info");
    console.log = handler("log");
    console.warn = handler("warn");
    console.error = handler("error");

    var oldOnerror = window.onerror;
    window.onerror = function onerror(event, source, lineNumber, column, errorObj) {
      oldOnerror && oldOnerror(event, source, lineNumber, column, errorObj);
      logToServer("error", "", {
        event: event,
        lineNumber: lineNumber,
        column: column,
        error: errorObj
      });
    };
  }
} catch (err) { }
