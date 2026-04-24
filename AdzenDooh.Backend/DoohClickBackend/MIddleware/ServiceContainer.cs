using AdzenDooh.Interface.Application.Inventory.Screen;
using AdzenDooh.Service.Application.Inventory.Screen;
using DoohClick.DataAccess;

namespace AdzenDooh.Api.DependencyInjection

{
    public static class ServiceContainer
    {
        public static IServiceCollection AddCoreServices(this IServiceCollection services)
        {
            services.AddScoped<IDataAccessService, DataAccessService>();
            services.AddScoped<IScreenService, ScreenService>();

            return services;
        }
    }
}