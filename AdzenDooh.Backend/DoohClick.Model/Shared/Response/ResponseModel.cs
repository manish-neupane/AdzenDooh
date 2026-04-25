using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AdzenDooh.Model.Shared.Response
{


  

    public class GridResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalCount { get; set; }
        }

 

        public record MvDropdown
        {
            public required int Id { get; set; }
            public required string Name { get; set; }
        }
    


}

