$ErrorActionPreference = "Stop"
$ScriptPath = $MyInvocation.MyCommand.Path
$ScriptDir = Split-Path $ScriptPath
$CommonScript = Join-Path $ScriptDir "common.ps1"
. $CommonScript

Write-Notice "Running js unit tests…"

pnpm run -r clean
pnpm install -r
pnpm run -r lint
pnpm run -r test
