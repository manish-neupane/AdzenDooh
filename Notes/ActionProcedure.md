Here's everything together, in order:

**`ActionResult.cs`**

```csharp
public class ActionResult
{
    public string? Type { get; init; }
    public string? Message { get; init; }
    public string Json { get; init; } = "{}";

    public bool IsError => Type is not null;
}
```

---

**`IDataAccessService.cs`**

```csharp
public interface IDataAccessService
{
    Task<IDbConnection> GetConnection();
    Task<string> RetrievalProcedure(string storedProcedure, string json);
    Task<string> ActionProcedure(string storedProcedure, string json);
    Task<ActionResult> ActionProcedureChecked(string storedProcedure, string json);
}
```

---

**`DataAccessService.cs`**

```csharp
public async Task<ActionResult> ActionProcedureChecked(string storedProcedure, string json)
{
    var resultJson = await ActionProcedure(storedProcedure, json);

    using var doc = JsonDocument.Parse(resultJson);
    var root = doc.RootElement;

    if (root.TryGetProperty("Type", out var typeProp) &&
        root.TryGetProperty("Message", out var msgProp))
    {
        return new ActionResult
        {
            Type    = typeProp.GetString(),
            Message = msgProp.GetString(),
            Json    = resultJson
        };
    }

    return new ActionResult { Json = resultJson };
}
```

---

**`ScreenService.cs`**

```csharp
public async Task<MvApiResponse<ScreenDto>> SaveScreenAsync(string inputJson)
{
    var result = await _dataService.ActionProcedureChecked("inv.SpScreenTsk", inputJson);

    if (result.IsError)
        return ApiResult.Fail<ScreenDto>(result.Message ?? "Unexpected error");

    var screen = JsonSerializer.Deserialize<List<ScreenDto>>(result.Json)?.FirstOrDefault();
    return screen is not null
        ? ApiResult.Success(screen)
        : ApiResult.Fail<ScreenDto>("No screen data returned");
}
```

---

**`ScreenController.cs`**

```csharp
[HttpPost]
public async Task<IActionResult> Save([FromBody] ScreenRequestDto request)
{
    var inputJson = JsonSerializer.Serialize(request);
    var result = await _screenService.SaveScreenAsync(inputJson);

    return result.Success
        ? Ok(result)
        : BadRequest(result);
}
```

Each layer does exactly one job, nothing bleeds into the next.