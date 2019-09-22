$ErrorActionPreference = "Stop"
$ScriptPath            = $MyInvocation.MyCommand.Path
$ScriptDir             = Split-Path $ScriptPath
$CommonScript          = Join-Path $ScriptDir "common.ps1"
. $CommonScript

Write-Notice "==> bootstrap"
Invoke-Script "bootstrap-requirements.ps1"
Invoke-Script "bootstrap-build-tools.ps1"
