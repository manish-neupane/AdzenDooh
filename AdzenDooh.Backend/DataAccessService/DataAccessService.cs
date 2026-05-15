    using Dapper;
    using Microsoft.Data.SqlClient;
    using Microsoft.Extensions.Configuration;
    using System;
    using System.Collections.Generic;
    using System.Data;
    using System.Linq;
    using System.Text;
    using System.Threading.Tasks;

    namespace DoohClick.DataAccess
    {
        public class DataAccessService : IDataAccessService
        {
            private readonly IConfiguration _configuration;

            public DataAccessService(IConfiguration configuration)
            {
                _configuration = configuration;
            }

            public async Task<IDbConnection> GetConnection()
            {
                try
                {
                    var connectionString = _configuration.GetConnectionString("DefaultConnection");
                    SqlConnection conn = new(connectionString);
                    conn.Open();
                    return conn;
                }
                catch (Exception)
                {
                    throw;
                }
            }

            public async Task<string> RetrievalProcedure(string storedProcedure, string json)
            {
                try
                {
                    using IDbConnection conn = await GetConnection();
                    DynamicParameters param = new();
                    param.Add("Json", json, DbType.String);
                    string result = await conn.QueryFirstOrDefaultAsync<string>(storedProcedure, param, commandType: CommandType.StoredProcedure) ?? "";
                    return result ?? "{}";
                }
                catch (Exception)
                {
                    throw;
                }
            }

            public async Task<string> ActionProcedure(string storedProcedure, string json)
            {
                try
                {
                    using IDbConnection conn = await GetConnection();
                    DynamicParameters param = new();
                    param.Add("Json", json, DbType.String, direction: ParameterDirection.InputOutput, size: int.MaxValue);
                    int result = await conn.ExecuteAsync(storedProcedure, param, commandType: CommandType.StoredProcedure);
                    return param.Get<string>("Json") ?? "{}";
                }
                catch (Exception)
                {
                    throw;
                }
            }
        }
    }
