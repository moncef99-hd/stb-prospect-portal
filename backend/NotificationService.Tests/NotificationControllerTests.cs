using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using NotificationService.Controllers;
using NotificationService.Data;
using NotificationService.Models;
using Xunit;

namespace NotificationService.Tests;

public class NotificationControllerTests
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
    public async Task GetAll_ReturnsAllNotifications_OrderedByCreatedAtDescending()
    {
        var context = CreateContext();
        var older = new Notification { UserId = 1, ProspectName = "Old", Email = "old@test.com", Message = "old", CreatedAt = DateTime.UtcNow.AddMinutes(-10) };
        var newer = new Notification { UserId = 2, ProspectName = "New", Email = "new@test.com", Message = "new", CreatedAt = DateTime.UtcNow };
        context.Notifications.AddRange(older, newer);
        await context.SaveChangesAsync();

        var controller = new NotificationController(context);

        var result = await controller.GetAll();

        var okResult = Assert.IsType<OkObjectResult>(result);
        var notifications = Assert.IsAssignableFrom<IEnumerable<Notification>>(okResult.Value).ToList();
        Assert.Equal(2, notifications.Count);
        Assert.Equal("New", notifications[0].ProspectName); // le plus recent doit etre en premier
    }

    [Fact]
    public async Task GetUnreadCount_ReturnsOnlyUnreadCount()
    {
        var context = CreateContext();
        context.Notifications.Add(new Notification { UserId = 1, ProspectName = "A", Email = "a@test.com", Message = "a", IsRead = false });
        context.Notifications.Add(new Notification { UserId = 2, ProspectName = "B", Email = "b@test.com", Message = "b", IsRead = true });
        context.Notifications.Add(new Notification { UserId = 3, ProspectName = "C", Email = "c@test.com", Message = "c", IsRead = false });
        await context.SaveChangesAsync();

        var controller = new NotificationController(context);

        var result = await controller.GetUnreadCount();

        var okResult = Assert.IsType<OkObjectResult>(result);
        var value = okResult.Value;
        var countProperty = value!.GetType().GetProperty("count");
        var count = (int)countProperty!.GetValue(value)!;
        Assert.Equal(2, count);
    }

    [Fact]
    public async Task MarkAsRead_WithExistingId_SetsIsReadToTrue()
    {
        var context = CreateContext();
        var notification = new Notification { UserId = 1, ProspectName = "A", Email = "a@test.com", Message = "a", IsRead = false };
        context.Notifications.Add(notification);
        await context.SaveChangesAsync();

        var controller = new NotificationController(context);

        var result = await controller.MarkAsRead(notification.Id);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var returned = Assert.IsType<Notification>(okResult.Value);
        Assert.True(returned.IsRead);
    }

    [Fact]
    public async Task MarkAsRead_WithNonExistentId_ReturnsNotFound()
    {
        var context = CreateContext();
        var controller = new NotificationController(context);

        var result = await controller.MarkAsRead(999);

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task MarkAllAsRead_MarksAllUnreadNotificationsAsRead()
    {
        var context = CreateContext();
        context.Notifications.Add(new Notification { UserId = 1, ProspectName = "A", Email = "a@test.com", Message = "a", IsRead = false });
        context.Notifications.Add(new Notification { UserId = 2, ProspectName = "B", Email = "b@test.com", Message = "b", IsRead = false });
        context.Notifications.Add(new Notification { UserId = 3, ProspectName = "C", Email = "c@test.com", Message = "c", IsRead = true });
        await context.SaveChangesAsync();

        var controller = new NotificationController(context);

        var result = await controller.MarkAllAsRead();

        Assert.IsType<OkObjectResult>(result);

        var stillUnread = await context.Notifications.CountAsync(n => !n.IsRead);
        Assert.Equal(0, stillUnread);
    }

    [Fact]
    public async Task MarkAllAsRead_WithNoUnreadNotifications_StillReturnsOk()
    {
        var context = CreateContext();
        context.Notifications.Add(new Notification { UserId = 1, ProspectName = "A", Email = "a@test.com", Message = "a", IsRead = true });
        await context.SaveChangesAsync();

        var controller = new NotificationController(context);

        var result = await controller.MarkAllAsRead();

        Assert.IsType<OkObjectResult>(result);
    }
}