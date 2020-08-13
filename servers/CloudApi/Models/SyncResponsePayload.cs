using System.Collections.Generic;

namespace CloudApi.Models
{
    public class SyncResponsePayload
    {
        public string AgentUserId { get; internal set; }
        public List<GoogleDevice> Devices { get; internal set; }
    }
}