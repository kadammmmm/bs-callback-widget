# WxCC Flow Configuration for Abandoned Call Detection

This document describes the flow configuration required to capture abandoned calls
and send them to the callback backend service.

## Flow Variables Required

Create these flow variables in your WxCC Flow Designer:

| Variable Name | Type    | Default | Description                           |
|---------------|---------|---------|---------------------------------------|
| Abandoned     | Boolean | false   | Set to true when customer disconnects |
| AbandonPoint  | String  | ""      | Where in flow abandonment occurred    |
| CollectedData | String  | ""      | Any IVR data collected before abandon |

## Flow Structure

### 1. Entry Point Configuration

```
Entry Point
    │
    ├── Set Variable: Abandoned = false
    │
    ├── Play Welcome Message
    │
    ├── IVR Menu / Data Collection
    │   └── On each step, update CollectedData variable
    │
    ├── Queue Contact
    │   └── Set AbandonPoint = "Queue"
    │
    └── Connect to Agent
```

### 2. Disconnect Event Handler

In your flow, add an Event handler for "OnDisconnect" or use the
Disconnect node to capture when the customer hangs up:

```
OnDisconnect Event
    │
    ├── Condition: Is agent connected?
    │   │
    │   ├── YES: Normal call end (do nothing)
    │   │
    │   └── NO: Customer abandoned
    │       │
    │       ├── Set Variable: Abandoned = true
    │       │
    │       └── HTTP Request Node
    │           URL: https://your-backend.onrender.com/api/abandon
    │           Method: POST
    │           Body (JSON):
    │           {
    │               "ani": "{{NewPhoneContact.ANI}}",
    │               "queue": "{{QueueName}}",
    │               "abandonedAt": "{{CurrentDateTime}}",
    │               "entryPointId": "{{EntryPointId}}",
    │               "context": "{{CollectedData}}",
    │               "sessionId": "{{SessionId}}",
    │               "dnis": "{{NewPhoneContact.DNIS}}"
    │           }
```

### 3. HTTP Request Node Configuration

**Node Settings:**
- Request Type: POST
- Content Type: application/json
- URL: `https://your-backend.onrender.com/api/abandon`
- Timeout: 5 seconds
- Parse Response: Optional (for logging)

**Request Body:**
```json
{
  "ani": "{{NewPhoneContact.ANI}}",
  "queue": "{{Queue.Name}}",
  "abandonedAt": "{{Global_CurrentDateTime}}",
  "entryPointId": "{{EntryPoint.Id}}",
  "context": "{{CollectedData}}",
  "sessionId": "{{Global_SessionId}}",
  "dnis": "{{NewPhoneContact.DNIS}}"
}
```

**Headers:**
- Content-Type: application/json

### 4. Alternative: Queue Timeout Handling

You can also capture abandons through queue timeout:

```
Queue Contact Node
    │
    ├── On Success: Connect to Agent
    │
    ├── On Timeout: 
    │   ├── Set Abandoned = true
    │   ├── Set AbandonPoint = "QueueTimeout"
    │   └── HTTP Request (same as above)
    │
    └── On Error: Handle error flow
```

## Variable Reference

### Standard WxCC Variables

| Variable                    | Description                    |
|-----------------------------|--------------------------------|
| NewPhoneContact.ANI         | Caller's phone number          |
| NewPhoneContact.DNIS        | Dialed number                  |
| Queue.Name                  | Name of the queue              |
| EntryPoint.Id               | Entry point identifier         |
| Global_SessionId            | Unique session ID              |
| Global_CurrentDateTime      | Current timestamp              |

### Custom Variables for IVR Context

Track what data was collected before abandonment:

```
CollectedData examples:
- "Menu: Sales, Language: English"
- "Account: 12345, Reason: Billing"
- "Product: Widget Pro, Issue: Returns"
```

## Testing the Integration

### 1. Test the Backend Directly

```bash
# Test abandon endpoint
curl -X POST https://your-backend.onrender.com/api/abandon \
  -H "Content-Type: application/json" \
  -d '{
    "ani": "+13305551234",
    "queue": "Sales_Queue",
    "abandonedAt": "2024-01-15T10:30:00Z",
    "context": "Called about billing",
    "entryPointId": "EP_001"
  }'

# Check callbacks list
curl https://your-backend.onrender.com/api/callbacks

# Check stats
curl https://your-backend.onrender.com/api/stats
```

### 2. Test in Flow Designer

1. Publish flow to development environment
2. Call into the entry point
3. Navigate through IVR
4. Hang up before reaching an agent
5. Check backend logs or /api/stats endpoint
6. Verify callback appears in agent widget

## Error Handling

The HTTP Request node should handle failures gracefully:

```
HTTP Request
    │
    ├── On Success: Log success (optional)
    │
    └── On Error: 
        └── Log error but continue
            (Don't block flow for HTTP failures)
```

## Security Considerations

For production:

1. **Add Authentication**: Use API key or JWT token in HTTP Request headers
2. **Restrict CORS**: Limit backend CORS to your WxCC domains
3. **Rate Limiting**: Implement rate limiting on the backend
4. **Data Retention**: Set appropriate retention policies for callback data
