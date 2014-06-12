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
