#!/usr/bin/env bash

# bind postgres to a different local port to not conflict with local development
if ($null -eq $PostgresPort)
{
    Set-Variable -Name PostgresPort -Value 5433 -Scope Script
}
else
{
    Set-Variable -Name PostgresPort -Value $($PostgresPort + 1) -Scope Script
}
