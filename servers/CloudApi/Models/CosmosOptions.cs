namespace CloudApi.Models
{
    public class CosmosOptions
    {
        public const string Cosmos = "Cosmos";
        public string EndpointUri { get; set; }
        public string PrimaryKey { get; set; }
        public string Database { get; set; }
        public string ContainerId { get; set; }
    }
}
