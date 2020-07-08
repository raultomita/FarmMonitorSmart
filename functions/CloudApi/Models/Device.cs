using Newtonsoft.Json;
using System;
using System.Diagnostics;

namespace CloudApi.Models
{
    public class Device
    {
        [JsonProperty(PropertyName = "id")]
        public string Id { get; set; }
        public string Type { get; set; }
        public string Display { get; set; }
        public string Location { get; set; }
        public DateTime TimeStamp { get; set; }
        public string State { get; set; }
    }
}
