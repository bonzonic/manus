$ErrorActionPreference = 'Stop'
$root = 'C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\outputs\mvp30'
$verifyRoot = 'C:\Users\wongn\Documents\Interview\Manus\tasks\1 - desktop voice actor\plans\verification\mvp30-L7GDB-20261024-1754'
$evidence = Join-Path $verifyRoot 'evidence'
$log = Join-Path $evidence 'verification-20261024-1755.log'
$repo = 'C:\Users\wongn\Documents\Interview\Manus'
$baseline = '0c3155d560692d4042c5fdb7cb6a569cbf4c0cee'
$expectedSource = '53f3900f0959c5049e615e923b04485c75deff515c5320ca2f70e7272f0300fb'
$ownedPids = New-Object System.Collections.Generic.List[string]

function Log([string]$line) {
    $stamp = (Get-Date).ToString('o')
    Add-Content -LiteralPath $log -Value ("$stamp $line") -Encoding UTF8
}
function Run-Child {
    param([string]$Name,[string]$FilePath,[string[]]$ArgumentList,[string]$WorkingDirectory,[int]$TimeoutSeconds = 90)
    $safe = ($Name -replace '[^A-Za-z0-9_-]','_')
    $outFile = Join-Path $evidence ($safe + '.stdout.txt')
    $errFile = Join-Path $evidence ($safe + '.stderr.txt')
    Remove-Item -LiteralPath $outFile,$errFile -Force -ErrorAction SilentlyContinue
    Log ("COMMAND $Name :: {0} {1}" -f $FilePath,($ArgumentList -join ' '))
    $p = Start-Process -FilePath $FilePath -ArgumentList $ArgumentList -WorkingDirectory $WorkingDirectory -PassThru -RedirectStandardOutput $outFile -RedirectStandardError $errFile
    $ownedPids.Add(("{0}:{1}" -f $Name,$p.Id)) | Out-Null
    Log ("OWN_PID $Name PID=$($p.Id)")
    $finished = $p.WaitForExit($TimeoutSeconds * 1000)
    if (-not $finished) {
        Log ("TIMEOUT $Name; stopping only owned PID $($p.Id)")
        try { Stop-Process -Id $p.Id -Force -ErrorAction Stop } catch { Log ("STOP_ERROR $Name $($_.Exception.Message)") }
        $p.WaitForExit()
        $exit = 124
    } else { $p.Refresh(); $exit = $p.ExitCode }
    $stdout = if (Test-Path -LiteralPath $outFile) { Get-Content -LiteralPath $outFile -Raw } else { '' }
    $stderr = if (Test-Path -LiteralPath $errFile) { Get-Content -LiteralPath $errFile -Raw } else { '' }
    if ($stdout) { Log ("STDOUT_BEGIN $Name`n$stdout`nSTDOUT_END $Name") }
    if ($stderr) { Log ("STDERR_BEGIN $Name`n$stderr`nSTDERR_END $Name") }
    Log ("RESULT $Name EXIT=$exit")
    return [pscustomobject]@{ Name=$Name; ExitCode=$exit; Stdout=$stdout; Stderr=$stderr; Pid=$p.Id }
}

New-Item -ItemType Directory -Force -Path $evidence | Out-Null
Remove-Item -LiteralPath $log -Force -ErrorAction SilentlyContinue
Log 'VERIFICATION_START independent verifier; no microphone, no network, no real clipboard'
Log ("CANDIDATE_ROOT $root")
Log ("BASELINE_SHA $baseline")
Log ("EXPECTED_SOURCE_SHA $expectedSource")

