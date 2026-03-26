# Re-apply api/db/seed.sql to a running EventLeaf Postgres container.
# Usage: cd api; .\scripts\apply-seed.ps1
# Requires: Docker Desktop — docker compose up -d

$ErrorActionPreference = "Stop"
$ApiDir = Split-Path -Parent $PSScriptRoot
Set-Location $ApiDir

$dbUser = if ($env:DB_USER) { $env:DB_USER } else { "eventleaf_user" }
$dbName = if ($env:DB_NAME) { $env:DB_NAME } else { "eventleaf_db" }

$seedPath = Join-Path $ApiDir "db\seed.sql"
Get-Content -Raw $seedPath | docker compose exec -T postgres psql -U $dbUser -d $dbName -v ON_ERROR_STOP=1
Write-Host "Seed applied."
