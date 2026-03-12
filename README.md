# Abandoned Call Callback Widget for Webex Contact Center

A custom Agent Desktop widget that surfaces abandoned calls for proactive agent follow-up. When customers disconnect during IVR or while waiting in queue, this solution captures the interaction data and presents it to agents for callback.

![Widget Preview](docs/widget-preview.png)

## Features

- **Real-time Callback List**: Displays abandoned calls with ANI, queue, timestamp, and context
- **Claim/Release System**: Prevents duplicate callbacks across agent sessions
- **One-Click Dial**: Initiates outbound call via Desktop SDK
- **Compact Header Design**: Fits in the 48px advancedHeader area
- **Auto-Refresh**: Polls for new callbacks every 30 seconds

## Architecture

```
WxCC Flow (OnDisconnect) ──► Backend Service ◄── Agent Desktop Widget
         HTTP POST              REST API           LitElement + SDK
```

## Quick Start

### 1. Deploy Backend (Render)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

Or manually:
1. Fork this repo
2. Create new Web Service on Render
3. Connect to your fork
4. Set Root Directory: `backend`
5. Deploy

### 2. Deploy Widget (GitHub Pages)

1. Fork this repo
2. Enable GitHub Pages (Settings > Pages > main branch)
3. Widget URL: `https://<your-username>.github.io/bs-callback-widget/index.js`

### 3. Configure WxCC Flow

Add HTTP Request node on disconnect:
- URL: `https://your-backend.onrender.com/api/abandon`
- Method: POST
- Body: See [Flow Configuration](docs/FLOW-CONFIGURATION.md)

### 4. Update Desktop Layout

Add to `advancedHeader`:
```json
{
  "comp": "bs-callback-widget",
  "script": "https://<your-username>.github.io/bs-callback-widget/index.js",
  "properties": {
    "backendUrl": "https://your-backend.onrender.com/api"
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Build widget
npm run build

# Run backend locally
cd backend && npm run dev
```

## Documentation

- [Deployment Guide](docs/DEPLOYMENT.md) - Complete setup instructions
- [Flow Configuration](docs/FLOW-CONFIGURATION.md) - WxCC Flow setup
- [Desktop Layout Sample](docs/desktop-layout-sample.json) - Layout JSON examples

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/abandon` | Create callback record (from Flow) |
| GET | `/api/callbacks` | List pending callbacks |
| POST | `/api/callbacks/:id/claim` | Claim a callback |
| POST | `/api/callbacks/:id/release` | Release claimed callback |
| POST | `/api/callbacks/:id/dial` | Mark as dialed |
| GET | `/api/stats` | Get callback statistics |

## Technical Details

- **Widget**: LitElement web component, IIFE bundle format
- **Backend**: Express.js with in-memory store (swap for DB in production)
- **SDK**: @wxcc-desktop/sdk for agent state and dialer integration

## License

MIT

## Author

bucher+suter - Cisco Contact Center Solutions