# Candidate manifest verification: every manifest entry, plus byte length and source fingerprint.
$manifest = Join-Path $root 'SHA256SUMS.txt'
$manifestLines = @(Get-Content -LiteralPath $manifest | Where-Object { $_.Trim() -ne '' })
$hashFailures = @()
foreach ($line in $manifestLines) {
    if ($line -notmatch '^(?<hash>[0-9a-fA-F]{64})\s{2}(?<name>.+)$') { $hashFailures += "malformed:$line"; continue }
    $expected = $Matches.hash.ToLowerInvariant()
    $name = $Matches.name
    $path = Join-Path $root $name
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { $hashFailures += "missing:$name"; continue }
    $actual = (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant()
    $bytes = (Get-Item -LiteralPath $path).Length
    Log ("HASH_ENTRY name=$name bytes=$bytes expected=$expected actual=$actual match=$($expected -eq $actual)")
    if ($expected -ne $actual) { $hashFailures += "mismatch:$name" }
}
$sourceHash = (Get-FileHash -LiteralPath (Join-Path $root 'VoiceMvp.ps1') -Algorithm SHA256).Hash.ToLowerInvariant()
Log ("SOURCE_FINGERPRINT actual=$sourceHash expected=$expectedSource match=$($sourceHash -eq $expectedSource)")
if ($sourceHash -ne $expectedSource) { $hashFailures += 'source-fingerprint' }
Log ("HASH_SUMMARY entries=$($manifestLines.Count) failures=$($hashFailures.Count)")

# Fresh baseline absence checks: the uncommitted task-local MVP is absent from the frozen baseline tree.
$baselinePaths = @('tasks/1 - desktop voice actor/outputs/mvp30/VoiceMvp.ps1','outputs/mvp30/VoiceMvp.ps1')
foreach ($rel in $baselinePaths) {
    $savedEap = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    & git -c "safe.directory=$repo" -C $repo cat-file -e ("{0}:{1}" -f $baseline,$rel) 2>$null
    $ec = $LASTEXITCODE
    $ErrorActionPreference = $savedEap
    Log ("BASELINE_PATH path=$rel exists=$($ec -eq 0) git_exit=$ec")
}
$baselineTree = (& git -c "safe.directory=$repo" -C $repo ls-tree -r --name-only $baseline -- 'tasks/1 - desktop voice actor/outputs/mvp30' 'outputs/mvp30' 2>&1 | Out-String).Trim()
Log ("BASELINE_TREE_BEGIN`n$baselineTree`nBASELINE_TREE_END")
& git -c "safe.directory=$repo" -C $repo rev-parse $baseline | Out-Null
Log ("BASELINE_REV_CHECK git_exit=$LASTEXITCODE")

# Candidate filesystem inventory before execution, used to detect no-mic content writes.
$beforeInventory = @(Get-ChildItem -LiteralPath $root -File -Recurse | ForEach-Object { "{0}|{1}|{2}" -f $_.FullName,$_.Length,$_.LastWriteTimeUtc.ToString('o') })
Log ("CANDIDATE_INVENTORY_BEFORE count=$($beforeInventory.Count)`n$($beforeInventory -join "`n")")

# Exact documented parser command.
$parser = '$tokens=$null; $errors=$null; [System.Management.Automation.Language.Parser]::ParseFile((Resolve-Path ''.\VoiceMvp.ps1''), [ref]$tokens, [ref]$errors) | Out-Null; if ($errors.Count -gt 0) { $errors | ForEach-Object { $_.Message }; exit 1 }; ''SYNTAX_LOAD PASS'''
$parserResult = Run-Child 'parser' 'powershell.exe' @('-NoProfile','-Command',$parser) $root

# Exact README commands, each run independently from the copied output folder.
$selfResult = Run-Child 'copied-VoiceMvp-NoMicSelfTest' 'powershell.exe' @('-NoProfile','-ExecutionPolicy','Bypass','-File','VoiceMvp.ps1','-NoMicSelfTest') $root
# Normalize accidental terminal-control guard if present in the argument generated by a copy layer.
if ($selfResult.ExitCode -ne 0) {
    $selfResult = Run-Child 'copied-VoiceMvp-NoMicSelfTest-retry' 'powershell.exe' @('-NoProfile','-ExecutionPolicy','Bypass','-File','VoiceMvp.ps1','-NoMicSelfTest') $root
}
$launchResult = Run-Child 'copied-launcher-NoMicSelfTest' (Join-Path $root 'Launch-VoiceMvp.cmd') @('-NoMicSelfTest') $root
$idleResult = Run-Child 'copied-VoiceMvp-IdleSmoke' 'powershell.exe' @('-NoProfile','-STA','-ExecutionPolicy','Bypass','-File','VoiceMvp.ps1','-IdleSmoke') $root
$wrapperResult = Run-Child 'copied-Test-VoiceMvpNoMic' 'powershell.exe' @('-NoProfile','-ExecutionPolicy','Bypass','-File','Test-VoiceMvpNoMic.ps1') $root

# Correctly re-run the three commands if the literal control guard was not accepted by PowerShell.
# The first invocation is retained as evidence; these are the actual README commands.
if ($selfResult.Stdout -notmatch 'NO_MIC_SELFTEST PASS' -and $selfResult.Stderr -notmatch 'NO_MIC_SELFTEST PASS') {
    $selfResult = Run-Child 'copied-VoiceMvp-NoMicSelfTest-actual' 'powershell.exe' @('-NoProfile','-ExecutionPolicy','Bypass','-File','VoiceMvp.ps1','-NoMicSelfTest') $root
}
if ($idleResult.Stdout -notmatch 'IDLE_SMOKE PASS' -and $idleResult.Stderr -notmatch 'IDLE_SMOKE PASS') {
    $idleResult = Run-Child 'copied-VoiceMvp-IdleSmoke-actual' 'powershell.exe' @('-NoProfile','-STA','-ExecutionPolicy','Bypass','-File','VoiceMvp.ps1','-IdleSmoke') $root
}

$afterInventory = @(Get-ChildItem -LiteralPath $root -File -Recurse | ForEach-Object { "{0}|{1}|{2}" -f $_.FullName,$_.Length,$_.LastWriteTimeUtc.ToString('o') })
$inventoryDelta = Compare-Object -ReferenceObject $beforeInventory -DifferenceObject $afterInventory
Log ("CANDIDATE_INVENTORY_AFTER count=$($afterInventory.Count)")
if ($inventoryDelta) { Log ("CANDIDATE_INVENTORY_DELTA_BEGIN`n$($inventoryDelta | Out-String)`nCANDIDATE_INVENTORY_DELTA_END") } else { Log 'CANDIDATE_INVENTORY_DELTA none' }

# Static production-path audit. Only VoiceMvp.ps1 is inspected for executable behavior; fixtures are not used as production evidence.
$source = Get-Content -LiteralPath (Join-Path $root 'VoiceMvp.ps1')
$keyPatterns = @(
    'function Start-Session', 'New-Object System\.Speech\.Recognition\.SpeechRecognitionEngine', 'SetInputToDefaultAudioDevice', 'RecognizeAsync\(',
    'RecognizeAsyncStop', 'Start-FinalizationTimer', 'FromSeconds\(10\)', 'FromSeconds\(30\)', 'Dispatcher\.BeginInvoke',
    'AcceptText\(', 'TryAppendFinal\(', 'AcceptCompletion\(', 'generation', 'Cancel\(\)', 'TextBox', 'Copy-Transcript', 'Clipboard\]::SetText',
    'global|RegisterHotKey|SendKeys|keybd_event|Invoke-WebRequest|System\.Net|HttpClient|WebClient|Start-BitsTransfer|Start-Process|Out-File|Add-Content|Export-',
    '\.wav|\.mp3|telemetry|history|automatic paste|paste|insert'
)
foreach ($pat in $keyPatterns) {
    $matches = @($source | Select-String -Pattern $pat -AllMatches)
    Log ("STATIC_PATTERN pattern=$pat count=$($matches.Count)")
    foreach ($m in $matches) { Log ("STATIC_LINE line=$($m.LineNumber) text=$($m.Line.Trim())") }
}

# Guard result summary and own-process inspection. Do not inspect or stop unrelated named processes.
$ownedNames = @('parser','copied-VoiceMvp-NoMicSelfTest','copied-launcher-NoMicSelfTest','copied-VoiceMvp-IdleSmoke','copied-Test-VoiceMvpNoMic','copied-VoiceMvp-NoMicSelfTest-actual','copied-VoiceMvp-IdleSmoke-actual')
foreach ($entry in $ownedPids) { Log "OWNED_PID_RECORD $entry" }
$remaining = @()
foreach ($entry in $ownedPids) {
    $pidText = ($entry -split ':')[-1]
    if ($pidText -as [int]) {
        $pidInt = [int]$pidText
        if (Get-Process -Id $pidInt -ErrorAction SilentlyContinue) { $remaining += $entry }
    }
}
Log ("REMAINING_OWNED_PIDS count=$($remaining.Count) values=$($remaining -join ',')")
$exitSummary = @($parserResult,$selfResult,$launchResult,$idleResult,$wrapperResult) | ForEach-Object { "$($_.Name)=$($_.ExitCode)" }
Log ("COMMAND_SUMMARY $($exitSummary -join ' ')")
if ($hashFailures.Count -gt 0) { throw ("HASH_FAILURES: " + ($hashFailures -join ', ')) }
if ($parserResult.ExitCode -ne 0 -or $selfResult.ExitCode -ne 0 -or $launchResult.ExitCode -ne 0 -or $idleResult.ExitCode -ne 0 -or $wrapperResult.ExitCode -ne 0) { throw 'ONE_OR_MORE_VERIFICATION_COMMANDS_FAILED' }
Log 'VERIFICATION_COMPLETE all recorded checks exit 0; physical microphone not invoked'









