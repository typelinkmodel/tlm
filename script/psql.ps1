$ErrorActionPreference = "Stop"
$ScriptPath            = $MyInvocation.MyCommand.Path
$ScriptDir             = Split-Path $ScriptPath
$CommonScript          = Join-Path $ScriptDir "common.ps1"
. $CommonScript

if (! (Test-Docker-Is-Running ${PostgresContainer}))
{
    Write-Warning "Container ${PostgresContainer} is not running, try setup.ps1."
}

Write-Notice "Running 'psql ${Args}' for ${PostgresContainer}/${PostgresDatabase}…"
docker exec -it ${PostgresContainer} psql -U ${PostgresUser} -d ${PostgresDatabase} $Args
