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
  /// Facebook OAuth2 verification.
  /// </summary>
  public class FacebookController: ApiController
  {
    /// <summary>
    /// A provider name.
    /// </summary>
    public const string Provider = "Facebook";

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
        client.QueryString["input_token"] = access_token;

        var info = JsonConvert.DeserializeObject<TokenInfo>(
          await client.DownloadStringTaskAsync(validateUrl));

        client.QueryString.Remove("input_token");

        var profile = JsonConvert.DeserializeObject<Profile>(
          await client.DownloadStringTaskAsync(profileUrl));

        return new UserAuthorization
        {
          Provider = Provider,
          AccessToken = access_token,
          ExpiresAt = new DateTime(1970, 1, 1).AddSeconds(info.data.expires_at),
          ClientId = info.data.app_id,
          Scopes = info.data.scopes ?? new string[0],
          Profile = new UserProfile 
          {
            Provider = Provider,
            UserId = info.data.user_id,
            Name = profile.name,
            Locale = profile.locale,
            Gender = profile.gender,
            Picture = pictureUrl.Replace(":user-id", info.data.user_id)
          }
        };
      }
    }

    private class TokenInfo
    {
      public TokenInfoData data { get; set; }
    }

    private class TokenInfoData
    {
      public string user_id { get; set; }
      public string app_id { get; set; }
      public int expires_at { get; set; }
      public string[] scopes { get; set; }
    }

    private class Profile
    {
      public string name { get; set; }
      public string locale { get; set; }
      public string gender { get; set; }
    }

    private const string validateUrl = "https://graph.facebook.com/debug_token";
    private const string profileUrl = "https://graph.facebook.com/me";
    private const string pictureUrl = "https://graph.facebook.com/:user-id/picture";
  }
}
