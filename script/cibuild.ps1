if (! (Test-Path variable:script:ENV))
{
    Set-Variable -Name ENV -Value ci -Scope Script
}

$ScriptPath            = $MyInvocation.MyCommand.Path
$ScriptDir             = Split-Path $ScriptPath
$CommonScript          = Join-Path $ScriptDir "common.ps1"
. $CommonScript

Write-Notice "==> cibuild"

Invoke-Script "bootstrap.ps1"
Invoke-Script "setup.ps1"
Invoke-Script "server.ps1"
Invoke-Script "test.ps1"
Invoke-Script "destroy.ps1"
