using System.Linq;
using Microsoft.AspNetCore.Mvc;
using System;
using LocalApp.Services;
using System.Threading.Tasks;

namespace LocalApp.Controllers
{
    public class DevicesController : Controller
    {
        private readonly IExternalWorld externalWorld;
        private readonly CloudClient cloudClient;

        public DevicesController(IExternalWorld externalWorld, CloudClient cloudClient)
        {
            this.externalWorld = externalWorld ?? throw new ArgumentNullException(nameof(externalWorld));
            this.cloudClient = cloudClient;
        }

        [HttpGet]
        public IActionResult Get()
        {
            var devices = externalWorld.GetAllDevices(); 
            return Content($"[{string.Join(", ", devices.Select(entry => entry.Value))}]", "application/json");            
        }
                
        [HttpPut()]
        public void Put(string id)
        {
            externalWorld.SendCommand(id);
        }

        public async Task<IActionResult> Report(string id)
        {
            await cloudClient.Report();
            return Ok();
        }
    }
}
