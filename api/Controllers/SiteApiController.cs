using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;
using System.Web.Http;
using MusicBrowser.Classes;
using System.Threading.Tasks;
//using System.Web.Mvc;

namespace MusicBrowser.Controllers
{
    public class SiteApiController : ApiController
    {
        // GET api/search/<collection>/<query>
        [HttpGet]
        public ResultViewModel Search(string collection, string query)
        {
            HttpResponseMessage searchResponse;
            HttpResponseMessage errorResponse;
            ResultViewModel result;
            string url;
            string queryString = string.Empty;
            string size = "20";
            string offset = "0";

            using (HttpClient client = new HttpClient())
            {
                client.DefaultRequestHeaders.Accept.Add((new MediaTypeWithQualityHeaderValue("application/json")));
                client.DefaultRequestHeaders.AcceptEncoding.Add((new StringWithQualityHeaderValue("gzip")));
                client.DefaultRequestHeaders.AcceptEncoding.Add((new StringWithQualityHeaderValue("deflate")));

                var parms = Request.RequestUri.ParseQueryString();

                if (parms["limit"] != null)
                {
                    size = parms["limit"];
                }
                if (parms["offset"] != null)
                {
                    offset = parms["offset"];
                }

                switch (collection)
                {
                    case "artist":
                        queryString = "?entitytype=artist";
                        break;
                    case "album":
                        queryString = "?entitytype=album";
                        break;
                    case "song":
                        queryString = "?entitytype=song";
                        break;
                    default:
                        errorResponse = new HttpResponseMessage(HttpStatusCode.BadRequest);
                        errorResponse.ReasonPhrase = "Unsupported collection type.";

                        throw new HttpResponseException(errorResponse);
                }

                url = ConfigurationManager.AppSettings["RoviSearchEndpoint"] + "music/search";
                queryString += "&query=" + HttpUtility.UrlEncode(query) + "&offset=" + offset + "&size=" + size;
                queryString += "&format=json&include=images&imagesize=50-200x0-200&imagesort=width&imagecount=3";
                queryString += "&apikey=" + ConfigurationManager.AppSettings["RoviApiKey"] + "&sig=" + Common.GetApiSignature();
                searchResponse = client.GetAsync(url + queryString).Result;
            }

            if (searchResponse.IsSuccessStatusCode)
            {
                result = new ResultViewModel(searchResponse.Content.ReadAsStringAsync().Result);
                return result;
            }
            else
            {
                throw new HttpResponseException(searchResponse);
            }
        }

        // GET api/<collection>/<id>
        [HttpGet]
        public ResultViewModel Lookup(string collection, string id)
        {
            HttpResponseMessage lookupResponse;
            HttpResponseMessage errorResponse;
            ResultViewModel result;
            string url;
            string queryString = string.Empty;
            string size = "20";
            string offset = "0";

            using (HttpClient client = new HttpClient())
            {
                client.DefaultRequestHeaders.Accept.Add((new MediaTypeWithQualityHeaderValue("application/json")));
                client.DefaultRequestHeaders.AcceptEncoding.Add((new StringWithQualityHeaderValue("gzip")));
                client.DefaultRequestHeaders.AcceptEncoding.Add((new StringWithQualityHeaderValue("deflate")));

                var parms = Request.RequestUri.ParseQueryString();

                if (parms["limit"] != null)
                {
                    size = parms["limit"];
                }
                if (parms["offset"] != null)
                {
                    offset = parms["offset"];
                }

                switch (collection)
                {
                    case "artist":
                        url = ConfigurationManager.AppSettings["RoviDataEndpoint"] + "name/info";
                        queryString = "?nameid=" + id + "&include=discography,images,musicstyles,musicbio&type=main";
                        break;
                    case "album":
                        url = ConfigurationManager.AppSettings["RoviDataEndpoint"] + "album/info";
                        queryString = "?albumid=" + id + "&include=tracks,images,styles,primaryreview";
                        break;
                    default:
                        errorResponse = new HttpResponseMessage(HttpStatusCode.BadRequest);
                        errorResponse.ReasonPhrase = "Unsupported collection type.";

                        throw new HttpResponseException(errorResponse);
                }

                queryString += "&format=json&imagesize=80-200x0-200&imagesort=width&imagecount=3&apikey=" + ConfigurationManager.AppSettings["RoviApiKey"] + "&sig=" + Common.GetApiSignature();
                lookupResponse = client.GetAsync(url + queryString).Result;
            }

            if (lookupResponse.IsSuccessStatusCode)
            {
                result = new ResultViewModel();
                result.Content = lookupResponse.Content.ReadAsStringAsync().Result;

                return result;
            }
            else
            {
                throw new HttpResponseException(lookupResponse);
            }
        }
    }
}
