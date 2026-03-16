import { LitElement, html, css } from 'lit';
import { Desktop } from '@wxcc-desktop/sdk';

/**
 * Abandoned Call Callback Widget for Webex Contact Center
 * 
 * Nav Panel version - full-width layout with expanded callback cards.
 * Surfaces abandoned calls for agent follow-up with claim/release/dial/complete workflow.
 */
class CallbackWidget extends LitElement {
  static properties = {
    callbacks: { type: Array },
    loading: { type: Boolean },
    error: { type: String },
    agentId: { type: String },
    agentState: { type: String },
    claimingId: { type: String },
    dialingId: { type: String },
    backendUrl: { type: String, attribute: 'backend-url' },
    outdialEp: { type: String, attribute: 'outdial-ep' },
    outdialAni: { type: String, attribute: 'outdial-ani' },
    // Support for multiple ANIs - can be comma-separated string or JSON array
    // Example: "+18005551234,+18005555678" or JSON array in layout
    outdialAniList: { type: Array, attribute: 'outdial-ani-list' },
    // Currently selected ANI (for multi-ANI scenarios)
    selectedAni: { type: String },
    // Show ANI selector modal
    showAniSelector: { type: Boolean }
  };

  static styles = css`
    :host {
      display: block;
      font-family: 'CiscoSansTT', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 13px;
      color: #171717;
      height: 100%;
      --primary-color: #00bceb;
      --primary-hover: #0095b8;
      --success-color: #28a745;
      --warning-color: #f59e0b;
      --danger-color: #dc3545;
      --bg-color: #ffffff;
      --bg-secondary: #f8fafc;
      --border-color: #e2e8f0;
      --text-muted: #64748b;
      --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
      --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    /* Main panel container */
    .panel-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--bg-secondary);
    }

    /* Panel header */
    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      background: var(--bg-color);
      border-bottom: 1px solid var(--border-color);
      flex-shrink: 0;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
      border-radius: 10px;
      color: white;
    }

    .header-icon svg {
      width: 22px;
      height: 22px;
    }

    .header-title {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }

    .header-subtitle {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .refresh-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      background: var(--bg-color);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .refresh-btn:hover {
      background: var(--bg-secondary);
      border-color: var(--primary-color);
      color: var(--primary-color);
    }

    .refresh-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .refresh-btn svg {
      width: 14px;
      height: 14px;
    }

    .refresh-btn.loading svg {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Stats bar */
    .stats-bar {
      display: flex;
      gap: 16px;
      padding: 12px 20px;
      background: var(--bg-color);
      border-bottom: 1px solid var(--border-color);
      flex-shrink: 0;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
    }

    .stat-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .stat-dot.pending { background: var(--warning-color); }
    .stat-dot.claimed { background: var(--primary-color); }
    .stat-dot.dialed { background: var(--success-color); }

    .stat-count {
      font-weight: 600;
      color: #1e293b;
    }

    .stat-label {
      color: var(--text-muted);
    }

    /* Callback list */
    .callback-list {
      flex: 1;
      overflow-y: auto;
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    /* Callback card */
    .callback-card {
      background: var(--bg-color);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 16px;
      box-shadow: var(--shadow-sm);
      transition: all 0.15s ease;
    }

    .callback-card:hover {
      box-shadow: var(--shadow);
      border-color: #cbd5e1;
    }

    .callback-card.claimed {
      border-left: 4px solid var(--primary-color);
      background: #f0f9ff;
    }

    .callback-card.dialed {
      border-left: 4px solid var(--success-color);
      background: #f0fdf4;
    }

    .callback-card.claimed-by-other {
      opacity: 0.6;
    }

    .card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .caller-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .caller-avatar {
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
      border-radius: 50%;
      color: white;
      flex-shrink: 0;
    }

    .caller-avatar svg {
      width: 22px;
      height: 22px;
    }

    .caller-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .caller-ani {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
      letter-spacing: 0.3px;
    }

    .caller-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .meta-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      background: #f1f5f9;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
      color: #475569;
    }

    .meta-tag.queue {
      background: #dbeafe;
      color: #1d4ed8;
    }

    .meta-tag.time {
      background: #fef3c7;
      color: #b45309;
    }

    .meta-tag svg {
      width: 12px;
      height: 12px;
    }

    .card-status {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .card-status.pending {
      background: #fef3c7;
      color: #b45309;
    }

    .card-status.claimed {
      background: #dbeafe;
      color: #1d4ed8;
    }

    .card-status.dialed {
      background: #d1fae5;
      color: #047857;
    }

    .card-status.other {
      background: #f1f5f9;
      color: #64748b;
    }

    /* Context section */
    .card-context {
      padding: 10px 12px;
      background: #f8fafc;
      border-radius: 6px;
      font-size: 12px;
      color: #475569;
      line-height: 1.5;
      margin-bottom: 12px;
      border-left: 3px solid #e2e8f0;
    }

    .card-context-label {
      font-size: 10px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    /* Actions section */
    .card-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      padding-top: 12px;
      border-top: 1px solid #f1f5f9;
    }

    .action-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px 18px;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .action-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .action-btn svg {
      width: 16px;
      height: 16px;
    }

    .action-btn.primary {
      background: var(--primary-color);
      color: white;
    }

    .action-btn.primary:hover:not(:disabled) {
      background: var(--primary-hover);
    }

    .action-btn.success {
      background: var(--success-color);
      color: white;
    }

    .action-btn.success:hover:not(:disabled) {
      background: #218838;
    }

    .action-btn.secondary {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #e2e8f0;
    }

    .action-btn.secondary:hover:not(:disabled) {
      background: #e2e8f0;
    }

    .action-btn.danger {
      background: #fee2e2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }

    .action-btn.danger:hover:not(:disabled) {
      background: #fecaca;
    }

    .action-spacer {
      flex: 1;
    }

    /* Outcome section */
    .outcome-section {
      margin-top: 12px;
      padding: 12px;
      background: #f0fdf4;
      border-radius: 8px;
      border: 1px dashed #86efac;
    }

    .outcome-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }

    .outcome-icon {
      width: 20px;
      height: 20px;
      color: var(--success-color);
    }

    .outcome-title {
      font-size: 12px;
      font-weight: 600;
      color: #047857;
    }

    .outcome-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .outcome-btn {
      padding: 8px 14px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      background: white;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .outcome-btn:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }

    .outcome-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .outcome-btn.connected:hover {
      border-color: #10b981;
      background: #d1fae5;
      color: #047857;
    }

    .outcome-btn.voicemail:hover {
      border-color: #f59e0b;
      background: #fef3c7;
      color: #b45309;
    }

    .outcome-btn.no-answer:hover {
      border-color: #6b7280;
      background: #f3f4f6;
      color: #374151;
    }

    .outcome-btn.wrong-number:hover {
      border-color: #ef4444;
      background: #fee2e2;
      color: #dc2626;
    }

    /* Empty state */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
      flex: 1;
    }

    .empty-icon {
      width: 80px;
      height: 80px;
      margin-bottom: 20px;
      color: #cbd5e1;
    }

    .empty-title {
      font-size: 18px;
      font-weight: 600;
      color: #475569;
      margin-bottom: 8px;
    }

    .empty-text {
      font-size: 14px;
      color: var(--text-muted);
      max-width: 300px;
    }

    /* Error banner */
    .error-banner {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 20px;
      background: #fef2f2;
      border-bottom: 1px solid #fecaca;
      color: var(--danger-color);
      font-size: 13px;
      flex-shrink: 0;
    }

    .error-banner svg {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }

    .error-dismiss {
      margin-left: auto;
      padding: 4px;
      background: none;
      border: none;
      color: var(--danger-color);
      cursor: pointer;
      opacity: 0.7;
    }

    .error-dismiss:hover {
      opacity: 1;
    }

    /* Scrollbar styling */
    .callback-list::-webkit-scrollbar {
      width: 8px;
    }

    .callback-list::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 4px;
    }

    .callback-list::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }

    .callback-list::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }

    /* Modal styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: var(--bg-color);
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      width: 90%;
      max-width: 400px;
      max-height: 80vh;
      overflow: hidden;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-color);
    }

    .modal-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--text-color);
    }

    .modal-close {
      background: none;
      border: none;
      padding: 4px;
      cursor: pointer;
      color: var(--text-muted);
      border-radius: 4px;
    }

    .modal-close:hover {
      background: var(--bg-hover);
      color: var(--text-color);
    }

    .modal-body {
      padding: 20px;
    }

    .modal-footer {
      padding: 16px 20px;
      border-top: 1px solid var(--border-color);
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }

    .ani-options {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .ani-option {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      background: var(--bg-color);
      border: 2px solid var(--border-color);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s ease;
      font-size: 14px;
      font-weight: 500;
      color: var(--text-color);
    }

    .ani-option:hover {
      border-color: var(--primary-color);
      background: rgba(0, 188, 235, 0.05);
    }

    .ani-option.selected {
      border-color: var(--primary-color);
      background: rgba(0, 188, 235, 0.1);
    }

    .ani-option svg {
      color: var(--primary-color);
    }

    .btn-secondary {
      padding: 8px 16px;
      background: var(--bg-color);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      color: var(--text-color);
    }

    .btn-secondary:hover {
      background: var(--bg-hover);
    }
  `;

