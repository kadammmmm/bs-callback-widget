/**
 * Backend Service for Abandoned Call Callback Widget
 * 
 * Provides REST API for:
 * - Storing abandoned call records (from WxCC Flow HTTP Request)
 * - Retrieving callback list for agents
 * - Claim/release/dial status management
 * - Serving the widget JS file (no GitHub Pages needed)
 * 
 * Deploy to: Render, Railway, Fly.io, or any Node.js host
 * 
 * Environment Variables:
 * - PORT: Server port (default: 3000)
 * - CALLBACK_TTL_HOURS: Hours before callbacks expire (default: 48)
 */

import express from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configurable TTL for callbacks (in hours) - default 48 hours
const CALLBACK_TTL_HOURS = parseInt(process.env.CALLBACK_TTL_HOURS) || 48;
const CALLBACK_TTL_MS = CALLBACK_TTL_HOURS * 60 * 60 * 1000;

// Optional API keys — set env vars to enable auth; leave unset to allow open access
const ABANDON_API_KEY = process.env.ABANDON_API_KEY || null;
const ADMIN_API_KEY   = process.env.ADMIN_API_KEY   || null;

function requireAbandonKey(req, res, next) {
  if (!ABANDON_API_KEY) return next();
  if (req.headers['x-api-key'] !== ABANDON_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

function requireAdminKey(req, res, next) {
  if (!ADMIN_API_KEY) return next();
  if (req.headers['x-api-key'] !== ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// In-memory store (replace with database for production)
// For production, use MongoDB, PostgreSQL, or Redis
let callbacks = [];

// Middleware
app.use(cors({
  origin: '*',  // Restrict in production to your WxCC domains
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'X-Agent-Id', 'Authorization']
}));

app.use(express.json());

// Serve the widget JS file from /widget endpoint
// This eliminates the need for GitHub Pages
app.use('/widget', express.static(join(__dirname, '../dist')));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(), 
    callbackCount: callbacks.length,
    callbackTTLHours: CALLBACK_TTL_HOURS
  });
});

// Debug endpoint - see all callbacks (admin only)
app.get('/api/debug', requireAdminKey, (req, res) => {
  res.json({ 
    callbackCount: callbacks.length,
    callbacks: callbacks,
    timestamp: new Date().toISOString()
  });
});

// ============================================
// FLOW ENDPOINT: Receive abandoned call data
// ============================================
// Called by WxCC Flow via HTTP Request node when Abandoned=true

