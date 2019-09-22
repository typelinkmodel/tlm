$ErrorActionPreference = "Stop"
$ScriptPath            = $MyInvocation.MyCommand.Path
$ScriptDir             = Split-Path $ScriptPath
$CommonScript          = Join-Path $ScriptDir "common.ps1"
. $CommonScript

Write-Notice "==> test"
Invoke-Script "test-powershell.ps1"
Invoke-Script "test-sql.ps1"
Invoke-Script "test-js.ps1"
