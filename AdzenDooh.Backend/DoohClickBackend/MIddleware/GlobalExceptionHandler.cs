using AdzenDooh.Model.Shared.Response;
using Microsoft.AspNetCore.Diagnostics;
using System.Net;

namespace AdzenDooh.Api.Middleware
{
    public class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
    {
        public async ValueTask<bool> TryHandleAsync(
            HttpContext httpContext,
            Exception exception,
            CancellationToken cancellationToken)
        {
            logger.LogError(exception, "An unhandled exception occurred: {Message}", exception.Message);

            
            var (statusCode, clientMessage) = exception switch
            {
                ArgumentException or InvalidOperationException
                    => (HttpStatusCode.BadRequest, exception.Message),

                KeyNotFoundException
                    => (HttpStatusCode.NotFound, "The requested resource could not be found."),

                UnauthorizedAccessException
                    => (HttpStatusCode.Unauthorized, "You do not have permission to access this resource."),

                _ => (HttpStatusCode.InternalServerError, "An unexpected server error occurred. Please try again later.")
            };

       
            httpContext.Response.StatusCode = (int)statusCode;
            httpContext.Response.ContentType = "application/json";

    
            var responsePayload = ApiResult.Fail<object>(clientMessage);

         
            await httpContext.Response.WriteAsJsonAsync(responsePayload, cancellationToken);
            return true;
        }
    }
}
