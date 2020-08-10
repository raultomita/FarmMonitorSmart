using System.Linq;
using Microsoft.AspNetCore.Mvc;
using System;
using LocalApp.Services;

namespace LocalApp.Controllers
{
    public class DevicesController : Controller
    {
        private readonly IExternalWorld externalWorld;

        public DevicesController(IExternalWorld externalWorld)
        {
            this.externalWorld = externalWorld ?? throw new ArgumentNullException(nameof(externalWorld));
        }

        [HttpGet]
        public IActionResult Get()
        {
            var devices = externalWorld.GetAllDevices(); 
            return Content($"[{string.Join(", ", devices.Select(entry => entry.Value))}]", "application/json");
            
        }
                
        [HttpPut("{id}")]
        public void Put(string id)
        {
            externalWorld.SendCommand(id);
        }
    }
}
