[CmdletBinding()]
param(
    [switch]$KeepTemp
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$SmokePath = $PSCommandPath
$RepoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\.."))
$HappyctlPath = Join-Path $RepoRoot "devtools\happyctl.ps1"
$WindowsPowerShell = Join-Path $env:SystemRoot "System32\WindowsPowerShell\v1.0\powershell.exe"
$OriginalLocation = Get-Location
$EnvironmentNames = @(
    "HAPPY_DEVTOOLS_CONFIG",
    "HAPPY_BUILD_NODE_ROOT",
    "HAPPY_OFFICIAL_BASE_REF",
    "HAPPY_PERSONAL_MAIN_BRANCH",
    "HAPPY_DEV_BRANCH",
    "LOCALAPPDATA",
    "PATH"
)
$OriginalEnvironment = @{}
foreach ($name in $EnvironmentNames) {
    $OriginalEnvironment[$name] = [Environment]::GetEnvironmentVariable($name, "Process")
}

$NonAscii = ([char]0x6D4B).ToString() + ([char]0x8BD5).ToString()
$TempRoot = Join-Path ([System.IO.Path]::GetTempPath()) (
    "happyctl Windows {0} space-{1}" -f $NonAscii, [Guid]::NewGuid().ToString("N")
)
$FixtureRepo = Join-Path $TempRoot "repo with spaces $NonAscii"
$FixtureLocalAppData = Join-Path $TempRoot "local app data $NonAscii"
$FixtureStateRoot = Join-Path $TempRoot "state with spaces $NonAscii"
$FixtureRegistryRoot = Join-Path $TempRoot "registry with spaces $NonAscii"
$FixtureConfig = Join-Path $TempRoot "fixture config $NonAscii.ps1"
$DoctorRunner = Join-Path $TempRoot "doctor contract runner.ps1"
$script:PassedContracts = 0

function Write-Utf8NoBom {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Content
    )

    $parent = Split-Path -Parent $Path
    if ($parent) {
        New-Item -ItemType Directory -Force -Path $parent | Out-Null
    }
    [System.IO.File]::WriteAllText($Path, $Content, (New-Object System.Text.UTF8Encoding($false)))
}

function Write-PowerShellScript {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Content
    )

    $parent = Split-Path -Parent $Path
    if ($parent) {
        New-Item -ItemType Directory -Force -Path $parent | Out-Null
    }
    # Windows PowerShell 5.1 treats UTF-8 without a BOM as the active ANSI code
    # page. Fixture scripts include non-ASCII paths, so make their encoding
    # explicit while keeping production source ASCII-compatible.
    [System.IO.File]::WriteAllText($Path, $Content, (New-Object System.Text.UTF8Encoding($true)))
}

function ConvertTo-SingleQuotedPowerShellLiteral {
    param([Parameter(Mandatory = $true)][string]$Value)
    return "'" + $Value.Replace("'", "''") + "'"
}

function Assert-True {
    param(
        [Parameter(Mandatory = $true)][bool]$Condition,
        [Parameter(Mandatory = $true)][string]$Message
    )

    if (-not $Condition) {
        throw $Message
    }
}

function Assert-Equal {
    param(
        [Parameter(Mandatory = $true)]$Actual,
        [Parameter(Mandatory = $true)]$Expected,
        [Parameter(Mandatory = $true)][string]$Message
    )

    if ($Actual -cne $Expected) {
        throw "$Message Expected=[$Expected] Actual=[$Actual]"
    }
}

function Assert-Contains {
    param(
        [Parameter(Mandatory = $true)][string]$Actual,
        [Parameter(Mandatory = $true)][string]$ExpectedSubstring,
        [Parameter(Mandatory = $true)][string]$Message
    )

    if (-not $Actual.Contains($ExpectedSubstring)) {
        throw "$Message Missing=[$ExpectedSubstring] Actual=[$Actual]"
    }
}

function Assert-Throws {
    param(
        [Parameter(Mandatory = $true)][scriptblock]$Action,
        [Parameter(Mandatory = $true)][string]$ExpectedSubstring,
        [Parameter(Mandatory = $true)][string]$Message
    )

    $thrown = $false
    $actualMessage = ""
    try {
        & $Action
    } catch {
        $thrown = $true
        $actualMessage = $_.Exception.Message
    }

    if (-not $thrown) {
        throw "$Message Expected an exception containing [$ExpectedSubstring]."
    }
    if (-not $actualMessage.Contains($ExpectedSubstring)) {
        throw "$Message Wrong exception. Expected=[$ExpectedSubstring] Actual=[$actualMessage]"
    }
}

