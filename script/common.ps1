using namespace System.Management.Automation

if (! (Test-Path variable:script:__CommonLoaded))
{
    $script:__CommonLoaded = $True

    function Initialize-Preferences
    {
        # Set-PSDebug -Trace 1
        # Set-Variable -Name DebugPreference       -Value "Continue" -Scope Script -Force
        # Set-Variable -Name VerbosePreference     -Value "Continue" -Scope Script -Force
        Set-Variable -Name InformationPreference -Value "Continue" -Scope Script -Force
        Set-Variable -Name WarningPreference     -Value "Continue" -Scope Script -Force
        Set-Variable -Name ErrorActionPreference -Value "Stop"     -Scope Script -Force
    }

    # from https://blog.kieranties.com/2018/03/26/write-information-with-colours
    Function Write-InformationColored {
        [CmdletBinding()]
        param(
            [Parameter(Mandatory)]
            [Object]$MessageData,
            [ConsoleColor]$ForegroundColor = $Host.UI.RawUI.ForegroundColor,
            [ConsoleColor]$BackgroundColor = $Host.UI.RawUI.BackgroundColor,
            [Switch]$NoNewline
        )

        $msg = [HostInformationMessage]@{
            Message         = $MessageData
            ForegroundColor = $ForegroundColor
            BackgroundColor = $BackgroundColor
            NoNewline       = $NoNewline.IsPresent
        }

        Write-Information $msg
    }

    function Write-Notice ([string]$Message)
    {
        Write-InformationColored $Message -ForegroundColor Green
    }

    function Write-ErrorNotice ([string]$Message)
    {
        Write-InformationColored $Message -ForegroundColor Red
    }

    function Invoke-Script ([string]$ScriptName)
    {
        $ScriptPath = $script:MyInvocation.MyCommand.Path
        $ScriptDir = Split-Path $ScriptPath
        $Script = Join-Path $ScriptDir $ScriptName
        . $Script
    }

    function Initialize-Settings
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

    function Test-Docker-Is-Running ([string]$ContainerName)
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

    function Wait-For-TCP ([string]$HostName, [int]$Port)
    {
        Write-Information "Waiting for connection to ${HostName}:${Port}…"
        if ($IsWindows) {
            while (!(Test-NetConnection -ComputerName $HostName -Port $Port -InformationLevel Quiet)) {
                Start-Sleep -ms 200
            }
            Write-Progress -Completed -Activity "Done waiting"
        } else {
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

    Initialize-Preferences
    Initialize-Settings
}
