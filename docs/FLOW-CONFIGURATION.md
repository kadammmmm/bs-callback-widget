# WxCC Flow Configuration for Abandoned Call Detection

This document describes the flow configuration required to capture abandoned calls
and send them to the callback backend service.

## HTTP Request Node Configuration

### Request Settings

| Setting | Value |
|---------|-------|
| **Request URL** | `https://bs-callback-widget-production.up.railway.app/api/abandon` |
| **Method** | `POST` |
| **Content Type** | `Application/JSON` |
| **Timeout** | `5` seconds |

### Request Body

```json
{
  "ani": "{{L_Calling_Number}}",
  "queue": "{{L_SMC_Router_Name}}",
  "abandonedAt": "{{now() | date: '%Y-%m-%dT%H:%M:%SZ'}}",
  "callId": "{{L_Call_ID}}",
  "dnis": "{{L_DNIS}}",
  "context": "{{L_Call_Reason}}",
  "callerName": "{{L_Caller_Name}}",
  "queueId": "{{L_QueueID}}",
  "companyName": "{{Company_Name}}",
  "vertical": "{{Vertical}}"
}
```

### Alternative Minimal Body

If you only need the essentials:

```json
{
  "ani": "{{L_Calling_Number}}",
  "queue": "{{L_SMC_Router_Name}}",
  "context": "{{L_Call_Reason}}",
  "callerName": "{{L_Caller_Name}}"
}
```

## Flow Variable Reference

Based on your flow, these are the relevant variables:

| Variable | Use | Example Value |
|----------|-----|---------------|
| `L_Calling_Number` | Caller's ANI | `+13305551234` |
| `L_Call_Reason` | IVR selection/reason | `Billing inquiry` |
| `L_Call_ID` | Unique call identifier | `abc123-def456` |
| `L_DNIS` | Dialed number | `+18005551234` |
| `L_Caller_Name` | Caller name (if collected) | `John Smith` |
| `L_SMC_Router_Name` | Queue/router name | `Sales_Queue` |
| `L_QueueID` | Queue ID | `Q_001` |
| `Company_Name` | Company name | `Acme Corp` |
| `Vertical` | Business vertical | `Retail` |
| `Abandoned` | Abandon flag | `true` |

## Flow Structure

### Abandon Detection Pattern

```
Queue Contact Node
    |
    +-- On Success --> Agent connects (normal flow)
    |
    +-- On Failure/Timeout --> Set Abandoned = true
    |                              |
    |                              v
    |                         HTTP Request Node
    |                         POST to /api/abandon
    |
    +-- OnGlobalError --> Check if in queue, then HTTP Request
```

### Using the Abandoned Variable

Before the HTTP Request node, you can set:
```
Set Variable: Abandoned = true
```

Then in the HTTP body, optionally include:
```json
{
  "ani": "{{L_Calling_Number}}",
  "queue": "{{L_SMC_Router_Name}}",
  "context": "{{L_Call_Reason}}",
  "abandoned": "{{Abandoned}}"
}
```

## Error Handling

The HTTP Request node should handle failures gracefully:

- **On Success**: Continue or end flow
- **On Error**: Log error but don't block (the call already ended)

## Testing the Integration

### Test with curl

```bash
# Simulate an abandon from your flow
curl -X POST https://bs-callback-widget-production.up.railway.app/api/abandon \
  -H "Content-Type: application/json" \
  -d '{
    "ani": "+13305551234",
    "queue": "Sales_Queue",
    "context": "Billing inquiry",
    "callerName": "John Smith",
    "queueId": "Q_001"
  }'

# Verify it was recorded
curl https://bs-callback-widget-production.up.railway.app/api/callbacks
```

### Check Backend Logs

In Render dashboard, check the Logs tab to see incoming requests and any errors.

## Troubleshooting

### HTTP Request Failing

1. **Check URL**: Must be exactly `https://bs-callback-widget-production.up.railway.app/api/abandon`
2. **Check Method**: Must be `POST`
3. **Check Content-Type**: Must be `Application/JSON`
4. **Check Variable Syntax**: Use `{{Variable_Name}}` format
5. **Check for Typos**: Variable names are case-sensitive

### Variables Not Populating

If variables show as empty or literal `{{Variable_Name}}`:
- Ensure the variable exists in your flow
- Ensure the variable has a value at the point of the HTTP Request
- Check variable scope (flow vs global)

### Backend Not Receiving Requests

1. Test backend health: `curl https://bs-callback-widget-production.up.railway.app/health`
2. Check Render logs for incoming requests
3. Verify the flow reaches the HTTP Request node (add logging before it)