  constructor() {
    super();
    this.callbacks = [];
    this.loading = false;
    this.error = null;
    this.agentId = null;
    this.agentState = 'Unknown';
    this.claimingId = null;
    this.dialingId = null;
    this.backendUrl = 'https://bs-callback-widget-production.up.railway.app/api';
    this.outdialEp = null;  // Outdial Entry Point ID - passed from layout
    this.outdialAni = null; // Single Outdial ANI - passed from layout
    this.outdialAniList = null; // Multiple ANIs - array or comma-separated
    this.selectedAni = null; // Currently selected ANI
    this.showAniSelector = false; // Show ANI selection modal
    this._pendingDialCallback = null; // Callback waiting for ANI selection
    this._sdkLogger = null;
    this._pollInterval = null;
  }

  connectedCallback() {
    super.connectedCallback();
    
    // Log all properties received from the layout
    console.log('[CallbackWidget] === WIDGET CONNECTED ===');
    console.log('[CallbackWidget] this.outdialAni:', this.outdialAni);
    console.log('[CallbackWidget] this.outdialEp:', this.outdialEp);
    console.log('[CallbackWidget] this.backendUrl:', this.backendUrl);
    
    // Deep inspect outdialAni
    if (this.outdialAni) {
      console.log('[CallbackWidget] outdialAni type:', typeof this.outdialAni);
      console.log('[CallbackWidget] outdialAni constructor:', this.outdialAni?.constructor?.name);
      
      try {
        // Try spread
        const spread = [...this.outdialAni];
        console.log('[CallbackWidget] outdialAni spread:', spread);
        spread.forEach((item, i) => {
          console.log(`[CallbackWidget] ANI[${i}]:`, item, 'type:', typeof item);
          if (typeof item === 'object' && item !== null) {
            console.log(`[CallbackWidget] ANI[${i}] keys:`, Object.keys(item));
            console.log(`[CallbackWidget] ANI[${i}] JSON:`, JSON.stringify(item));
          }
        });
      } catch (e) {
        console.log('[CallbackWidget] Could not spread outdialAni:', e.message);
      }
      
      try {
        // Try slice
        if (typeof this.outdialAni.slice === 'function') {
          console.log('[CallbackWidget] outdialAni.slice():', this.outdialAni.slice());
        }
      } catch (e) {
        console.log('[CallbackWidget] slice failed:', e.message);
      }
      
      try {
        // Try toJSON
        if (typeof this.outdialAni.toJSON === 'function') {
          console.log('[CallbackWidget] outdialAni.toJSON():', this.outdialAni.toJSON());
        }
      } catch (e) {
        console.log('[CallbackWidget] toJSON failed:', e.message);
      }
    }
    
    // Store reference to this widget on window for debugging
    window._callbackWidget = this;
    console.log('[CallbackWidget] Widget stored at window._callbackWidget for debugging');
    
    this._initSDK();
    this._startPolling();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._stopPolling();
  }

