namespace ProspectService.Models;

public enum ProspectStatus
{
    Prospect = 0,
    PendingClient = 1,
    Client = 2
}

public class Prospect
{
    public int Id { get; set; }
    public int UserId { get; set; }

    public string? PhoneNumber { get; set; }
    public string? Address { get; set; }

    public ProspectStatus Status { get; set; } = ProspectStatus.Prospect;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}