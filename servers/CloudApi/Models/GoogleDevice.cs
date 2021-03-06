﻿using Common;
using System;

namespace CloudApi.Models
{
    public class GoogleDevice : DeviceBase
    {
        public string Type { get; set; }
        public string[] Traits { get; set; }
        public GoogleDeviceName Name { get; set; }
        public bool willReportState { get; set; }
        public string RoomHint { get; set; }
        public object[] OtherDeviceIds { get; set; }
        public object CustomData { get; set; }

        internal static GoogleDevice From(Device d)
        {
            var device = new GoogleDevice
            {
                Id = d.id,                
                Type = d.GoogleType,
                Traits = new string[] { "action.devices.traits.OnOff" },
                Name = new GoogleDeviceName
                {
                    Name = d.Display
                },
                RoomHint = d.Location == "Living-room" ? "Living Room" : d.Location,
                willReportState = true,
                OtherDeviceIds = new object[] {
                    new 
                    { 
                        DeviceId = d.id
                    }
                },
                CustomData = new { 
                    Proxy = "farmMonitorSmartHub",
                    Port = 7888
                }
            };

            if (string.IsNullOrEmpty(device.Type))
            {
                device.Type = "action.devices.types.LIGHT";
            }

            return device;
        }
    }
}
