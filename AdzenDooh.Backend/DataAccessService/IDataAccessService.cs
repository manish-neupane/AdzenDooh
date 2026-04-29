using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace DoohClick.DataAccess;

public interface IDataAccessService
{
    Task<IDbConnection> GetConnection();

    Task<string> RetrievalProcedure(string storedProcedure, string json);

    Task<string> ActionProcedure(string storedProcedure, string json);
}
