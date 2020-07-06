using Microsoft.AspNetCore.Mvc;
using System.Runtime.InteropServices.WindowsRuntime;

namespace CloudApi.Controllers
{
    public class SmartHomeController : Controller
    {
        public IActionResult Sync()
        {
            return Ok();
        }

        public IActionResult Query()
        {
            return Ok();
        }
    }
}
