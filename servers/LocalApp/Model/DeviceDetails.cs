using Newtonsoft.Json;
using StackExchange.Redis;
using System.Collections.Generic;

namespace LocalApp.Model
{
    public class DeviceDetails
    {
        public DeviceDetails(string deviceId)
        {
            DeviceId = deviceId;
            Messages = new List<string>();
            MappedWith = new List<string>();
        }

        [JsonIgnore]
        public List<string> MappedWith { get; }
        
        public string DeviceId { get; }
        public KeyValuePair<string, string>[] Fields { get; set; }
        public List<string> Messages { get; }
    }
}
