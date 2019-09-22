$ErrorActionPreference = "Stop"
$ScriptPath            = $MyInvocation.MyCommand.Path
$ScriptDir             = Split-Path $ScriptPath
$CommonScript          = Join-Path $ScriptDir "common.ps1"
. $CommonScript

Write-Notice "Install pgtap into ${PostgresContainer}…"

docker run -i --rm `
    --name ${PgTapContainer} `
    --link "${PostgresContainer}:db" `
    --entrypoint "/install.sh" `
    -e "USER=${PostgresUser}" `
    -e "PASSWORD=${PostgresPassword}" `
    -e "DATABASE=${PostgresDatabase}" `
    -e "HOST=db" `
    -e "PORT=5432" `
    "${PgTapImage}"
