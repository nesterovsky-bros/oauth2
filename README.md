oauth2 - a demo of oauth2 integration
======

Here we implement oauth2 authorization within angularjs.

Authentication is done as follows:

  1. Open oauth2 provider login/grant screen.
  2. Redirect to the oauth2 callback screen with access token.
  3. Verification of the access token against provider.
  4. Get some basic profile.

A base javascript class [OAuth2][1] implements these steps.

There are following implementations that authorize against specific providers:

 - [OAuth2Facebook][2];
 - [OAuth2Google][3];
 - [OAuth2Server][4];

[OAuth2Server][5] - implements authorization through known providers, but calls server side to validate access token. This way, the server side can establish a user's session.

The file [Config.json][6] contains endpoints and request parameters per supported provider.

**Note:**
You should register a client_id for each provider.

**Note:**
user_id and access_tokens are unique only in a scope of access provider, thus a session is identified by Provider + access_token, and a user is identified by Provider + user_id.
  
The use case can be found in [test.js][7]
E.g. authorization against [OAuth2Server][8] is done like this:

    var login = new OAuth2Server(provider);
    
    token = login.authorize();
    
    token.$promise.then(
      function()
      {
        // token contains populated data.
      },
      function(error)
      {
        if (error)
        {
          // handle an error
        }
      });


Authorization token contains:

 - a promise to handle authorization outcome.
 - cancelToken (a Deferred object) to cancel authorization in progress.

Whole sample is implemented as VS project.
All scripts are build with [app.tt][9], that combines content of [Scripts/app][10] int [app.js][11].

Server side is implemented with ASP.NET Web API.
Authorization controllers are

  - [GoogleController][12];
  - [FacebookController][13]

  [1]: https://github.com/nesterovsky-bros/oauth2/blob/master/OAuth2/Scripts/app/oauth2/oauth2.js
  [2]: https://github.com/nesterovsky-bros/oauth2/blob/master/OAuth2/Scripts/app/oauth2/oauth2-facebook.js
  [3]: https://github.com/nesterovsky-bros/oauth2/blob/master/OAuth2/Scripts/app/oauth2/oauth2-google.js
  [4]: https://github.com/nesterovsky-bros/oauth2/blob/master/OAuth2/Scripts/app/oauth2/oauth2-server.js
  [5]: https://github.com/nesterovsky-bros/oauth2/blob/master/OAuth2/Scripts/app/oauth2/oauth2-server.js
  [6]: https://github.com/nesterovsky-bros/oauth2/blob/master/OAuth2/Scripts/app/oauth2/Config.json
  [7]: https://github.com/nesterovsky-bros/oauth2/blob/master/OAuth2/Scripts/app/test/test.js
  [8]: https://github.com/nesterovsky-bros/oauth2/blob/master/OAuth2/Scripts/app/oauth2/oauth2-server.js
  [9]: https://github.com/nesterovsky-bros/oauth2/blob/master/OAuth2/Scripts/app.tt
  [10]: https://github.com/nesterovsky-bros/oauth2/tree/master/OAuth2/Scripts/app
  [11]: https://github.com/nesterovsky-bros/oauth2/blob/master/OAuth2/Scripts/app.js
  [12]: https://github.com/nesterovsky-bros/oauth2/blob/master/OAuth2/Controllers/OAuth2/GoogleController.cs
  [13]: https://github.com/nesterovsky-bros/oauth2/blob/master/OAuth2/Controllers/OAuth2/FacebookController.cs