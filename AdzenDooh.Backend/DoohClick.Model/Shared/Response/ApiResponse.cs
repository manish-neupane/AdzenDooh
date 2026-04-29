using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AdzenDooh.Model.Shared.Response
{





    public class MvApiResponse<T>
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public T? Data { get; set; }
    }

    
    // Factory methods for building API responses.
  
    public static class ApiResult
    {
        public static MvApiResponse<T> Success<T>(T data, string message = "Success")
            => new()
            {
                Success = true,
                Message = message,
                Data = data
            };

        public static MvApiResponse<T> Fail<T>(string message, T? data = default)
            => new()
            {
                Success = false,
                Message = message,
                Data = data
            };
    }
}

