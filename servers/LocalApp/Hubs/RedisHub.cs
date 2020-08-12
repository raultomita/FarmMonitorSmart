using LocalApp.Services;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace LocalApp.Hubs
{
    public class RedisHub : Hub
    {
        private readonly IExternalWorld externalWorld;

        public RedisHub(IExternalWorld externalWorld)
        {
            this.externalWorld = externalWorld;
        }
        public override async Task OnConnectedAsync()
        {
            var deviceStates = externalWorld.GetHashFields("heartbeat").Select(h => new
            {
                name = h.fieldName.Substring(0, 1).ToUpper(),
                latestDate = h.value,
                isDead = (DateTime.Now - DateTime.ParseExact(h.value, "dd.MM.yy HH:mm:ss", CultureInfo.InvariantCulture)).Minutes > 10
            }).ToList();


            await Clients.Caller.SendAsync("heartbeats", new
            {
                deviceStates,
                pendingDevices = externalWorld.ReceivedDevices.Count
            });
            await base.OnConnectedAsync();
        }
    }
}
