using CloudApi.Models;
using Common;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Options;
using StackExchange.Redis;
using System.Collections.Generic;
using System.Linq;
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
        public IActionResult Default([FromBody] DevicesRequest request)
        {
            if(request?.Inputs?.FirstOrDefault()?.Intent == "action.devices.SYNC")
            {
                return Sync(request);
            }

            return Query(request);
        }

        [HttpPost]
        public IActionResult Sync([FromBody] DevicesRequest request)
        {
            var devices = container.GetItemLinqQueryable<Device>(allowSynchronousQueryExecution: true)
                .ToList()
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

            return Ok(response);
        }

        [HttpPost]
        public IActionResult Query([FromBody] DevicesRequest request)
        {
            var requestedDevices = request?.Inputs?.SelectMany(i => i.Payload?.Devices?.Select(d => d.Id))?
                .ToList();

            Dictionary<string, object> foundDevices;

            if (requestedDevices != null)
            {

                foundDevices = container.GetItemLinqQueryable<Device>(allowSynchronousQueryExecution: true)
                .Where(d => requestedDevices.Contains(d.id))
                .ToDictionary(d => d.id, d => (object)new
                {
                    On = d.State == "1" ? true : false,
                    Online = true
                });
            }
            else
            {
                foundDevices = new Dictionary<string, object>();
            }

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
