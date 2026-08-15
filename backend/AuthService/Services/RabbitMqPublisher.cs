using System.Text;
using System.Text.Json;
using RabbitMQ.Client;

namespace AuthService.Services;

public class RabbitMqPublisher : IAsyncDisposable
{
    private const string ExchangeName = "user.events";
    private readonly IConfiguration _configuration;
    private IConnection? _connection;
    private IChannel? _channel;
    private readonly SemaphoreSlim _lock = new(1, 1);

    public RabbitMqPublisher(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    private async Task EnsureConnectedAsync()
    {
        if (_channel != null && _channel.IsOpen)
            return;

        await _lock.WaitAsync();
        try
        {
            if (_channel != null && _channel.IsOpen)
                return;

            var factory = new ConnectionFactory
            {
                HostName = _configuration["RabbitMQ:HostName"] ?? "localhost",
                UserName = _configuration["RabbitMQ:UserName"] ?? "guest",
                Password = _configuration["RabbitMQ:Password"] ?? "guest"
            };

            _connection = await factory.CreateConnectionAsync();
            _channel = await _connection.CreateChannelAsync();

            await _channel.ExchangeDeclareAsync(
                exchange: ExchangeName,
                type: ExchangeType.Fanout,
                durable: true);
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task PublishUserRegisteredAsync(object userEvent)
    {
        await EnsureConnectedAsync();

        var json = JsonSerializer.Serialize(userEvent);
        var body = Encoding.UTF8.GetBytes(json);

        await _channel!.BasicPublishAsync(
            exchange: ExchangeName,
            routingKey: string.Empty,
            body: body);
    }

    public async ValueTask DisposeAsync()
    {
        if (_channel != null) await _channel.CloseAsync();
        if (_connection != null) await _connection.CloseAsync();
    }
}