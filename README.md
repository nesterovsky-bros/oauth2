oauth2
======

A small demo of oauth2 integration

Here we implement oauth2 authorization withing angularjs.

Authentication is done as follows:
  1. Open oauth provider login/grant screen.
  2. Redirect to the oauth callback screen with access token.
  3. Verification of the access token against provider.
  4. Get some basic profile.


A base class OAuth2 (https://github.com/nesterovsky-bros/oauth2/blob/master/OAuth2/Scripts/app/oauth2/oauth2.js)
implements this steps.

There are following implementations that implement authorization against specific providers:
  OAuth2Facebook - https://github.com/nesterovsky-bros/oauth2/blob/master/OAuth2/Scripts/app/oauth2/oauth2-facebook.js
  OAuth2Google - https://github.com/nesterovsky-bros/oauth2/blob/master/OAuth2/Scripts/app/oauth2/oauth2-google.js
  OAuth2Server - https://github.com/nesterovsky-bros/oauth2/blob/master/OAuth2/Scripts/app/oauth2/oauth2-server.js
  
OAuth2Server - implements authorization through known providers, but calls server side to validate access token. 
This way, server can establish a user's session.

The file Config.json - https://github.com/nesterovsky-bros/oauth2/blob/master/OAuth2/Scripts/app/oauth2/Config.json
contains endpoints and request parameters per supported provider.

Please note that you should have register a client_id for each provider.
Please also note that user id and access tokens are unique only in a scope of access provider, thus 
  a session is identified by Provider + access_token, and
  a user is identified by Provider + user_id
  
The use case can be found in test.js - https://github.com/nesterovsky-bros/oauth2/blob/master/OAuth2/Scripts/app/test/test.js

E.g. authorization against OAuth2Server is done like this:

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

Authorization token contains a Promise token.$promise to handle authorization outcome.
Authorization token contains $cancelToken (alternatively cancelation promise can be passed 
during authorize request), which can be used to cancel authorization in progress.


Whole sample is implemented as VS project.
All application scripts are build with app.tt - https://github.com/nesterovsky-bros/oauth2/blob/master/OAuth2/Scripts/app.tt
which includes all content in https://github.com/nesterovsky-bros/oauth2/tree/master/OAuth2/Scripts/app
and results into output https://github.com/nesterovsky-bros/oauth2/blob/master/OAuth2/Scripts/app.js

Server side is implemented as ASP.NET Web API.
Authorization controllers are
  GoogleController - https://github.com/nesterovsky-bros/oauth2/blob/master/OAuth2/Controllers/OAuth2/GoogleController.cs
  FacebookController - https://github.com/nesterovsky-bros/oauth2/blob/master/OAuth2/Controllers/OAuth2/FacebookController.cs