  async _initSDK() {
    try {
      console.log('[CallbackWidget] _initSDK starting...');
      
      // Initialize config (matching working widget pattern)
      Desktop.config.init();
      console.log('[CallbackWidget] Config initialized');

      // Store reference to agent service (matching working widget pattern)
      window.myAgentService = Desktop.agentContact?.SERVICE;
      console.log('[CallbackWidget] myAgentService:', window.myAgentService);

      // Get agent details using the working pattern
      if (Desktop.agentContact?.SERVICE?.webex) {
        try {
          const agentDetails = await Desktop.agentContact.SERVICE.webex.fetchPersonData("me");
          console.log('[CallbackWidget] Agent details:', agentDetails);
          this.agentId = agentDetails?.id || agentDetails?.emails?.[0] || null;
          console.log('[CallbackWidget] Agent ID from fetchPersonData:', this.agentId);
        } catch (err) {
          console.warn('[CallbackWidget] fetchPersonData failed:', err);
        }
      }

      // Fallback: try agentStateInfo if agentContact didn't work
      if (!this.agentId && Desktop.agentStateInfo?.latestData) {
        const agentInfo = Desktop.agentStateInfo.latestData;
        console.log('[CallbackWidget] agentStateInfo latestData:', agentInfo);
        this.agentId = agentInfo?.agentId || agentInfo?.id || agentInfo?.agentSessionId || null;
        this.agentState = agentInfo?.subStatus || agentInfo?.status || 'Available';
      }

      // Get Outdial ANI from agent profile if not set via property
      if (!this.outdialAni) {
        try {
          // Try to get from Desktop.agentStateInfo
          const agentData = Desktop.agentStateInfo?.latestData;
          console.log('[CallbackWidget] Looking for outdialAni in agentData:', agentData);
          
          // The outdial ANI might be in different places depending on config
          this.outdialAni = agentData?.outDialAni || 
                           agentData?.outdialAni ||
                           agentData?.dialAni ||
                           agentData?.ani ||
                           null;
          
          // Also check Desktop.dialer for default ANI
          if (!this.outdialAni && Desktop.dialer?.defaultAni) {
            this.outdialAni = Desktop.dialer.defaultAni;
          }
          
          console.log('[CallbackWidget] Outdial ANI from agent profile:', this.outdialAni);
        } catch (err) {
          console.warn('[CallbackWidget] Could not get outdialAni:', err);
        }
      }

      console.log('[CallbackWidget] Final Agent ID:', this.agentId);
      console.log('[CallbackWidget] Agent State:', this.agentState);
      console.log('[CallbackWidget] Outdial ANI:', this.outdialAni);

      // Try to create logger
      if (Desktop.logger) {
        try {
          this._sdkLogger = Desktop.logger.createLogger('bs-callback-widget');
        } catch (e) {
          console.warn('[CallbackWidget] Logger creation failed:', e);
        }
      }

      // Listen for state changes
      if (Desktop.agentStateInfo?.addEventListener) {
        Desktop.agentStateInfo.addEventListener('updated', (event) => {
          console.log('[CallbackWidget] Agent state update event:', event);
          if (Array.isArray(event)) {
            const stateChange = event.find(item => item.name === 'subStatus');
            if (stateChange) {
              this.agentState = stateChange.value;
            }
          }
        });
      }

      await this._fetchCallbacks();

    } catch (err) {
      console.error('[CallbackWidget] SDK init failed:', err);
      this.error = 'Failed to initialize SDK: ' + err.message;
      // Still try to fetch callbacks
      await this._fetchCallbacks();
    }
  }

