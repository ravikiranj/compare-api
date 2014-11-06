var compare = (function(document, window) {
  "use strict";
  var _handleFormSubmit = function(e) {
    var url1 = $("#API_URL_1").val()
    , url2 = $("#API_URL_2").val()
    ;
    _clearResponseFields();
    e.preventDefault();
    if (!url1 && !url2) {
      alert("Please enter non empty urls!");
      return;
    }
    $.when(_getUrlResponse(url1),
           _getUrlResponse(url2)
    ).done(
      function(a1, a2) {
        _compareResponses(a1, a2);
      }
    );
  },

  _clearResponseFields = function() {
    var results1Elem = $("#RESULTS_1")
    , results2Elem = $("#RESULTS_2")
    , results1Url = $("#RESULTS_1_URL")
    , results2Url = $("#RESULTS_2_URL")
    , resultsDiff = $("#RESULTS_DIFF")
    , statusElem = $("#STATUS")
    ;
    results1Elem.html("URL1 Result");
    results2Elem.html("URL2 Result");
    results1Url.html("URL1")
    results2Url.html("URL2")
    resultsDiff.html("Results Diff");
    statusElem.html("STATUS = UNKNOWN");
  },

  _getUrlResponse = function(url) {
    if (!url) {
      return "";
    }
    return $.get(url);
  },
  
  /**
   * a[num] = [data, statusText, jqXHR]
   */
  _compareResponses = function(a1, a2) {
    if (!a1 || !a2) {
      alert("There was an error comparing responses");
      return;
    }
    var resp1Str
    , resp2Str
    , resp1
    , resp2
    , results1Elem = $("#RESULTS_1")
    , results2Elem = $("#RESULTS_2")
    , results1Url = $("#RESULTS_1_URL")
    , results2Url = $("#RESULTS_2_URL")
    , resultsDiff = $("#RESULTS_DIFF")
    , statusElem = $("#STATUS")
    , url1 = $("#API_URL_1").val()
    , url2 = $("#API_URL_2").val()
    , delta
    ;

    resp1 = a1[0] ? a1[0] : {"key": "Dummy1"};
    resp2 = a2[0] ? a2[0] : {"key": "Dummy2"};

    resp1Str = a1[2] ? a1[2].responseText : "Dummy1";
    resp2Str = a2[2] ? a2[2].responseText : "Dummy2";

    console.log(a1);
    console.log(a2);

    //results1Elem.html(url1 + "\n" + JSON.stringify(resp1, undefined, 2));
    //results2Elem.html(url2 + "\n" + JSON.stringify(resp2, undefined, 2));
    results1Elem.JSONView(resp1);
    results2Elem.JSONView(resp2);

    results1Url.html(url1);
    results2Url.html(url2);

    //if (resp1Str === resp2Str) {
    if (_deepCompare(resp1, resp2)) {
      statusElem.html("STATUS = EQUAL");
      resultsDiff.html("NO DIFF SINCE THEY ARE EQUAL");
    } else {
      statusElem.html("STATUS = NOT EQUAL");

      // Show the delta
      delta = jsondiffpatch.diff(resp1, resp2);
      resultsDiff.html("");
      resultsDiff.html(jsondiffpatch.formatters.html.format(delta, resp1));
      jsondiffpatch.formatters.html.hideUnchanged();
    }
  },

  _deepCompare = function() {
    var i,
      l,
      leftChain,
      rightChain
    ;
    function _compare2Objects (x, y) {
      var p;

      // remember that NaN === NaN returns false
      // and isNaN(undefined) returns true
      if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
        return true;
      }

      // Compare primitives and functions.     
      // Check if both arguments link to the same object.
      // Especially useful on step when comparing prototypes
      if (x === y) {
        return true;
      }

      // Works in case when functions are created in constructor.
      // Comparing dates is a common scenario. Another built-ins?
      // We can even handle functions passed across iframes
      if ((typeof x === 'function' && typeof y === 'function') ||
         (x instanceof Date && y instanceof Date) ||
         (x instanceof RegExp && y instanceof RegExp) ||
         (x instanceof String && y instanceof String) ||
         (x instanceof Number && y instanceof Number)) {
        return x.toString() === y.toString();
      }

      // At last checking prototypes as good a we can
      if (!(x instanceof Object && y instanceof Object)) {
        return false;
      }

      if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
        return false;
      }

      if (x.constructor !== y.constructor) {
        return false;
      }

      if (x.prototype !== y.prototype) {
        return false;
      }

      // Check for infinitive linking loops
      if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
        return false;
      }

      // Quick checking of one object beeing a subset of another.
      // todo: cache the structure of arguments[0] for performance
      for (p in y) {
        if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
          return false;
        }
        else if (typeof y[p] !== typeof x[p]) {
          return false;
        }
      }

      for (p in x) {
        if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
          return false;
        }
        else if (typeof y[p] !== typeof x[p]) {
          return false;
        }

        switch (typeof (x[p])) {
          case 'object':
          case 'function':
            leftChain.push(x);
            rightChain.push(y);

            if (!_compare2Objects (x[p], y[p])) {
              return false;
            }

            leftChain.pop();
            rightChain.pop();
            break;

          default:
            if (x[p] !== y[p]) {
              return false;
            }
            break;
        }
      }
      return true;
    }
    if (arguments.length < 1) {
      return true; //Die silently? Don't know how to handle such case, please help...
      // throw "Need two or more arguments to compare";
    }

    for (i = 1, l = arguments.length; i < l; i++) {
      leftChain = []; //Todo: this can be cached
      rightChain = [];

      if (!_compare2Objects(arguments[0], arguments[i])) {
        return false;
      }
    }
    return true;
  }
  ;

  return {
    init : function() {
      // Add event handler
      $("#COMPARE_FORM").on("submit", _handleFormSubmit);
    }
  };
}(document, window));

$(function(){
  "use strict";
  compare.init();
});
