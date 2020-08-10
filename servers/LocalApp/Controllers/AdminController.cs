using LocalApp.Model;
using LocalApp.Services;
using Microsoft.AspNetCore.Mvc;
using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Linq;

namespace LocalApp.Controllers
{
    public class AdminController : Controller
    {
        private static readonly List<string> supportedTypes = new List<string> { "switch", "toggleButton", "tankLevel", "watering", "led", "automaticTrigger", "distanceSensor" };
        private static readonly List<string> supportedLocations = new List<string> { "Bedroom", "Bathroom", "Living-room", "Kitchen", "Garden", "Lobby" };
        
        private readonly IExternalWorld externalWorld;

        public AdminController(IExternalWorld externalWorld)
        {
            this.externalWorld = externalWorld ?? throw new ArgumentNullException(nameof(externalWorld));
        }

        [HttpGet]
        public IActionResult Get()
        {
            SystemOverview devicesOverview = new SystemOverview(supportedTypes, supportedLocations);

            bool hasValidationErrors = false;

            List<string> databaseKeys = externalWorld.GetAllKeys();

            if (!databaseKeys.Any())
            {
                devicesOverview.Messages.Add("Database has no keys.");
            }

            Dictionary<string, DeviceDetails> devices = new Dictionary<string, DeviceDetails>(databaseKeys.Count);

            foreach (var key in databaseKeys)
            {
                var type = externalWorld.GetType(key);

                switch (type)
                {
                    case RedisType.Set:
                        var deviceIds = externalWorld.GetInstanceDeviceIds(key).Select(deviceId =>
                        {
                            DeviceDetails device;
                            if (!devices.ContainsKey(deviceId))
                            {
                                device = new DeviceDetails(deviceId);
                                devices.Add(deviceId, device);
                            }
                            else
                            {
                                device = devices[deviceId];
                            }

                            device.MappedWith.Add(key);
                            return device;
                        }).ToList();

                        devicesOverview.Instances.Add(new InstanceDetails(key, deviceIds));
                        break;
                    case RedisType.Hash:
                        if (!devices.ContainsKey(key))
                        {
                            devices.Add(key, new DeviceDetails(key));
                        }

                        devices[key].Fields = externalWorld.GetHashFields(key);
                        break;
                    default:
                        devicesOverview.Messages.Add($"I don't know what to do with this type: {type.ToString()}.");
                        break;
                }
            }

            foreach (var device in devices)
            {
                if (!device.Value.MappedWith.Any())
                {
                    devicesOverview.Unmapped.Add(device.Value);
                    continue;
                }

                if (device.Value.Fields == null)
                {
                    device.Value.Messages.Add("This has no fields.");
                    device.Value.Fields = new(string fieldName, string value)[0];
                    hasValidationErrors = true;
                }

                if (device.Value.MappedWith.Count > 1)
                {
                    device.Value.Messages.Add("There is more than one instance that has this device.");
                    hasValidationErrors = true;
                }
            }

            foreach (var instance in devicesOverview.Instances)
            {
                List<int> gpios = new List<int>();

                foreach (var device in instance.Devices)
                {

                    foreach (var field in device.Fields)
                    {
                        int gpio;
                        if (field.fieldName.ToLower().Contains("gpio"))
                        {
                            if (Int32.TryParse(field.value, out gpio))
                            {
                                if (gpios.Contains(gpio))
                                {
                                    device.Messages.Add($"GPIO {field.value} int field {field.fieldName} is duplicated.");
                                    hasValidationErrors = true;
                                }
                                gpios.Add(gpio);
                            }
                            else
                            {
                                device.Messages.Add($"GPIO {field.value} from field {field.fieldName} cannot be converted in int.");
                                hasValidationErrors = true;

                            }
                        }

                        if (String.Compare(field.fieldName, "type", true) == 0 && !supportedTypes.Contains(field.value))
                        {
                            device.Messages.Add($"type {field.value} is not supported.");
                            hasValidationErrors = true;
                        }

                        if (String.Compare(field.fieldName, "location", true) == 0 && !supportedLocations.Contains(field.value))
                        {
                            device.Messages.Add($"location {field.value} is not supported.");
                            hasValidationErrors = true;
                        }
                    }
                }
            }

            if (hasValidationErrors)
            {
                devicesOverview.Messages.Add("See the validation errors bellow.");
            }

            return Json(devicesOverview);

        }
    }
}
