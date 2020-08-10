using System.Collections.Generic;

namespace LocalApp.Model
{
    public class SystemOverview
    {
        public SystemOverview(List<string> types, List<string> locations)
        {
            Messages = new List<string>();
            Instances = new List<InstanceDetails>();
            Unmapped = new List<DeviceDetails>();
            SupportedTypes = types;
            SupportedLocations = locations;
        }

        public List<string> SupportedTypes { get; }

        public List<string> SupportedLocations { get; }

        public List<string> Messages { get; }
        
        public List<InstanceDetails> Instances { get; }

        public List<DeviceDetails> Unmapped { get; }
    }
}
