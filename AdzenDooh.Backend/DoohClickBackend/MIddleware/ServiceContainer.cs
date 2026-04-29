using AdzenDooh.Interface.Application.Inventory.Creative;
using AdzenDooh.Interface.Application.Inventory.Screen;
using AdzenDooh.Interface.Application.Inventory.ScreenOperatingHour;
using AdzenDooh.Service.Application.Inventory.Creative;
using AdzenDooh.Service.Application.Inventory.Screen;
using AdzenDooh.Service.Application.Inventory.ScreenOperatingHour;
using DoohClick.DataAccess;

namespace AdzenDooh.Api.DependencyInjection


{
    public static class ServiceContainer
    {
        public static IServiceCollection AddCoreServices(this IServiceCollection services)
        {
            services.AddScoped<IDataAccessService, DataAccessService>();
            services.AddScoped<IScreenService, ScreenService>();
            services.AddScoped<ICreativeService, CreativeService>();
            services.AddScoped<IFileMetadataService, FileMetadataService>();
            services.AddScoped<IScreenOperatingHourService, ScreenOperatingHourService>();


            return services;
        }
    }
}