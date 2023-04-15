$ErrorActionPreference = "Stop"
$ScriptPath = $MyInvocation.MyCommand.Path
$ScriptDir = Split-Path $ScriptPath
$CommonScript = Join-Path $ScriptDir "common.ps1"
. $CommonScript

Write-Section-Start "test"
Invoke-Script "test-sql.ps1"
Invoke-Script "test-js.ps1"
Write-Section-End
