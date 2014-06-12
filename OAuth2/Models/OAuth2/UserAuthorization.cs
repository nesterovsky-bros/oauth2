namespace MyApp.Models
{
  using System;

  /// <summary>
  /// Define a user's authorization.
  /// </summary>
  public class UserAuthorization
  {
    /// <summary>
    /// Authorization provider.
    /// </summary>
    public string Provider { get; set; }

    /// <summary>
    /// Authorization access token.
    /// </summary>
    public string AccessToken { get; set; }

    /// <summary>
    /// Application client id within scope of provider.
    /// </summary>
    public string ClientId { get; set; }
    
    /// <summary>
    /// Authorization scopes.
    /// </summary>
    public string[] Scopes { get; set; }

    /// <summary>
    /// Authorization expiration time.
    /// </summary>
    public DateTime? ExpiresAt { get; set; }

    /// <summary>
    /// A user profile.
    /// </summary>
    public UserProfile Profile { get; set; }
  }
}