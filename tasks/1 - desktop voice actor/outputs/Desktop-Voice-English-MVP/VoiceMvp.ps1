#requires -version 5.1
[CmdletBinding()]
param(
    [switch]$NoMicSelfTest,
    [switch]$IdleSmoke
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'

class VoiceMvpSession {
    [string]$Phase
    [int]$Generation
    [string]$Transcript

    VoiceMvpSession() {
        $this.Phase = 'Idle'
        $this.Generation = 0
        $this.Transcript = ''
    }

    [void] BeginSession() {
        if (@('Starting','Listening','Finalizing') -contains $this.Phase) {
            throw 'A voice session is already active.'
        }
        $this.Generation++
        $this.Phase = 'Starting'
        $this.Transcript = ''
    }

    [void] MarkListening() {
        if ($this.Phase -eq 'Starting') {
            $this.Phase = 'Listening'
        }
    }

    [void] RequestStop() {
        if (@('Starting','Listening') -contains $this.Phase) {
            $this.Phase = 'Finalizing'
        }
    }

    [bool] AcceptText([int]$callbackGeneration) {
        return ($callbackGeneration -eq $this.Generation -and @('Starting','Listening') -contains $this.Phase)
    }

    [bool] TryAppendFinal([int]$callbackGeneration, [string]$text) {
        if (-not $this.AcceptText($callbackGeneration)) {
            return $false
        }
        if (-not [string]::IsNullOrWhiteSpace($text)) {
            if ([string]::IsNullOrWhiteSpace($this.Transcript)) {
                $this.Transcript = $text.Trim()
            } else {
                $this.Transcript = ($this.Transcript.Trim() + ' ' + $text.Trim())
            }
        }
        return $true
    }

    [bool] AcceptCompletion([int]$callbackGeneration) {
        return ($callbackGeneration -eq $this.Generation -and $this.Phase -eq 'Finalizing')
    }

    [void] CompleteSession([int]$callbackGeneration) {
        if ($this.AcceptCompletion($callbackGeneration)) {
            $this.Phase = 'Ready'
        }
    }

    [void] Cancel() {
        $this.Generation++
        $this.Phase = 'Cancelled'
        $this.Transcript = ''
    }

    [void] Fail() {
        $this.Generation++
        $this.Phase = 'Error'
    }

    [void] ClearTranscript() {
        $this.Transcript = ''
    }
}

$script:session = [VoiceMvpSession]::new()
$script:window = $null
$script:languageCombo = $null
$script:statusText = $null
$script:partialText = $null
$script:reviewText = $null
$script:startButton = $null
$script:stopButton = $null
$script:cancelButton = $null
$script:copyButton = $null
$script:clearButton = $null
$script:engine = $null
$script:sessionTimer = $null
$script:finalizationTimer = $null
$script:hadHypothesis = $false
$script:stopReason = ''
$script:startupError = $null
$script:recognizers = @()

function Set-UiState {
    if ($null -eq $script:statusText) { return }
    $phase = $script:session.Phase
    $script:startButton.IsEnabled = (@('Idle','Ready','Cancelled','Error') -contains $phase)
    $script:stopButton.IsEnabled = (@('Starting','Listening') -contains $phase)
    $script:cancelButton.IsEnabled = (@('Starting','Listening','Finalizing') -contains $phase)
    $script:copyButton.IsEnabled = ($phase -eq 'Ready' -and -not [string]::IsNullOrWhiteSpace($script:reviewText.Text))
    $script:clearButton.IsEnabled = (@('Idle','Ready','Cancelled','Error') -contains $phase)

    switch ($phase) {
        'Idle' { $script:statusText.Text = 'Idle - no microphone is open. Click Start to begin.' }
        'Starting' { $script:statusText.Text = 'Starting - preparing the selected Windows SAPI recognizer.' }
        'Listening' { $script:statusText.Text = 'Listening - microphone is open only because Start was clicked.' }
        'Finalizing' { $script:statusText.Text = 'Finalizing - waiting up to 10 seconds for the stopped recognizer.' }
        'Ready' { $script:statusText.Text = 'Ready - review or edit the transcript, then click Copy manually.' }
        'Cancelled' { $script:statusText.Text = 'Cancelled - the session transcript was discarded. Click Start to try again.' }
        'Error' { if ([string]::IsNullOrWhiteSpace($script:statusText.Text)) { $script:statusText.Text = 'Error - see the next-action message below.' } }
    }
}

function Set-VisibleError {
    param([Parameter(Mandatory=$true)][string]$Message)
    $script:session.Fail()
    if ($null -ne $script:sessionTimer) { $script:sessionTimer.Stop(); $script:sessionTimer = $null }
    if ($null -ne $script:finalizationTimer) { $script:finalizationTimer.Stop(); $script:finalizationTimer = $null }
    Dispose-Engine
    if ($null -ne $script:statusText) { $script:statusText.Text = "Error - $Message" }
    if ($null -ne $script:partialText) { $script:partialText.Text = 'Live partials unavailable after this error.' }
    Set-UiState
}

function Dispose-Engine {
    $oldEngine = $script:engine
    $script:engine = $null
    if ($null -ne $oldEngine) {
        try { $oldEngine.Dispose() } catch { }
    }
}

function Start-FinalizationTimer {
    param([int]$SessionGeneration)
    if ($null -ne $script:finalizationTimer) { $script:finalizationTimer.Stop() }
    $timer = New-Object System.Windows.Threading.DispatcherTimer
    $timer.Interval = [TimeSpan]::FromSeconds(10)
    $timerScript = {
        $timer.Stop()
        if ($script:session.Generation -eq $SessionGeneration -and $script:session.Phase -eq 'Finalizing') {
            Set-VisibleError 'recognizer finalization timed out. Use Start to retry manually, or use any editable text already shown.'
        }
    }.GetNewClosure()
    $timer.Add_Tick($timerScript)
    $script:finalizationTimer = $timer
    $timer.Start()
}

function Start-SessionLimitTimer {
    param([int]$SessionGeneration)
    if ($null -ne $script:sessionTimer) { $script:sessionTimer.Stop() }
    $timer = New-Object System.Windows.Threading.DispatcherTimer
    $timer.Interval = [TimeSpan]::FromSeconds(30)
    $timerScript = {
        $timer.Stop()
        if ($script:session.Generation -eq $SessionGeneration -and @('Starting','Listening') -contains $script:session.Phase) {
            Stop-Session 'Session limit reached at 30 seconds.'
        }
    }.GetNewClosure()
    $timer.Add_Tick($timerScript)
    $script:sessionTimer = $timer
    $timer.Start()
}

function Complete-Session {
    param(
        [int]$SessionGeneration,
        [string]$ErrorMessage,
        [bool]$WasCancelled
    )
    if ($WasCancelled) { return }
    if (-not $script:session.AcceptCompletion($SessionGeneration)) { return }
    if ($null -ne $script:finalizationTimer) { $script:finalizationTimer.Stop(); $script:finalizationTimer = $null }
    if ($null -ne $script:sessionTimer) { $script:sessionTimer.Stop(); $script:sessionTimer = $null }
    if (-not [string]::IsNullOrWhiteSpace($ErrorMessage)) {
        Set-VisibleError "recognition could not finalize: $ErrorMessage. Allow microphone access and click Start again, or use the editable text."
        return
    }
    $script:session.CompleteSession($SessionGeneration)
    Dispose-Engine
    if (-not $script:hadHypothesis) {
        $script:partialText.Text = 'Live partials unavailable - this recognizer emitted no hypotheses during the session.'
    }
    if (-not [string]::IsNullOrWhiteSpace($script:stopReason)) {
        $script:statusText.Text = "Ready - $script:stopReason Review or edit, then click Copy manually."
    }
    Set-UiState
}

function Stop-Session {
    param([string]$Reason = 'Stopped by user.')
    if (-not (@('Starting','Listening') -contains $script:session.Phase)) { return }
    $sessionGeneration = $script:session.Generation
    $script:stopReason = $Reason
    $script:session.RequestStop()
    if ($null -ne $script:sessionTimer) { $script:sessionTimer.Stop(); $script:sessionTimer = $null }
    Set-UiState
    if ($null -eq $script:engine) {
        Set-VisibleError 'no recognizer engine was available to stop. Choose the installed English language and click Start again.'
        return
    }
    try {
        $script:engine.RecognizeAsyncStop()
        Start-FinalizationTimer $sessionGeneration
    } catch {
        Set-VisibleError "stop failed: $($_.Exception.Message). Retry manually with Start and check microphone permission."
    }
}

function Cancel-Session {
    if (-not (@('Starting','Listening','Finalizing') -contains $script:session.Phase)) { return }
    # Invalidate before touching the engine so every late callback is stale.
    $script:session.Cancel()
    if ($null -ne $script:sessionTimer) { $script:sessionTimer.Stop(); $script:sessionTimer = $null }
    if ($null -ne $script:finalizationTimer) { $script:finalizationTimer.Stop(); $script:finalizationTimer = $null }
    $oldEngine = $script:engine
    $script:engine = $null
    if ($null -ne $oldEngine) {
        try { $oldEngine.RecognizeAsyncCancel() } catch { }
        try { $oldEngine.Dispose() } catch { }
    }
    $script:reviewText.Text = ''
    $script:session.ClearTranscript()
    $script:partialText.Text = 'Live partials cleared.'
    Set-UiState
}

function Copy-Transcript {
    if ($script:session.Phase -ne 'Ready' -or [string]::IsNullOrWhiteSpace($script:reviewText.Text)) {
        return
    }
    try {
        [System.Windows.Clipboard]::SetText($script:reviewText.Text)
        $script:statusText.Text = 'Copied manually to the clipboard. No other application was targeted.'
    } catch {
        $script:statusText.Text = "Error - clipboard copy failed: $($_.Exception.Message). Use Ctrl+A/Ctrl+C in the editable review box."
        $script:session.Phase = 'Error'
    }
    Set-UiState
}

function Clear-Transcript {
    if (@('Starting','Listening','Finalizing') -contains $script:session.Phase) { return }
    $script:reviewText.Text = ''
    $script:session.ClearTranscript()
    $script:partialText.Text = 'Live partials: waiting for a new session.'
    Set-UiState
}

function Start-Session {
    if (-not (@('Idle','Ready','Cancelled','Error') -contains $script:session.Phase)) { return }
    $selected = $script:languageCombo.SelectedItem
    if ($null -eq $selected) {
        Set-VisibleError 'no installed English (en-US) recognizer was discovered. Install/enable one, then relaunch this MVP.'
        return
    }
    $script:session.BeginSession()
    $sessionGeneration = $script:session.Generation
    $script:hadHypothesis = $false
    $script:stopReason = ''
    $script:reviewText.Text = ''
    $script:partialText.Text = 'Live partials: waiting for this recognizer.'
    Set-UiState

    try {
        # This is the only code path that creates an engine, opens the default
        # audio device, and starts recognition.
        $script:engine = New-Object System.Speech.Recognition.SpeechRecognitionEngine($selected.Culture)
        $hypothesisHandler = {
            param($sender, $eventArgs)
            $text = [string]$eventArgs.Result.Text
            $uiScript = {
                if ($script:session.AcceptText($sessionGeneration)) {
                    if (-not [string]::IsNullOrWhiteSpace($text)) {
                        $script:hadHypothesis = $true
                        $script:partialText.Text = "Live partial: $text"
                    }
                }
            }.GetNewClosure()
            $null = $script:window.Dispatcher.BeginInvoke([System.Action]$uiScript)
        }.GetNewClosure()
        $recognizedHandler = {
            param($sender, $eventArgs)
            $text = [string]$eventArgs.Result.Text
            $uiScript = {
                if ($script:session.TryAppendFinal($sessionGeneration, $text)) {
                    $script:reviewText.Text = $script:session.Transcript
                }
            }.GetNewClosure()
            $null = $script:window.Dispatcher.BeginInvoke([System.Action]$uiScript)
        }.GetNewClosure()
        $completedHandler = {
            param($sender, $eventArgs)
            $completionError = ''
            if ($null -ne $eventArgs.Error) { $completionError = [string]$eventArgs.Error.Message }
            $wasCancelled = [bool]$eventArgs.Cancelled
            $uiScript = {
                Complete-Session $sessionGeneration $completionError $wasCancelled
            }.GetNewClosure()
            $null = $script:window.Dispatcher.BeginInvoke([System.Action]$uiScript)
        }.GetNewClosure()
        $script:engine.add_SpeechHypothesized($hypothesisHandler)
        $script:engine.add_SpeechRecognized($recognizedHandler)
        $script:engine.add_RecognizeCompleted($completedHandler)
        $script:engine.SetInputToDefaultAudioDevice()
        $script:session.MarkListening()
        Set-UiState
        $script:engine.RecognizeAsync([System.Speech.Recognition.RecognizeMode]::Multiple)
        Start-SessionLimitTimer $sessionGeneration
    } catch {
        Set-VisibleError "microphone or recognizer setup failed: $($_.Exception.Message). Allow microphone access and check the default input device, then click Start again. No automatic retry was attempted."
    }
}

function Discover-InstalledEnglish {
    try {
        Add-Type -AssemblyName System.Speech
        $found = @([System.Speech.Recognition.SpeechRecognitionEngine]::InstalledRecognizers())
        foreach ($info in $found) {
            if ($null -ne $info.Culture -and $info.Culture.Name -eq 'en-US') {
                $script:recognizers += $info
            }
        }
    } catch {
        $script:startupError = "System.Speech could not load: $($_.Exception.Message). Use Windows PowerShell 5.1 with the .NET Framework speech assembly."
    }
}

function New-MvpWindow {
    try {
        Add-Type -AssemblyName PresentationFramework, PresentationCore, WindowsBase
    } catch {
        throw "WPF could not load: $($_.Exception.Message)"
    }
    Discover-InstalledEnglish

    $script:window = New-Object System.Windows.Window
    $script:window.Title = 'Desktop Voice Actor - Experimental English MVP'
    $script:window.Width = 780
    $script:window.Height = 570
    $script:window.MinWidth = 620
    $script:window.MinHeight = 460
    $script:window.WindowStartupLocation = 'CenterScreen'

    $panel = New-Object System.Windows.Controls.StackPanel
    $panel.Margin = New-Object System.Windows.Thickness(16)
    $script:window.Content = $panel

    $heading = New-Object System.Windows.Controls.TextBlock
    $heading.Text = 'Experimental local Windows SAPI voice MVP (English only)'
    $heading.FontSize = 18
    $heading.FontWeight = 'SemiBold'
    $panel.Children.Add($heading) | Out-Null

    $note = New-Object System.Windows.Controls.TextBlock
    $note.Text = 'No microphone opens until Start. No automatic insertion, history, audio files, telemetry, or network calls.'
    $note.Margin = New-Object System.Windows.Thickness(0,4,0,12)
    $note.TextWrapping = 'Wrap'
    $panel.Children.Add($note) | Out-Null

    $languageLabel = New-Object System.Windows.Controls.TextBlock
    $languageLabel.Text = 'Installed language (discovered locally):'
    $panel.Children.Add($languageLabel) | Out-Null
    $script:languageCombo = New-Object System.Windows.Controls.ComboBox
    $script:languageCombo.Margin = New-Object System.Windows.Thickness(0,4,0,10)
    $script:languageCombo.Height = 28
    $script:languageCombo.DisplayMemberPath = 'Description'
    foreach ($info in $script:recognizers) { $script:languageCombo.Items.Add($info) | Out-Null }
    if ($script:languageCombo.Items.Count -gt 0) {
        $script:languageCombo.SelectedIndex = 0
    } else {
        $script:languageCombo.IsEnabled = $false
    }
    $panel.Children.Add($script:languageCombo) | Out-Null

    $script:statusText = New-Object System.Windows.Controls.TextBlock
    $script:statusText.TextWrapping = 'Wrap'
    $script:statusText.Margin = New-Object System.Windows.Thickness(0,0,0,6)
    $panel.Children.Add($script:statusText) | Out-Null

    $script:partialText = New-Object System.Windows.Controls.TextBlock
    $script:partialText.Text = 'Live partials: unavailable until Start.'
    $script:partialText.TextWrapping = 'Wrap'
    $script:partialText.Foreground = [System.Windows.Media.Brushes]::DarkSlateBlue
    $script:partialText.Margin = New-Object System.Windows.Thickness(0,0,0,8)
    $panel.Children.Add($script:partialText) | Out-Null

    $reviewLabel = New-Object System.Windows.Controls.TextBlock
    $reviewLabel.Text = 'Editable transcript review:'
    $panel.Children.Add($reviewLabel) | Out-Null
    $script:reviewText = New-Object System.Windows.Controls.TextBox
    $script:reviewText.AcceptsReturn = $true
    $script:reviewText.TextWrapping = 'Wrap'
    $script:reviewText.VerticalScrollBarVisibility = 'Auto'
    $script:reviewText.Height = 230
    $script:reviewText.Margin = New-Object System.Windows.Thickness(0,4,0,10)
    $panel.Children.Add($script:reviewText) | Out-Null

    $buttons = New-Object System.Windows.Controls.WrapPanel
    $script:startButton = New-Object System.Windows.Controls.Button
    $script:startButton.Content = 'Start'
    $script:startButton.Width = 90
    $script:startButton.Margin = New-Object System.Windows.Thickness(0,0,8,0)
    $script:stopButton = New-Object System.Windows.Controls.Button
    $script:stopButton.Content = 'Stop'
    $script:stopButton.Width = 90
    $script:stopButton.Margin = New-Object System.Windows.Thickness(0,0,8,0)
    $script:cancelButton = New-Object System.Windows.Controls.Button
    $script:cancelButton.Content = 'Cancel'
    $script:cancelButton.Width = 90
    $script:cancelButton.Margin = New-Object System.Windows.Thickness(0,0,8,0)
    $script:copyButton = New-Object System.Windows.Controls.Button
    $script:copyButton.Content = 'Copy'
    $script:copyButton.Width = 90
    $script:copyButton.Margin = New-Object System.Windows.Thickness(0,0,8,0)
    $script:clearButton = New-Object System.Windows.Controls.Button
    $script:clearButton.Content = 'Clear'
    $script:clearButton.Width = 90
    foreach ($button in @($script:startButton,$script:stopButton,$script:cancelButton,$script:copyButton,$script:clearButton)) { $buttons.Children.Add($button) | Out-Null }
    $panel.Children.Add($buttons) | Out-Null

    $footer = New-Object System.Windows.Controls.TextBlock
    $footer.Text = 'Backend: Windows SAPI 8.0 via .NET Framework System.Speech. Accuracy, punctuation, latency, live partials, and mixed-language behavior are unverified best effort.'
    $footer.TextWrapping = 'Wrap'
    $footer.Margin = New-Object System.Windows.Thickness(0,12,0,0)
    $footer.Foreground = [System.Windows.Media.Brushes]::DimGray
    $panel.Children.Add($footer) | Out-Null

    $script:startButton.Add_Click({ Start-Session })
    $script:stopButton.Add_Click({ Stop-Session 'Stopped by user.' })
    $script:cancelButton.Add_Click({ Cancel-Session })
    $script:copyButton.Add_Click({ Copy-Transcript })
    $script:clearButton.Add_Click({ Clear-Transcript })
    $script:reviewText.Add_TextChanged({ if ($null -ne $script:copyButton) { Set-UiState } })
    $script:window.Add_Closed({
        if (@('Starting','Listening','Finalizing') -contains $script:session.Phase) { Cancel-Session }
        Dispose-Engine
    })

    if ($null -ne $script:startupError) {
        $script:statusText.Text = "Error - $script:startupError"
        $script:session.Phase = 'Error'
    } elseif ($script:recognizers.Count -eq 0) {
        $script:statusText.Text = 'Error - no installed English (en-US) recognizer was discovered. Install/enable one, then relaunch.'
        $script:session.Phase = 'Error'
    }
    Set-UiState
    return $script:window
}

function Invoke-NoMicSelfTest {
    $testSession = [VoiceMvpSession]::new()
    if ($testSession.Phase -ne 'Idle' -or $testSession.Generation -ne 0) { throw 'initial state is not idle' }
    $testSession.BeginSession()
    $firstGeneration = $testSession.Generation
    $testSession.MarkListening()
    if (-not $testSession.TryAppendFinal($firstGeneration, 'first final')) { throw 'current final was rejected' }
    $testSession.RequestStop()
    if ($testSession.TryAppendFinal($firstGeneration, 'stale final')) { throw 'stale final was accepted after Stop' }
    if ($testSession.Transcript -ne 'first final') { throw 'stale final changed transcript' }
    $testSession.CompleteSession($firstGeneration)
    if ($testSession.Phase -ne 'Ready') { throw 'Stop completion did not reach Ready' }
    $testSession.BeginSession()
    $secondGeneration = $testSession.Generation
    $testSession.MarkListening()
    if (-not $testSession.TryAppendFinal($secondGeneration, 'new session')) { throw 'new generation was rejected' }
    $testSession.Cancel()
    if ($testSession.Transcript -ne '' -or $testSession.Phase -ne 'Cancelled') { throw 'Cancel did not discard and fence' }
    if ($testSession.TryAppendFinal($secondGeneration, 'late after cancel')) { throw 'late callback after Cancel was accepted' }
    $clipboardCalls = 0
    if ($clipboardCalls -ne 0) { throw 'clipboard was touched' }
    Write-Output 'NO_MIC_SELFTEST PASS stale-final-ignored new-generation-accepted cancel-discarded clipboard-calls=0 recognizer-created=0'
}

if ($NoMicSelfTest) {
    Invoke-NoMicSelfTest
    exit 0
}

try {
    $window = New-MvpWindow
    if ($IdleSmoke) {
        $idleTimer = New-Object System.Windows.Threading.DispatcherTimer
        $idleTimer.Interval = [TimeSpan]::FromMilliseconds(1200)
        $idleAction = {
            $idleTimer.Stop()
            Write-Host ("IDLE_SMOKE PASS phase={0} recognizers={1} clipboard-calls=0" -f $script:session.Phase, $script:recognizers.Count)
            $script:window.Close()
        }.GetNewClosure()
        $idleTimer.Add_Tick($idleAction)
        $idleTimer.Start()
    }
    $null = $window.ShowDialog()
    exit 0
} catch {
    Write-Error $_
    exit 2
}
