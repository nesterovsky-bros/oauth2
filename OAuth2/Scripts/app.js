 
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
    extended = proto.init || function() {};
    extended.prototype = proto;
  }
  else
  {
    var base = function() { };

    extended = proto.init ||
      function() { parent.apply(this, arguments); };
    base.prototype = parent.prototype;
    extended.prototype = angular.extend(new base(), proto);
  }

  extended.prototype.constructor = extended;

  return extended;
}

// OAuth base class
module.factory("OAuth2", ["$window", "$q", "$http", "oauth2/Config",
  function ($window, $q, $http, config)
  {
    return inherit(
    {
      /**
       * A provider name.
      */
      provider: null,

      /**
       * Default options.
       */
      options: null,

      /**
       * Authorization redirect page.
       */
      $redirectUrl: "oauth2callback.html",

      /**
       * Parameters to window.open() call.
       */
      $windowParams: "", //"width=650,height=300,resizable=yes,scrollbars=yes",

      /**
       * Constructs an OAuth2 instance.
       * @param options {Object} optional provider specific parameters. (See oauth2/Config.json).
       *   If not specified then config[this.provider] is used.
       */
      init: function (options)
      {
        this.options = options || config[this.provider] || {};
      },

      /**
       * Authorizes application to act as a user.
       * @param params {Object} provider specific parameters.
       * @param cancel {Promise} optional cancel promise.
       */
      authorize: function (params, cancel)
      {
        var self = this;
        var cancelToken = !cancel && $q.defer();

        var token =
        {
          provider: self.provider,
          params: angular.extend({}, self.options.params, params),
          infos: {},

          $cancelToken: cancelToken,
          $cancel: cancel || cancelToken.promise,

          param: function (key, value)
          {
            return self.$param(token, key, value);
          },

          info: function (key, value)
          {
            return self.$info(token, key, value);
          }
        };

        angular.forEach(
          params,
          function (value, name) { token.param(name, value); });

        token.clientId = token.param("client_id");
        token.param("state", self.$randomString(16) + "." + token.clientId);

        if (!token.param("redirect_uri"))
        {
          token.param(
            "redirect_uri",
            angular.element("<a href='#'></a>").
              attr("href", self.$redirectUrl).prop("href"));
        }

        token.$promise = self.$dialog(token).
          then(
            function ()
            {
              if (token.info("state") != token.param("state"))
              {
                throw new Error("cross-site-request-forgery mitigation.");
              }

              var error = token.info("error");

              if (error)
              {
                throw new Error(error);
              }

              var accessToken = token.info("access_token");

              if (!accessToken)
              {
                throw new Error("access_token is expected.");
              }

              token.accessToken = accessToken;
              token.authorizedAt = new Date();
              token.expiresAt = token.info("expiresAt");
            }).
          then(function () { return self.$validate(token); }).
          then(
            function (response)
            {
              token.validatedAt = new Date();
              token.expiresAt = token.info("expiresAt");
            }).
          then(function () { return self.$profile(token); }).
          then(
            function (response)
            {
              token.userId = token.info("user_id");
              token.locale = token.info("locale");
              token.name = token.info("name");
              token.gender = token.info("gender");
              token.picture = token.info("picture");
            }).
          then(
            function ()
            {
              token.$cancel["finally"](function () { token.accessToken = null; });

              return token;
            },
            function (e)
            {
              token.accessToken = null;

              return $q.reject(e);
            });

        return token;
      },

      $param: function (token, key, value)
      {
        if (value === undefined)
        {
          return token.params[key];
        }

        token.params[key] = value;
      },

      $info: function (token, key, value)
      {
        if (value === undefined)
        {
          return token.infos[key];
        }

        token.infos[key] = value;
      },

      $dialog: function (token)
      {
        var deferred = $q.defer();
        var key = "oauth2." + token.clientId;
        var url = this.options.endpoints.authenticate + "?" +
          this.$toKeyValue(token.params);


        token.$cancel["finally"](function (e) { deferred.reject(e); });

        $window.localStorage.removeItem(key);
        angular.element($window).on("storage", handler);

        $window.open(url, key, this.$windowParams);

        return deferred.promise["finally"](
          function ()
          {
            angular.element($window).off("storage", handler);
            $window.localStorage.removeItem(key);
          });

        function handler(e)
        {
          if ((e.storageArea != $window.localStorage) || (e.key !== key))
          {
            return;
          }

          var data = $window.localStorage.getItem(key);

          if (!data)
          {
            return;
          }

          angular.extend(token.infos, JSON.parse(data));
          deferred.resolve();
        }
      },

      $validate: function (token)
      {
        var url = this.options.endpoints.validate;

        return url &&
          $http(
          {
            method: "get",
            url: url,
            params: { access_token: token.accessToken },
            timeout: token.$cancel
          }).
            then(
              function (response)
              {
                angular.extend(token.infos, response.data);
              });
      },

      $profile: function (token)
      {
        var url = this.options.endpoints.profile;

        return url &&
          $http(
          {
            method: "get",
            url: url,
            params: { access_token: token.accessToken },
            timeout: token.$cancel
          }).
          then(
            function (response)
            {
              angular.extend(token.infos, response.data);
            });
      },

      /**
       * Returns a random string of a specified length.
       * @param length {number} a string length.
       * @returns a random string containing digits and latin letters only.
       */
      $randomString: function (length)
      {
        var result = "";

        while (result.length < length)
        {
          result += Math.random().toString(36).slice(2);
        }

        return result.slice(0, length);
      },

      /**
       * Converts object in query string params.
       * @param obj {Object} object containing fields to convert.
       * @returns a query string.
       */
      $toKeyValue: function (obj)
      {
        var parts = [];

        angular.forEach(
          obj,
          function (value, key)
          {
            parts.push(
              encodeURIComponent(key) + '=' + encodeURIComponent(value));
          });

        return parts.length ? parts.join('&') : '';
      }
    });
  }]);

