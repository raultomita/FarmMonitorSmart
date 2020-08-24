namespace CloudApi.Models
{
    public class DevicesRequest
    {
        public string RequestId { get; set; }
        public string AgentUserId { get; set; }
        public DevicesRequestInput[] Inputs { get; set; }
    }
}
