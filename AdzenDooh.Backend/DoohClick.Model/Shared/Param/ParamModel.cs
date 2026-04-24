using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AdzenDooh.Model.Shared.Param
{
    public class MvParamOption<T>
    {
        public T? Filter { get; set; }
        public int? Offset { get; set; }
        public int? PageSize { get; set; }
        public string? SortBy { get; set; }
        public string? SortOrder { get; set; }
    }
}
