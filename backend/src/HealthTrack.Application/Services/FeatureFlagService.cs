using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;

namespace HealthTrack.Application.Services;

public sealed class FeatureFlagService(
  Func<string, System.Threading.CancellationToken, Task<bool>> provider,
  string? fallbackPath)
  : IFeatureFlagService
{
  public async Task<bool> IsEnabledAsync(string key, System.Threading.CancellationToken ct = default)
  {
    try
    {
      return await provider(key, ct);
    }
    catch
    {
      if (!string.IsNullOrWhiteSpace(fallbackPath) && File.Exists(fallbackPath))
      {
        var json = await File.ReadAllTextAsync(fallbackPath, ct);
        var dict = JsonSerializer.Deserialize<Dictionary<string, object>>(json) ?? new();
        return dict.TryGetValue(key, out var val) && val is bool b && b;
      }

      return false;
    }
  }

  public async Task<IDictionary<string, object>> SnapshotAsync(System.Threading.CancellationToken ct = default)
  {
    if (!string.IsNullOrWhiteSpace(fallbackPath) && File.Exists(fallbackPath))
    {
      var json = await File.ReadAllTextAsync(fallbackPath, ct);
      return JsonSerializer.Deserialize<Dictionary<string, object>>(json) ?? new();
    }

    return new Dictionary<string, object>();
  }
}
