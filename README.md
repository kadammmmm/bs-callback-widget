# CallBack Queue for Webex Contact Center

A custom Agent Desktop widget that surfaces abandoned calls for proactive agent follow-up. When customers disconnect during IVR or while waiting in queue, this solution captures the interaction data and presents it to agents for callback.

**Built by Matt Kadas**

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Deployment](#deployment)
  - [Backend Deployment](#backend-deployment)
  - [Widget Deployment](#widget-deployment)
- [WxCC Configuration](#wxcc-configuration)
  - [Flow Configuration](#flow-configuration)
  - [Desktop Layout Configuration](#desktop-layout-configuration)
- [Configuration Reference](#configuration-reference)
- [API Reference](#api-reference)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

---

## Features

- **Real-time Callback List**: Displays abandoned calls with ANI, queue, timestamp, caller name, and context
- **Priority Indicators**: Visual urgency flags (green/yellow/red) based on wait time with configurable thresholds
- **Search & Filter**: Filter callbacks by phone number, queue, caller name, or context
- **Claim/Release System**: Prevents duplicate callbacks across agent sessions
- **One-Click Dial**: Initiates outbound call via Desktop SDK with configurable Outdial ANI
- **Multi-ANI Support**: Agents can select from multiple outbound caller IDs if configured
- **Auto-Refresh**: Polls for new callbacks every 30 seconds
- **Configurable TTL**: Automatic cleanup of old callbacks (default: 48 hours)

---

## Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   WxCC Flow     │  POST   │    Backend      │   GET   │  Agent Desktop  │
│  (OnDisconnect) │ ──────► │    Service      │ ◄────── │     Widget      │
│                 │         │  (Express.js)   │         │  (LitElement)   │
└─────────────────┘         └─────────────────┘         └─────────────────┘
                                    │
                                    ▼
                            In-Memory Store
                          (or Database for prod)
```

**Data Flow:**
1. Customer abandons call in IVR or queue
2. WxCC Flow triggers HTTP POST to backend with call data
3. Backend stores callback record
4. Agent Desktop widget polls backend for pending callbacks
5. Agent claims, dials, and callback is removed from list

---

## Prerequisites

- Webex Contact Center tenant with Flow Designer access
- GitHub account (for widget hosting)
- Backend hosting account (Render, Railway, Fly.io, or similar)
- Admin access to WxCC Control Hub for Desktop Layout configuration
- Outdial Entry Point and ANI configured in WxCC

---

## Deployment

### Backend Deployment

The backend is a Node.js/Express application that stores callback records and serves the REST API.

#### Option 1: Render.com (Recommended)

1. Fork this repository to your GitHub account
2. Log in to [Render.com](https://render.com)
3. Click **New > Web Service**
4. Connect your GitHub account and select the forked repository
5. Configure the service:

| Setting | Value |
|---------|-------|
| **Name** | `bs-callback-widget` (or your preference) |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

6. Add environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `CALLBACK_TTL_HOURS` | `48` | Hours before callbacks expire |
| `ABANDON_API_KEY` | *(your secret)* | If set, WxCC Flow must send this in `X-API-Key` header on `POST /api/abandon` |
| `ADMIN_API_KEY` | *(your secret)* | If set, required on all admin/debug endpoints |

7. Click **Create Web Service**
8. Note your service URL (e.g., `https://your-service.onrender.com`)

**Custom Domain (Optional):**
- In Render dashboard, go to Settings > Custom Domains
- Add your domain (e.g., `abandoncallbacks.yourdomain.com`)
- Configure DNS CNAME record as instructed

#### Option 2: Railway.app

1. Log in to [Railway.app](https://railway.app)
2. Click **New Project > Deploy from GitHub repo**
3. Select your forked repository
4. Railway auto-detects Node.js
5. Go to **Settings** and set:
   - Root Directory: `backend`
6. Add environment variables in **Variables** tab:
   - `CALLBACK_TTL_HOURS`: `48`
   - `ABANDON_API_KEY`: *(your secret)*
   - `ADMIN_API_KEY`: *(your secret)*
7. Deploy and note your service URL

#### Option 3: Fly.io

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Navigate to backend directory: `cd backend`
3. Create Fly app:
```bash
fly launch --name bs-callback-widget
```
4. Set environment variables:
```bash
fly secrets set CALLBACK_TTL_HOURS=48
fly secrets set ABANDON_API_KEY=your-secret
fly secrets set ADMIN_API_KEY=your-admin-secret
```
5. Deploy:
```bash
fly deploy
```

#### Option 4: Self-Hosted (Docker)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ .
ENV PORT=3000
ENV CALLBACK_TTL_HOURS=48
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t callback-widget-backend .
docker run -p 3000:3000 \
  -e CALLBACK_TTL_HOURS=48 \
  -e ABANDON_API_KEY=your-secret \
  -e ADMIN_API_KEY=your-admin-secret \
  callback-widget-backend
```

#### Verify Backend Deployment

```bash
curl https://your-backend-url.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "callbackCount": 0,
  "callbackTTLHours": 48
}
```

---

### Widget Deployment

The widget is a LitElement web component bundled as an IIFE script.

#### Option 1: GitHub Pages (Recommended)

1. Fork this repository
2. Build the widget locally:
```bash
npm install
NODE_ENV=production npm run build
cp dist/callback-widget.js index.js
```
3. Commit and push:
```bash
git add .
git commit -m "Build widget"
git push
```
4. Enable GitHub Pages:
   - Go to repository Settings > Pages
   - Source: Deploy from branch
   - Branch: `main` / `root`
5. Widget URL: `https://<username>.github.io/<repo-name>/index.js`

#### Option 2: Backend Hosting

The backend can also serve the widget file:

1. Build the widget: `npm run build`
2. The `dist/callback-widget.js` file is served at `/widget/callback-widget.js`
3. Widget URL: `https://your-backend-url.com/widget/callback-widget.js`

#### Option 3: CDN (CloudFlare, AWS S3, etc.)

1. Build the widget: `npm run build`
2. Upload `dist/callback-widget.js` to your CDN
3. Configure CORS headers to allow WxCC Desktop domain

---

## WxCC Configuration

### Flow Configuration

Add an HTTP Request node to your flow that triggers when a call is abandoned.

#### HTTP Request Node Settings

| Setting | Value |
|---------|-------|
| **Request URL** | `https://your-backend-url.com/api/abandon` |
| **Method** | `POST` |
| **Content Type** | `application/json` |
| **Header: X-API-Key** | *(value of your `ABANDON_API_KEY` env var, if configured)* |

#### Request Body

```json
{
  "ani": "{{NewPhoneContact.ANI}}",
  "queue": "{{Queue.name}}",
  "context": "{{your_context_variable}}",
  "callerName": "{{your_caller_name_variable}}",
  "dnis": "{{NewPhoneContact.DNIS}}"
}
```

**Available Flow Variables:**

| Field | Description | Example |
|-------|-------------|---------|
| `ani` | Caller's phone number (required) | `+13305551234` |
| `queue` | Queue name or ID | `Sales` or `uuid` |
| `context` | IVR context, reason for call | `Billing inquiry` |
| `callerName` | Caller name if collected | `John Smith` |
| `dnis` | Dialed number | `+18005559999` |

#### Custom Fields

You can pass any additional data fields to display in the widget. There are two methods:

**Method 1: customFields Object (Recommended)**

```json
{
  "ani": "{{NewPhoneContact.ANI}}",
  "queue": "{{Queue.name}}",
  "customFields": {
    "Account Number": "{{accountNumber}}",
    "VIP Status": "{{vipTier}}",
    "Product Interest": "{{selectedProduct}}",
    "Previous Agent": "{{lastAgentName}}"
  }
}
```

**Method 2: Prefixed Fields**

Use `custom_` prefix for automatic label conversion:

```json
{
  "ani": "{{NewPhoneContact.ANI}}",
  "queue": "{{Queue.name}}",
  "custom_accountNumber": "{{accountNumber}}",
  "custom_vipStatus": "{{vipTier}}",
  "custom_productInterest": "{{selectedProduct}}"
}
```

The prefix is removed and camelCase is converted to readable labels:
- `custom_accountNumber` becomes "Account Number"
- `custom_vipStatus` becomes "Vip Status"

Custom fields are displayed in a dedicated section on each callback card and are searchable via the filter.

#### Flow Placement

Trigger the HTTP Request when:
- `QueueContactEvent.reason == "Abandoned"`
- Or on disconnect when `Queue.waitTime > 0`

---

### Desktop Layout Configuration

Add the callback widget to your Desktop Layout JSON.

#### Navigation Panel Layout (Recommended)

Add to the `navigation` array in your desktop layout:

```json
{
  "nav": {
    "label": "Callbacks",
    "icon": "call-log",
    "iconType": "momentum",
    "navigateTo": "callbacks",
    "align": "top"
  },
  "page": {
    "id": "callbacks",
    "widgets": {
      "callback-area": {
        "comp": "bs-callback-widget",
        "script": "https://your-username.github.io/bs-callback-widget/index.js",
        "attributes": {
          "darkmode": "$STORE.app.darkMode"
        },
        "properties": {
          "backendUrl": "https://your-backend-url.com/api",
          "accessToken": "$STORE.auth.accessToken",
          "outdialEp": "$STORE.agent.outDialEp",
          "outdialAni": "+18005551234",
          "priorityWarningMins": 60,
          "priorityCriticalMins": 120
        }
      },
      "main-area": {
        "comp": "agentx-wc-interaction-control"
      }
    },
    "layout": {
      "areas": [["callback-area", "main-area"]],
      "size": {
        "cols": ["35%", "65%"],
        "rows": [1]
      }
    }
  }
}
```

#### Multi-ANI Configuration

If agents need to select from multiple outbound caller IDs:

```json
"properties": {
  "backendUrl": "https://your-backend-url.com/api",
  "accessToken": "$STORE.auth.accessToken",
  "outdialEp": "$STORE.agent.outDialEp",
  "outdialAniList": "+18005551234,+18005555678,+18005559999",
  "priorityWarningMins": 60,
  "priorityCriticalMins": 120
}
```

When `outdialAniList` contains multiple numbers, agents see a selection modal before dialing.

---

## Configuration Reference

### Widget Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `backendUrl` | String | Yes | - | Backend API URL (include `/api`) |
| `outdialEp` | String | Yes | - | Outdial Entry Point ID. Use `$STORE.agent.outDialEp` |
| `outdialAni` | String | Yes* | - | Single Outdial ANI (e.g., `+18005551234`) |
| `outdialAniList` | String | Yes* | - | Comma-separated ANIs for multi-select |
| `accessToken` | String | No | - | Set to `$STORE.auth.accessToken` as fallback if SDK token unavailable |
| `priorityWarningMins` | Number | No | `60` | Minutes until yellow warning indicator |
| `priorityCriticalMins` | Number | No | `120` | Minutes until red critical indicator |

*Either `outdialAni` or `outdialAniList` is required.

### Backend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | Server port |
| `CALLBACK_TTL_HOURS` | No | `48` | Hours before callbacks automatically expire |
| `ABANDON_API_KEY` | No | *(open)* | If set, `POST /api/abandon` requires `X-API-Key: <value>` header |
| `ADMIN_API_KEY` | No | *(open)* | If set, required on `GET /api/debug` and `DELETE /api/callbacks` endpoints |

### Priority Indicator Thresholds

| Wait Time | Indicator | Description |
|-----------|-----------|-------------|
| < `priorityWarningMins` | Green | Normal priority |
| `priorityWarningMins` to `priorityCriticalMins` | Yellow | Warning - needs attention |
| > `priorityCriticalMins` | Red (pulsing) | Critical - urgent follow-up |

---

## API Reference

### Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/health` | — | Health check with callback count and TTL |
| `POST` | `/api/abandon` | `ABANDON_API_KEY` | Create callback record (called by Flow) |
| `GET` | `/api/callbacks` | — | List pending/claimed callbacks, sorted oldest-first |
| `POST` | `/api/callbacks/:id/claim` | — | Claim a callback for exclusive handling |
| `POST` | `/api/callbacks/:id/release` | — | Release claimed callback back to pool |
| `POST` | `/api/callbacks/:id/complete` | — | Remove callback after dial (immediate delete) |
| `GET` | `/api/stats` | — | Get callback statistics |
| `GET` | `/api/debug` | `ADMIN_API_KEY` | View full callback store |
| `DELETE` | `/api/callbacks/:id` | `ADMIN_API_KEY` | Delete a single callback |
| `DELETE` | `/api/callbacks` | `ADMIN_API_KEY` | Clear all callbacks |

### POST /api/abandon

Create a new callback record.

**Request:**
```json
{
  "ani": "+13305551234",
  "queue": "Sales",
  "context": "Billing inquiry",
  "callerName": "John Smith",
  "dnis": "+18005559999"
}
```

**Response:**
```json
{
  "message": "Callback created",
  "id": "uuid-here"
}
```

---

## Development

### Local Development

```bash
# Clone repository
git clone https://github.com/your-username/wxcc-callback-widget.git
cd wxcc-callback-widget

# Install dependencies
npm install

# Production build
NODE_ENV=production npm run build

# Run backend locally
cd backend
npm install
npm start
```

### Build Commands

| Command | Description |
|---------|-------------|
| `NODE_ENV=production npm run build` | Production build to `dist/callback-widget.js` (~287 KB minified) |
| `npm run build` | Development build (larger, includes source maps) |
| `npm run deploy` | Production build + copy to `index.js` for GitHub Pages |

### Project Structure

```
bs-callback-widget/
├── src/
│   └── callback-widget.js    # LitElement widget source
├── backend/
│   ├── server.js             # Express API server
│   └── package.json
├── dist/
│   └── callback-widget.js    # Built widget (after npm run build)
├── docs/
│   ├── COMPLETE-SETUP-GUIDE.md
│   ├── FLOW-CONFIGURATION.md
│   └── navigation-layout.json
├── package.json
├── webpack.config.cjs
└── README.md
```

---

## Troubleshooting

### Widget Not Loading

1. Check browser console for errors
2. Verify script URL is accessible (try opening in browser)
3. Confirm CORS is not blocking requests
4. Check that `comp` name matches: `bs-callback-widget`

### Outdial Fails

1. Verify `outdialEp` is set (check `$STORE.agent.outDialEp` in console)
2. Confirm `outdialAni` is a valid, hardcoded phone number
3. Check agent has Outdial permissions in Control Hub
4. Review browser console for specific error messages

### Callbacks Not Appearing

1. Test backend health: `curl https://your-backend-url.com/health`
2. Check Flow HTTP Request is triggering (add debug logging)
3. Verify backend URL in widget properties includes `/api`
4. Check backend logs in hosting dashboard

### Backend Restarting Loses Data

The default backend uses in-memory storage. For production:
- Use a paid tier that doesn't sleep (Render, Railway paid plans)
- Or implement database storage (MongoDB, PostgreSQL, Redis)

### Console Debug Commands

Run in browser console on Agent Desktop to inspect the live widget instance:

```javascript
function findWidget(root = document) {
  let w = root.querySelector('bs-callback-widget');
  if (w) return w;
  for (const el of root.querySelectorAll('*')) {
    if (el.shadowRoot) {
      w = findWidget(el.shadowRoot);
      if (w) return w;
    }
  }
  return null;
}

const w = findWidget();
console.log('Backend URL:', w?.backendUrl);
console.log('Outdial EP:', w?.outdialEp);
console.log('Outdial ANI:', w?.outdialAni);
console.log('Agent ID:', w?.agentId);
console.log('Callbacks:', w?.callbacks);
```

---

## Support

For issues or questions, open an issue in the repository.

---

## License

MIT License - Matt Kadas

---

**Matt Kadas**
