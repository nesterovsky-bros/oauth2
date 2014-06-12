namespace MyApp.Controllers
{
  using System;
  using System.Linq;
  using System.Net;
  using System.Web.Http;
  using System.Threading.Tasks;
  using Newtonsoft.Json;
  using MyApp.Models;

  /// <summary>
  /// Google OAuth2 verification.
  /// </summary>
  public class GoogleController: ApiController
  {
    /// <summary>
    /// A provider name.
    /// </summary>
    public const string Provider = "Google";

    /// <summary>
    /// Validates oauth 2 access_token against a google provider.
    /// </summary>
    /// <param name="param name="access_token"">
    /// An access token to validate.
    /// </param>
    /// <returns>
    /// Profile info.
    /// </returns>
    public async Task<UserAuthorization> Get(string access_token)
    {
      using(var client = new WebClient())
      {
        client.Headers["Content-Type"] = "application/json";
        client.QueryString["access_token"] = access_token;

        var info = JsonConvert.DeserializeObject<TokenInfo>(
          await client.DownloadStringTaskAsync(validateUrl));

        var user = new UserProfile
        {
          Provider = Provider,
          UserId = info.user_id
        };

        var authorization = new UserAuthorization
        {
          Provider = Provider,
          AccessToken = access_token,
          ClientId = info.issued_to,
          Scopes = (info.scope ?? "").Split(' '),
          ExpiresAt = DateTime.Now.AddSeconds(info.expires_in),
          Profile = user
        };

        if (authorization.Scopes.Contains(profileScope))
        {
          var profile = JsonConvert.DeserializeObject<Profile>(
            await client.DownloadStringTaskAsync(profileUrl));

          user.Name = profile.name;
          user.Locale = profile.locale;
          user.Gender = profile.gender;
          user.Picture = profile.picture;

          // Fix Google bug.
          if ((user.Picture != null) && 
            (user.Picture.StartsWith("https:https")))
          {
            user.Picture = user.Picture.Substring("https:".Length);
          }
        }

        return authorization;
      }
    }

    private class TokenInfo
    {
      public string issued_to {get; set; }
      public string scope {get; set; }
      public int expires_in {get; set; }
      public string user_id {get; set; }
    }

    private class Profile
    {
      public string name { get; set; }
      public string locale { get; set; }
      public string gender { get; set; }
      public string picture { get; set; }
    }

    private const string validateUrl = "https://www.googleapis.com/oauth2/v1/tokeninfo";
    private const string profileUrl = "https://www.googleapis.com/plus/v1/people/me/openIdConnect";
    private const string profileScope = "https://www.googleapis.com/auth/userinfo.profile";
  }
}
