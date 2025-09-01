
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;

namespace HealthTrack.Infrastructure.Features;

public static class DynamoFeatureFlagProvider
{
    public static Func<string, System.Threading.CancellationToken, Task<bool>> Create(string? serviceUrl)
    {
        var config = new AmazonDynamoDBConfig();
        if (!string.IsNullOrWhiteSpace(serviceUrl)) { config.ServiceURL = serviceUrl; config.AuthenticationRegion = "us-east-1"; }
        var client = new AmazonDynamoDBClient(config);
        return async (key, ct) => {
            var resp = await client.GetItemAsync(new GetItemRequest {
                TableName = "FeatureFlags",
                Key = new Dictionary<string, AttributeValue> { { "Key", new AttributeValue { S = key } } }
            }, ct);
            if (resp.Item.TryGetValue("Value", out var v) && v.BOOL.HasValue) return v.BOOL.Value;
            return false;
        };
    }
}
