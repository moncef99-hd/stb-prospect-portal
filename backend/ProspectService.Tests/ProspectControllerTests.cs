using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using ProspectService.Controllers;
using ProspectService.Data;
using ProspectService.Models;
using Xunit;

namespace ProspectService.Tests;

public class ProspectControllerTests
{
    // Cree un contexte de base de donnees en memoire, isole pour chaque test
    private ApplicationDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task GetAll_ReturnsAllProspects()
    {
        var context = CreateContext();
        context.Prospects.Add(new Prospect { UserId = 1 });
        context.Prospects.Add(new Prospect { UserId = 2 });
        await context.SaveChangesAsync();

        var controller = new ProspectController(context);

        var result = await controller.GetAll();

        var okResult = Assert.IsType<OkObjectResult>(result);
        var prospects = Assert.IsAssignableFrom<IEnumerable<Prospect>>(okResult.Value);
        Assert.Equal(2, prospects.Count());
    }

    [Fact]
    public async Task GetById_WithExistingId_ReturnsProspect()
    {
        var context = CreateContext();
        var prospect = new Prospect { UserId = 1 };
        context.Prospects.Add(prospect);
        await context.SaveChangesAsync();

        var controller = new ProspectController(context);

        var result = await controller.GetById(prospect.Id);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var returned = Assert.IsType<Prospect>(okResult.Value);
        Assert.Equal(prospect.Id, returned.Id);
    }

    [Fact]
    public async Task GetById_WithNonExistentId_ReturnsNotFound()
    {
        var context = CreateContext();
        var controller = new ProspectController(context);

        var result = await controller.GetById(999);

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task GetByUserId_WithExistingUserId_ReturnsProspect()
    {
        var context = CreateContext();
        var prospect = new Prospect { UserId = 42 };
        context.Prospects.Add(prospect);
        await context.SaveChangesAsync();

        var controller = new ProspectController(context);

        var result = await controller.GetByUserId(42);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var returned = Assert.IsType<Prospect>(okResult.Value);
        Assert.Equal(42, returned.UserId);
    }

    [Fact]
    public async Task GetByUserId_WithNonExistentUserId_ReturnsNotFound()
    {
        var context = CreateContext();
        var controller = new ProspectController(context);

        var result = await controller.GetByUserId(999);

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task Create_WithValidData_ReturnsCreatedProspect()
    {
        var context = CreateContext();
        var controller = new ProspectController(context);
        var newProspect = new Prospect { UserId = 7, PhoneNumber = "12345678" };

        var result = await controller.Create(newProspect);

        var createdResult = Assert.IsType<CreatedAtActionResult>(result);
        var returned = Assert.IsType<Prospect>(createdResult.Value);
        Assert.Equal(7, returned.UserId);

        var inDb = await context.Prospects.FirstOrDefaultAsync(p => p.UserId == 7);
        Assert.NotNull(inDb);
    }

    [Fact]
    public async Task Update_WithExistingId_UpdatesProspect()
    {
        var context = CreateContext();
        var prospect = new Prospect { UserId = 1, PhoneNumber = "old" };
        context.Prospects.Add(prospect);
        await context.SaveChangesAsync();

        var controller = new ProspectController(context);
        var updated = new Prospect { PhoneNumber = "new", Address = "new address", Status = ProspectStatus.PendingClient };

        var result = await controller.Update(prospect.Id, updated);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var returned = Assert.IsType<Prospect>(okResult.Value);
        Assert.Equal("new", returned.PhoneNumber);
        Assert.Equal("new address", returned.Address);
        Assert.Equal(ProspectStatus.PendingClient, returned.Status);
    }

    [Fact]
    public async Task Update_WithNonExistentId_ReturnsNotFound()
    {
        var context = CreateContext();
        var controller = new ProspectController(context);
        var updated = new Prospect { PhoneNumber = "new" };

        var result = await controller.Update(999, updated);

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task Delete_WithExistingId_RemovesProspect()
    {
        var context = CreateContext();
        var prospect = new Prospect { UserId = 1 };
        context.Prospects.Add(prospect);
        await context.SaveChangesAsync();

        var controller = new ProspectController(context);

        var result = await controller.Delete(prospect.Id);

        Assert.IsType<OkObjectResult>(result);
        var inDb = await context.Prospects.FindAsync(prospect.Id);
        Assert.Null(inDb);
    }

    [Fact]
    public async Task Delete_WithNonExistentId_ReturnsNotFound()
    {
        var context = CreateContext();
        var controller = new ProspectController(context);

        var result = await controller.Delete(999);

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task BecomeClient_WithExistingId_UpdatesStatusToPendingClient()
    {
        var context = CreateContext();
        var prospect = new Prospect { UserId = 1, Status = ProspectStatus.Prospect };
        context.Prospects.Add(prospect);
        await context.SaveChangesAsync();

        var controller = new ProspectController(context);

        var result = await controller.BecomeClient(prospect.Id);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var returned = Assert.IsType<Prospect>(okResult.Value);
        Assert.Equal(ProspectStatus.PendingClient, returned.Status);
    }

    [Fact]
    public async Task BecomeClient_WithNonExistentId_ReturnsNotFound()
    {
        var context = CreateContext();
        var controller = new ProspectController(context);

        var result = await controller.BecomeClient(999);

        Assert.IsType<NotFoundObjectResult>(result);
    }
}