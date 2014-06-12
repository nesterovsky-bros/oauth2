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
