$ErrorActionPreference = "Stop"
$ScriptPath = $MyInvocation.MyCommand.Path
$ScriptDir = Split-Path $ScriptPath
$CommonScript = Join-Path $ScriptDir "common.ps1"
. $CommonScript

Write-Notice "Running js unit tests…"

./node_modules/.bin/pnpm run -r prepare
./node_modules/.bin/pnpm run -r lint
./node_modules/.bin/pnpm run -r test
