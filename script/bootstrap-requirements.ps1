$ErrorActionPreference = "Stop"
$ScriptPath = $MyInvocation.MyCommand.Path
$ScriptDir = Split-Path $ScriptPath
$CommonScript = Join-Path $ScriptDir "common.ps1"
. $CommonScript

$script:MissingDependency = $False

function Test-Command-Available([string]$Command)
{
  if (!(Get-Command $Command))
  {
    Write-ErrorNotice "Missing dependency ${Command}"
    $script:MissingDependency = $True
  }
}

function Install-PNPM()
{
  if (!(Get-Command pnpm))
  {
    corepack enable
  }
}

Write-Notice "Checking requirements are met…"
$ErrorActionPreference = "SilentlyContinue"

Test-Command-Available git
Test-Command-Available docker
Test-Command-Available node
# Test-Command-Available nvm

Install-PNPM

Install-Module "PSScriptAnalyzer" -Repository "PSGallery" -Force

if ($script:MissingDependency)
{
  throw "Missing dependency!"
}
else
{
  Write-Notice "…requirements ok"
}

$ErrorActionPreference = "Stop"
