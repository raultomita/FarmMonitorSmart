using CloudApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding.Binders;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using StackExchange.Redis;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using System.Threading;
using System.Threading.Tasks;

namespace CloudApi.Controllers
{
    public class HomeController : Controller
    {
        private readonly Container container;

        public HomeController(IOptions<CosmosOptions> cosmosOptions, CosmosClient cosmosClient)
        {
            container = cosmosClient.GetContainer(cosmosOptions.Value.Database, cosmosOptions.Value.ContainerId);
        }

        public IActionResult Sync()
        {
            var devices = container.GetItemLinqQueryable<Device>(allowSynchronousQueryExecution: true).ToList();
            return Ok(devices);
        }

        public IActionResult Query()
        {
            return Ok();
        }

        [HttpPost]
        public async Task<IActionResult> ReportState([FromBody] Device[] devices)
        {
            foreach (var item in devices)
            {
                var device = item;

                await container.UpsertItemAsync(device).ConfigureAwait(false);
            }

            return Ok();
        }
    }
}
