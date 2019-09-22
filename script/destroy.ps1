$ScriptPath            = $MyInvocation.MyCommand.Path
$ScriptDir             = Split-Path $ScriptPath
$CommonScript          = Join-Path $ScriptDir "common.ps1"
. $CommonScript
$ErrorActionPreference = "Continue"

Write-Notice "==> destroy"
Invoke-Script "destroy-postgres-container.ps1"
