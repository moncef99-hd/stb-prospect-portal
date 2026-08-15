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

    // Cree un RabbitMqPublisher avec une configuration de test.
    // La connexion est etablie de maniere paresseuse (lazy), donc aucune
    // connexion RabbitMQ reelle n'est necessaire pour ces tests.
    // Si la publication echoue (pas de RabbitMQ disponible en CI), le
    // controleur l'attrape via son try/catch et continue normalement.
    private RabbitMqPublisher CreateRabbitMqPublisher()
    {
        var inMemorySettings = new Dictionary<string, string?>
        {
            { "RabbitMQ:HostName", "localhost" },
            { "RabbitMQ:UserName", "guest" },
            { "RabbitMQ:Password", "guest" }
        };

        IConfiguration configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        return new RabbitMqPublisher(configuration);
    }

    [Fact]
    public async Task Register_WithValidData_ReturnsOkAndCreatesUser()
    {
        var context = CreateContext();
        var controller = new AuthController(context, CreateJwtService(), CreateRabbitMqPublisher());
        var dto = new RegisterDto
        {
            FirstName = "Test",
            LastName = "User",
            Email = "test@example.com",
            Password = "Test@1234"
        };

        var result = await controller.Register(dto);

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(200, okResult.StatusCode);

        var userInDb = await context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        Assert.NotNull(userInDb);
        Assert.NotEqual(dto.Password, userInDb!.PasswordHash);
    }

    [Fact]
    public async Task Register_WithExistingEmail_ReturnsBadRequest()
    {
        var context = CreateContext();
        var controller = new AuthController(context, CreateJwtService(), CreateRabbitMqPublisher());
        var dto = new RegisterDto
        {
            FirstName = "Test",
            LastName = "User",
            Email = "duplicate@example.com",
            Password = "Test@1234"
        };

        await controller.Register(dto);

        var result = await controller.Register(dto);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(400, badRequest.StatusCode);
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsOkWithToken()
    {
        var context = CreateContext();
        var controller = new AuthController(context, CreateJwtService(), CreateRabbitMqPublisher());
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

        var result = await controller.Login(loginDto);

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(200, okResult.StatusCode);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task Login_WithWrongPassword_ReturnsUnauthorized()
    {
        var context = CreateContext();
        var controller = new AuthController(context, CreateJwtService(), CreateRabbitMqPublisher());
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

        var result = await controller.Login(loginDto);

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public async Task Login_WithNonExistentEmail_ReturnsUnauthorized()
    {
        var context = CreateContext();
        var controller = new AuthController(context, CreateJwtService(), CreateRabbitMqPublisher());
        var loginDto = new LoginDto
        {
            Email = "doesnotexist@example.com",
            Password = "Whatever123"
        };

        var result = await controller.Login(loginDto);

        Assert.IsType<UnauthorizedObjectResult>(result);
    }
}