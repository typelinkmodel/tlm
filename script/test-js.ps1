$ErrorActionPreference = "Stop"
$ScriptPath            = $MyInvocation.MyCommand.Path
$ScriptDir             = Split-Path $ScriptPath
$CommonScript          = Join-Path $ScriptDir "common.ps1"
. $CommonScript

Write-Notice "Running js unit tests…"

$LernaScript = Join-Path `
    -Path node_modules `
    -ChildPath lerna `
    -AdditionalChildPath cli.js

pnpm run -r prepare
pnpm run -r lint
pnpm run -r test
