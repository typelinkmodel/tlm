$ErrorActionPreference = "Stop"
$ScriptPath            = $MyInvocation.MyCommand.Path
$ScriptDir             = Split-Path $ScriptPath
$CommonScript          = Join-Path $ScriptDir "common.ps1"
. $CommonScript

Write-Notice "==> setup"
Invoke-Script "setup-postgres-container.ps1"
Invoke-Script "setup-postgres-db.ps1"
Invoke-Script "setup-postgres-pgtap.ps1"
