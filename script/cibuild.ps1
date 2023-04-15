Set-Variable -Name ENV -Value ci -Scope Script
Set-Item -Path Env:ENV -Value ci

$ScriptPath = $MyInvocation.MyCommand.Path
$ScriptDir = Split-Path $ScriptPath
$CommonScript = Join-Path $ScriptDir "common.ps1"
. $CommonScript

Write-Notice "==> cibuild"

corepack enable
pnpm install
pnpm run ci
Invoke-Script "setup.ps1"
Invoke-Script "server.ps1"
Invoke-Script "test.ps1"
Invoke-Script "destroy.ps1"
