# Deployment Guide: Abandoned Call Callback Widget

This guide covers complete deployment of the callback widget and backend service.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        WEBEX CONTACT CENTER                              │
│                                                                          │
│  ┌──────────────┐    OnDisconnect    ┌─────────────────────────────┐    │
│  │   WxCC Flow  │ ─────────────────► │   Backend Service (Render)  │    │
│  │              │   POST /api/abandon │   - Express.js              │    │
│  │  Abandoned   │                     │   - In-memory or DB store   │    │
│  │  Detection   │                     │                             │    │
│  └──────────────┘                     └──────────────┬──────────────┘    │
│                                                      │                   │
│                                                      │ GET /api/callbacks│
│                                                      │                   │
│  ┌──────────────────────────────────────────────────▼──────────────────┐│
│  │                     AGENT DESKTOP                                   ││
│  │  ┌─────────────────────────────────────────────────────────────┐   ││
│  │  │  advancedHeader                                              │   ││
│  │  │  ┌───────────────────────────────────────────────────────┐  │   ││
│  │  │  │  bs-callback-widget (GitHub Pages)                     │  │   ││
│  │  │  │  - Shows callback count badge                          │  │   ││
│  │  │  │  - Dropdown with callback list                         │  │   ││
│  │  │  │  - Claim/Release/Dial actions                          │  │   ││
│  │  │  └───────────────────────────────────────────────────────┘  │   ││
│  │  └─────────────────────────────────────────────────────────────┘   ││
│  └────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

## Prerequisites

- Node.js 18+ installed locally
- VS Code with extensions:
  - ESLint
  - Prettier
  - GitLens (optional)
- Git installed and configured
- GitHub account
- Render.com account (free tier works)

---

## Part 1: Local Development Setup

### Step 1: Create Project Directory

```bash
# Create and navigate to project folder
mkdir bs-callback-widget
cd bs-callback-widget

# Initialize git
git init
```

### Step 2: Create Project Files

Copy all the source files from this package:
- `package.json`
- `rollup.config.js`
- `src/callback-widget.js`
- `backend/package.json`
- `backend/server.js`

Or clone from your repo once created.

### Step 3: Install Dependencies

```bash
# Install widget dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Step 4: Test Local Backend

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Test endpoints
curl http://localhost:3000/health

# Create test callback
curl -X POST http://localhost:3000/api/abandon \
  -H "Content-Type: application/json" \
  -d '{"ani":"+13305551234","queue":"Sales","context":"Test callback"}'

# List callbacks
curl http://localhost:3000/api/callbacks
```

### Step 5: Build Widget

```bash
# Build IIFE bundle
npm run build

# Verify output
ls -la dist/
# Should see: callback-widget.js, callback-widget.js.map
```

### Step 6: Verify Build Format

```bash
# Check first line - should NOT contain 'export'
head -c 200 dist/callback-widget.js

# If you see 'export', rollup config is wrong
```

---

## Part 2: GitHub Repository Setup

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `bs-callback-widget`
3. Description: "Abandoned Call Callback Widget for Webex Contact Center"
4. Public repository (required for GitHub Pages free tier)
5. Do NOT initialize with README (we have local files)
6. Click "Create repository"

### Step 2: Push Local Code

```bash
# Add remote (replace with your repo URL)
git remote add origin https://github.com/kadammmmm/bs-callback-widget.git

# Create .gitignore
cat > .gitignore << 'EOF'
node_modules/
.DS_Store
*.log
.env
.env.local
backend/node_modules/
EOF

# Stage all files
git add .

# Initial commit
git commit -m "Initial commit: Callback widget and backend"

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Prepare for GitHub Pages

```bash
# Copy built widget to root for GitHub Pages
cp dist/callback-widget.js index.js

