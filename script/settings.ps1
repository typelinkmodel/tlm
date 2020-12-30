#!/usr/bin/env bash

function Initialize-Default-Variable ([string]$VariableName, [string]$DefaultValue)
{
    if (! (Test-Path variable:script:$VariableName))
    {
        Set-Variable -Name $VariableName -Value $DefaultValue -Scope Script
    }
}

if ($IsWindows)
{
    $user = $env:UserName
}
else
{
    $user = $env:USER
}

Initialize-Default-Variable ENV                d
Initialize-Default-Variable STACK              $user

Initialize-Default-Variable NodeVersion        10.16.0
Initialize-Default-Variable BuildContainer     ${ENV}-${STACK}-build
Initialize-Default-Variable NodeImage          node:${NodeVersion}

Initialize-Default-Variable PostgresUser       postgres
Initialize-Default-Variable PostgresPassword   postgres
Initialize-Default-Variable PostgresDatabase   tlm
Initialize-Default-Variable PostgresPort       5432
Initialize-Default-Variable PostgresHost       localhost
Initialize-Default-Variable PostgresContainer  ${ENV}-${STACK}-psql-${PostgresDatabase}
Initialize-Default-Variable PostgresImage      postgres
Initialize-Default-Variable PostgresScriptsDir $(Join-Path `
        -Path packages `
        -ChildPath tlm-pgsql `
        -AdditionalChildPath sql)

Initialize-Default-Variable PgTapContainer     ${ENV}-${STACK}-pgtap-${PostgresDatabase}
Initialize-Default-Variable PgTapImage         lsimons/pgtap
Initialize-Default-Variable PgTapTestsDir      $(Join-Path `
        -Path packages `
        -ChildPath tlm-pgsql `
        -AdditionalChildPath test-sql)
Initialize-Default-Variable PgTapTestsPattern  *.sql

Initialize-Default-Variable SectionStartPrefix "==> "
Initialize-Default-Variable SectionEndMessage  ""
Initialize-Default-Variable ErrorPrefix        "ERROR: "
