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
