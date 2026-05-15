using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AdzenDooh.Service.Infrastructure
{
    using DoohClick.DataAccess;
    using Microsoft.Extensions.DependencyInjection;
    using Microsoft.Extensions.Hosting;
    using Microsoft.Extensions.Logging;

    namespace AdzenDooh.Service.Infrastructure
    {
        public class CampaignStatusWorker : BackgroundService
        {
            private readonly ILogger<CampaignStatusWorker> _logger;
            private readonly IServiceScopeFactory _scopeFactory;

            public CampaignStatusWorker(ILogger<CampaignStatusWorker> logger, IServiceScopeFactory scopeFactory)
            {
                _logger = logger;
                _scopeFactory = scopeFactory;
            }

            protected override async Task ExecuteAsync(CancellationToken stoppingToken)
            {
                _logger.LogInformation("CampaignStatusWorker started.");

                while (!stoppingToken.IsCancellationRequested)
                {
                    try
                    {
                        using var scope = _scopeFactory.CreateScope();
                        var dataAccess = scope.ServiceProvider.GetRequiredService<IDataAccessService>();

                        // Call the stored procedure to update statuses
                        await dataAccess.ActionProcedure("dbo.SpCampaignStatusUpd", "{}");

                        _logger.LogInformation("Campaign statuses updated at {time}", DateTime.UtcNow);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error updating campaign statuses.");
                    }

                    // Run every minute (adjust as needed)
                    await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
                }

                _logger.LogInformation("CampaignStatusWorker stopped.");
            }
        }
    }

    }
