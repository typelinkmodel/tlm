$ErrorActionPreference = "Stop"
$ScriptPath            = $MyInvocation.MyCommand.Path
$ScriptDir             = Split-Path $ScriptPath
$CommonScript          = Join-Path $ScriptDir "common.ps1"
. $CommonScript

if (Test-Docker-Is-Running $PostgresContainer)
{
    Write-Warning "Container ${PostgresContainer} is already running."
}
else
{
    Write-Notice "Starting docker container ${POSTGRES_CONTAINER}…"
    docker run --rm `
        --name ${PostgresContainer} `
        -e "POSTGRES_USER=${PostgresUser}" `
        -e "POSTGRES_PASSWORD=${PostgresPassword}" `
        -e "POSTGRES_DB=${PostgresDatabase}" `
        -d `
        -p "${PostgresPort}:5432" `
        ${PostgresImage}
}
