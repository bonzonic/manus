[CmdletBinding()]
param(
    [string]$OutputDirectory = (Join-Path $PSScriptRoot 'parent-network-head-check-receipt'),
    [int]$MaxTimeSeconds = 10,
    [int]$ConnectTimeoutSeconds = 5
)

# Parent-only, bounded diagnostics. This script does not download bodies, install/extract
# an SDK, restore/build/test product code, read secrets, or change network policy.
$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
$curl = (Get-Command curl.exe -ErrorAction Stop).Source
$targets = @(
    'https://dot.net/v1/dotnet-install.ps1',
    'https://dotnetcli.blob.core.windows.net/dotnet/release-metadata/10.0/releases.json'
)
$rows = @()

foreach ($url in $targets) {
    $safeName = (($url -replace '^https://', '') -replace '[^A-Za-z0-9.-]', '_')
    $stdoutPath = Join-Path $OutputDirectory ($safeName + '.stdout.txt')
    $stderrPath = Join-Path $OutputDirectory ($safeName + '.stderr.txt')
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = $curl
    $psi.Arguments = '--head --location --silent --show-error --verbose --max-time ' + $MaxTimeSeconds + ' --connect-timeout ' + $ConnectTimeoutSeconds + ' "' + $url + '"'
    $psi.UseShellExecute = $false
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $psi.CreateNoWindow = $true
    $p = New-Object System.Diagnostics.Process
    $p.StartInfo = $psi
    $started = $p.Start()
    if (-not $started) { throw "Could not start curl.exe for $url" }
    $stdout = $p.StandardOutput.ReadToEnd()
    $stderr = $p.StandardError.ReadToEnd()
    $p.WaitForExit()
    $exitCode = $p.ExitCode
    [IO.File]::WriteAllText($stdoutPath, $stdout)
    [IO.File]::WriteAllText($stderrPath, $stderr)
    $rows += [pscustomobject]@{
        Url = $url
        ExitCode = $exitCode
        Stdout = $stdoutPath
        Stderr = $stderrPath
        TimestampUtc = [DateTime]::UtcNow.ToString('o')
    }
}

$receipt = [pscustomobject]@{
    Script = $PSCommandPath
    Curl = $curl
    EnvironmentNetworkDisabled = $env:MANUS_TERMINAL_NETWORK_DISABLED
    MaxTimeSeconds = $MaxTimeSeconds
    ConnectTimeoutSeconds = $ConnectTimeoutSeconds
    Targets = $rows
    Interpretation = 'Diagnostic only. Inspect stderr/stdout and exit codes; do not infer TLS/HTTP status when curl did not reach those layers.'
}
$receiptPath = Join-Path $OutputDirectory 'receipt.json'
$receipt | ConvertTo-Json -Depth 5 | Set-Content -Encoding UTF8 -Path $receiptPath
$receiptPath
if (($rows | Where-Object { $_.ExitCode -ne 0 }).Count -gt 0) { exit 1 }
exit 0
