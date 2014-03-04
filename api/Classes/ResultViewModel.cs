using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;

namespace MusicBrowser
{
    public class ResultViewModel
    {
        public ResultViewModel()
        {
        }

        public ResultViewModel(string content)
        {
            this.Content = content;
        }

        public string Content { get; set; }
        public string ImageData { get; set; }
    }
}