app.post('/api/abandon', requireAbandonKey, (req, res) => {
  
  try {
    const {
      ani,
      queue,
      abandonedAt,
      entryPointId,
      context,
      ivrData,
      sessionId,
      dnis,
      // Additional built-in fields
      callId,
      callerName,
      queueId,
      companyName,
      vertical,
      // Generic custom fields object - any key-value pairs
      customFields,
      // Also support flat custom_* fields for simpler Flow configuration
      ...otherFields
    } = req.body;

    if (!ani) {
      return res.status(400).json({ error: 'ANI is required' });
    }

    // Check for duplicate (same ANI within last 5 minutes)
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    const duplicate = callbacks.find(c => 
      c.ani === ani && 
      new Date(c.abandonedAt).getTime() > fiveMinutesAgo &&
      c.status !== 'completed'
    );

    if (duplicate) {
      return res.json({
        message: 'Duplicate detected', 
        id: duplicate.id 
      });
    }

    // Build customFields from explicit object or from custom_* prefixed fields
    let finalCustomFields = {};
    
    // Add explicit customFields object if provided
    if (customFields && typeof customFields === 'object') {
      finalCustomFields = { ...customFields };
    }
    
    // Also extract any custom_* prefixed fields and convert to readable labels
    // e.g., custom_accountNumber becomes "Account Number"
    Object.keys(otherFields).forEach(key => {
      if (key.startsWith('custom_') && otherFields[key]) {
        // Convert custom_accountNumber to "Account Number"
        const label = key
          .replace('custom_', '')
          .replace(/([A-Z])/g, ' $1')
          .replace(/_/g, ' ')
          .trim()
          .replace(/^\w/, c => c.toUpperCase());
        finalCustomFields[label] = otherFields[key];
      }
    });

    const callback = {
      id: randomUUID(),
      ani,
      queue: queue || 'Unknown',
      abandonedAt: abandonedAt || new Date().toISOString(),
      entryPointId: entryPointId || null,
      context: context || ivrData || null,
      sessionId: sessionId || null,
      dnis: dnis || null,
      callId: callId || null,
      callerName: callerName || null,
      queueId: queueId || null,
      companyName: companyName || null,
      vertical: vertical || null,
      customFields: Object.keys(finalCustomFields).length > 0 ? finalCustomFields : null,
      status: 'pending',
      claimedBy: null,
      claimedAt: null,
      dialedAt: null,
      completedAt: null,
      createdAt: new Date().toISOString()
    };

    callbacks.push(callback);
    console.log(`Abandon recorded: ${ani} queue=${queue}`);

    res.status(201).json({
      message: 'Callback created', 
      id: callback.id 
    });

  } catch (err) {
    console.error('Error creating callback:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// WIDGET ENDPOINTS: Agent interactions
// ============================================

// Get all callbacks (for agent widget)
app.get('/api/callbacks', (req, res) => {
  const agentId = req.headers['x-agent-id'];
  
  // Filter out expired callbacks (older than TTL)
  const ttlCutoff = Date.now() - CALLBACK_TTL_MS;
  const activeCallbacks = callbacks.filter(c => {
    // Remove if older than TTL
    if (new Date(c.createdAt).getTime() < ttlCutoff) {
      return false;
    }
    // Don't show completed to agents
    if (c.status === 'completed') {
      return false;
    }
    return true;
  });

  // Sort oldest-first so highest-urgency callbacks appear at top
  activeCallbacks.sort((a, b) =>
    new Date(a.abandonedAt).getTime() - new Date(b.abandonedAt).getTime()
  );

  res.json({ 
    callbacks: activeCallbacks,
    agentId,
    count: activeCallbacks.length
  });
});

// Claim a callback
app.post('/api/callbacks/:id/claim', (req, res) => {
  const { id } = req.params;
  const { agentId, claimedAt } = req.body;

  if (!agentId) {
    return res.status(400).json({ error: 'agentId is required' });
  }

  const callback = callbacks.find(c => c.id === id);
  
  if (!callback) {
    return res.status(404).json({ error: 'Callback not found' });
  }

  if (callback.claimedBy && callback.claimedBy !== agentId) {
    return res.status(409).json({ 
      error: 'Already claimed by another agent',
      claimedBy: callback.claimedBy
    });
  }

  callback.claimedBy = agentId;
  callback.claimedAt = claimedAt || new Date().toISOString();
  callback.status = 'claimed';

  res.json({ message: 'Callback claimed', callback });
});

// Release a callback
app.post('/api/callbacks/:id/release', (req, res) => {
  const { id } = req.params;
  const { agentId } = req.body;

  const callback = callbacks.find(c => c.id === id);
  
  if (!callback) {
    return res.status(404).json({ error: 'Callback not found' });
  }

  if (callback.claimedBy !== agentId) {
    return res.status(403).json({ error: 'Not claimed by this agent' });
  }

  callback.claimedBy = null;
  callback.claimedAt = null;
  callback.status = 'pending';

  res.json({ message: 'Callback released', callback });
});

// Mark as dialed
app.post('/api/callbacks/:id/dial', (req, res) => {
  const { id } = req.params;
  const { agentId, dialedAt } = req.body;

  const callback = callbacks.find(c => c.id === id);
  if (!callback) return res.status(404).json({ error: 'Callback not found' });

  callback.dialedAt = dialedAt || new Date().toISOString();
  callback.status = 'dialed';
  res.json({ message: 'Callback marked as dialed', callback });
});

// Complete a callback — removes it from the store immediately
app.post('/api/callbacks/:id/complete', (req, res) => {
  const { id } = req.params;
  const index = callbacks.findIndex(c => c.id === id);
  if (index === -1) return res.status(404).json({ error: 'Callback not found' });

  callbacks.splice(index, 1);
  res.json({ message: 'Callback completed' });
});

// Delete a callback (admin)
app.delete('/api/callbacks/:id', requireAdminKey, (req, res) => {
  const { id } = req.params;
  const index = callbacks.findIndex(c => c.id === id);
  if (index === -1) return res.status(404).json({ error: 'Callback not found' });

  callbacks.splice(index, 1);
  res.json({ message: 'Callback deleted' });
});

// Admin: Get stats
app.get('/api/stats', (req, res) => {
  const completed = callbacks.filter(c => c.status === 'completed');
  
  const stats = {
    total: callbacks.length,
    pending: callbacks.filter(c => c.status === 'pending').length,
    claimed: callbacks.filter(c => c.status === 'claimed').length,
    dialed: callbacks.filter(c => c.status === 'dialed').length,
    completed: completed.length,
    outcomes: {
      connected: completed.filter(c => c.outcome === 'connected').length,
      voicemail: completed.filter(c => c.outcome === 'voicemail').length,
      noAnswer: completed.filter(c => c.outcome === 'no-answer').length,
      wrongNumber: completed.filter(c => c.outcome === 'wrong-number').length
    }
  };
  
  res.json(stats);
});

// Admin: Clear all
app.delete('/api/callbacks', requireAdminKey, (req, res) => {
  const count = callbacks.length;
  callbacks = [];
  res.json({ message: `Cleared ${count} callbacks` });
});

// Cleanup expired callbacks periodically (every hour)
setInterval(() => {
  const ttlCutoff = Date.now() - CALLBACK_TTL_MS;
  const before = callbacks.length;
  
  callbacks = callbacks.filter(c => 
    new Date(c.createdAt).getTime() > ttlCutoff
  );
  
  const removed = before - callbacks.length;
  if (removed > 0) {
    console.log(`Cleanup: removed ${removed} expired callbacks (older than ${CALLBACK_TTL_HOURS} hours)`);
  }
}, 60 * 60 * 1000); // Run every hour

// Start server
app.listen(PORT, () => {
  console.log(`Callback backend running on port ${PORT}`);
  console.log(`Callback TTL: ${CALLBACK_TTL_HOURS} hours`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
