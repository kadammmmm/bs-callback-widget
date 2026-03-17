# Complete Setup Guide: Abandoned Call Callback Widget

This guide walks you through every step from downloading the code to seeing the widget live in WxCC Agent Desktop.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Download and Open in VS Code](#2-download-and-open-in-vs-code)
3. [Understand the Project Structure](#3-understand-the-project-structure)
4. [Local Testing (Optional)](#4-local-testing-optional)
5. [Create GitHub Repository](#5-create-github-repository)
6. [Push Code to GitHub](#6-push-code-to-github)
7. [Enable GitHub Pages (Widget Hosting)](#7-enable-github-pages-widget-hosting)
8. [Deploy Backend to Render](#8-deploy-backend-to-render)
9. [Configure WxCC Flow for Abandon Detection](#9-configure-wxcc-flow-for-abandon-detection)
10. [Update WxCC Desktop Layout](#10-update-wxcc-desktop-layout)
11. [Test the Complete Solution](#11-test-the-complete-solution)
12. [Troubleshooting](#12-troubleshooting)

---

## Quick Reference - Your URLs

| Component | URL |
|-----------|-----|
| Widget Script | `https://kadammmmm.github.io/bs-callback-widget/index.js` |
| Backend API | `https://abandoncallbacks.bswxcc.com/api` |
| Backend Health | `https://abandoncallbacks.bswxcc.com/health` |
| GitHub Repo | `https://github.com/kadammmmm/bs-callback-widget` |

---

## 1. Prerequisites

Before starting, ensure you have these installed:

### Required Software

| Software | Download Link | Verify Installation |
|----------|---------------|---------------------|
| VS Code | https://code.visualstudio.com/ | Open VS Code |
| Node.js 18+ | https://nodejs.org/ (LTS version) | `node --version` |
| Git | https://git-scm.com/ | `git --version` |

### Required Accounts

| Account | Sign Up Link | Notes |
|---------|--------------|-------|
| GitHub | https://github.com/join | Free account works |
| Render | https://render.com/ | Sign up with GitHub recommended |
| WxCC Admin | Your org's Control Hub | Need admin or layout edit access |

### VS Code Extensions (Recommended)

Open VS Code, go to Extensions (Ctrl+Shift+X), and install:
- **ESLint** - JavaScript linting
- **Prettier** - Code formatting
- **GitLens** - Git integration

---

## 2. Download and Open in VS Code

### Step 2.1: Download the Project

1. Download the `bs-callback-widget.zip` file from Claude
2. Create a folder for your projects (if you don't have one):
   - Windows: `C:\Users\YourName\Projects\`
   - Mac: `~/Projects/`

3. Extract the zip file to your projects folder
   - Right-click the zip > "Extract All" (Windows)
   - Double-click the zip (Mac)

4. You should now have:
   ```
   Projects/
     wxcc-callback-widget/
       src/
       backend/
       docs/
       package.json
       ...
   ```

### Step 2.2: Open in VS Code

**Option A: From VS Code**
1. Open VS Code
2. File > Open Folder
3. Navigate to `wxcc-callback-widget` folder
4. Click "Select Folder"

**Option B: From Terminal/Command Line**
```bash
cd C:\Users\YourName\Projects\wxcc-callback-widget
code .
```

### Step 2.3: Open the Integrated Terminal

1. In VS Code, go to View > Terminal (or press Ctrl+`)
2. You should see a terminal at the bottom of VS Code
3. Verify you're in the right folder:
   ```bash
   pwd
   # Should show: .../wxcc-callback-widget
   ```

---

## 3. Understand the Project Structure

```
wxcc-callback-widget/
├── src/
│   └── callback-widget.js    # The main widget code (LitElement)
├── backend/
│   ├── server.js             # Express.js API server
│   └── package.json          # Backend dependencies
├── docs/
│   ├── COMPLETE-SETUP-GUIDE.md   # This file
│   ├── DEPLOYMENT.md             # Deployment reference
│   ├── FLOW-CONFIGURATION.md     # WxCC Flow setup
│   ├── navigation-layout.json    # Desktop Layout JSON
│   └── desktop-layout-sample.json
├── package.json              # Widget dependencies
├── rollup.config.js          # Build configuration (IIFE format)
├── .gitignore                # Files to exclude from Git
└── README.md                 # Project overview
```

---

## 4. Local Testing (Optional)

You can test the backend locally before deploying.

### Step 4.1: Install Dependencies

In VS Code terminal:

```bash
# Install widget dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Step 4.2: Start the Backend Locally

```bash
cd backend
npm run dev
```

You should see:
```
Callback backend running on port 3000
Health check: http://localhost:3000/health
```

### Step 4.3: Test the API

Open a NEW terminal tab (click the + icon in terminal) and run:

```bash
# Health check
curl http://localhost:3000/health

# Create a test callback
curl -X POST http://localhost:3000/api/abandon \
  -H "Content-Type: application/json" \
  -d "{\"ani\":\"+13305551234\",\"queue\":\"Sales\",\"context\":\"Test callback\"}"

# List callbacks
curl http://localhost:3000/api/callbacks
```

**On Windows without curl**, use PowerShell:
```powershell
# Health check
Invoke-RestMethod -Uri http://localhost:3000/health

# Create test callback
Invoke-RestMethod -Uri http://localhost:3000/api/abandon -Method POST -ContentType "application/json" -Body '{"ani":"+13305551234","queue":"Sales","context":"Test"}'

# List callbacks
Invoke-RestMethod -Uri http://localhost:3000/api/callbacks
```

### Step 4.4: Build the Widget

Stop the backend (Ctrl+C) and go back to the root folder:

```bash
cd ..
npm run build
```

You should see output like:
```
src/callback-widget.js -> dist/callback-widget.js...
created dist/callback-widget.js in 1.2s
```

Check the `dist/` folder now exists with `callback-widget.js` inside.

---

## 5. Create GitHub Repository

### Step 5.1: Create Repository on GitHub

1. Go to https://github.com/new
2. Fill in:
   - **Repository name**: `bs-callback-widget`
   - **Description**: `Abandoned Call Callback Widget for Webex Contact Center`
   - **Visibility**: Public (required for free GitHub Pages)
   - **DO NOT** check "Add a README file" (we already have files)
   - **DO NOT** add .gitignore (we already have one)

3. Click **"Create repository"**

4. You'll see a page with setup instructions. Keep this page open.

Your repo URL will be: `https://github.com/kadammmmm/bs-callback-widget.git`

---

## 6. Push Code to GitHub

### Step 6.1: Initialize Git Repository

In VS Code terminal (make sure you're in the `wxcc-callback-widget` folder):

```bash
# Initialize Git
git init

# Verify .gitignore exists
cat .gitignore
```

### Step 6.2: Configure Git (First Time Only)

If you haven't used Git on this computer before:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 6.3: Add Remote Repository

```bash
# Add GitHub as remote
git remote add origin https://github.com/kadammmmm/bs-callback-widget.git

# Verify remote was added
git remote -v
```

### Step 6.4: Build and Prepare for Deployment

```bash
# Build the widget
npm run build

# Copy built file to root for GitHub Pages
cp dist/callback-widget.js index.js

# Verify index.js exists
ls -la index.js
```

### Step 6.5: Commit and Push

```bash
# Stage all files
git add .

# Check what will be committed
git status

# Commit
git commit -m "Initial commit: Callback widget and backend"

# Push to GitHub
git branch -M main
git push -u origin main
```

**If prompted for credentials:**
- GitHub now requires a Personal Access Token instead of password
- Go to: GitHub > Settings > Developer Settings > Personal Access Tokens > Tokens (classic)
- Generate new token with `repo` scope
- Use this token as your password

### Step 6.6: Verify on GitHub

1. Go to `https://github.com/kadammmmm/bs-callback-widget`
2. You should see all your files
3. Verify `index.js` is in the root

---

## 7. Enable GitHub Pages (Widget Hosting)

### Step 7.1: Configure GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (tab at the top)
3. Scroll down to **Pages** (left sidebar)
4. Under "Source", select:
   - **Branch**: `main`
   - **Folder**: `/ (root)`
5. Click **Save**

### Step 7.2: Wait for Deployment

1. GitHub will show "Your site is being built"
2. Wait 1-2 minutes
3. Refresh the page
4. You should see: "Your site is live at https://kadammmmm.github.io/bs-callback-widget/"

### Step 7.3: Verify Widget is Accessible

Test the widget URL:

```bash
curl -I https://kadammmmm.github.io/bs-callback-widget/index.js
```

Or open in browser: `https://kadammmmm.github.io/bs-callback-widget/index.js`

You should see minified JavaScript code.

**Your widget URL is:**
```
https://kadammmmm.github.io/bs-callback-widget/index.js
```

---

## 8. Deploy Backend to Render

### Step 8.1: Sign Up/Log In to Render

1. Go to https://render.com/
2. Click "Get Started for Free"
3. **Sign up with GitHub** (recommended)
4. Authorize Render to access your GitHub

### Step 8.2: Create a New Web Service

1. From Render Dashboard, click **"New +"** button
2. Select **"Web Service"**

### Step 8.3: Connect Your Repository

1. Find `bs-callback-widget` and click **"Connect"**
2. If you don't see it, click "Configure account" to grant access

### Step 8.4: Configure the Service

Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | `bs-callback-widget` |
| **Region** | Choose closest to your WxCC region |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

### Step 8.5: Select Instance Type

1. Scroll down to "Instance Type"
2. Select **"Free"** for testing (or "Starter" $7/mo for production)
3. Note: Free tier sleeps after 15 minutes of inactivity

### Step 8.6: Deploy

1. Click **"Create Web Service"**
2. Wait 2-3 minutes for deployment
3. Once deployed, you'll see status: "Live"

**Your backend URL is:**
```
https://abandoncallbacks.bswxcc.com
```

### Step 8.7: Test the Backend

```bash
# Health check
curl https://abandoncallbacks.bswxcc.com/health

# Create test callback
curl -X POST https://abandoncallbacks.bswxcc.com/api/abandon \
  -H "Content-Type: application/json" \
  -d '{"ani":"+13305551234","queue":"Sales","context":"Test from curl"}'

# List callbacks
curl https://abandoncallbacks.bswxcc.com/api/callbacks
```

---

## 9. Configure WxCC Flow for Abandon Detection

This step configures your WxCC Flow to detect abandoned calls and send them to the backend.

### Step 9.1: Open Flow Designer

1. Log into Webex Control Hub
2. Go to Contact Center > Flows
3. Open the flow you want to add abandon detection to

### Step 9.2: Add Flow Variables

Create these variables in your flow:

| Variable Name | Type | Default Value |
|---------------|------|---------------|
| `Abandoned` | Boolean | `false` |
| `CollectedData` | String | `""` |

### Step 9.3: Add HTTP Request Node

Add an **HTTP Request** node that fires when the call disconnects before reaching an agent.

**Request Tab:**

| Setting | Value |
|---------|-------|
| Request URL | `https://abandoncallbacks.bswxcc.com/api/abandon` |
| Method | `POST` |
| Content Type | `Application/JSON` |

**Request Body:**
```json
{
  "ani": "{{NewPhoneContact.ANI}}",
  "queue": "{{Queue.Name | default: 'Unknown'}}",
  "abandonedAt": "{{now() | date: '%Y-%m-%dT%H:%M:%SZ'}}",
  "entryPointId": "{{EntryPoint.Id | default: ''}}",
  "context": "{{CollectedData | default: ''}}",
  "sessionId": "{{Global_SessionId | default: ''}}"
}
```

### Step 9.4: Flow Pattern

```
Entry Point
    |
IVR Menu (collect data, update CollectedData variable)
    |
Queue Contact
    |
    +-- On Agent Connect --> Normal call
    |
    +-- On Disconnect (before agent) --> HTTP Request to /api/abandon
```

### Step 9.5: Publish the Flow

1. Validate the flow (check for errors)
2. Publish to your environment

---

## 10. Update WxCC Desktop Layout

### Step 10.1: Export Current Layout

1. Log into Webex Control Hub
2. Go to Contact Center > Desktop Layouts
3. Find your current layout (or create a new one)
4. Click the layout name to open it
5. Click **Export** to download the JSON file

### Step 10.2: Edit the Layout JSON

Open the downloaded JSON file in VS Code.

Find the `navigation` array in your layout. Add this object to the array:

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
        "script": "https://kadammmmm.github.io/bs-callback-widget/index.js",
        "attributes": {
          "darkmode": "$STORE.app.darkMode"
        },
        "properties": {
          "backendUrl": "https://abandoncallbacks.bswxcc.com/api",
          "accessToken": "$STORE.auth.accessToken"
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

### Step 10.3: Layout Visual

```
+------------------------------------------------------------------+
| [Nav]  +---------------------+-----------------------------------+
|        |                     |                                   |
| Home   |  Callback Widget    |   Interaction Control             |
|        |  (35%)              |   (65%)                           |
| ------ |                     |                                   |
|        |  +---------------+  |                                   |
|  []    |  | (330) 555-1234|  |                                   |
|Callbacks| | Sales - 5m ago|  |                                   |
|        |  | [Claim]       |  |                                   |
|        |  +---------------+  |                                   |
|        |                     |                                   |
+--------+---------------------+-----------------------------------+
```

### Step 10.4: Alternative - Full Width Layout

If you want the callback widget to take the full page:

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
        "script": "https://kadammmmm.github.io/bs-callback-widget/index.js",
        "attributes": {
          "darkmode": "$STORE.app.darkMode"
        },
        "properties": {
          "backendUrl": "https://abandoncallbacks.bswxcc.com/api",
          "accessToken": "$STORE.auth.accessToken"
        }
      }
    },
    "layout": {
      "areas": [["callback-area"]],
      "size": {
        "cols": [1],
        "rows": [1]
      }
    }
  }
}
```

### Step 10.5: Validate the JSON

1. In VS Code, the JSON should have no red underlines
2. Or use https://jsonlint.com/ to validate

### Step 10.6: Import the Updated Layout

1. Go back to Control Hub > Desktop Layouts
2. Click **Import**
3. Select your modified JSON file
4. Give it a name (e.g., "Layout with Callbacks")
5. Click **Import**

### Step 10.7: Assign Layout to Team

1. Go to Contact Center > Teams
2. Select the team that should see the callback widget
3. Edit the team settings
4. Under "Desktop Layout", select your new layout
5. Save

---

## 11. Test the Complete Solution

### Step 11.1: Create Test Callbacks

```bash
# Create a few test callbacks
curl -X POST https://abandoncallbacks.bswxcc.com/api/abandon \
  -H "Content-Type: application/json" \
  -d '{"ani":"+13305551111","queue":"Sales","context":"Interested in pricing"}'

curl -X POST https://abandoncallbacks.bswxcc.com/api/abandon \
  -H "Content-Type: application/json" \
  -d '{"ani":"+13305552222","queue":"Support","context":"Password reset issue"}'

curl -X POST https://abandoncallbacks.bswxcc.com/api/abandon \
  -H "Content-Type: application/json" \
  -d '{"ani":"+13305553333","queue":"Billing","context":"Invoice question"}'
```

### Step 11.2: Log Into Agent Desktop

1. Go to your WxCC Agent Desktop URL
2. Log in as an agent assigned to the team with the new layout
3. Click the **"Callbacks"** icon in the left navigation

### Step 11.3: Verify Widget Loads

You should see:
- Header with "Abandoned Callbacks" title
- Stats bar showing Pending/Claimed/Dialed counts
- List of callback cards with the test data

### Step 11.4: Test the Workflow

1. **Claim** a callback (click the Claim button)
2. **Dial** the callback (click the Dial button)
   - Note: Outdial may fail if not configured - that's OK
3. **Complete** with an outcome (Connected, Voicemail, etc.)
4. Verify the callback disappears from the list

### Step 11.5: Check Browser Console for Errors

1. Right-click in Agent Desktop > Inspect
2. Go to Console tab
3. Look for any red errors

---

## 12. Troubleshooting

### Widget Not Loading

**Symptom:** Callbacks page shows blank or error

**Check 1: Script Loading**
```javascript
fetch('https://kadammmmm.github.io/bs-callback-widget/index.js')
  .then(r => r.ok ? console.log('Script loads') : console.log('Not found'))
```

**Check 2: Custom Element Registered**
```javascript
console.log('Element defined:', !!customElements.get('bs-callback-widget'))
```

**Check 3: Syntax Errors**
```javascript
fetch('https://kadammmmm.github.io/bs-callback-widget/index.js')
  .then(r => r.text())
  .then(code => {
    try { new Function(code); console.log('No syntax errors'); }
    catch(e) { console.log('Syntax error:', e.message); }
  })
```

### Backend Not Responding

**Symptom:** Widget shows "Unable to load callbacks"

**Check 1: Backend Health**
```bash
curl https://abandoncallbacks.bswxcc.com/health
```

**Check 2: Render Dashboard**
- Go to Render.com > Your service
- Check if status is "Live"
- Check the Logs tab for errors

**Check 3: Free Tier Sleeping**
Render free tier sleeps after 15 minutes. First request after sleep takes 30-60 seconds.

### CORS Errors

**Symptom:** Console shows "Access-Control-Allow-Origin" errors

**Fix:** Update `backend/server.js` CORS configuration:
```javascript
app.use(cors({
  origin: [
    'https://desktop.wxcc-us1.cisco.com',
    'https://desktop.wxcc-eu1.cisco.com',
    'https://desktop.wxcc-anz1.cisco.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'X-Agent-Id']
}));
```

Then commit and push - Render will auto-redeploy.

### Desktop Layout Not Updating

**Symptom:** Old layout still shows after import

**Fix:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh Agent Desktop (Ctrl+Shift+R)
3. Log out and log back in
4. Verify team is assigned to correct layout

---

## Common Commands

```bash
# Build widget
npm run build

# Deploy widget (build + copy + push)
npm run build && cp dist/callback-widget.js index.js && git add . && git commit -m "Update" && git push

# Run backend locally
cd backend && npm run dev

# Test backend health
curl https://abandoncallbacks.bswxcc.com/health

# Create test callback
curl -X POST https://abandoncallbacks.bswxcc.com/api/abandon \
  -H "Content-Type: application/json" \
  -d '{"ani":"+13305551234","queue":"Sales","context":"Test"}'
```

---

## Next Steps

Once everything is working:

1. **Production Database**: Replace in-memory storage with MongoDB or PostgreSQL
2. **Authentication**: Add API key validation for Flow requests
3. **Monitoring**: Set up logging and alerting
4. **Custom Branding**: Update colors/styling to match your brand
