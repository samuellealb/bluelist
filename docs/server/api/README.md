# Server API Routes

This directory contains Nitro API handlers. Each file name maps directly to an
`/api/...` route.

## `/api/exemptUsers`

**Consumer:** the client-side suggestions flow uses this endpoint to determine
whether a DID is exempt from the daily AI-suggestion limit.

### Request

The handler reads a request body with a `did` field.

```json
{ "did": "did:plc:example" }
```

### Responses and validation

| Condition                                         | Response                                            |
| ------------------------------------------------- | --------------------------------------------------- |
| `did` is provided and configured as exempt        | `{ "isExempt": true }`                              |
| `did` is provided but is not configured as exempt | `{ "isExempt": false }`                             |
| `did` is missing or empty                         | `{ "isExempt": false, "error": "No DID provided" }` |

The route returns the missing-DID result rather than throwing an HTTP error.

### Configuration

`runtimeConfig.exemptDids` supplies a comma-separated set of exempt DIDs. It is
server-only configuration and is not returned to the client.

## `/api/suggestions`

**Consumer:** `src/lib/aiSuggestions.ts` sends follows and existing lists to
this endpoint, then parses its successful response as JSON.

### Request

The handler reads a request body containing JSON-encoded strings for both
`users` and `lists`:

```json
{
  "users": "[{\"name\":\"Example profile\",\"description\":\"...\"}]",
  "lists": "[{\"name\":\"Developers\"}]"
}
```

Only the `name` fields are used to build the output schema. Both decoded arrays
must provide at least one name.

### Successful response

The response is a JSON string, not an already-parsed JSON object. Its content
is constrained to this shape:

```json
{
  "data": [
    {
      "name": "Example profile",
      "description": "...",
      "lists": [{ "name": "Developers" }]
    }
  ]
}
```

Each returned profile name must be one of the supplied user names, and each
list name must be one of the supplied existing-list names.

### Validation and errors

| Condition                                 | HTTP status | Error behavior                                 |
| ----------------------------------------- | ----------- | ---------------------------------------------- |
| Missing `users` or `lists`                | 400         | Reports that both fields are required.         |
| Invalid JSON in either field              | 400         | Reports malformed users or lists JSON.         |
| No usable follow or existing-list names   | 400         | Reports that at least one of each is required. |
| Prompt exceeds 100,000 characters         | 400         | Asks the caller to reduce users or lists.      |
| Anthropic returns `max_tokens`            | 500         | Reports a truncated response.                  |
| Anthropic returns no text block           | 500         | Reports missing text content.                  |
| Anthropic API error or a 400-status error | 400         | Logs the error and returns an H3 error.        |
| Other server error                        | 500         | Logs the error and returns an H3 error.        |

### Configuration and external service

`runtimeConfig.anthropicApiKey` is required and remains server-only. The handler
uses it to call Anthropic at `https://api.anthropic.com` with
`claude-haiku-4-5-20251001`. A missing key is reported as a server error.

The request-specific JSON Schema prevents the model from introducing profile or
list names that were not supplied by the caller.
