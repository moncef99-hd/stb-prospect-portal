using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AuthService.Data;
using AuthService.Models;
using AuthService.DTOs;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
namespace AuthService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly JwtService _jwtService;

    public AuthController(
    ApplicationDbContext context,
    JwtService jwtService)
{
    _context = context;
    _jwtService = jwtService;
}


    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        // Vérifier si email existe
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (existingUser != null)
        {
            return BadRequest(new
            {
                message = "Email already exists"
            });
        }


        // Hash du mot de passe
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);


        // Création User
        var user = new User
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            PasswordHash = passwordHash
        };


        // Sauvegarde PostgreSQL
        _context.Users.Add(user);
        await _context.SaveChangesAsync();


       return Ok(new
{
    message = "User created successfully",
    user = new
    {
        user.Id,
        user.FirstName,
        user.LastName,
        user.Email
    }
});
    }
    [HttpPost("login")]
public async Task<IActionResult> Login(LoginDto dto)
{
    var user = await _context.Users
        .FirstOrDefaultAsync(u => u.Email == dto.Email);


    if (user == null)
    {
        return Unauthorized(new
        {
            message = "Invalid email or password"
        });
    }


    bool passwordValid =
        BCrypt.Net.BCrypt.Verify(
            dto.Password,
            user.PasswordHash
        );


    if (!passwordValid)
    {
        return Unauthorized(new
        {
            message = "Invalid email or password"
        });
    }


    var token = _jwtService.GenerateToken(user);


    return Ok(new
    {
        token = token
    });
}
[Authorize]
[HttpGet("me")]
public async Task<IActionResult> Me()
{
    var email = User.Claims
        .FirstOrDefault(c => c.Type.Contains("email"))
        ?.Value;


    var user = await _context.Users
        .FirstOrDefaultAsync(u => u.Email == email);


    return Ok(new
    {
        user.Id,
        user.FirstName,
        user.LastName,
        user.Email
    });
}
}