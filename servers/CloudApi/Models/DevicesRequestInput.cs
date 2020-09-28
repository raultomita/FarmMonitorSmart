namespace CloudApi.Models
{
    public class DevicesRequestInput
    {
        public string Intent { get; set; }
        public DevicesRequestPayload Payload { get; set; }
    }
}