# Commit the deployable file
git add index.js
git commit -m "Add index.js for GitHub Pages deployment"
git push
```

### Step 4: Enable GitHub Pages

1. Go to your repo on GitHub
2. Settings > Pages (left sidebar)
3. Source: "Deploy from a branch"
4. Branch: `main`
5. Folder: `/ (root)`
6. Click Save
7. Wait 1-2 minutes for deployment

### Step 5: Verify GitHub Pages

```bash
# Test the widget URL (replace with your username)
curl -I https://kadammmmm.github.io/bs-callback-widget/index.js

# Should return HTTP 200
```

Widget URL: `https://kadammmmm.github.io/bs-callback-widget/index.js`

---

## Part 3: Backend Deployment (Render)

### Step 1: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub (recommended for easy deploys)
3. Authorize Render to access your repositories

### Step 2: Create Web Service

1. Dashboard > New > Web Service
2. Connect repository: `bs-callback-widget`
3. Configure:
   - Name: `bs-callback-backend`
   - Region: Choose closest to your WxCC region
   - Branch: `main`
   - Root Directory: `backend`
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: Free (or Starter for production)

4. Click "Create Web Service"

### Step 3: Wait for Deployment

Render will:
1. Clone your repo
2. Run `npm install` in the `backend` folder
3. Start the server with `npm start`
4. Provide a URL like: `https://bs-callback-backend.onrender.com`

### Step 4: Test Backend

```bash
# Health check
curl https://bs-callback-backend.onrender.com/health

# Test abandon endpoint
curl -X POST https://bs-callback-backend.onrender.com/api/abandon \
  -H "Content-Type: application/json" \
  -d '{"ani":"+13305551234","queue":"Sales","context":"Test"}'

# Get callbacks
curl https://bs-callback-backend.onrender.com/api/callbacks
```

### Step 5: Note Your Backend URL

Save this URL - you'll need it for:
1. Widget configuration
2. WxCC Flow HTTP Request node

---

## Part 4: Configure Widget with Backend URL

### Step 1: Update Widget Source

Edit `src/callback-widget.js` and update the `backendUrl` default:

```javascript
constructor() {
  // ... other properties
  this.backendUrl = 'https://bs-callback-backend.onrender.com/api';
  // ...
}
```

### Step 2: Rebuild and Redeploy

```bash
# Rebuild
npm run build

# Copy to root
cp dist/callback-widget.js index.js

# Commit and push
git add .
git commit -m "Update backend URL"
git push
```

GitHub Pages will automatically redeploy (takes 1-2 minutes).

---

## Part 5: WxCC Desktop Layout Configuration

### Step 1: Export Current Layout

1. Log into WxCC Admin Portal
2. Provisioning > Desktop Layouts
3. Find your layout or create a new one
4. Export as JSON

### Step 2: Add Widget to advancedHeader

Edit the JSON and add the widget to `advancedHeader`:

```json
{
  "page": {
    "advancedHeader": [
      {
        "comp": "bs-callback-widget",
        "script": "https://kadammmmm.github.io/bs-callback-widget/index.js",
        "properties": {
          "backendUrl": "https://bs-callback-backend.onrender.com/api"
        }
      }
    ],
    "area": {
      "header": { ... },
      "panel": { ... },
      "navigation": { ... }
    }
  }
}
```

**Alternative: Panel Placement**

For a larger widget, add to a panel instead:

```json
{
  "page": {
    "area": {
      "panel": {
        "comp": "md-tabs",
        "children": [
          {
            "comp": "md-tab",
            "attributes": {
              "slot": "tab"
            },
            "children": [
              {
                "comp": "span",
                "textContent": "Callbacks"
              }
            ]
          },
          {
            "comp": "md-tab-panel",
            "attributes": {
              "slot": "panel"
            },
            "children": [
              {
                "comp": "bs-callback-widget",
                "script": "https://kadammmmm.github.io/bs-callback-widget/index.js",
                "properties": {
                  "backendUrl": "https://bs-callback-backend.onrender.com/api"
                }
              }
            ]
          }
        ]
      }
    }
  }
}
```

### Step 3: Import Updated Layout

1. Admin Portal > Desktop Layouts
2. Import the modified JSON
3. Assign to appropriate teams

### Step 4: Test in Agent Desktop

