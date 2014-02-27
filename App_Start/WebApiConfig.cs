using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;

namespace MusicBrowser
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            // Web API routes
            config.MapHttpAttributeRoutes();

            config.Routes.MapHttpRoute(
                name: "SearchApi",
                routeTemplate: "api/search/{collection}/{query}",
                defaults: new { controller = "SiteAPI", collection = "all" }
            );

            config.Routes.MapHttpRoute(
                name: "LookupApi",
                routeTemplate: "api/{collection}/{id}",
                defaults: new { controller = "SiteAPI" }
            );
        }
    }
}
