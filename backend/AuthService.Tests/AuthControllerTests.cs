using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Mvc;
using AuthService.Controllers;
using AuthService.Data;
using AuthService.DTOs;
using AuthService.Services;
using Xunit;

namespace AuthService.Tests;

public class AuthControllerTests
{
    // Cree un contexte de base de donnees en memoire, isole pour chaque test
    private ApplicationDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    // Cree un JwtService avec une configuration de test
    private JwtService CreateJwtService()
    {
        var inMemorySettings = new Dictionary<string, string?>
        {
            { "Jwt:Key", "TEST_SECRET_KEY_FOR_UNIT_TESTS_ONLY_1234567890" },
            { "Jwt:Issuer", "AuthService.Tests" }
        };

        IConfiguration configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        return new JwtService(configuration);
    }

    [Fact]
    public async Task Register_WithValidData_ReturnsOkAndCreatesUser()
    {
        // Arrange
        var context = CreateContext();
        var controller = new AuthController(context, CreateJwtService());
        var dto = new RegisterDto
        {
            FirstName = "Test",
            LastName = "User",
            Email = "test@example.com",
            Password = "Test@1234"
        };

        // Act
        var result = await controller.Register(dto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(200, okResult.StatusCode);

        var userInDb = await context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        Assert.NotNull(userInDb);
        Assert.NotEqual(dto.Password, userInDb!.PasswordHash); // le mot de passe doit etre hashe, pas stocke en clair
    }

    [Fact]
    public async Task Register_WithExistingEmail_ReturnsBadRequest()
    {
        // Arrange
        var context = CreateContext();
        var controller = new AuthController(context, CreateJwtService());
        var dto = new RegisterDto
        {
            FirstName = "Test",
            LastName = "User",
            Email = "duplicate@example.com",
            Password = "Test@1234"
        };

        await controller.Register(dto); // premiere inscription : doit reussir

        // Act
        var result = await controller.Register(dto); // deuxieme inscription : meme email

        // Assert
        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(400, badRequest.StatusCode);
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsOkWithToken()
    {
        // Arrange
        var context = CreateContext();
        var controller = new AuthController(context, CreateJwtService());
        var registerDto = new RegisterDto
        {
            FirstName = "Test",
            LastName = "User",
            Email = "login@example.com",
            Password = "Test@1234"
        };
        await controller.Register(registerDto);

        var loginDto = new LoginDto
        {
            Email = "login@example.com",
            Password = "Test@1234"
        };

        // Act
        var result = await controller.Login(loginDto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(200, okResult.StatusCode);
        Assert.NotNull(okResult.Value); // doit contenir un token
    }

    [Fact]
    public async Task Login_WithWrongPassword_ReturnsUnauthorized()
    {
        // Arrange
        var context = CreateContext();
        var controller = new AuthController(context, CreateJwtService());
        var registerDto = new RegisterDto
        {
            FirstName = "Test",
            LastName = "User",
            Email = "wrongpass@example.com",
            Password = "Test@1234"
        };
        await controller.Register(registerDto);

        var loginDto = new LoginDto
        {
            Email = "wrongpass@example.com",
            Password = "WrongPassword123"
        };

        // Act
        var result = await controller.Login(loginDto);

        // Assert
        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public async Task Login_WithNonExistentEmail_ReturnsUnauthorized()
    {
        // Arrange
        var context = CreateContext();
        var controller = new AuthController(context, CreateJwtService());
        var loginDto = new LoginDto
        {
            Email = "doesnotexist@example.com",
            Password = "Whatever123"
        };

        // Act
        var result = await controller.Login(loginDto);

        // Assert
        Assert.IsType<UnauthorizedObjectResult>(result);
    }
}