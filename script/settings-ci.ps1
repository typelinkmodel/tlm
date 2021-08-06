#!/usr/bin/env bash

# bind postgres to a different local port to not conflict with local development
if ($null -eq $PostgresPort)
{
  Set-Variable -Name PostgresPort -Value 5433 -Scope Script
}
else
{
  Set-Variable -Name PostgresPort -Value $( $PostgresPort + 1 ) -Scope Script
}

# github action workflow command output
#   see https://docs.github.com/en/free-pro-team@latest/actions/reference/workflow-commands-for-github-actions
Set-Variable -Name SectionStartPrefix -Value "::group::" -Scope Script
Set-Variable -Name SectionEndMessage -Value "::endgroup::" -Scope Script
Set-Variable -Name ErrorPrefix -Value "::error::" -Scope Script