function Invoke-Contract {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][scriptblock]$Body
    )

    try {
        & $Body
        $script:PassedContracts += 1
        Write-Host "PASS $Name"
    } catch {
        throw "FAIL $Name`: $($_.Exception.Message)"
    }
}

function Invoke-FixtureGit {
    param([Parameter(Mandatory = $true)][string[]]$Arguments)

    $savedErrorActionPreference = $ErrorActionPreference
    try {
        # Windows PowerShell 5.1 promotes redirected native stderr (including
        # harmless Git warnings) to ErrorRecord. Capture it without turning a
        # successful Git exit into a terminating PowerShell error.
        $ErrorActionPreference = "Continue"
        $output = @(& git -C $FixtureRepo @Arguments 2>&1)
        $exitCode = $LASTEXITCODE
    } finally {
        $ErrorActionPreference = $savedErrorActionPreference
    }
    if ($exitCode -ne 0) {
        throw "git $($Arguments -join ' ') failed: $($output -join [Environment]::NewLine)"
    }
    return $output
}

function Get-TreeFingerprint {
    param([Parameter(Mandatory = $true)][string]$Root)

    if (-not (Test-Path -LiteralPath $Root)) {
        return "missing"
    }

    $fullRoot = [System.IO.Path]::GetFullPath($Root).TrimEnd("\") + "\"
    $gitPrefix = $fullRoot + ".git\"
    $lines = @(Get-ChildItem -LiteralPath $Root -Recurse -File -Force -ErrorAction Stop |
        Where-Object { -not $_.FullName.StartsWith($gitPrefix, [StringComparison]::OrdinalIgnoreCase) } |
        ForEach-Object {
            $relative = $_.FullName.Substring($fullRoot.Length)
            $hash = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash
            "{0}|{1}|{2}" -f $relative, $_.Length, $hash
        } |
        Sort-Object)
    return $lines -join "`n"
}

function Get-FixtureInvariant {
    $status = @(& git -C $FixtureRepo status --porcelain=v1 -uall 2>$null) -join "`n"
    $head = (& git -C $FixtureRepo rev-parse HEAD).Trim()
    $branch = (& git -C $FixtureRepo branch --show-current).Trim()
    return [ordered]@{
        branch = $branch
        head = $head
        status = $status
        repoTree = Get-TreeFingerprint -Root $FixtureRepo
        stateTree = Get-TreeFingerprint -Root $FixtureStateRoot
        installTree = Get-TreeFingerprint -Root $FixtureLocalAppData
        uninstallTree = Get-TreeFingerprint -Root $FixtureRegistryRoot
        desktopProfile = $script:DesktopProfile
    }
}

function Invoke-DoctorFixture {
    param([Parameter(Mandatory = $true)][ValidateSet("complete", "missing")][string]$Mode)

    $output = @(& $WindowsPowerShell `
        -NoLogo `
        -NoProfile `
        -NonInteractive `
        -ExecutionPolicy Bypass `
        -File $DoctorRunner `
        -HappyctlPath $HappyctlPath `
        -ConfigPath $FixtureConfig `
        -Mode $Mode 2>&1)
    return [pscustomobject]@{
        ExitCode = $LASTEXITCODE
        Output = $output -join "`n"
    }
}

function Remove-OwnedTempRoot {
    if (-not (Test-Path -LiteralPath $TempRoot)) {
        return
    }

    $resolvedTemp = [System.IO.Path]::GetFullPath($TempRoot)
    $tempBase = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath()).TrimEnd("\") + "\"
    $ownedPrefix = "happyctl Windows "
    if (-not $resolvedTemp.StartsWith($tempBase, [StringComparison]::OrdinalIgnoreCase) -or
        -not (Split-Path -Leaf $resolvedTemp).StartsWith($ownedPrefix, [StringComparison]::Ordinal)) {
        throw "Refusing to remove unowned temporary path: $resolvedTemp"
    }

    Remove-Item -LiteralPath $resolvedTemp -Recurse -Force
}

try {
    New-Item -ItemType Directory -Force -Path `
        $FixtureRepo, $FixtureLocalAppData, $FixtureStateRoot, $FixtureRegistryRoot | Out-Null

    $configContent = @(
        '$HappyRepo = ' + (ConvertTo-SingleQuotedPowerShellLiteral $FixtureRepo)
        '$DevtoolsStateRoot = ' + (ConvertTo-SingleQuotedPowerShellLiteral $FixtureStateRoot)
        '$BackupDir = Join-Path $DevtoolsStateRoot ''backups'''
        '$LogDir = Join-Path $DevtoolsStateRoot ''logs'''
        '$ReportDir = Join-Path $DevtoolsStateRoot ''reports'''
        '$TauriConfig = ''src-tauri\tauri.dev.conf.json'''
        '$WindowsBuildNodeRoot = '''''
    ) -join "`r`n"
    Write-PowerShellScript -Path $FixtureConfig -Content ($configContent + "`r`n")

    $doctorRunnerContent = @'
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$HappyctlPath,
    [Parameter(Mandatory = $true)][string]$ConfigPath,
    [Parameter(Mandatory = $true)][ValidateSet("complete", "missing")][string]$Mode
)
$ErrorActionPreference = "Stop"
$env:HAPPY_DEVTOOLS_CONFIG = $ConfigPath
. $HappyctlPath help 6>&1 | Out-Null

function Write-CommandStatus {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [string[]]$VersionArgs = @("--version")
    )
    if ($Mode -eq "missing" -and $Name -eq "pnpm") {
        Write-Host "miss pnpm not found"
        return $false
    }
    Write-Host "ok   $Name fixture"
    return $true
}
function Test-HappyRepo { return $true }
function Test-GitPushGuard { return $true }
function Get-GitPushGuardInstallDir { return (Join-Path (Split-Path -Parent $ConfigPath) "fixture-hooks") }
function Get-MsvcInfo {
    return [pscustomobject]@{ Found = $true; Detail = "fixture MSVC"; VcVars64Exists = $true }
}
function Get-RustInfo { return "stable-x86_64-pc-windows-msvc (fixture)" }
function Get-WebView2Info {
    return [pscustomobject]@{ Found = $true; Version = "fixture"; Source = "fixture" }
}

Invoke-Doctor
'@
    Write-PowerShellScript -Path $DoctorRunner -Content $doctorRunnerContent

    $env:HAPPY_DEVTOOLS_CONFIG = $FixtureConfig
    $env:HAPPY_BUILD_NODE_ROOT = $null
    $env:HAPPY_OFFICIAL_BASE_REF = "upstream/main"
    $env:HAPPY_PERSONAL_MAIN_BRANCH = "main"
    $env:HAPPY_DEV_BRANCH = "dev"
    $env:LOCALAPPDATA = $FixtureLocalAppData

    . $HappyctlPath help 6>&1 | Out-Null

    Invoke-Contract "uninstall registry reads expose a fixture-safe seam" {
        Assert-True `
            -Condition ($null -ne (Get-Command Get-UninstallRegistryEntry -CommandType Function -ErrorAction SilentlyContinue)) `
            -Message "happyctl does not expose the uninstall registry read seam required for fixture isolation."
    }

    $script:FixtureRegistryReads = @()
    function Get-UninstallRegistryEntry {
        $entryPath = Join-Path $FixtureRegistryRoot ("{0}.json" -f $script:DesktopProfile)
        $resolvedRoot = [System.IO.Path]::GetFullPath($FixtureRegistryRoot).TrimEnd("\") + "\"
        $resolvedEntry = [System.IO.Path]::GetFullPath($entryPath)
        if (-not $resolvedEntry.StartsWith($resolvedRoot, [StringComparison]::OrdinalIgnoreCase)) {
            throw "Fixture uninstall entry escaped the owned registry root: $resolvedEntry"
        }
        $script:FixtureRegistryReads += $resolvedEntry
        if (-not (Test-Path -LiteralPath $resolvedEntry -PathType Leaf)) {
            return $null
        }
        return Get-Content -LiteralPath $resolvedEntry -Raw -Encoding UTF8 | ConvertFrom-Json
    }

    Invoke-Contract "PowerShell parses production and smoke scripts" {
        foreach ($pathToParse in @($HappyctlPath, $SmokePath)) {
            $tokens = $null
            $errors = $null
            [System.Management.Automation.Language.Parser]::ParseFile(
                $pathToParse,
                [ref]$tokens,
                [ref]$errors
            ) | Out-Null
            Assert-Equal -Actual @($errors).Count -Expected 0 -Message "AST errors in $pathToParse"
        }
        Assert-True `
            -Condition ($PSVersionTable.PSVersion.Major -ge 5) `
            -Message "Unsupported PowerShell host: $($PSVersionTable.PSVersion)"
    }

    Invoke-Contract "fixture paths preserve spaces and non-ASCII characters" {
        Assert-True -Condition $FixtureRepo.Contains(" ") -Message "Fixture repository path has no spaces."
        Assert-True -Condition $FixtureRepo.Contains($NonAscii) -Message "Fixture repository path has no non-ASCII characters."
        Assert-Equal `
            -Actual ([System.IO.Path]::GetFullPath($script:HappyRepo)) `
            -Expected ([System.IO.Path]::GetFullPath($FixtureRepo)) `
            -Message "Fixture config did not anchor happyctl to the owned repository."
    }

    Invoke-Contract "isolated Node 20 resolves explicit, current, legacy, and invalid paths" {
        $explicitRoot = Join-Path $TempRoot "explicit node 20 $NonAscii"
        Write-Utf8NoBom -Path (Join-Path $explicitRoot "node.exe") -Content "fixture"
        $script:WindowsBuildNodeRoot = $explicitRoot
        Assert-Equal `
            -Actual (Resolve-WindowsBuildNodeRoot) `
            -Expected ([System.IO.Path]::GetFullPath($explicitRoot)) `
            -Message "Explicit Node root was not selected."

        $script:WindowsBuildNodeRoot = Join-Path $TempRoot "missing explicit node"
        Assert-Throws `
            -Action { Resolve-WindowsBuildNodeRoot | Out-Null } `
            -ExpectedSubstring "Configured Windows build Node runtime not found" `
            -Message "Missing explicit Node root did not fail closed."

        $script:WindowsBuildNodeRoot = ""
        $current19 = Join-Path $FixtureLocalAppData "Happy Devtools\tools\node-v20.19.1-win-x64"
        $current20 = Join-Path $FixtureLocalAppData "Happy Devtools\tools\node-v20.20.1-win-x64"
        $ignored22 = Join-Path $FixtureLocalAppData "Happy Devtools\tools\node-v22.1.0-win-x64"
        Write-Utf8NoBom -Path (Join-Path $current19 "node.exe") -Content "fixture"
        Write-Utf8NoBom -Path (Join-Path $current20 "node.exe") -Content "fixture"
        Write-Utf8NoBom -Path (Join-Path $ignored22 "node.exe") -Content "fixture"
        Assert-Equal `
            -Actual (Resolve-WindowsBuildNodeRoot) `
            -Expected ([System.IO.Path]::GetFullPath($current20)) `
            -Message "Newest current isolated Node 20 was not selected."

        $legacy = Join-Path $FixtureLocalAppData "Happy Manager\tools\node-v20.20.2-win-x64"
        Write-Utf8NoBom -Path (Join-Path $legacy "node.exe") -Content "fixture"
        Assert-Equal `
            -Actual (Resolve-WindowsBuildNodeRoot) `
            -Expected ([System.IO.Path]::GetFullPath($legacy)) `
            -Message "Legacy isolated Node 20 compatibility was not preserved."
    }

    Invoke-Contract "build Node major check accepts 20 and rejects other majors" {
        $savedPath = $env:PATH
        $nodeShimDir = Join-Path $TempRoot "node version shims"
        $nodeShim = Join-Path $nodeShimDir "node.cmd"
        try {
            Write-Utf8NoBom -Path $nodeShim -Content "@echo off`r`necho 20`r`n"
            $env:PATH = $nodeShimDir + ";" + (Join-Path $env:SystemRoot "System32")
            Assert-WindowsBuildNode

            Write-Utf8NoBom -Path $nodeShim -Content "@echo off`r`necho 22`r`n"
            Assert-Throws `
                -Action { Assert-WindowsBuildNode } `
                -ExpectedSubstring "require isolated Node 20" `
                -Message "A non-20 active Node was accepted."
        } finally {
            $env:PATH = $savedPath
        }
    }

    Invoke-Contract "doctor distinguishes complete and missing toolchains" {
        $complete = Invoke-DoctorFixture -Mode "complete"
        Assert-Equal -Actual $complete.ExitCode -Expected 0 -Message "Complete doctor fixture failed."
        Assert-Contains -Actual $complete.Output -ExpectedSubstring "Doctor passed." -Message "Complete doctor summary missing."

        $missing = Invoke-DoctorFixture -Mode "missing"
        Assert-True -Condition ($missing.ExitCode -ne 0) -Message "Missing-tool doctor fixture returned success."
        Assert-Contains `
            -Actual $missing.Output `
            -ExpectedSubstring "Doctor found missing Windows Tauri build prerequisites." `
            -Message "Missing-tool doctor summary missing."
    }

    New-Item -ItemType Directory -Force -Path `
        (Join-Path $FixtureRepo "devtools\git-hooks"), `
        (Join-Path $FixtureRepo "packages\happy-app\src-tauri") | Out-Null
    Write-Utf8NoBom -Path (Join-Path $FixtureRepo ".gitignore") -Content "packages/happy-app/src-tauri/target/`r`n"
    Write-Utf8NoBom -Path (Join-Path $FixtureRepo "product.txt") -Content "official`r`n"
    Write-Utf8NoBom -Path (Join-Path $FixtureRepo "devtools\git-hooks\pre-push") -Content "#!/bin/sh`nexit 0`n"
    Write-Utf8NoBom `
        -Path (Join-Path $FixtureRepo "packages\happy-app\src-tauri\tauri.dev.conf.json") `
        -Content "{}`r`n"
    Invoke-FixtureGit -Arguments @("init", "-q", "-b", "main") | Out-Null
    Invoke-FixtureGit -Arguments @("config", "user.name", "Happyctl Windows Smoke") | Out-Null
    Invoke-FixtureGit -Arguments @("config", "user.email", "happyctl-windows@example.invalid") | Out-Null
    Invoke-FixtureGit -Arguments @("add", ".") | Out-Null
    Invoke-FixtureGit -Arguments @("commit", "-qm", "official baseline") | Out-Null
    Invoke-FixtureGit -Arguments @("update-ref", "refs/remotes/upstream/main", "HEAD") | Out-Null
    Write-Utf8NoBom -Path (Join-Path $FixtureRepo "devtools\allowed.txt") -Content "allowed`r`n"
    Invoke-FixtureGit -Arguments @("add", "devtools/allowed.txt") | Out-Null
    Invoke-FixtureGit -Arguments @("commit", "-qm", "allowlisted devtools delta") | Out-Null

    Invoke-Contract "Git hook, branch, and product-difference guards fail closed" {
        $script:WindowsBuildNodeRoot = ""
        Assert-True -Condition (-not (Test-GitPushGuard)) -Message "Missing fixture Git guard was accepted."
        Install-GitPushGuard | Out-Null
        Assert-True -Condition (Test-GitPushGuard) -Message "Installed matching fixture Git guard was rejected."

        $sourceHook = Join-Path $FixtureRepo "devtools\git-hooks\pre-push"
        $installedHook = Join-Path (Get-GitPushGuardInstallDir) "pre-push"
        $sourceHookContent = [System.IO.File]::ReadAllText($sourceHook).Replace("`r`n", "`n")
        Write-Utf8NoBom -Path $sourceHook -Content $sourceHookContent.Replace("`n", "`r`n")
        Write-Utf8NoBom -Path $installedHook -Content $sourceHookContent
        Assert-True `
            -Condition (Test-GitPushGuard) `
            -Message "Equivalent CRLF checkout and LF installed Git guards were rejected."

        Write-Utf8NoBom -Path $installedHook -Content "drift`r`n"
        Assert-True -Condition (-not (Test-GitPushGuard)) -Message "Drifted fixture Git guard was accepted."
        Copy-Item -LiteralPath $sourceHook -Destination $installedHook -Force
        Assert-True -Condition (Test-GitPushGuard) -Message "Restored fixture Git guard was rejected."
        Write-Utf8NoBom -Path $sourceHook -Content $sourceHookContent
        Write-Utf8NoBom -Path $installedHook -Content $sourceHookContent

        Assert-OfficialBaselineSource
        Invoke-FixtureGit -Arguments @("switch", "-qc", "feature/product-delta", "main") | Out-Null
        Assert-Throws `
            -Action { Assert-OfficialBaselineSource } `
            -ExpectedSubstring "Official baseline must be built from main" `
            -Message "Official baseline accepted the wrong branch."
        Write-Utf8NoBom -Path (Join-Path $FixtureRepo "product.txt") -Content "personal product delta`r`n"
        Invoke-FixtureGit -Arguments @("add", "product.txt") | Out-Null
        Invoke-FixtureGit -Arguments @("commit", "-qm", "product delta") | Out-Null
        Assert-Throws `
            -Action { Assert-OfficialProductEquivalence } `
            -ExpectedSubstring "outside the devtools allowlist" `
            -Message "Product delta was accepted as an official baseline."
        Invoke-FixtureGit -Arguments @("switch", "-q", "main") | Out-Null
    }

    Invoke-Contract "artifact discovery covers missing and populated release outputs" {
        $script:DryRun = $true
        Assert-Equal -Actual @(Get-BuildArtifacts).Count -Expected 0 -Message "Empty artifact fixture was not empty."
        Assert-Throws `
            -Action { Invoke-UpdateDesktop } `
            -ExpectedSubstring "No NSIS setup artifact found" `
            -Message "update-desktop did not fail before mutation when NSIS was missing."

        $releaseRoot = Join-Path $script:TauriRoot "target\release"
        $appArtifact = Join-Path $releaseRoot "app.exe"
        $nsisArtifact = Join-Path $releaseRoot "bundle\nsis\Happy (dev)_0.1.0_x64-setup.exe"
        $msiArtifact = Join-Path $releaseRoot "bundle\msi\Happy (dev)_0.1.0_x64_en-US.msi"
        Write-Utf8NoBom -Path $appArtifact -Content "app fixture"
        Write-Utf8NoBom -Path $nsisArtifact -Content "nsis fixture"
        Write-Utf8NoBom -Path $msiArtifact -Content "msi fixture"

        $artifactPaths = @(Get-BuildArtifacts | ForEach-Object { $_.FullName })
        foreach ($expectedArtifact in @($appArtifact, $nsisArtifact, $msiArtifact)) {
            Assert-True `
                -Condition ($artifactPaths -contains [System.IO.Path]::GetFullPath($expectedArtifact)) `
                -Message "Required artifact missing from discovery: $expectedArtifact"
        }
        Assert-Equal `
            -Actual (Get-LatestNsisInstaller).FullName `
            -Expected ([System.IO.Path]::GetFullPath($nsisArtifact)) `
            -Message "Latest NSIS installer selection failed."
    }

    Invoke-Contract "Tauri prebuilt frontend override survives Windows command marshalling" {
        $pnpmShimRoot = Join-Path $TempRoot "pnpm command shim $NonAscii"
        $pnpmShim = Join-Path $pnpmShimRoot "pnpm.cmd"
        $argumentsCapture = Join-Path $TempRoot "tauri arguments $NonAscii.txt"
        $configCapture = Join-Path $TempRoot "tauri config capture $NonAscii.json"
        $pnpmShimContent = @'
@echo off
setlocal EnableExtensions DisableDelayedExpansion
chcp 65001 >nul
:capture
if "%~1"=="" goto captured
>>"%HAPPY_TAURI_ARGS_FILE%" echo(%~1
set "lastArg=%~1"
shift
goto capture
:captured
set "sourceArg=%lastArg:/=\%"
copy /y "%sourceArg%" "%HAPPY_TAURI_CONFIG_CAPTURE%" >nul
if errorlevel 1 exit /b 1
if "%HAPPY_TAURI_SHIM_FAIL%"=="1" exit /b 7
exit /b 0
'@
        Write-Utf8NoBom -Path $pnpmShim -Content $pnpmShimContent

        $savedPath = $env:PATH
        try {
            $env:HAPPY_TAURI_ARGS_FILE = $argumentsCapture
            $env:HAPPY_TAURI_CONFIG_CAPTURE = $configCapture
            $env:PATH = $pnpmShimRoot + ";" + (Join-Path $env:SystemRoot "System32")
            Invoke-TauriBuildWithPrebuiltFrontend -ConfigPath $script:TauriConfigPath
        } finally {
            $env:PATH = $savedPath
            Remove-Item Env:HAPPY_TAURI_ARGS_FILE,Env:HAPPY_TAURI_CONFIG_CAPTURE -ErrorAction SilentlyContinue
        }

        $capturedTauriArguments = @(Get-Content -LiteralPath $argumentsCapture -Encoding UTF8)
        $capturedPrebuiltConfigPath = $capturedTauriArguments[-1]
        $capturedPrebuiltConfig = Get-Content -LiteralPath $configCapture -Raw -Encoding UTF8

        Assert-Contains `
            -Actual ($capturedTauriArguments -join "|") `
            -ExpectedSubstring "--config" `
            -Message "Tauri build did not receive config arguments."
        Assert-Contains `
            -Actual $capturedPrebuiltConfigPath `
            -ExpectedSubstring $NonAscii `
            -Message "The Windows command shim did not preserve the non-ASCII config path."
        Assert-Equal `
            -Actual $capturedPrebuiltConfig `
            -Expected '{"build":{"beforeBuildCommand":""}}' `
            -Message "Tauri prebuilt frontend override was not valid JSON."
        Assert-True `
            -Condition (-not (Test-Path -LiteralPath $capturedPrebuiltConfigPath)) `
            -Message "Temporary Tauri override config was not cleaned up."

        $failedArgumentsCapture = Join-Path $TempRoot "failed tauri arguments $NonAscii.txt"
        $failedConfigCapture = Join-Path $TempRoot "failed tauri config capture $NonAscii.json"
        try {
            $env:HAPPY_TAURI_ARGS_FILE = $failedArgumentsCapture
            $env:HAPPY_TAURI_CONFIG_CAPTURE = $failedConfigCapture
            $env:HAPPY_TAURI_SHIM_FAIL = "1"
            $env:PATH = $pnpmShimRoot + ";" + (Join-Path $env:SystemRoot "System32")
            Assert-Throws `
                -Action { Invoke-TauriBuildWithPrebuiltFrontend -ConfigPath $script:TauriConfigPath } `
                -ExpectedSubstring "tauri build failed with exit code 7" `
                -Message "A failed Tauri child process did not propagate its exit code."
        } finally {
            $env:PATH = $savedPath
            Remove-Item `
                Env:HAPPY_TAURI_ARGS_FILE,Env:HAPPY_TAURI_CONFIG_CAPTURE,Env:HAPPY_TAURI_SHIM_FAIL `
                -ErrorAction SilentlyContinue
        }
        $failedPrebuiltConfigPath = @(Get-Content -LiteralPath $failedArgumentsCapture -Encoding UTF8)[-1]
        Assert-True `
            -Condition (-not (Test-Path -LiteralPath $failedPrebuiltConfigPath)) `
            -Message "Temporary Tauri override config was not cleaned after a child failure."
    }

    $script:DryRun = $true
    $taskSentinel = Join-Path $FixtureStateRoot "scheduled-task.sentinel"
    $processSentinel = Join-Path $FixtureStateRoot "process.sentinel"
    Write-Utf8NoBom -Path $taskSentinel -Content "unchanged task"
    Write-Utf8NoBom -Path $processSentinel -Content "unchanged process"
    foreach ($profileFixture in @(
        [pscustomobject]@{ Profile = "personal"; AppName = "Happy (dev)" },
        [pscustomobject]@{ Profile = "official-baseline"; AppName = "Happy (official baseline)" }
    )) {
        $installRoot = Join-Path $FixtureLocalAppData $profileFixture.AppName
        Write-Utf8NoBom -Path (Join-Path $installRoot "app.exe") -Content ("{0} app sentinel" -f $profileFixture.Profile)
        Write-Utf8NoBom -Path (Join-Path $installRoot "install.sentinel") -Content "unchanged install"
        $registryEntry = [ordered]@{
            DisplayName = $profileFixture.AppName
            DisplayVersion = "9.9.9-fixture"
            InstallLocation = $installRoot
            UninstallString = (Join-Path $installRoot "uninstall.exe")
            Sentinel = "unchanged uninstall entry"
        } | ConvertTo-Json -Compress
        Write-Utf8NoBom `
            -Path (Join-Path $FixtureRegistryRoot ("{0}.json" -f $profileFixture.Profile)) `
            -Content $registryEntry
    }

    Invoke-Contract "update-desktop DryRun identifies inputs and preserves its fixture state" {
        Set-DesktopProfile -Profile "personal"
        $installer = Join-Path $script:TauriRoot "target\release\bundle\nsis\Happy (dev)_0.1.0_x64-setup.exe"
        $before = Get-FixtureInvariant | ConvertTo-Json -Depth 6 -Compress
        $readsBefore = $script:FixtureRegistryReads.Count
        $output = (& { Invoke-UpdateDesktop } 6>&1 | Out-String -Width 4096)
        Assert-Contains -Actual $output -ExpectedSubstring "Source:        $installer" -Message "update-desktop source missing."
        Assert-Contains -Actual $output -ExpectedSubstring "Installer:     $installer" -Message "update-desktop installer missing."
        Assert-Contains -Actual $output -ExpectedSubstring "Target:        $script:WindowsInstallDir" -Message "update-desktop target missing."
        Assert-Contains -Actual $output -ExpectedSubstring "No changes made." -Message "update-desktop DryRun invariant message missing."
        Assert-True `
            -Condition ($script:FixtureRegistryReads.Count -gt $readsBefore) `
            -Message "update-desktop did not use the fixture uninstall-entry reader."
        $after = Get-FixtureInvariant | ConvertTo-Json -Depth 6 -Compress
        Assert-Equal -Actual $after -Expected $before -Message "update-desktop DryRun changed fixture state."
    }

    Invoke-Contract "refresh-desktop DryRun identifies inputs and preserves its fixture state" {
        Set-DesktopProfile -Profile "personal"
        $source = "$script:OfficialBaseRef -> $script:PersonalMainBranch -> $script:DevBranch"
        $before = Get-FixtureInvariant | ConvertTo-Json -Depth 6 -Compress
        $output = (& { Invoke-RefreshDesktop } 6>&1 | Out-String -Width 4096)
        Assert-Contains -Actual $output -ExpectedSubstring "Source:        $source" -Message "refresh-desktop source missing."
        Assert-Contains -Actual $output -ExpectedSubstring "Installer:     freshly built NSIS setup for Happy (dev)" -Message "refresh-desktop installer intent missing."
        Assert-Contains -Actual $output -ExpectedSubstring "Target:        $script:WindowsInstallDir" -Message "refresh-desktop target missing."
        Assert-Contains `
            -Actual $output `
            -ExpectedSubstring "No branch, push, build, install, package, or report changes made." `
            -Message "refresh-desktop DryRun invariant message missing."
        $after = Get-FixtureInvariant | ConvertTo-Json -Depth 6 -Compress
        Assert-Equal -Actual $after -Expected $before -Message "refresh-desktop DryRun changed fixture state."
    }

    Invoke-Contract "refresh-official-baseline DryRun identifies inputs and preserves its fixture state" {
        Set-DesktopProfile -Profile "official-baseline"
        $before = Get-FixtureInvariant | ConvertTo-Json -Depth 6 -Compress
        $output = (& { Invoke-RefreshOfficialBaseline } 6>&1 | Out-String -Width 4096)
        Assert-Contains -Actual $output -ExpectedSubstring "Source:        $script:OfficialBaseRef" -Message "refresh-official-baseline source missing."
        Assert-Contains -Actual $output -ExpectedSubstring "Installer:     freshly built NSIS setup for Happy (official baseline)" -Message "refresh-official-baseline installer intent missing."
        Assert-Contains -Actual $output -ExpectedSubstring "Target:        $script:WindowsInstallDir" -Message "refresh-official-baseline target missing."
        Assert-Contains `
            -Actual $output `
            -ExpectedSubstring "No branch, build, install, package, or report changes made." `
            -Message "refresh-official-baseline DryRun invariant message missing."
        $after = Get-FixtureInvariant | ConvertTo-Json -Depth 6 -Compress
        Assert-Equal -Actual $after -Expected $before -Message "refresh-official-baseline DryRun changed fixture state."
    }

    Write-Host "happyctl Windows smoke passed: $script:PassedContracts contracts"
} finally {
    Set-Location $OriginalLocation
    foreach ($name in $EnvironmentNames) {
        $value = $OriginalEnvironment[$name]
        if ($null -eq $value) {
            [Environment]::SetEnvironmentVariable($name, $null, "Process")
        } else {
            [Environment]::SetEnvironmentVariable($name, [string]$value, "Process")
        }
    }

    if ($KeepTemp) {
        Write-Host "Kept fixture root: $TempRoot"
    } else {
        Remove-OwnedTempRoot
    }
}
