using Common;
using IdentityModel.Client;
using LocalApp.Model;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading;

namespace LocalApp.Services
{
    public class CloudClient
    {
        private readonly HttpClient httpClient;
        private readonly CloudApiOptions cloudApiOptions;
        private readonly ILogger<CloudClient> logger;
        private DateTime? tokenExpiration;

        public CloudClient(IOptions<CloudApiOptions> cloudApiOptions, ILogger<CloudClient> logger)
        {  
            this.httpClient = new HttpClient();
            this.cloudApiOptions = cloudApiOptions.Value;
            this.logger = logger;
        }

        public void Report(Device[] devices)
        {   
            PrepareAuthenticatedClient();
            var jsoncontent = new StringContent(JsonConvert.SerializeObject(devices), Encoding.UTF8, "application/json");
            var response = httpClient.PostAsync(cloudApiOptions.ReportStateUrl, jsoncontent).Result;
            logger.LogInformation(response.Content.ReadAsStringAsync().Result);
        }

        private void PrepareAuthenticatedClient()
        {
            if(tokenExpiration == null || tokenExpiration < DateTime.Now.AddSeconds(-30))
            {
                var tokenResponse = httpClient.RequestClientCredentialsTokenAsync(new ClientCredentialsTokenRequest
                {
                    Address = cloudApiOptions.TokenEndpoint,
                    ClientId = cloudApiOptions.ClientId,
                    ClientSecret = cloudApiOptions.ClientSecret,
                    Parameters = new Dictionary<string, string> { { "scope", cloudApiOptions.Scope } }
                }).Result;
                tokenExpiration = DateTime.Now.AddSeconds(tokenResponse.ExpiresIn);
                httpClient.SetBearerToken(tokenResponse.AccessToken);
            }
            
            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }
    }
}
