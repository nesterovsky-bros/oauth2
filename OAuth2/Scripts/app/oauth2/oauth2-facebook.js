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
