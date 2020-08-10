using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LocalApp.Services
{
    public interface IExternalWorld
    {
        Task SubscribeAsync(Action<RedisChannel, RedisValue> subscriptionHandler);
        Task UnsubscribeAsync(Action<RedisChannel, RedisValue> subscriptionHandler);
        HashEntry[] GetAllDevices();
        void SendCommand(string id);
        List<string> GetAllKeys();
        RedisType GetType(string key);
        List<string> GetInstanceDeviceIds(string key);
        (string fieldName, string value)[] GetHashFields(string key);
    }
}
