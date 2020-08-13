using CloudApi.Models;
using Common;
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

        [HttpPost]
        public IActionResult Sync([FromBody] SyncRequest request)
        {
            var devices = container.GetItemLinqQueryable<Device>(allowSynchronousQueryExecution: true)
                .Select(d => GoogleDevice.From(d))
                .ToList();

            var response = new SyncResponse
            {
                RequestId = request.RequestId,
                Payload = new SyncResponsePayload
                {
                    AgentUserId = request.AgentUserId,
                    Devices = devices
                }
            };


            return Ok(devices);
        }

        [HttpPost]
        public IActionResult Query([FromBody] QueryRequest request)
        {
            var requestedDevices = request?.Inputs?.SelectMany(i => i.Payload?.Devices?.Select(d => d.Id))
                .ToList();

            var foundDevices = container.GetItemLinqQueryable<Device>(allowSynchronousQueryExecution: true)
                .Where(d => requestedDevices.Contains(d.Id))
                .ToDictionary(d => d.Id, d => (object) new
                {
                    On = d.State == "1" ? true : false,
                    Online = true
                });

            var response = new QueryResponse
            {
                RequestId = request.RequestId,
                Payload = new QueryResponsePayload
                {
                    Devices = foundDevices
                }
            };

            return Ok(response);
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
