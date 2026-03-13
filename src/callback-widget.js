import { LitElement, html, css } from 'lit';

// Desktop SDK is provided globally by Agent Desktop runtime
// We access it via window.wxcc.Desktop or window.Desktop
const getDesktop = () => {
  if (typeof window !== 'undefined') {
    return window.wxcc?.Desktop || window.Desktop || null;
  }
  return null;
};

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
    completingId: { type: String },
    backendUrl: { type: String, attribute: 'backend-url' }
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
    this.completingId = null;
    this.backendUrl = 'https://bs-callback-widget.onrender.com/api';
    this._sdkLogger = null;
    this._pollInterval = null;
    this._desktop = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this._initSDK();
    this._startPolling();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._stopPolling();
  }

  async _initSDK() {
    try {
      this._desktop = getDesktop();
      
      if (!this._desktop) {
        this._log('Desktop SDK not available - running outside Agent Desktop', {}, 'warn');
        // Still fetch callbacks even without SDK
        await this._fetchCallbacks();
        return;
      }

      this._sdkLogger = this._desktop.logger.createLogger('bs-callback-widget');
      
      await this._desktop.config.init({
        widgetName: 'bs-callback-widget',
        widgetProvider: 'bucher-suter'
      });

      const agentInfo = this._desktop.agentStateInfo.latestData;
      this.agentId = agentInfo?.agentId || agentInfo?.id || null;
      this.agentState = agentInfo?.subStatus || agentInfo?.status || 'Available';

      this._log('SDK initialized', { agentId: this.agentId, state: this.agentState });

      this._desktop.agentStateInfo.addEventListener('updated', (event) => {
        if (Array.isArray(event)) {
          const stateChange = event.find(item => item.name === 'subStatus');
          if (stateChange) {
            this.agentState = stateChange.value;
            this._log('Agent state changed', { state: this.agentState });
          }
        }
      });

      await this._fetchCallbacks();

    } catch (err) {
      this._log('SDK init failed', err, 'error');
      this.error = 'Failed to initialize SDK';
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
      // Check if Desktop SDK is available for outdial
      if (this._desktop?.dialer) {
        const dialResult = await this._desktop.dialer.startOutdial({
          data: {
            entryPointId: callback.entryPointId || '',
            destination: callback.ani,
            direction: 'OUTBOUND',
            origin: callback.ani,
            attributes: {
              callbackId: callback.id,
              originalQueue: callback.queue,
              abandonedAt: callback.abandonedAt,
              context: callback.context || ''
            }
          }
        });

        this._log('Outdial initiated', { callbackId: callback.id, result: dialResult });
      } else {
        this._log('Desktop SDK dialer not available - marking as dialed without initiating call', {}, 'warn');
      }

      // Mark as dialed in backend regardless
      await fetch(`${this.backendUrl}/callbacks/${callback.id}/dial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: this.agentId,
          dialedAt: new Date().toISOString()
        })
      });

      await this._fetchCallbacks();

    } catch (err) {
      this._log('Dial failed', { error: err.message }, 'error');
      
      if (err.message?.includes('400') || err.message?.includes('403')) {
        this.error = 'Outdial not permitted. Please dial manually.';
      } else {
        this.error = 'Dial failed: ' + err.message;
      }
    } finally {
      this.dialingId = null;
    }
  }

  async _completeCallback(callback, outcome) {
    this.completingId = callback.id;

    try {
      const response = await fetch(`${this.backendUrl}/callbacks/${callback.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: this.agentId,
          outcome: outcome,
          completedAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Complete failed');
      }

      this._log('Completed callback', { callbackId: callback.id, outcome });
      await this._fetchCallbacks();

    } catch (err) {
      this._log('Complete failed', { error: err.message }, 'error');
      this.error = err.message;
    } finally {
      this.completingId = null;
    }
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
      pending: this.callbacks.filter(c => c.status === 'pending').length,
      claimed: this.callbacks.filter(c => c.status === 'claimed').length,
      dialed: this.callbacks.filter(c => c.status === 'dialed').length
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
          <div class="stat-item">
            <span class="stat-dot dialed"></span>
            <span class="stat-count">${stats.dialed}</span>
            <span class="stat-label">Dialed</span>
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
      </div>
    `;
  }

  _renderCallbackCard(callback) {
    const isClaimedByMe = callback.claimedBy === this.agentId;
    const isClaimedByOther = callback.claimedBy && !isClaimedByMe;
    const isDialed = callback.status === 'dialed';
    const isDialedByMe = isDialed && isClaimedByMe;
    const isClaiming = this.claimingId === callback.id;
    const isDialing = this.dialingId === callback.id;
    const isCompleting = this.completingId === callback.id;

    const statusClass = isDialedByMe ? 'dialed' : (isClaimedByMe ? 'claimed' : (isClaimedByOther ? 'claimed-by-other' : ''));
    const statusLabel = isDialed ? 'Dialed' : (isClaimedByMe ? 'Claimed' : (isClaimedByOther ? 'Unavailable' : 'Pending'));
    const statusBadgeClass = isDialed ? 'dialed' : (isClaimedByMe ? 'claimed' : (isClaimedByOther ? 'other' : 'pending'));

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

        ${isDialedByMe ? html`
          <div class="outcome-section">
            <div class="outcome-header">
              <svg class="outcome-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span class="outcome-title">Call completed? Select outcome:</span>
            </div>
            <div class="outcome-buttons">
              <button 
                class="outcome-btn connected"
                @click=${() => this._completeCallback(callback, 'connected')}
                ?disabled=${isCompleting}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                Connected
              </button>
              <button 
                class="outcome-btn voicemail"
                @click=${() => this._completeCallback(callback, 'voicemail')}
                ?disabled=${isCompleting}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="5.5" cy="11.5" r="4.5"/>
                  <circle cx="18.5" cy="11.5" r="4.5"/>
                  <line x1="5.5" y1="16" x2="18.5" y2="16"/>
                </svg>
                Voicemail
              </button>
              <button 
                class="outcome-btn no-answer"
                @click=${() => this._completeCallback(callback, 'no-answer')}
                ?disabled=${isCompleting}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
                No Answer
              </button>
              <button 
                class="outcome-btn wrong-number"
                @click=${() => this._completeCallback(callback, 'wrong-number')}
                ?disabled=${isCompleting}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                Wrong #
              </button>
            </div>
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

          ${isClaimedByMe && !isDialed ? html`
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

          ${isDialedByMe ? html`
            <button 
              class="action-btn secondary"
              @click=${() => this._dialCallback(callback)}
              ?disabled=${isDialing}
              title="Retry call"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 4v6h-6M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              ${isDialing ? 'Dialing...' : 'Redial'}
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
