$ErrorActionPreference = "Stop"
$ScriptPath            = $MyInvocation.MyCommand.Path
$ScriptDir             = Split-Path $ScriptPath
$WorkDir               = Split-Path $ScriptDir
$CommonScript          = Join-Path $ScriptDir "common.ps1"
. $CommonScript

Write-Notice "Setting up database schema ${PostgresContainer}/${PostgresDatabase}…"

function Wait-For-PSQL
{
    Write-InformationColored "Waiting for psql to be available..." -NoNewline
    $Waited = 0
    $oldErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "SilentlyContinue"
    while (! $(docker exec -i `
            $PostgresContainer `
            psql `
            -b `
            -v ON_ERROR_STOP=1 `
            -U $PostgresUser `
            -h localhost `
            -p 5432 `
            -c "SELECT TRUE;" >$null 2>$null
            ; $?))
    {
        Write-InformationColored "." -NoNewline
        Start-Sleep -ms 100
        $Waited = $Waited + 1
        if ($Waited -ge 10) {
            Write-Nost "X" -NoNewline
            break
        }
    }
    Write-InformationColored ""
    $ErrorActionPreference = $oldErrorActionPreference
}

function Invoke-SQL ([string]$Database, [Object]$File)
{
    Write-Notice "Running SQL script $($File.Name) on ${PostgresContainer}/${Database}…"
    Get-Content $File.FullName -Raw | docker exec -i `
        $PostgresContainer `
        psql `
        -b `
        -v ON_ERROR_STOP=1 `
        -U $PostgresUser `
        -h localhost `
        -p 5432 `
        -d $Database >$null
}

Wait-For-TCP localhost $PostgresPort
Wait-For-PSQL

$SqlScriptDir = Join-Path $WorkDir $PostgresScriptsDir
Get-ChildItem $SqlScriptDir -Filter *.pgsql | Foreach-Object {
    if ($_.Name -match 'db\.pgsql$')
    {
        Invoke-SQL -Database postgres -File $_
    }
    else
    {
        Invoke-SQL -Database $PostgresDatabase -File $_
    }
}
