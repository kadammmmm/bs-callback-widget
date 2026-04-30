#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Deploys the WxCC Callback Widget backend to a Windows Server.

.DESCRIPTION
    Installs Node.js dependencies, writes configuration, registers the backend
    as a persistent Windows service via PM2, and opens the required firewall port.

.PARAMETER Port
    Port the backend server listens on. Default: 3000.

.PARAMETER ServiceName
    Name used for the PM2 process. Default: WxCCCallback.

.PARAMETER Uninstall
    Remove the service and firewall rule instead of installing.

.EXAMPLE
    .\deploy.ps1
    .\deploy.ps1 -Port 8080
    .\deploy.ps1 -Uninstall
#>

param(
    [int]    $Port        = 3000,
    [string] $ServiceName = "WxCCCallback",
    [switch] $Uninstall
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ─── Helpers ──────────────────────────────────────────────────────────────────

function Write-Header([string]$text) {
    Write-Host ""
    Write-Host "━━━ $text" -ForegroundColor Cyan
}

function Write-OK([string]$text)   { Write-Host "  [OK] $text" -ForegroundColor Green  }
function Write-Info([string]$text) { Write-Host "  [..] $text" -ForegroundColor Yellow }
function Write-Fail([string]$text) { Write-Host "  [!!] $text" -ForegroundColor Red    }

function Read-Value([string]$prompt, [string]$default = "") {
    $label = if ($default) { "$prompt [$default]" } else { $prompt }
    $val   = Read-Host -Prompt "  $label"
    if (-not $val -and $default) { return $default }
    return $val
}

function Read-Secret([string]$prompt) {
    $ss  = Read-Host -Prompt "  $prompt" -AsSecureString
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($ss)
    try { return [Runtime.InteropServices.Marshal]::PtrToStringAuto($ptr) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
}

# ─── Locate project root ──────────────────────────────────────────────────────

$rootDir    = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $rootDir "backend"

if (-not (Test-Path $backendDir)) {
    Write-Fail "Cannot find 'backend' directory at: $backendDir"
    Write-Fail "Run this script from the wxcc-callback-widget root folder."
    exit 1
}

# ─── Uninstall ────────────────────────────────────────────────────────────────

if ($Uninstall) {
    Write-Header "Uninstalling WxCC Callback Backend"

    $pm2 = Get-Command pm2 -ErrorAction SilentlyContinue
    if ($pm2) {
        Write-Info "Stopping PM2 process '$ServiceName'..."
        & pm2 delete $ServiceName 2>$null
        & pm2 save --force 2>$null
        Write-OK "PM2 process removed."
    }

    $fwRule = Get-NetFirewallRule -DisplayName "WxCC Callback Backend" -ErrorAction SilentlyContinue
    if ($fwRule) {
        Remove-NetFirewallRule -DisplayName "WxCC Callback Backend"
        Write-OK "Firewall rule removed."
    }

    $ecoPath = Join-Path $backendDir "ecosystem.config.cjs"
    if (Test-Path $ecoPath) { Remove-Item $ecoPath; Write-OK "ecosystem.config.cjs removed." }

    $envPath = Join-Path $backendDir ".env"
    if (Test-Path $envPath) {
        Write-Host ""
        $del = Read-Host "  Remove backend/.env as well? [y/N]"
        if ($del -match '^[Yy]') { Remove-Item $envPath; Write-OK ".env removed." }
    }

    Write-Host ""
    Write-OK "Uninstall complete."
    exit 0
}

# ─── Banner ───────────────────────────────────────────────────────────────────

Clear-Host
Write-Host ""
Write-Host "  WxCC Callback Widget — Windows Server Deployment" -ForegroundColor White
Write-Host "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

# ─── Step 1: Prerequisites ────────────────────────────────────────────────────

Write-Header "Step 1: Checking prerequisites"

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Fail "Node.js is not installed or not in PATH."
    Write-Fail "Install Node.js 18+ from https://nodejs.org and re-run this script."
    exit 1
}

$nodeVer = & node --version
$major   = [int]($nodeVer -replace 'v(\d+)\..*', '$1')
if ($major -lt 18) {
    Write-Fail "Node.js $nodeVer detected — version 18 or later is required."
    Write-Fail "Download the latest LTS from https://nodejs.org"
    exit 1
}
Write-OK "Node.js $nodeVer"

$npm = Get-Command npm -ErrorAction SilentlyContinue
if (-not $npm) { Write-Fail "npm not found. Reinstall Node.js."; exit 1 }
Write-OK "npm $(& npm --version)"

# ─── Step 2: Configuration ────────────────────────────────────────────────────

Write-Header "Step 2: Configuration"
Write-Host "  Press Enter to accept the default shown in [brackets]." -ForegroundColor DarkGray
Write-Host ""

$cfgPort    = Read-Value "Backend port"                    -default "$Port"
$cfgTtl     = Read-Value "Callback TTL (hours)"           -default "48"
$cfgAbandon = Read-Secret "Abandon API key (blank = no auth)"
$cfgAdmin   = Read-Secret "Admin API key   (blank = no auth)"

# ─── Step 3: Write PM2 ecosystem config ───────────────────────────────────────

Write-Header "Step 3: Writing PM2 ecosystem config"

$envBlock = "      NODE_ENV: 'production',`n      PORT: '$cfgPort',`n      CALLBACK_TTL_HOURS: '$cfgTtl'"
if ($cfgAbandon) { $envBlock += ",`n      ABANDON_API_KEY: '$cfgAbandon'" }
if ($cfgAdmin)   { $envBlock += ",`n      ADMIN_API_KEY: '$cfgAdmin'"   }

$ecoContent = @"
// Auto-generated by deploy.ps1 — do not edit by hand.
module.exports = {
  apps: [{
    name: '$ServiceName',
    script: './server.js',
    cwd: __dirname,
    env_production: {
$envBlock
    }
  }]
};
"@

$ecoPath = Join-Path $backendDir "ecosystem.config.cjs"
Set-Content -Path $ecoPath -Value $ecoContent -Encoding utf8
Write-OK "Created: $ecoPath"

# ─── Step 4: Install backend dependencies ─────────────────────────────────────

Write-Header "Step 4: Installing backend dependencies"

Push-Location $backendDir
try {
    & npm install --omit=dev
    if ($LASTEXITCODE -ne 0) { throw "npm install failed (exit $LASTEXITCODE)" }
    Write-OK "Dependencies installed."
} finally {
    Pop-Location
}

# ─── Step 5: Ensure PM2 is installed ─────────────────────────────────────────

Write-Header "Step 5: Checking PM2"

$pm2 = Get-Command pm2 -ErrorAction SilentlyContinue
if (-not $pm2) {
    Write-Info "PM2 not found — installing globally..."
    & npm install -g pm2
    if ($LASTEXITCODE -ne 0) { Write-Fail "Failed to install PM2."; exit 1 }
    Write-OK "PM2 installed."
} else {
    Write-OK "PM2 $(& pm2 --version) already installed."
}

# ─── Step 6: Start / restart service ─────────────────────────────────────────

Write-Header "Step 6: Starting backend service"

# Remove any existing instance so we can do a clean start.
& pm2 delete $ServiceName 2>$null

Push-Location $backendDir
try {
    & pm2 start ecosystem.config.cjs --env production
    if ($LASTEXITCODE -ne 0) { throw "PM2 failed to start the server." }
} finally {
    Pop-Location
}

& pm2 save
Write-OK "Service '$ServiceName' started and saved to PM2 process list."

# ─── Step 7: Auto-start on boot ───────────────────────────────────────────────

Write-Header "Step 7: Configuring auto-start on boot"

Write-Info "Registering PM2 startup with Windows Task Scheduler..."
$startupOutput = & pm2 startup 2>&1
Write-Host ""

# pm2 startup on Windows sometimes prints a command to run manually.
if ($startupOutput -match "To setup the Startup Script, copy/paste the following command") {
    Write-Host "  PM2 printed a command you must run manually to complete startup registration:" -ForegroundColor Yellow
    Write-Host ""
    $startupOutput | ForEach-Object { Write-Host "    $_" -ForegroundColor White }
    Write-Host ""
    Write-Host "  Copy and run that command in an elevated PowerShell session, then re-run" -ForegroundColor Yellow
    Write-Host "  this script (or just run: pm2 save) to finish." -ForegroundColor Yellow
} else {
    Write-OK "Auto-start configured."
}

# ─── Step 8: Firewall rule ────────────────────────────────────────────────────

Write-Header "Step 8: Configuring Windows Firewall"

Get-NetFirewallRule -DisplayName "WxCC Callback Backend" -ErrorAction SilentlyContinue |
    Remove-NetFirewallRule

New-NetFirewallRule `
    -DisplayName "WxCC Callback Backend" `
    -Direction   Inbound `
    -Protocol    TCP `
    -LocalPort   $cfgPort `
    -Action      Allow `
    -Profile     Any | Out-Null

Write-OK "Inbound firewall rule created for TCP port $cfgPort."

# ─── Step 9: Health check ─────────────────────────────────────────────────────

Write-Header "Step 9: Health check"

Write-Info "Waiting 4 seconds for server to start..."
Start-Sleep -Seconds 4

try {
    $resp = Invoke-RestMethod -Uri "http://localhost:$cfgPort/health" -TimeoutSec 10
    Write-OK "Server responded: $($resp | ConvertTo-Json -Compress)"
} catch {
    Write-Host ""
    Write-Host "  [!!] Health check failed — the server may still be initialising." -ForegroundColor Yellow
    Write-Host "       Check status : pm2 status" -ForegroundColor Yellow
    Write-Host "       View logs    : pm2 logs $ServiceName" -ForegroundColor Yellow
}

# ─── Summary ──────────────────────────────────────────────────────────────────

$ips = (Get-NetIPAddress -AddressFamily IPv4 |
        Where-Object { $_.PrefixOrigin -ne "WellKnown" }).IPAddress

Write-Host ""
Write-Host "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "  Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "  Local  : http://localhost:$cfgPort" -ForegroundColor White
foreach ($ip in $ips) {
    Write-Host "  Network: http://${ip}:$cfgPort" -ForegroundColor White
}
Write-Host ""
Write-Host "  Key endpoints:"
Write-Host "    /health          — liveness check"
Write-Host "    /api/callbacks   — list pending callbacks (agents poll here)"
Write-Host "    /api/abandon     — receive abandoned call from WxCC Flow (POST)"
Write-Host ""
Write-Host "  Useful PM2 commands:" -ForegroundColor DarkGray
Write-Host "    pm2 status                  — check service status"
Write-Host "    pm2 logs $ServiceName       — live logs"
Write-Host "    pm2 restart $ServiceName    — restart after config changes"
Write-Host "    .\deploy.ps1 -Uninstall     — remove service and firewall rule"
Write-Host ""
Write-Host "  Next steps:" -ForegroundColor Cyan
Write-Host "    1. Use one of the Network URLs above as your backend-url"
Write-Host "       (or put a reverse proxy / DNS name in front of it)"
Write-Host "    2. Host widget/index.js via GitHub Pages or IIS"
Write-Host "    3. Set backend-url in the WxCC Desktop Layout JSON"
Write-Host "    4. Configure WxCC Flow to POST to /api/abandon on call disconnect"
Write-Host "    5. See docs\DEPLOYMENT.md and docs\COMPLETE-SETUP-GUIDE.md for details"
Write-Host ""
