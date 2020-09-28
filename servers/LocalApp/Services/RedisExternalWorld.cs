using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using StackExchange.Redis;
using System.Linq;
using LocalApp.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Common;
using Newtonsoft.Json;
using System.Collections.Concurrent;

namespace LocalApp.Services
{
    public class RedisExternalWorld : IExternalWorld
    {
        private const string StatusHashKey = "devices";
        private const string NotificationsChannel = "notifications";
        private const string heartbeatsChannel = "heartbeats";
        private const string CommandsChannel = "commands";

        private readonly ConnectionMultiplexer connection;
        private readonly IDatabase database;
        private readonly ISubscriber subscriber;
        private readonly IHubContext<RedisHub> hubContext;
        private readonly ILogger logger;

        public ConcurrentDictionary<string, Device> ReceivedDevices { get; }

        public RedisExternalWorld(IHubContext<RedisHub> hubContext, IConfiguration configuration, ILogger<RedisExternalWorld> logger)
        {
            ReceivedDevices = new ConcurrentDictionary<string, Device>();
            this.hubContext = hubContext;
            this.logger = logger;
            ConfigurationOptions options = new ConfigurationOptions();
            options.KeepAlive = 30;
            connection = ConnectionMultiplexer.Connect(configuration["redisHost"]);
            database = connection.GetDatabase();
            subscriber = connection.GetSubscriber();
            subscriber.Subscribe(NotificationsChannel, OnDeviceReceived);
            subscriber.Subscribe(heartbeatsChannel, OnHeartbeatReceived);
            logger.LogInformation("Connected to redis");
            connection.ConnectionFailed += Connection_ConnectionFailed;
            connection.ConnectionRestored += Connection_ConnectionRestored;
            connection.InternalError += Connection_InternalError;
            connection.ErrorMessage += Connection_ErrorMessage;
        }

        private void Connection_ErrorMessage(object sender, RedisErrorEventArgs e)
        {
            logger.LogError(e.Message);
        }

        private void Connection_InternalError(object sender, InternalErrorEventArgs e)
        {
            logger.LogError(e.Exception?.Message);
        }

        private void Connection_ConnectionRestored(object sender, ConnectionFailedEventArgs e)
        {
            logger.LogInformation("Connection restored");
        }

        private void Connection_ConnectionFailed(object sender, ConnectionFailedEventArgs e)
        {
            logger.LogWarning($"Connection Failed {e.FailureType} with exception {e.Exception?.Message}");
        }

        private void OnDeviceReceived(RedisChannel channel, RedisValue value)
        {
            logger.LogInformation($"Just received {value} from {channel}");
            var device = value.ToString();           
            hubContext.Clients.All.SendAsync(channel, device);
            var deviceObject = JsonConvert.DeserializeObject<Device>(device);
            ReceivedDevices.AddOrUpdate(deviceObject.id, deviceObject,(k, v) => deviceObject);
        }

        private void OnHeartbeatReceived(RedisChannel channel, RedisValue value)
        {
            logger.LogInformation($"Just received {value} from {channel}");
            hubContext.Clients.All.SendAsync(channel, value.ToString());
        }

        public HashEntry[] GetAllDevices()
        {
            return database.HashGetAll(StatusHashKey);
        }

        public List<string> GetAllKeys()
        {
            var server = connection.GetServer(connection.GetEndPoints().First());

            var keys = server.Keys(pageSize: 100);

            return keys.Where(key => key != StatusHashKey).Select(key => (string)key).ToList();
        }

        public KeyValuePair<string, string>[] GetHashFields(string key)
        {
            return database.HashGetAll(key).Select(hf => new KeyValuePair<string, string>((string)hf.Name, hf.Value.ToString())).ToArray();
        }

        public List<string> GetInstanceDeviceIds(string key)
        {
            return database.SetScan(key, pageSize: 100).Select(v => (string)v).ToList();
        }

        public RedisType GetType(string key)
        {
            return database.KeyType(key);
        }

        public void SendCommand(string id)
        {
            subscriber.Publish(CommandsChannel, id);
        }

        public async Task SubscribeAsync(Action<RedisChannel, RedisValue> subscriptionHandler)
        {
            await connection.GetSubscriber().SubscribeAsync(NotificationsChannel, subscriptionHandler);
        }

        public async Task UnsubscribeAsync(Action<RedisChannel, RedisValue> subscriptionHandler)
        {
            await connection.GetSubscriber().UnsubscribeAsync(NotificationsChannel, subscriptionHandler);
        }

        public void SaveAttribute(string key, string field, string value)
        {
            database.HashSet(key, field, value);
        }
    }
}
