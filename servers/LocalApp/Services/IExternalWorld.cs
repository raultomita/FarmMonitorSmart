using Common;
using StackExchange.Redis;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;

namespace LocalApp.Services
{
    public interface IExternalWorld
    {
        ConcurrentDictionary<string,Device> ReceivedDevices { get; }
        HashEntry[] GetAllDevices();
        void SendCommand(string id);
        List<string> GetAllKeys();
        RedisType GetType(string key);
        List<string> GetInstanceDeviceIds(string key);
        KeyValuePair<string, string>[] GetHashFields(string key);
        void SaveAttribute(string key, string field, string value);
    }
}
