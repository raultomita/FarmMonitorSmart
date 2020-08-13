namespace CloudApi.Models
{
    public class SyncResponse
    {
        public string RequestId { get; set; }
        public SyncResponsePayload Payload { get; set; }
    }
}
