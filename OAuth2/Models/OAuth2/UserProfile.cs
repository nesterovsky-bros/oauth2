namespace MyApp.Models
{
  /// <summary>
  /// Define a user profile.
  /// </summary>
  public class UserProfile
  {
    /// <summary>
    /// Name of authorization provider.
    /// </summary>
    public string Provider { get; set; }

    /// <summary>
    /// A user identifier within scope of provider.
    /// </summary>
    public string UserId { get; set; }

    /// <summary>
    /// Public user name.
    /// </summary>
    public string Name { get; set; }

    /// <summary>
    /// User's locale.
    /// </summary>
    public string Locale { get; set; }

    /// <summary>
    /// User's gender.
    /// </summary>
    public string Gender { get; set; }

    /// <summary>
    /// User's picture url.
    /// </summary>
    public string Picture { get; set; }
  }
}