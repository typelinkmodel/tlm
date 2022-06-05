using namespace System.Management.Automation

if (!(Test-Path variable:script:__CommonLoaded))
{
  $script:__CommonLoaded = $True

  function Initialize-Preference
  {
    #        Set-PSDebug -Trace 1
    #        Set-Variable -Name DebugPreference       -Value "Continue" -Scope Script -Force
    #        Set-Variable -Name VerbosePreference     -Value "Continue" -Scope Script -Force
    Set-Variable -Name InformationPreference -Value "Continue" -Scope Script -Force
    Set-Variable -Name WarningPreference     -Value "Continue" -Scope Script -Force
    Set-Variable -Name ErrorActionPreference -Value "Stop"     -Scope Script -Force
  }

  # from https://blog.kieranties.com/2018/03/26/write-information-with-colours
  Function Write-InformationColored
  {
    [CmdletBinding()]
    param(
      [Parameter(Mandatory)]
      [Object]$MessageData,
      [ConsoleColor]$ForegroundColor = $Host.UI.RawUI.ForegroundColor,
      [ConsoleColor]$BackgroundColor = $Host.UI.RawUI.BackgroundColor,
      [Switch]$NoNewline
    )

    $msg = [HostInformationMessage]@{
      Message = $MessageData
      ForegroundColor = $ForegroundColor
      BackgroundColor = $BackgroundColor
      NoNewline = $NoNewline.IsPresent
    }

    Write-Information $msg
  }

  function Write-Notice([string]$Message)
  {
    Write-InformationColored $Message -ForegroundColor Green
  }

  function Write-Section-Start([string]$Section)
  {
    Write-InformationColored "${SectionStartPrefix}${Section}" -ForegroundColor Green
  }

  function Write-Section-End
  {
    Write-InformationColored "${SectionEndMessage}" -ForegroundColor Green
  }

  function Write-ErrorNotice([string]$Message)
  {
    Write-InformationColored "${ErrorPrefix}${Message}" -ForegroundColor Red
  }

  function Invoke-Script([string]$ScriptName)
  {
    $ScriptPath = $script:MyInvocation.MyCommand.Path
    $ScriptDir = Split-Path $ScriptPath
    $Script = Join-Path $ScriptDir $ScriptName
    . $Script
  }

  function Initialize-Setting
  {
    $ScriptPath = $script:MyInvocation.MyCommand.Path
    $ScriptDir = Split-Path $ScriptPath
    $LocalSettingsScript = Join-Path $ScriptDir "settings-local.ps1"

    if (Test-Path -Path $LocalSettingsScript -PathType leaf)
    {
      . $LocalSettingsScript
    }

    if (Test-Path variable:script:ENV)
    {
      $EnvSettingsScript = Join-Path $ScriptDir "settings-${ENV}.ps1"
      if (Test-Path -Path $EnvSettingsScript -PathType leaf)
      {
        . $EnvSettingsScript
      }
    }

    $SettingsScript = Join-Path $ScriptDir "settings.ps1"
    . $SettingsScript
  }

  function Initialize-Env-Var
  {
    New-Item -Name POSTGRES_USER -Value $PostgresUser -ItemType Variable -Path Env: -Force > $null
    New-Item -Name POSTGRES_PASSWORD -Value $PostgresPassword -ItemType Variable -Path Env: -Force > $null
    New-Item -Name POSTGRES_DATABASE -Value $PostgresDatabase -ItemType Variable -Path Env: -Force > $null
    New-Item -Name POSTGRES_PORT -Value $PostgresPort -ItemType Variable -Path Env: -Force > $null
    New-Item -Name POSTGRES_HOST -Value $PostgresHost -ItemType Variable -Path Env: -Force > $null
  }

  function Test-Docker-Is-Running([string]$ContainerName)
  {
    if (docker ps -q -f "name=${ContainerName}")
    {
      return $True
    }
    else
    {
      return $False
    }
  }

  function Wait-For-TCP([string]$HostName, [int]$Port)
  {
    Write-Information "Waiting for connection to ${HostName}:${Port}…"
    if ($IsWindows)
    {
      $Waited = 0
      while (!(Test-NetConnection -ComputerName $HostName -Port $Port -InformationLevel Quiet))
      {
        Write-InformationColored "." -NoNewline
        Start-Sleep -ms 200
        $Waited = $Waited + 1
        if ($Waited -ge 20)
        {
          Write-InformationColored "X" -NoNewline -ForegroundColor Red
          break
        }
      }
      Write-Progress -Completed -Activity "Done waiting"
    }
    else
    {
      # Test-NetConnection is not available in PowerShell Core Mac/Linux
      $ScriptPath = $script:MyInvocation.MyCommand.Path
      $ScriptDir = Split-Path $ScriptPath
      Push-Location $ScriptDir
      try
      {
        bash wait-for-tcp.sh "${HostName}" "${Port}"
      }
      finally
      {
        Pop-Location
      }
    }
  }

  Initialize-Preference
  Initialize-Setting
  Initialize-Env-Var
}
