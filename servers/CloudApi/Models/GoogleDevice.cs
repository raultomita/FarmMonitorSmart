﻿using Common;
using System;

namespace CloudApi.Models
{
    public class GoogleDevice : DeviceBase
    {
        public string Type { get; set; }
        public string[] Traits { get; set; }
        public GoogleDeviceName Name { get; set; }
        public bool WillResponseState { get; set; }
        public string RoomHint { get; set; }

        internal static GoogleDevice From(Device d)
        {
            return new GoogleDevice
            {
                Id = d.id,
                Type = "action.devices.types.LIGHT",
                Traits = new string[] { "action.devices.traits.OnOff" },
                Name = new GoogleDeviceName
                {
                    Name = d.Display
                },
                RoomHint = d.Location == "Living-room"? "Living Room" : d.Location,
                WillResponseState = true
            };
        }
    }
}
