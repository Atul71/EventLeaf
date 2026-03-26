# Start EventLeaf for local development (Postgres via Docker, then API + UI in new windows).
# Prerequisites: Docker Desktop running, Go, Node/npm, repo root `.env` (copy from `.env.example`).
# Usage (from repo root):  powershell -ExecutionPolicy Bypass -File .\scripts\start-dev.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker not found. Install Docker Desktop and add it to PATH, then try again."
}

Write-Host "Starting Postgres (and pgAdmin)..."
Set-Location (Join-Path $Root "api")
docker compose --env-file ..\.env up -d
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Waiting for database health..."
$deadline = (Get-Date).AddSeconds(45)
$ready = $false
while ((Get-Date) -lt $deadline) {
    docker compose exec -T postgres pg_isready -U eventleaf_user -d eventleaf_db 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) { $ready = $true; break }
    Start-Sleep -Seconds 2
}
if (-not $ready) {
    Write-Warning "pg_isready did not succeed in time. Check: docker compose logs postgres"
}

Write-Host "Starting API on :3000 (new window)..."
$apiCmd = "Set-Location '$Root\api'; Write-Host 'EventLeaf API'; go run ./cmd/server"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $apiCmd

Write-Host "Starting Vite on :5173 (new window)..."
$uiPath = Join-Path $Root "ui\eventleaf-ui"
$uiCmd = "Set-Location '$uiPath'; Write-Host 'EventLeaf UI'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $uiCmd

Set-Location $Root
Write-Host ""
Write-Host "Done. Open http://localhost:5173 — API proxied to http://localhost:3000"
Write-Host "If the API cannot connect to the DB, set DB_PORT in repo root .env to match Compose (5433 if Windows Postgres uses 5432)."
Write-Host "Health: http://localhost:3000/health  Swagger: http://localhost:3000/swagger/index.html"