1. Log into Agent Desktop
2. Look for "Callbacks" badge in header
3. Click to expand dropdown
4. Verify it connects to backend (no errors)

---

## Part 6: WxCC Flow Configuration

### Step 1: Create Abandon Detection Flow

Add an HTTP Request node that fires when a customer disconnects before reaching an agent.

**HTTP Request Node Settings:**

- Method: POST
- URL: `https://bs-callback-backend.onrender.com/api/abandon`
- Content-Type: application/json
- Body:
```json
{
  "ani": "{{NewPhoneContact.ANI}}",
  "queue": "{{Queue.Name}}",
  "abandonedAt": "{{Global_CurrentDateTime}}",
  "entryPointId": "{{EntryPoint.Id}}",
  "context": "{{CollectedData}}",
  "sessionId": "{{Global_SessionId}}"
}
```

See `docs/FLOW-CONFIGURATION.md` for complete flow setup details.

---

## Part 7: Production Considerations

### Database for Persistence

The demo backend uses in-memory storage. For production, add a database:

**Option A: MongoDB Atlas (Free Tier)**
```bash
npm install mongodb
```

**Option B: PostgreSQL (Render Database)**
```bash
npm install pg
```

**Option C: Redis (Render Redis)**
```bash
npm install redis
```

### Environment Variables

Set these in Render dashboard:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=<your-database-url>
API_KEY=<secret-key-for-flow-auth>
```

### CORS Restrictions

Update backend CORS for production:

```javascript
app.use(cors({
  origin: [
    'https://desktop.wxcc-us1.cisco.com',
    'https://desktop.wxcc-eu1.cisco.com',
    // Add your specific WxCC domains
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'X-Agent-Id', 'Authorization']
}));
```

### API Authentication

Add API key validation for the Flow endpoint:

```javascript
app.post('/api/abandon', (req, res) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // ... rest of handler
});
```

---

## Troubleshooting

### Widget Not Loading

```javascript
// Check in browser console on Agent Desktop

// 1. Script loading?
fetch('https://kadammmmm.github.io/bs-callback-widget/index.js')
  .then(r => console.log('Script exists:', r.ok))

// 2. Element registered?
console.log('Element defined:', !!customElements.get('bs-callback-widget'))

// 3. Syntax errors?
fetch('https://kadammmmm.github.io/bs-callback-widget/index.js')
  .then(r => r.text())
  .then(code => {
    try { new Function(code); console.log('No syntax errors'); }
    catch(e) { console.log('Syntax error:', e.message); }
  })
```

### "Unexpected token 'export'" Error

Your rollup config is using ES module format. Ensure:
```javascript
output: {
  format: 'iife',  // NOT 'es' or 'esm'
}
```

Rebuild and redeploy.

### Backend Not Responding

1. Check Render logs in dashboard
2. Verify service is running (not suspended on free tier)
3. Test health endpoint: `curl https://your-backend.onrender.com/health`

### CORS Errors

Check browser console for CORS messages. Update backend CORS config to include your WxCC domain.

### Callbacks Not Appearing

1. Test backend directly with curl
2. Check WxCC Flow logs for HTTP Request errors
3. Verify the ANI/queue data is being passed correctly

---

## Quick Reference

| Component | URL |
|-----------|-----|
| Widget Script | `https://kadammmmm.github.io/bs-callback-widget/index.js` |
| Backend API | `https://bs-callback-backend.onrender.com/api` |
| Health Check | `https://bs-callback-backend.onrender.com/health` |
| GitHub Repo | `https://github.com/kadammmmm/bs-callback-widget` |

## Build & Deploy Commands

```bash
# Local development
npm run build              # Build widget
npm run deploy             # Build + copy to index.js
cd backend && npm run dev  # Run backend locally

# Git deployment
git add .
git commit -m "Update"
git push                   # Triggers GitHub Pages + Render deploy
```

## Support

For issues:
1. Check Render logs for backend errors
2. Check browser console for widget errors
3. Test endpoints with curl
4. Review WxCC Flow execution logs
