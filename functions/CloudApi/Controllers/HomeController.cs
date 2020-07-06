using CloudApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding.Binders;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using StackExchange.Redis;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using System.Threading;

namespace CloudApi.Controllers
{
    public class HomeController : Controller
    {
        private readonly ConnectionMultiplexer redisConnection;

        public HomeController(ConnectionMultiplexer redisConnection)
        {
            this.redisConnection = redisConnection;
        }
        
        public IActionResult Init()
        {
            IDatabase db = redisConnection.GetDatabase();

            string devices = $"[{string.Join(", ", db.HashGetAll("devices").Select(v => v.Value))}]";
            Device[] deserializedDevices = JsonConvert.DeserializeObject<Device[]>(devices);
            return ReportState(deserializedDevices);
        }    

        public IActionResult Sync()
        {
        return Ok();
        }

        public IActionResult Query()
        {
            return Ok();
        }

        [HttpPost]
        public IActionResult ReportState(Device[] devices)
        {
            return Ok();
        }
    }
}
