$ErrorActionPreference = "Stop"
$ScriptPath            = $MyInvocation.MyCommand.Path
$ScriptDir             = Split-Path $ScriptPath
$WorkDir               = Split-Path $ScriptDir
$CommonScript          = Join-Path $ScriptDir "common.ps1"
. $CommonScript

Write-Notice "Testing SQL database…"

if (Test-Docker-Is-Running ${PgTapContainer})
{
    Write-Warning "Container ${PgTapContainer} is already running, please remove it."
}
if (! (Test-Docker-Is-Running ${PostgresContainer}))
{
    Write-Error "Container ${PostgresContainer} is not running, cannot run tests, use setup.ps1."
}

$SqlScriptDir = Join-Path $WorkDir $PgTapTestsDir

docker run -it --rm `
    --name ${PgTapContainer} `
    --link "${PostgresContainer}:db" `
    -v "${SqlScriptDir}:/test" `
    -e "USER=${PostgresUser}" `
    -e "PASSWORD=${PostgresPassword}" `
    -e "DATABASE=${PostgresDatabase}" `
    -e "HOST=db" `
    -e "PORT=5432" `
    -e "TESTS=/test/${PgTapTestsPattern}" `
    "${PgTapImage}" `
    /test.sh `
    -a -k
