namespace CloudApi.Models
{
    public class QueryRequest
    {
        public string RequestId { get; set; }
        public string AgentUserId { get; set; }
        public QueryRequestInput[] Inputs { get; set; }
    }
}
