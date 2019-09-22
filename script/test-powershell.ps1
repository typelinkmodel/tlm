$ErrorActionPreference = "Stop"
$ScriptPath            = $MyInvocation.MyCommand.Path
$ScriptDir             = Split-Path $ScriptPath
$CommonScript          = Join-Path $ScriptDir "common.ps1"
. $CommonScript

Write-Notice "Analyzing PowerShell…"

$errors = Invoke-ScriptAnalyzer $ScriptDir `
    -ExcludeRule PSUseBOMForUnicodeEncodedFile

if ($errors)
{
    foreach ($error in $errors)
    {
        Write-ErrorNotice "$($error.ScriptName):$($error.Line): [$($error.RuleName)] $($error.Message)"
    }
    throw "…PowerShell errors found!"
}
