using ESCE_SYSTEM.Models;
using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace ESCE_SYSTEM.Models
{
    public partial class Role
    {
        public Role()
        {
            Accounts = new HashSet<Account>();
        }

        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public int Id { get; set; }

        [JsonIgnore]
        public virtual ICollection<Account> Accounts { get; set; }
    }
}
