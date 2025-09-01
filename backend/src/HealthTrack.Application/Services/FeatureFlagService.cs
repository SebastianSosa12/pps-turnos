
using System.Text.Json;

namespace HealthTrack.Application.Services;

public sealed class FeatureFlagService : IFeatureFlagService
{
    private readonly string? _fallbackPath;
    private readonly Func<string, System.Threading.CancellationToken, Task<bool>> _provider;
    public FeatureFlagService(Func<string, System.Threading.CancellationToken, Task<bool>> provider, string? fallbackPath) { _provider = provider; _fallbackPath = fallbackPath; }

    public async Task<bool> IsEnabledAsync(string key, System.Threading.CancellationToken ct = default)
    {
        try { return await _provider(key, ct); }
        catch {
            if (!string.IsNullOrWhiteSpace(_fallbackPath) && File.Exists(_fallbackPath)) {
                var json = await File.ReadAllTextAsync(_fallbackPath, ct);
                var dict = JsonSerializer.Deserialize<Dictionary<string, object>>(json) ?? new();
                return dict.TryGetValue(key, out var val) && val is bool b && b;
            }
            return false;
        }
    }

    public async Task<IDictionary<string, object>> SnapshotAsync(System.Threading.CancellationToken ct = default)
    {
        if (!string.IsNullOrWhiteSpace(_fallbackPath) && File.Exists(_fallbackPath)) {
            var json = await File.ReadAllTextAsync(_fallbackPath, ct);
            return JsonSerializer.Deserialize<Dictionary<string, object>>(json) ?? new();
        }
        return new Dictionary<string, object>();
    }
}
