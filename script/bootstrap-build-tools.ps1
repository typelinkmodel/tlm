$ErrorActionPreference = "Stop"
$ScriptPath            = $MyInvocation.MyCommand.Path
$ScriptDir             = Split-Path $ScriptPath
$WorkDir               = Split-Path $ScriptDir
$CommonScript          = Join-Path $ScriptDir "common.ps1"
. $CommonScript

Write-Notice "Bootstrapping tools…"

Push-Location $WorkDir
try
{
    pnpm install -r
}
finally
{
    Pop-Location
}
