using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web.Http;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;

namespace MyApp
{
    public static class WebApiConfig
    {
      public static void Register(HttpConfiguration config)
      {
        config.Routes.MapHttpRoute(
          name: "OAuth2Api",
          routeTemplate: "api/oauth2/{controller}/{action}",
          defaults: new { action = RouteParameter.Optional });
        config.Routes.MapHttpRoute(
          name: "DefaultApi",
          routeTemplate: "api/{controller}/{action}",
          defaults: new { action = RouteParameter.Optional });

        // See 
        // http://www.asp.net/web-api/overview/formats-and-model-binding/json-and-xml-serialization
        // http://stackoverflow.com/questions/7427909
        var jsonSettings = config.Formatters.JsonFormatter.SerializerSettings;

        jsonSettings.ContractResolver =
          new CamelCasePropertyNamesContractResolver();
        jsonSettings.Converters.Add(
          new StringEnumConverter { CamelCaseText = true });

        //config.Services.Add(typeof(IExceptionLogger), new GlobalExceptionLogger());
        //config.Services.Replace(typeof(IExceptionHandler), new GlobalExceptionHandler());

        var errorPolicy = ConfigurationManager.AppSettings["ExceptionStackTrace"] ?? "default";

        switch (errorPolicy.ToLower())
        {
          case "always":
          {
            config.IncludeErrorDetailPolicy = IncludeErrorDetailPolicy.Always;

            break;
          }
          case "local":
          {
            config.IncludeErrorDetailPolicy = IncludeErrorDetailPolicy.LocalOnly;

            break;
          }
          case "never":
          {
            config.IncludeErrorDetailPolicy = IncludeErrorDetailPolicy.Never;
          
            break;
          }
          default:
          {
            config.IncludeErrorDetailPolicy = IncludeErrorDetailPolicy.Default;

            break;
          }
        }


        // Uncomment the following line of code to enable query support for actions with an IQueryable or IQueryable<T> return type.
        // To avoid processing unexpected or malicious queries, use the validation settings on QueryableAttribute to validate incoming queries.
        // For more information, visit http://go.microsoft.com/fwlink/?LinkId=279712.
        //config.EnableQuerySupport();
        // To disable tracing in your application, please comment out or remove the following line of code
        // For more information, refer to: http://www.asp.net/web-api
        //config.EnableSystemDiagnosticsTracing();
      }
    }
}
