using Common;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Concurrent;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace LocalApp.Services
{
    public class CloudReporter : IHostedService
    {
        private readonly IExternalWorld externalWorld;
        private readonly CloudClient cloudClient;
        private readonly ILogger logger;
        private Timer timer;

        public CloudReporter(IExternalWorld externalWorld, CloudClient cloudClient, ILogger<CloudReporter> logger)
        {
            this.externalWorld = externalWorld;
            this.cloudClient = cloudClient;
            this.logger = logger;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            logger.LogInformation("Cloud Reporter is starting.");

            timer = new Timer(DoWork, null, 0, 3000);

            return Task.CompletedTask;
        }

        private void DoWork(object state)
        {
            if (!externalWorld.ReceivedDevices.Any())
            {
                return;
            }

            timer?.Change(Timeout.Infinite, 0);
            logger.LogInformation("Cloud Reporter triggered.");

            try
            {
                var devices = externalWorld.ReceivedDevices.Values.ToArray();
                externalWorld.ReceivedDevices.Clear();
                cloudClient.Report(devices);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, ex.Message);
                externalWorld.ReceivedDevices.Clear();
            }
            finally
            {
                timer?.Change(TimeSpan.FromSeconds(3), TimeSpan.FromSeconds(3));

            }
        }


        public Task StopAsync(CancellationToken cancellationToken)
        {
            logger.LogInformation("Cloud Reporter is stopping.");

            timer?.Change(Timeout.Infinite, 0);

            return Task.CompletedTask;
        }

        public void Dispose()
        {
            timer?.Dispose();
        }
    }
}
