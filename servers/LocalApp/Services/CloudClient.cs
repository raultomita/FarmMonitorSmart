using LocalApp.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.Identity.Web;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace LocalApp.Controllers
{
    public class CloudClient
    {
        private readonly ITokenAcquisition tokenAcquisition;
        private readonly HttpClient httpClient;
        private readonly CloudApiOptions cloudApiOptions;

        public CloudClient(
            ITokenAcquisition tokenAcquisition, 
            HttpClient httpClient,
            IOptions<CloudApiOptions> cloudApiOptions)
        {
            this.tokenAcquisition = tokenAcquisition;
            this.httpClient = httpClient;
            this.cloudApiOptions = cloudApiOptions.Value;
        }

        public async Task Report()
        {
            await PrepareAuthenticatedClient();

            var jsonRequest = JsonConvert.SerializeObject(new object[] { new { id ="switch1"} });
            var jsoncontent = new StringContent(jsonRequest, Encoding.UTF8, "application/json");
            await httpClient.PostAsync(cloudApiOptions.ReportStateUrl, jsoncontent);
        }

        private async Task PrepareAuthenticatedClient()
        {
            var accessToken = await tokenAcquisition.GetAccessTokenForAppAsync(new[] { cloudApiOptions.Scope });
            Debug.WriteLine($"access token-{accessToken}");
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }
    }
}