  _startPolling() {
    this._pollInterval = setInterval(() => {
      if (!this.loading) {
        this._fetchCallbacks();
      }
    }, 30000);
  }

  _stopPolling() {
    if (this._pollInterval) {
      clearInterval(this._pollInterval);
      this._pollInterval = null;
    }
  }

  _log(message, data = {}, level = 'info') {
    const logData = { message, ...data, timestamp: new Date().toISOString() };
    
    if (this._sdkLogger) {
      this._sdkLogger[level]?.(JSON.stringify(logData));
    } else {
      console[level === 'error' ? 'error' : 'log']('[CallbackWidget]', message, data);
    }
  }

  async _fetchCallbacks() {
    this.loading = true;

    try {
      const response = await fetch(`${this.backendUrl}/callbacks`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Agent-Id': this.agentId || ''
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      this.callbacks = data.callbacks || [];
      this._log('Fetched callbacks', { count: this.callbacks.length });

    } catch (err) {
      this._log('Fetch failed', { error: err.message }, 'error');
      this.error = 'Unable to load callbacks';
    } finally {
      this.loading = false;
    }
  }

  async _claimCallback(callback) {
    if (!this.agentId) {
      this.error = 'Agent ID not available';
      return;
    }

    this.claimingId = callback.id;

    try {
      const response = await fetch(`${this.backendUrl}/callbacks/${callback.id}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: this.agentId,
          claimedAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Claim failed');
      }

      this._log('Claimed callback', { callbackId: callback.id });
      await this._fetchCallbacks();

    } catch (err) {
      this._log('Claim failed', { error: err.message }, 'error');
      this.error = err.message;
    } finally {
      this.claimingId = null;
    }
  }

  async _releaseCallback(callback) {
    try {
      const response = await fetch(`${this.backendUrl}/callbacks/${callback.id}/release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: this.agentId })
      });

