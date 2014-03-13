using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;
using System.Web.Http;
using System.Threading.Tasks;

namespace MusicBrowser.Controllers
{
    public class SiteApiController : ApiController
    {
        #region Constants

        private const string IMAGES_TO_RETRIEVE = "15";
        private const string DEFAULT_RESULT_SIZE = "20";
        private const string DEFAULT_OFFSET = "0";

        #endregion

        #region Public methods

        // GET api/search/<collection>/<query>
        [HttpGet]
        public ResultViewModel Search(string collection, string query)
        {
            string url;
            string queryString = string.Empty;
            string size = DEFAULT_RESULT_SIZE;
            string offset = DEFAULT_OFFSET;

            var parms = Request.RequestUri.ParseQueryString();

            if (parms["size"] != null)
            {
                size = parms["size"];
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
                    throw new HttpResponseException(Request.CreateResponse(
                        HttpStatusCode.BadRequest, 
                        "Unsupported collection type"));
            }

            url = ConfigurationManager.AppSettings["RoviSearchEndpoint"] + "music/search";
            queryString += "&query=" + HttpUtility.UrlEncode(query) + "&offset=" + offset + "&size=" + size;
            queryString += "&include=images&imagesize=50-200x0-200&imagesort=width&imagecount=" + IMAGES_TO_RETRIEVE;

            return SubmitRequest(url, queryString);
        }

        // GET api/<collection>/<id>
        [HttpGet]
        public ResultViewModel Lookup(string collection, string id)
        {
            ResultViewModel result;
            string url;
            string queryString = string.Empty;
            string size = DEFAULT_RESULT_SIZE;
            string offset = DEFAULT_OFFSET;

            if (ConfigurationManager.AppSettings["LogIDs"] == bool.TrueString)
            {
                MusicBrowser.Common.WriteEvent("debug", "Collection-" + collection + " | ID-" + id, DateTime.Now);
            }

            var parms = Request.RequestUri.ParseQueryString();

            if (parms["size"] != null)
            {
                size = parms["size"];
            }
            if (parms["offset"] != null)
            {
                offset = parms["offset"];
            }

            switch (collection)
            {
                case "artist":
                    url = ConfigurationManager.AppSettings["RoviDataEndpoint"] + "name/info";
                    queryString = "?nameid=" + id + "&include=discography,images,musicstyles,musicbio&type=main,singles,compilations&imagesize=90-300x0-300&imagesort=width&imagecount=" + IMAGES_TO_RETRIEVE;
                    result = SubmitRequest(url, queryString);

                    break;
                case "album":
                    url = ConfigurationManager.AppSettings["RoviDataEndpoint"] + "album/info";
                    queryString = "?albumid=" + id + "&include=tracks,images,styles,primaryreview&imagesize=90-300x0-300&imagesort=width&imagecount=" + IMAGES_TO_RETRIEVE;
                    result = SubmitRequest(url, queryString);

                    break;
                case "style":
                    // We first try to grab the given style from the styles collection. If it's not
                    // found we try the subgenre collection. Rovi has a weird way of organizing music 
                    // styles; some are in the styles collection and others are under subgenres
                    url = ConfigurationManager.AppSettings["RoviDataEndpoint"] + "descriptor/styles";
                    queryString = "?styleids=" + id;

                    try
                    {
                        result = SubmitRequest(url, queryString);
                    }
                    catch (HttpResponseException ex)
                    {
                        if (ex.Response.StatusCode == HttpStatusCode.NotFound)
                        {
                            url = ConfigurationManager.AppSettings["RoviDataEndpoint"] + "descriptor/subgenres";
                            queryString = "?subgenreids=" + id;
                            result = SubmitRequest(url, queryString);
                        }
                        else
                        {
                            throw;
                        }
                    }

                    break;
                case "genre":
                    url = ConfigurationManager.AppSettings["RoviDataEndpoint"] + "descriptor/genres";
                    queryString = "?genreids=" + id;
                    result = SubmitRequest(url, queryString);

                    break;
                default:
                    throw new HttpResponseException(Request.CreateResponse(
                        HttpStatusCode.BadRequest, 
                        "Unsupported collection type"));
            }

            return result;
        }

        #endregion

        #region Private methods

        private ResultViewModel SubmitRequest(string url, string queryString)
        {
            HttpResponseMessage response;
            ResultViewModel result;
            string finalQueryString;

            using (HttpClient client = new HttpClient())
            {
                client.DefaultRequestHeaders.Accept.Add((new MediaTypeWithQualityHeaderValue("application/json")));
                client.DefaultRequestHeaders.AcceptEncoding.Add((new StringWithQualityHeaderValue("gzip")));
                client.DefaultRequestHeaders.AcceptEncoding.Add((new StringWithQualityHeaderValue("deflate")));
                finalQueryString = queryString + "&format=json&apikey=" + ConfigurationManager.AppSettings["RoviApiKey"] + "&sig=" + Common.GetApiSignature();

                using (response = client.GetAsync(url + finalQueryString).Result)
                {
                    if (response.IsSuccessStatusCode)
                    {
                        result = new ResultViewModel();
                        result.Content = response.Content.ReadAsStringAsync().Result;

                        return result;
                    }
                    else
                    {
                        throw new HttpResponseException(Request.CreateResponse(
                            response.StatusCode, 
                            MusicBrowser.Common.GetErrorMessage(response.StatusCode)));
                    }
                }
            }
        }

    #endregion
    }
}
