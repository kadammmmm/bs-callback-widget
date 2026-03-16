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

// Request logging - detailed for debugging
app.use((req, res, next) => {
  console.log('='.repeat(50));
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  console.log('='.repeat(50));
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), callbackCount: callbacks.length });
});

// Debug endpoint - see all callbacks
app.get('/api/debug', (req, res) => {
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

app.post('/api/abandon', (req, res) => {
  console.log('>>> ABANDON ENDPOINT HIT <<<');
  console.log('Raw body:', req.body);
  
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
      // Additional fields from your flow
      callId,
      callerName,
      queueId,
      companyName,
      vertical
    } = req.body;

    console.log('Parsed ANI:', ani);
    console.log('Parsed Queue:', queue);

    if (!ani) {
      console.log('ERROR: ANI is missing!');
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
      console.log(`Duplicate abandon detected for ${ani}, skipping`);
      return res.json({ 
        message: 'Duplicate detected', 
        id: duplicate.id 
      });
    }

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
      status: 'pending',
      claimedBy: null,
      claimedAt: null,
      dialedAt: null,
      completedAt: null,
      createdAt: new Date().toISOString()
    };

    callbacks.push(callback);
    console.log(`New abandoned call recorded: ${ani} from queue ${queue}`);
    console.log('Callback object:', JSON.stringify(callback, null, 2));

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
  
  // Filter out completed callbacks older than 24 hours
  const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
  const activeCallbacks = callbacks.filter(c => {
    if (c.status === 'completed' && new Date(c.completedAt).getTime() < oneDayAgo) {
      return false;
    }
    // Don't show completed to agents
    if (c.status === 'completed') {
      return false;
    }
    return true;
  });

  // Sort by abandonedAt descending (newest first)
  activeCallbacks.sort((a, b) => 
    new Date(b.abandonedAt).getTime() - new Date(a.abandonedAt).getTime()
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

  console.log(`Callback ${id} claimed by agent ${agentId}`);

  res.json({ 
    message: 'Callback claimed', 
    callback 
  });
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

  console.log(`Callback ${id} released by agent ${agentId}`);

  res.json({ 
    message: 'Callback released', 
    callback 
  });
});

// Mark as dialed
app.post('/api/callbacks/:id/dial', (req, res) => {
  const { id } = req.params;
  const { agentId, dialedAt } = req.body;

  const callback = callbacks.find(c => c.id === id);
  
  if (!callback) {
    return res.status(404).json({ error: 'Callback not found' });
  }

  callback.dialedAt = dialedAt || new Date().toISOString();
  callback.status = 'dialed';

  console.log(`Callback ${id} dialed by agent ${agentId}`);

  res.json({ 
    message: 'Callback marked as dialed', 
    callback 
  });
});

// Mark as completed (optional, for when call ends)
app.post('/api/callbacks/:id/complete', (req, res) => {
  const { id } = req.params;
  const { agentId, outcome, notes } = req.body;

  const callback = callbacks.find(c => c.id === id);
  
  if (!callback) {
    return res.status(404).json({ error: 'Callback not found' });
  }

  callback.completedAt = new Date().toISOString();
  callback.status = 'completed';
  callback.outcome = outcome || 'completed';
  callback.notes = notes || null;

  console.log(`Callback ${id} completed by agent ${agentId}`);

  res.json({ 
    message: 'Callback completed', 
    callback 
  });
});

// Delete a callback (admin only in production)
app.delete('/api/callbacks/:id', (req, res) => {
  const { id } = req.params;
  const index = callbacks.findIndex(c => c.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Callback not found' });
  }

  callbacks.splice(index, 1);
  console.log(`Callback ${id} deleted`);

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

// Admin: Clear all (for testing)
app.delete('/api/callbacks', (req, res) => {
  const count = callbacks.length;
  callbacks = [];
  console.log(`Cleared ${count} callbacks`);
  res.json({ message: `Cleared ${count} callbacks` });
});

// Cleanup old callbacks periodically (every hour)
setInterval(() => {
  const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const before = callbacks.length;
  
  callbacks = callbacks.filter(c => 
    new Date(c.createdAt).getTime() > oneWeekAgo
  );
  
  const removed = before - callbacks.length;
  if (removed > 0) {
    console.log(`Cleanup: removed ${removed} old callbacks`);
  }
}, 60 * 60 * 1000);

// Start server
app.listen(PORT, () => {
  console.log(`Callback backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
