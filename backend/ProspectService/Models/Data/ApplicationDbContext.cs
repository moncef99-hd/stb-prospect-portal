using Microsoft.EntityFrameworkCore;
using ProspectService.Models;

namespace ProspectService.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    public DbSet<Prospect> Prospects { get; set; }
}