// OAuth 2 authentication against google.
module.factory("OAuth2Google", ["OAuth2", function(OAuth2)
{
  return inherit(
    OAuth2,
    {
      provider: "Google",

      $info: function(token, key, value)
      {
        if (value === undefined)
        {
          switch(key)
          {
            case "expiresAt":
            {
              return new Date(
                +(token.validatedAt || token.authorizedAt) +
                token.infos.expires_in * 1000);
            }
            case "picture":
            {
              var picture = token.infos.picture;

              // Fix a Google's bug
              if (picture && (picture.indexOf("https:https") == 0))
              {
                picture = picture.substr("https:".length);
              }

              return picture;
            }
          }
        }

        return OAuth2.prototype.$info.call(this, token, key, value);
      }
    });
}]);

// OAuth 2 authentication against google.
module.factory("OAuth2Facebook", ["OAuth2", "$http", function(OAuth2, $http)
{
  return inherit(
    OAuth2,
    {
      provider: "Facebook",

      $info: function(token, key, value)
      {
        if (value === undefined)
        {
          switch(key)
          {
            case "expiresAt":
            {
              return new Date(
                +token.authorizedAt + token.infos.expires_in * 1000);
            }
            case "picture":
            {
              return this.options.endpoints.picture.replace(
                /:user-id(?:\/|$)/g, 
                encodeURIComponent(token.infos.user_id));
            }
          }
        }

        return OAuth2.prototype.$info.call(this, token, key, value);
      },

      $validate: function(token)
      {
        var url = this.options.endpoints.validate;

        return url &&
          $http(
            {
              method: "get",
              url: url,
              params:
              {
                input_token: token.accessToken,
                access_token: token.accessToken
              },
              timeout: token.$cancel
            }).
              then(
                function(response)
                {
                  angular.extend(token.infos, response.data.data);
                });
      }
    });
}]);

// OAuth 2 authentication that validates against application server.
module.factory("OAuth2Server", ["OAuth2", "oauth2/Config", "$resource",
  function(OAuth2, config, $resource)
{
  var service = $resource("api/oauth2/:provider", {});

  return inherit(
    OAuth2,
    {
      init: function(provider)
      {
        this.provider = provider;

        OAuth2.prototype.init.call(this, config[provider]);
      },

      $info: function (token, key, value)
      {
        if (value === undefined)
        {
          switch(key)
          {
            case "expiresAt":
            {
              return new Date(token.infos.expiresAt);
            }
            default:
            {
              return token.infos[key] ||
                token.infos.profile && token.infos.profile[key];
            }
          }
        }

        return OAuth2.prototype.$info.call(this, token, key, value);
      },

      $validate: function(token)
      {
        token.infos.provider = this.provider;

        var result = service.get(token.infos);

        return result.$promise.
          then(function() { angular.extend(token.infos, result); });
      },

      $profile: angular.noop
    });
}]);

module.constant(
  'oauth2/Config',
  {
    Google:
    {
      endpoints: 
      {
        authenticate: "https://accounts.google.com/o/oauth2/auth",
        validate: "https://www.googleapis.com/oauth2/v1/tokeninfo",
        profile: "https://www.googleapis.com/plus/v1/people/me/openIdConnect"
      },
      params: 
      {
        response_type: "token",
        scope: "openid profile",
        include_granted_scopes: true,
        approval_prompt: "force",
  
        client_id: "852924519530-hsv25f8g5gjra7ak777624doa5863krb.apps.googleusercontent.com"
      }
    },
    Facebook: 
    {
      endpoints: 
      {
        authenticate: "https://www.facebook.com/dialog/oauth",
        validate: "https://graph.facebook.com/debug_token",
        profile: "https://graph.facebook.com/me",
        picture: "https://graph.facebook.com/:user-id/picture"
      },
      params: 
      {
        response_type: "token",
        scope: "public_profile",
  
        client_id: "428910043915716"
      }
   }
  });

// An app-search directive supports test search screen.
module.controller("OAuth2Test", ["$injector", "oauth2/Config",
  function($injector, config)
{
    this.login = function(provider, validateOnServer)
    {
      var token;

      if (validateOnServer)
      {
        var Login = $injector.get("OAuth2Server");
        var login = new Login(provider);

        token = login.authorize();
      }
      else
      {
        var Login = $injector.get("OAuth2" + provider);
        var login = new Login();
        
        token = login.authorize(config[provider].params);
      }

      token.$promise.
        then(
          function(result)
          {
            alert("Success: " + JSON.stringify(
            {
              userId: token.userId,
              locale: token.locale,
              name: token.name,
              gender: token.gender,
              picture: token.picture,
              expiresAt: token.expiresAt,
              accessToken: token.accessToken,
              provider: token.provider
            }));
          },
          function(error)
          {
            if (error)
            {
              alert("Error: " + JSON.stringify(error));
            }
          });
    }
}]);



})();


