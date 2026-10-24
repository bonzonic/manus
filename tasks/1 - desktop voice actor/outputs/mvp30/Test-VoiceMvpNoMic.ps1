$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$scriptPath = Join-Path $root 'VoiceMvp.ps1'
$captured = & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $scriptPath -NoMicSelfTest 2>&1 | Out-String
if ($LASTEXITCODE -ne 0) { throw "NO_MIC_SELFTEST process failed with exit $LASTEXITCODE`n$captured" }
if (-not $captured.Contains('NO_MIC_SELFTEST PASS')) { throw "NO_MIC_SELFTEST did not report PASS.`n$captured" }
if (-not $captured.Contains('stale-final-ignored')) { throw "Stale callback fence marker missing.`n$captured" }
if (-not $captured.Contains('clipboard-calls=0')) { throw "Clipboard side-effect marker missing.`n$captured" }
Write-Output 'Test-VoiceMvpNoMic PASS'
