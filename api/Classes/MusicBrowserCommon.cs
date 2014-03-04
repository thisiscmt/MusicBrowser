using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Web;

namespace MusicBrowser
{
    public static class Common
    {
        public static string GetApiSignature()
        {
            string timestamp = (DateTime.UtcNow - new DateTime(1970, 1, 1, 0, 0, 0)).TotalSeconds.ToString();
            timestamp = timestamp.Substring(0, timestamp.IndexOf("."));

            MD5 md5 = MD5.Create();
            byte[] inputBytes = System.Text.Encoding.ASCII.GetBytes(ConfigurationManager.AppSettings["RoviApiKey"] + ConfigurationManager.AppSettings["RoviApiSharedSecret"] + timestamp);
            byte[] hashBytes = md5.ComputeHash(inputBytes);

            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < hashBytes.Length; i++)
            {
                // Will force lowercase letters, use "X2" instead of "x2" to get uppercase
                sb.Append(hashBytes[i].ToString("x2"));
            }

            return sb.ToString();
        }

        public static string GetErrorMessage(HttpStatusCode status)
        {
            string msg;

            switch (status)
            {
                case HttpStatusCode.Forbidden:
                    msg = "Access is forbidden";
                    break;
                default:
                    msg = HttpWorkerRequest.GetStatusDescription((int)status);
                    break;
            }

            return msg;
        }

        public static void WriteEvent(string logName, string desc, DateTime timestamp, string longDesc = "", string source = "", 
                                      string process = "", string tag = "")
        {
            string msg = string.Empty;
            string filePath;

            try
            {
                filePath = HttpContext.Current.Request.MapPath("/") + "logs\\" + logName + ".log";

                using (StreamWriter sr = new StreamWriter(filePath, true, System.Text.Encoding.UTF8)) 
                {
                    if (!string.IsNullOrEmpty(desc))
                    {
                        msg = msg + "Event description: " + desc;
                    }

                    msg = msg + Environment.NewLine + "Event timestamp: " + timestamp.ToString("M/dd/yyyy H:mm yy");

                    if (!string.IsNullOrEmpty(longDesc))
                    {
                        msg = msg + Environment.NewLine + "Event long description: " + longDesc;
                    }
                    if (!string.IsNullOrEmpty(source))
                    {
                        msg = msg + Environment.NewLine + "Source: " + source;
                    }
                    if (!string.IsNullOrEmpty(process))
                    {
                        msg = msg + Environment.NewLine + "Process: " + process;
                    }
                    if (!string.IsNullOrEmpty(tag))
                    {
                        msg = msg + Environment.NewLine + "Tag: " + tag;
                    }

                    sr.Write(msg + Environment.NewLine + Environment.NewLine);
                }
            }
            catch (Exception ex)
            {
                msg = ex.Message.Trim();

                if (!string.IsNullOrEmpty(desc))
                {
                    msg = msg + Environment.NewLine + "Event description: " + desc;
                }

                msg = msg + Environment.NewLine + "Event timestamp: " + timestamp.ToString("M/dd/yyyy H:mm tt");

                if (!string.IsNullOrEmpty(longDesc))
                {
                    msg = msg + Environment.NewLine + "Event long description: " + longDesc;
                }
                if (!string.IsNullOrEmpty(source))
                {
                    msg = msg + Environment.NewLine + "Source: " + source;
                }
                if (!string.IsNullOrEmpty(process))
                {
                    msg = msg + Environment.NewLine + "Process: " + process;
                }
                if (!string.IsNullOrEmpty(tag))
                {
                    msg = msg + Environment.NewLine + "Tag: " + tag;
                }
            }
        }
    }
}