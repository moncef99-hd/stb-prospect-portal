using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProspectService.Data;
using ProspectService.Models;

namespace ProspectService.Controllers;

[ApiController]
[Route("api/prospects")]
public class ProspectController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ProspectController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET /api/prospects
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var prospects = await _context.Prospects.ToListAsync();
        return Ok(prospects);
    }

    // GET /api/prospects/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var prospect = await _context.Prospects.FindAsync(id);
        if (prospect == null) return NotFound(new { message = "Prospect introuvable." });
        return Ok(prospect);
    }

    // GET /api/prospects/by-user/5
    [HttpGet("by-user/{userId}")]
    public async Task<IActionResult> GetByUserId(int userId)
    {
        var prospect = await _context.Prospects
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (prospect == null) return NotFound(new { message = "Prospect introuvable pour cet utilisateur." });
        return Ok(prospect);
    }

    // POST /api/prospects
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Prospect prospect)
    {
        prospect.CreatedAt = DateTime.UtcNow;
        prospect.UpdatedAt = DateTime.UtcNow;

        _context.Prospects.Add(prospect);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = prospect.Id }, prospect);
    }

    // PUT /api/prospects/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Prospect updated)
    {
        var prospect = await _context.Prospects.FindAsync(id);
        if (prospect == null) return NotFound(new { message = "Prospect introuvable." });

        prospect.PhoneNumber = updated.PhoneNumber;
        prospect.Address = updated.Address;
        prospect.Status = updated.Status;
        prospect.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(prospect);
    }

    // DELETE /api/prospects/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var prospect = await _context.Prospects.FindAsync(id);
        if (prospect == null) return NotFound(new { message = "Prospect introuvable." });

        _context.Prospects.Remove(prospect);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Prospect supprimé avec succès." });
    }

    // PATCH /api/prospects/5/become-client
    [HttpPatch("{id}/become-client")]
    public async Task<IActionResult> BecomeClient(int id)
    {
        var prospect = await _context.Prospects.FindAsync(id);
        if (prospect == null) return NotFound(new { message = "Prospect introuvable." });

        prospect.Status = ProspectStatus.PendingClient;
        prospect.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(prospect);
    }
}