      if (!response.ok) {
        throw new Error('Release failed');
      }

      this._log('Released callback', { callbackId: callback.id });
      await this._fetchCallbacks();

    } catch (err) {
      this._log('Release failed', { error: err.message }, 'error');
      this.error = err.message;
    }
  }

  async _dialCallback(callback) {
    this.dialingId = callback.id;

    try {
      console.log('[CallbackWidget] _dialCallback called');
      console.log('[CallbackWidget] Callback data:', JSON.stringify(callback, null, 2));
      
      // Get access token from the agent service (same pattern as cherry picker)
      const token = window.myAgentService?.webex?.token?.access_token;
      console.log('[CallbackWidget] Access token available:', !!token);
      
      if (!token) {
        throw new Error('No access token available for outdial');
      }

      // Get the outdial entry point - prefer widget property, then callback data
      const entryPointId = this.outdialEp || callback.entryPointId;
      console.log('[CallbackWidget] Outdial Entry Point:', entryPointId);

      if (!entryPointId) {
        throw new Error('No Outdial Entry Point configured. Please set outdialEp in the desktop layout.');
      }

      // Get available ANIs
      const availableAnis = this._getAvailableAnis();
      console.log('[CallbackWidget] Available ANIs:', availableAnis);

      if (availableAnis.length === 0) {
        throw new Error('No Outdial ANI configured. Set outdialAni or outdialAniList in the desktop layout.');
      }

      let originAni;

      // If multiple ANIs and none selected, show selector
      if (availableAnis.length > 1 && !this.selectedAni) {
        console.log('[CallbackWidget] Multiple ANIs available, showing selector');
        this._pendingDialCallback = callback;
        this.showAniSelector = true;
        this.dialingId = null; // Reset since we're waiting for selection
        return;
      }

      // Use selected ANI or the only available one
      originAni = this.selectedAni || availableAnis[0];
      console.log('[CallbackWidget] Using origin ANI:', originAni);

      // Proceed with dial
      await this._executeOutdial(callback, entryPointId, originAni);

    } catch (err) {
      console.error('[CallbackWidget] Dial error:', err);
      this.error = err.message;
      this.dialingId = null;
    }
  }

  /**
   * Get list of available ANIs from various sources
   */
  _getAvailableAnis() {
    const anis = [];

    // 1. Check outdialAniList (comma-separated or array)
    if (this.outdialAniList) {
      if (typeof this.outdialAniList === 'string') {
        // Comma-separated string
        const parsed = this.outdialAniList.split(',').map(a => a.trim()).filter(a => a.length > 5);
        anis.push(...parsed);
      } else if (Array.isArray(this.outdialAniList)) {
        anis.push(...this.outdialAniList.filter(a => typeof a === 'string' && a.length > 5));
      }
    }

    // 2. Check single outdialAni
    if (this.outdialAni && typeof this.outdialAni === 'string' && this.outdialAni.length > 5) {
      if (!anis.includes(this.outdialAni)) {
        anis.push(this.outdialAni);
      }
    }

    // 3. Try to extract from MobX proxy (if outdialAni is an object)
    if (this.outdialAni && typeof this.outdialAni === 'object') {
      try {
        let extracted = [];
        
        if (typeof this.outdialAni.slice === 'function') {
          extracted = this.outdialAni.slice();
        } else if (typeof this.outdialAni.toJSON === 'function') {
          extracted = this.outdialAni.toJSON();
        } else if (this.outdialAni.data && Array.isArray(this.outdialAni.data)) {
          extracted = this.outdialAni.data;
        }

        if (Array.isArray(extracted)) {
          extracted.forEach(item => {
            const ani = typeof item === 'string' ? item :
                       (item?.id || item?.name || item?.ani || item?.number || item?.value);
            if (ani && typeof ani === 'string' && ani.length > 5 && !anis.includes(ani)) {
              anis.push(ani);
            }
          });
        }
      } catch (e) {
        console.warn('[CallbackWidget] Could not extract ANIs from MobX proxy:', e);
      }
    }

    return anis;
  }

  /**
   * Handle ANI selection from modal
   */
  _selectAni(ani) {
    console.log('[CallbackWidget] ANI selected:', ani);
    this.selectedAni = ani;
    this.showAniSelector = false;

    // If there's a pending dial, execute it
    if (this._pendingDialCallback) {
      const callback = this._pendingDialCallback;
      this._pendingDialCallback = null;
      this._dialCallback(callback);
    }
  }

  /**
   * Cancel ANI selection
   */
  _cancelAniSelection() {
    this.showAniSelector = false;
    this._pendingDialCallback = null;
    this.dialingId = null;
  }

  /**
   * Execute the actual outdial
   */
  async _executeOutdial(callback, entryPointId, originAni) {
    this.dialingId = callback.id;

    try {
      // Determine the WxCC API region
      const datacenter = this._getDatacenter();
      const apiBase = `https://api.wxcc-${datacenter}.cisco.com`;
      console.log('[CallbackWidget] API base:', apiBase);

      // Try Desktop.dialer first if available
      if (Desktop.dialer?.startOutdial) {
        console.log('[CallbackWidget] Attempting Desktop.dialer.startOutdial');
        
        const outdialPayload = {
          data: {
            entryPointId: entryPointId,
            destination: callback.ani,
            direction: 'OUTBOUND',
            origin: originAni,
            mediaType: 'telephony',
            outboundType: 'OUTDIAL',
            attributes: {},
          }
        };
        
        console.log('[CallbackWidget] Outdial payload:', JSON.stringify(outdialPayload, null, 2));
        
        const dialResult = await Desktop.dialer.startOutdial(outdialPayload);
        console.log('[CallbackWidget] Desktop.dialer result:', dialResult);
      } else {
        console.warn('[CallbackWidget] Desktop.dialer.startOutdial not available');
        
        if (Desktop.dialer?.dial) {
          console.log('[CallbackWidget] Trying Desktop.dialer.dial');
          await Desktop.dialer.dial(callback.ani);
        } else {
          throw new Error('No outdial method available. Please dial manually: ' + callback.ani);
        }
      }

      this._log('Outdial initiated', { callbackId: callback.id, ani: callback.ani });

      // Mark as completed and remove from list (call disposition handled by Cisco Desktop)
      await fetch(`${this.backendUrl}/callbacks/${callback.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: this.agentId,
          outcome: 'dialed',
          completedAt: new Date().toISOString()
        })
      });

      // Remove from local list immediately for better UX
      this.callbacks = this.callbacks.filter(c => c.id !== callback.id);

      this._log('Callback completed and removed', { callbackId: callback.id });

    } catch (err) {
      console.error('[CallbackWidget] Dial error:', err);
      
      // Extract useful error message
      let errorMsg = err.message || String(err);
      if (err.details?.msg?.errorMessage) {
        errorMsg = err.details.msg.errorMessage;
      }
      
      this._log('Dial failed', { error: errorMsg }, 'error');
      this.error = 'Dial failed: ' + errorMsg;
    } finally {
      this.dialingId = null;
    }
  }

  _getDatacenter() {
    // Try to get datacenter from various sources
    try {
      // From Desktop config
      if (Desktop.config?.datacenter) {
        return Desktop.config.datacenter.replace('prod', '');
      }
      // From window location
      const hostname = window.location.hostname;
      if (hostname.includes('wxcc-us1')) return 'us1';
      if (hostname.includes('wxcc-eu1')) return 'eu1';
      if (hostname.includes('wxcc-eu2')) return 'eu2';
      if (hostname.includes('wxcc-anz1')) return 'anz1';
      if (hostname.includes('wxcc-ca1')) return 'ca1';
      if (hostname.includes('wxcc-jp1')) return 'jp1';
      if (hostname.includes('wxcc-sg1')) return 'sg1';
    } catch (e) {
      console.warn('[CallbackWidget] Could not determine datacenter:', e);
    }
    return 'us1'; // Default
  }

  _dismissError() {
    this.error = null;
  }

  _formatTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }

  _formatANI(ani) {
    const cleaned = ani?.replace(/\D/g, '') || '';
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return ani || 'Unknown';
  }

  _getStats() {
    return {
      pending: this.callbacks.filter(c => !c.claimedBy).length,
      claimed: this.callbacks.filter(c => c.claimedBy).length
    };
  }

  render() {
    const stats = this._getStats();

    return html`
      <div class="panel-container">
        <div class="panel-header">
          <div class="header-left">
            <div class="header-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <div>
              <div class="header-title">Abandoned Callbacks</div>
              <div class="header-subtitle">${this.callbacks.length} pending follow-ups</div>
            </div>
          </div>
          <div class="header-actions">
            <button 
              class="refresh-btn ${this.loading ? 'loading' : ''}"
              @click=${this._fetchCallbacks}
              ?disabled=${this.loading}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 4v6h-6M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              ${this.loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        <div class="stats-bar">
          <div class="stat-item">
            <span class="stat-dot pending"></span>
            <span class="stat-count">${stats.pending}</span>
            <span class="stat-label">Pending</span>
          </div>
          <div class="stat-item">
            <span class="stat-dot claimed"></span>
            <span class="stat-count">${stats.claimed}</span>
            <span class="stat-label">Claimed</span>
          </div>
        </div>

        ${this.error ? html`
          <div class="error-banner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            ${this.error}
            <button class="error-dismiss" @click=${this._dismissError}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        ` : ''}

        ${this.callbacks.length === 0 ? html`
          <div class="empty-state">
            <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              <path d="M15 5l4 4M19 5l-4 4" stroke-linecap="round"/>
            </svg>
            <div class="empty-title">No callbacks pending</div>
            <div class="empty-text">When customers abandon calls, they'll appear here for follow-up.</div>
          </div>
        ` : html`
          <div class="callback-list">
            ${this.callbacks.map(callback => this._renderCallbackCard(callback))}
          </div>
        `}

        ${this.showAniSelector ? this._renderAniSelector() : ''}
      </div>
    `;
  }

  _renderAniSelector() {
    const anis = this._getAvailableAnis();
    
    return html`
      <div class="modal-overlay" @click=${this._cancelAniSelection}>
        <div class="modal-content" @click=${(e) => e.stopPropagation()}>
          <div class="modal-header">
            <h3>Select Outbound Caller ID</h3>
            <button class="modal-close" @click=${this._cancelAniSelection}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <p style="margin-bottom: 12px; color: var(--text-muted);">
              Choose which number to display to the customer:
            </p>
            <div class="ani-options">
              ${anis.map(ani => html`
                <button 
                  class="ani-option ${this.selectedAni === ani ? 'selected' : ''}"
                  @click=${() => this._selectAni(ani)}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  <span>${this._formatPhoneNumber(ani)}</span>
                </button>
              `)}
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click=${this._cancelAniSelection}>Cancel</button>
          </div>
        </div>
      </div>
    `;
  }

  _renderCallbackCard(callback) {
    const isClaimedByMe = callback.claimedBy === this.agentId;
    const isClaimedByOther = callback.claimedBy && !isClaimedByMe;
    const isClaiming = this.claimingId === callback.id;
    const isDialing = this.dialingId === callback.id;

    const statusClass = isClaimedByMe ? 'claimed' : (isClaimedByOther ? 'claimed-by-other' : '');
    const statusLabel = isClaimedByMe ? 'Claimed' : (isClaimedByOther ? 'Unavailable' : 'Pending');
    const statusBadgeClass = isClaimedByMe ? 'claimed' : (isClaimedByOther ? 'other' : 'pending');

    return html`
      <div class="callback-card ${statusClass}">
        <div class="card-header">
          <div class="caller-info">
            <div class="caller-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div class="caller-details">
              <div class="caller-ani">${this._formatANI(callback.ani)}</div>
              <div class="caller-meta">
                <span class="meta-tag queue">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  ${callback.queue || 'Unknown Queue'}
                </span>
                <span class="meta-tag time">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  ${this._formatTime(callback.abandonedAt)}
                </span>
              </div>
            </div>
          </div>
          <span class="card-status ${statusBadgeClass}">${statusLabel}</span>
        </div>

        ${callback.context ? html`
          <div class="card-context">
            <div class="card-context-label">Context</div>
            ${callback.context}
          </div>
        ` : ''}

        ${callback.callerName ? html`
          <div class="card-context">
            <div class="card-context-label">Caller</div>
            ${callback.callerName}
          </div>
        ` : ''}

        <div class="card-actions">
          ${!callback.claimedBy ? html`
            <button 
              class="action-btn primary"
              @click=${() => this._claimCallback(callback)}
              ?disabled=${isClaiming}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <polyline points="17 11 19 13 23 9"/>
              </svg>
              ${isClaiming ? 'Claiming...' : 'Claim'}
            </button>
          ` : ''}

          ${isClaimedByMe ? html`
            <button 
              class="action-btn success"
              @click=${() => this._dialCallback(callback)}
              ?disabled=${isDialing}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              ${isDialing ? 'Dialing...' : 'Dial'}
            </button>
            <div class="action-spacer"></div>
            <button 
              class="action-btn danger"
              @click=${() => this._releaseCallback(callback)}
            >
              Release
            </button>
          ` : ''}

          ${isClaimedByOther ? html`
            <span style="color: var(--text-muted); font-size: 12px;">
              Claimed by another agent
            </span>
          ` : ''}
        </div>
      </div>
    `;
  }
}

customElements.define('bs-callback-widget', CallbackWidget);
