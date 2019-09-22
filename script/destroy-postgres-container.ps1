$ScriptPath            = $MyInvocation.MyCommand.Path
$ScriptDir             = Split-Path $ScriptPath
$CommonScript          = Join-Path $ScriptDir "common.ps1"
. $CommonScript
$ErrorActionPreference = "Continue"

Write-Notice "Stopping docker container ${PostgresContainer}…"
docker stop ${PostgresContainer}
