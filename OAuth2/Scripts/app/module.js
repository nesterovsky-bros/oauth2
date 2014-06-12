(function ()
{
"use strict";

var module = angular.module("app", ["ngResource"]);

/**
 * Inherits a parent class with proto.
 * @param parent {Function} a parent constructor function.
 * @param proto {Object} an extension prototype.
 *   proto.init, if any, is a constructor of the extended class.
 * @returns {Function} a constructor function of a class that extends parent.
 */
function inherit(parent, proto)
{
  if (!proto)
  {
    proto = parent;
    parent = null;
  }

  var extended;

  if (!parent)
  {
    extended = proto && proto.init || angular.noop;
    extended.prototype = proto;
  }
  else
  {
    var base = function() { };

    extended = proto && proto.init ||
      function() { parent.apply(this, arguments); };
    base.prototype = parent.prototype;
    extended.prototype = angular.extend(new base(), proto);
  }

  extended.prototype.constructor = extended;

  return extended;
}

/* content place holder */

})();

