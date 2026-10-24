$ErrorActionPreference = 'Stop'
$root = 'C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\outputs\mvp30'
$log = 'C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\verification\mvp30-L7GDB-20261024-1754\evidence\final-command-exits-20261024-1758.log'
Remove-Item -LiteralPath $log -Force -ErrorAction SilentlyContinue
function Run-Direct([string]$Name,[scriptblock]$Command) {
    Add-Content -LiteralPath $log -Value ("COMMAND $Name HOST_PID=$PID") -Encoding UTF8
    $text = (& $Command 2>&1 | Out-String)
    $ec = $LASTEXITCODE
    Add-Content -LiteralPath $log -Value ("OUTPUT_BEGIN $Name`n$text`nOUTPUT_END $Name`nEXIT $Name=$ec") -Encoding UTF8
    return $ec
}
Push-Location $root
try {
    $parser = Run-Direct 'parser' { powershell.exe -NoProfile -Command '$tokens=$null; $errors=$null; [System.Management.Automation.Language.Parser]::ParseFile((Resolve-Path ''.\VoiceMvp.ps1''), [ref]$tokens, [ref]$errors) | Out-Null; if ($errors.Count -gt 0) { $errors | ForEach-Object { $_.Message }; exit 1 }; ''SYNTAX_LOAD PASS''' }
    $self = Run-Direct 'copied-VoiceMvp-NoMicSelfTest' { powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\VoiceMvp.ps1 -NoMicSelfTest }
    $launcher = Run-Direct 'copied-launcher-NoMicSelfTest' { .\Launch-VoiceMvp.cmd -NoMicSelfTest }
    $idle = Run-Direct 'copied-VoiceMvp-IdleSmoke' { powershell.exe -NoProfile -STA -ExecutionPolicy Bypass -File .\VoiceMvp.ps1 -IdleSmoke }
    $wrapper = Run-Direct 'copied-Test-VoiceMvpNoMic' { powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\Test-VoiceMvpNoMic.ps1 }
} finally { Pop-Location }
if (($parser,$self,$launcher,$idle,$wrapper) -contains 0) { } else { exit 1 }
if ($parser -ne 0 -or $self -ne 0 -or $launcher -ne 0 -or $idle -ne 0 -or $wrapper -ne 0) { exit 1 }
Add-Content -LiteralPath $log -Value 'SUMMARY parser=0 copied-VoiceMvp-NoMicSelfTest=0 copied-launcher-NoMicSelfTest=0 copied-VoiceMvp-IdleSmoke=0 copied-Test-VoiceMvpNoMic=0' -Encoding UTF8

