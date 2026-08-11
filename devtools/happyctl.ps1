[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [ValidateSet("status", "doctor", "artifacts", "build-desktop", "build-official-baseline", "update-cli", "patch-cli-codex-model", "update-desktop", "update-official-baseline", "update-all", "verify-desktop", "verify-official-baseline", "check-upstream", "refresh-desktop", "refresh-official-baseline", "install-refresh-task", "uninstall-refresh-task", "refresh-task-status", "help")]
    [string]$Command = "help",

    [switch]$DryRun,

    [switch]$Force,

    [ValidatePattern("^\d{2}:\d{2}$")]
    [string]$TaskTime = "09:00",

    [ValidateRange(0, 100)]
    [int]$KeepBackups = 3,

    [ValidateNotNullOrEmpty()]
    [string]$CodexModel = "gpt-5.6-sol",

    [switch]$RestartDaemon
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ScriptPath = $PSCommandPath
$ScriptDir = Split-Path -Parent $ScriptPath
$DevtoolsRoot = $ScriptDir

$HappyRepo = Split-Path -Parent $DevtoolsRoot
$DevtoolsStateRoot = Join-Path $env:LOCALAPPDATA "Happy Devtools"
$BackupDir = ""
$LogDir = ""
$ReportDir = ""
$TauriConfig = "src-tauri\tauri.dev.conf.json"
$WindowsBuildNodeRoot = if ($env:HAPPY_BUILD_NODE_ROOT) { $env:HAPPY_BUILD_NODE_ROOT } else { "" }

$ConfigPath = if ($env:HAPPY_DEVTOOLS_CONFIG) {
    $env:HAPPY_DEVTOOLS_CONFIG
} else {
    Join-Path $DevtoolsStateRoot "config.windows.ps1"
}
if (-not (Test-Path -LiteralPath $ConfigPath)) {
    $repoConfigPath = Join-Path $DevtoolsRoot "config.windows.ps1"
    $legacyConfigPath = "C:\Users\myartings\workspace\happy-manager\config.windows.ps1"
    if (Test-Path -LiteralPath $repoConfigPath) {
        $ConfigPath = $repoConfigPath
    } elseif (Test-Path -LiteralPath $legacyConfigPath) {
        $ConfigPath = $legacyConfigPath
    }
}
if (Test-Path -LiteralPath $ConfigPath) {
    . $ConfigPath
}
$BackupDir = if ($BackupDir) { $BackupDir } else { Join-Path $DevtoolsStateRoot "backups" }
$LogDir = if ($LogDir) { $LogDir } else { Join-Path $DevtoolsStateRoot "logs" }
$ReportDir = if ($ReportDir) { $ReportDir } else { Join-Path $DevtoolsStateRoot "reports" }

$HappyAppPackage = Join-Path $HappyRepo "packages\happy-app"
$TauriRoot = Join-Path $HappyAppPackage "src-tauri"
$PersonalTauriConfig = $TauriConfig
$TauriConfigPath = if ([System.IO.Path]::IsPathRooted($PersonalTauriConfig)) {
    $PersonalTauriConfig
} else {
    Join-Path $HappyAppPackage $PersonalTauriConfig
}
$OfficialBaselineTauriConfigPath = Join-Path $DevtoolsRoot "config\tauri.official-baseline.conf.json"
$LogFile = Join-Path $LogDir "happyctl-windows.log"
$DesktopProfile = "personal"
$WindowsAppName = "Happy (dev)"
$WindowsInstallDir = Join-Path $env:LOCALAPPDATA $WindowsAppName
$WindowsInstalledExe = Join-Path $WindowsInstallDir "app.exe"
$WindowsUninstallKey = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\$WindowsAppName"
$WindowsRefreshTaskName = "Happy Devtools Desktop Refresh"
$LastDesktopUpdateResult = $null
$OfficialBaseRef = if ($env:HAPPY_OFFICIAL_BASE_REF) { $env:HAPPY_OFFICIAL_BASE_REF } else { "upstream/main" }
$PersonalMainBranch = if ($env:HAPPY_PERSONAL_MAIN_BRANCH) { $env:HAPPY_PERSONAL_MAIN_BRANCH } else { "main" }
$DevBranch = if ($env:HAPPY_DEV_BRANCH) { $env:HAPPY_DEV_BRANCH } else { "dev" }
$CodexDefaultModel = if ($env:HAPPY_CODEX_DEFAULT_MODEL) { $env:HAPPY_CODEX_DEFAULT_MODEL } else { "gpt-5.6-sol" }
$LastPatchStackChanged = $false
$LastPatchStackCommit = ""
$OfficialBaselineDependencyMode = "n/a"

function Set-DesktopProfile {
    param([Parameter(Mandatory = $true)][ValidateSet("personal", "official-baseline")][string]$Profile)

    $script:DesktopProfile = $Profile
    if ($Profile -eq "official-baseline") {
        $script:TauriConfigPath = $OfficialBaselineTauriConfigPath
        $script:WindowsAppName = "Happy (official baseline)"
    } else {
        $script:TauriConfigPath = if ([System.IO.Path]::IsPathRooted($PersonalTauriConfig)) {
            $PersonalTauriConfig
        } else {
            Join-Path $HappyAppPackage $PersonalTauriConfig
        }
        $script:WindowsAppName = "Happy (dev)"
    }

    $script:WindowsInstallDir = Join-Path $env:LOCALAPPDATA $WindowsAppName
    $script:WindowsInstalledExe = Join-Path $WindowsInstallDir "app.exe"
    $script:WindowsUninstallKey = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\$WindowsAppName"
}

function Add-PathEntry {
    param([Parameter(Mandatory = $true)][string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) {
        return
    }
    $parts = @($env:PATH -split ";" | Where-Object { $_ })
    if ($parts -notcontains $Path) {
        $env:PATH = "$Path;$env:PATH"
    }
}

function Resolve-WindowsBuildNodeRoot {
    if ($WindowsBuildNodeRoot) {
        $explicitNode = Join-Path $WindowsBuildNodeRoot "node.exe"
        if (-not (Test-Path -LiteralPath $explicitNode)) {
            throw "Configured Windows build Node runtime not found: $explicitNode"
        }
        return [System.IO.Path]::GetFullPath($WindowsBuildNodeRoot)
    }

    $toolRoots = @(
        (Join-Path $env:LOCALAPPDATA "Happy Devtools\tools"),
        (Join-Path $env:LOCALAPPDATA "Happy Manager\tools")
    )
    $candidates = @($toolRoots | Where-Object { Test-Path -LiteralPath $_ } |
        ForEach-Object { Get-ChildItem -LiteralPath $_ -Directory -Filter "node-v20.*-win-x64" -ErrorAction SilentlyContinue } |
        Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName "node.exe") } |
        Sort-Object { [version](($_.Name -replace '^node-v', '') -replace '-win-x64$', '') } -Descending)
    if ($candidates.Count -eq 0) {
        return ""
    }
    return $candidates[0].FullName
}

function Assert-WindowsBuildNode {
    $major = (& node -p "process.versions.node.split('.')[0]").Trim()
    if ($LASTEXITCODE -ne 0 -or $major -ne "20") {
        throw "Happy Windows desktop builds require isolated Node 20; active Node is $(Invoke-Version 'node'). Run .\scripts\install-windows-build-node.ps1."
    }
}

function Add-WindowsBuildToolPaths {
    Add-PathEntry (Join-Path $env:USERPROFILE ".cargo\bin")
    Add-PathEntry "C:\Program Files\Git\usr\bin"
    $resolvedBuildNodeRoot = Resolve-WindowsBuildNodeRoot
    if ($resolvedBuildNodeRoot) {
        $script:WindowsBuildNodeRoot = $resolvedBuildNodeRoot
        Add-PathEntry $resolvedBuildNodeRoot
    }
}

Add-WindowsBuildToolPaths

function Write-Log {
    param([Parameter(Mandatory = $true)][string]$Message)
    New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
    $line = "[{0}] {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $Message
    $line | Tee-Object -FilePath $LogFile -Append
}

function Write-Section {
    param([Parameter(Mandatory = $true)][string]$Title)
    Write-Host ""
    Write-Host "== $Title =="
}

function Format-ReportValue {
    param($Value)
    if ($null -eq $Value) {
        return "n/a"
    }
    if ($Value -is [string] -and $Value -eq "") {
        return "n/a"
    }
    if ($Value -is [array]) {
        if ($Value.Count -eq 0) {
            return "n/a"
        }
        $Value = $Value -join "; "
    }
    return (($Value | Out-String).Trim() -replace "`e\[[0-9;]*m", "" -replace "`r?`n", " / ")
}

function Write-UpdateReport {
    param(
        [Parameter(Mandatory = $true)][string]$Kind,
        [Parameter(Mandatory = $true)][System.Collections.IDictionary]$Fields
    )

    New-Item -ItemType Directory -Force -Path $ReportDir | Out-Null
    $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $path = Join-Path $ReportDir "$stamp-$Kind.md"
    $lines = @(
        "# Happy Devtools Update Report",
        "",
        "- Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss zzz")",
        "- Kind: $Kind"
    )

    foreach ($key in $Fields.Keys) {
        $lines += "- ${key}: $(Format-ReportValue $Fields[$key])"
    }

    $lines | Set-Content -LiteralPath $path -Encoding UTF8
    Write-Log "Update report: $path" | Out-Null
    Write-Host "Update report: $path"
    return $path
}

function Get-CommandPaths {
    param([Parameter(Mandatory = $true)][string]$Name)
    $output = & where.exe $Name 2>$null
    if ($LASTEXITCODE -ne 0) {
        return @()
    }
    return @($output | Where-Object { $_ })
}

function Test-CommandExists {
    param([Parameter(Mandatory = $true)][string]$Name)
    return @(Get-CommandPaths $Name).Count -gt 0
}

function Get-ExecutableCommandPath {
    param([Parameter(Mandatory = $true)][string]$Name)
    $paths = @(Get-CommandPaths $Name)
    if ($paths.Count -eq 0) {
        return ""
    }

    $preferred = @($paths | Where-Object { $_ -match "\.(exe|cmd|bat|ps1)$" })
    if ($preferred.Count -gt 0) {
        return $preferred[0]
    }

    return $paths[0]
}

function Invoke-Version {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
    [string[]]$Args = @("--version")
    )
    $commandPath = Get-ExecutableCommandPath $Name
    if (-not $commandPath) {
        return "not found"
    }
    try {
        return ((& $commandPath @Args 2>&1) -join "`n").Trim()
    } catch {
        return "error: $($_.Exception.Message)"
    }
}

function Write-CommandStatus {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [string[]]$VersionArgs = @("--version")
    )
    $paths = @(Get-CommandPaths $Name)
    if ($paths.Count -eq 0) {
        Write-Host ("miss {0,-10} not found" -f $Name)
        return $false
    }

    Write-Host ("ok   {0,-10} {1}" -f $Name, ($paths -join "; "))
    $version = Invoke-Version $Name $VersionArgs
    if ($version) {
        Write-Host ("     {0}" -f ($version -replace "`n", "`n     "))
    }
    return $true
}

function Test-HappyRepo {
    & git -C $HappyRepo rev-parse --is-inside-work-tree 2>$null | Out-Null
    return $LASTEXITCODE -eq 0
}

function Get-HappyCommit {
    if (-not (Test-HappyRepo)) {
        return "repo not found"
    }
    return (& git -C $HappyRepo rev-parse --short HEAD 2>$null).Trim()
}

function Get-HappyRepoStatus {
    if (-not (Test-HappyRepo)) {
        return @("repo not found")
    }
    $status = @(& git -C $HappyRepo status --short 2>$null)
    if ($status.Count -eq 0) {
        return @("clean")
    }
    return $status
}

function Assert-HappyRepoClean {
    $status = @(Get-HappyRepoStatus)
    if ($status.Count -ne 1 -or $status[0] -ne "clean") {
        throw "Refusing to update official Happy repo because it is not clean: $($status -join '; ')"
    }
}

function Invoke-HappyGit {
    param([Parameter(Mandatory = $true)][string[]]$Arguments)
    Write-Log "+ git -C $HappyRepo $($Arguments -join ' ')" | Out-Null
    & git -C $HappyRepo @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "git $($Arguments -join ' ') failed with exit code $LASTEXITCODE"
    }
}

function Test-GitRef {
    param([Parameter(Mandatory = $true)][string]$Ref)
    & git -C $HappyRepo rev-parse --verify --quiet $Ref | Out-Null
    return $LASTEXITCODE -eq 0
}

function Test-DevtoolsPath {
    param([Parameter(Mandatory = $true)][string]$Path)
    return $Path -eq "AGENTS.md" -or
        $Path -eq ".gitignore" -or
        $Path -like "devtools/*" -or
        $Path -like ".agents/skills/happy-desktop-update/*" -or
        $Path -like ".agents/skills/happy-ios-release/*"
}

function Assert-OfficialProductEquivalence {
    param([string]$UpstreamRef = $OfficialBaseRef)
    if (-not (Test-GitRef $UpstreamRef)) {
        throw "Official Happy base ref not found: $UpstreamRef"
    }
    & git -C $HappyRepo merge-base --is-ancestor $UpstreamRef HEAD
    if ($LASTEXITCODE -ne 0) {
        throw "Personal main does not contain the current official commit: $UpstreamRef"
    }
    $invalid = @(& git -C $HappyRepo diff --name-only "$UpstreamRef..HEAD" |
        Where-Object { $_ -and -not (Test-DevtoolsPath $_) })
    if ($invalid.Count -gt 0) {
        throw "Personal main changes product/build inputs outside the devtools allowlist: $($invalid -join ', ')"
    }
}

function Ensure-HappyLocalBranch {
    param(
        [Parameter(Mandatory = $true)][string]$Branch,
        [Parameter(Mandatory = $true)][string]$FallbackRef
    )

    if (Test-GitRef "refs/heads/$Branch") {
        Invoke-HappyGit -Arguments @("switch", $Branch)
        return
    }
    if (Test-GitRef "refs/remotes/origin/$Branch") {
        Invoke-HappyGit -Arguments @("switch", "--track", "-c", $Branch, "origin/$Branch")
        return
    }
    if (Test-GitRef $FallbackRef) {
        Invoke-HappyGit -Arguments @("switch", "-c", $Branch, $FallbackRef)
        return
    }
    throw "Required Happy branch/ref not found: $Branch or $FallbackRef"
}

function Sync-CurrentBranchFromOrigin {
    param([Parameter(Mandatory = $true)][string]$Branch)
    $originRef = "origin/$Branch"
    if (-not (Test-GitRef $originRef)) {
        return
    }

    $counts = ((& git -C $HappyRepo rev-list --left-right --count "HEAD...$originRef") -join " ").Trim() -split "\s+"
    $ahead = [int]$counts[0]
    $behind = [int]$counts[1]
    if ($ahead -gt 0 -and $behind -gt 0) {
        throw "Happy branch $Branch diverged from $originRef; refusing automatic dev integration sync. Resolve the local branch divergence before running refresh-desktop."
    }
    if ($behind -gt 0) {
        Invoke-HappyGit -Arguments @("merge", "--ff-only", $originRef)
    }
}

function Assert-PersonalPatches {
    $cliFile = "packages/happy-cli/src/codex/runCodex.ts"
    $defaultsFile = "packages/happy-app/sources/sync/agentDefaults.ts"
    & git -C $HappyRepo grep -q "const DEFAULT_CODEX_MODEL = '$CodexDefaultModel';" -- $cliFile
    if ($LASTEXITCODE -ne 0) {
        throw "Codex default model patch missing from ${cliFile}; expected $CodexDefaultModel"
    }
    & git -C $HappyRepo grep -q "codex: { permissionMode: 'yolo', modelMode: '$CodexDefaultModel'" -- $defaultsFile
    if ($LASTEXITCODE -ne 0) {
        throw "Desktop Codex default model patch missing from ${defaultsFile}; expected $CodexDefaultModel"
    }
}

function Show-PersonalPatchStackPlan {
    if (-not (Test-HappyRepo)) {
        throw "Happy repo not found: $HappyRepo"
    }
    Assert-HappyRepoClean

    Write-Section "Happy personal dev integration"
    Write-Host "Repo:          $HappyRepo"
    Write-Host "Official base: $OfficialBaseRef"
    Write-Host "Personal main: $PersonalMainBranch"
    Write-Host "Dev branch:    $DevBranch"
    Write-Host ""
    Write-Host "Would run:"
    Write-Host "  git fetch --prune upstream"
    Write-Host "  git fetch --prune origin"
    Write-Host "  git switch $PersonalMainBranch"
    Write-Host "  verify main differs from $OfficialBaseRef only in devtools infrastructure"
    Write-Host "  git merge --no-edit $OfficialBaseRef"
    Write-Host "  git push origin $PersonalMainBranch"
    Write-Host "  git switch $DevBranch"
    Write-Host "  git merge --no-edit $PersonalMainBranch"
    Write-Host "  git push origin $DevBranch"
    Write-Host "  verify Codex default model remains $CodexDefaultModel"
}

function Sync-PersonalPatchStack {
    if (-not (Test-HappyRepo)) {
        throw "Happy repo not found: $HappyRepo"
    }
    Assert-HappyRepoClean

    $beforeFinal = ""
    $beforeOutput = & git -C $HappyRepo rev-parse $DevBranch 2>$null
    if ($LASTEXITCODE -eq 0 -and $beforeOutput) {
        $beforeFinal = $beforeOutput.Trim()
    } else {
        $beforeOutput = & git -C $HappyRepo rev-parse "origin/$DevBranch" 2>$null
        if ($LASTEXITCODE -eq 0 -and $beforeOutput) {
            $beforeFinal = $beforeOutput.Trim()
        }
    }

    Invoke-HappyGit -Arguments @("fetch", "--prune", "upstream")
    Invoke-HappyGit -Arguments @("fetch", "--prune", "origin")
    if (-not (Test-GitRef $OfficialBaseRef)) {
        throw "Official Happy base ref not found after fetch: $OfficialBaseRef"
    }

    Ensure-HappyLocalBranch -Branch $PersonalMainBranch -FallbackRef $OfficialBaseRef
    Sync-CurrentBranchFromOrigin -Branch $PersonalMainBranch
    Invoke-HappyGit -Arguments @("merge", "--no-edit", $OfficialBaseRef)
    Assert-OfficialProductEquivalence
    Invoke-HappyGit -Arguments @("push", "origin", $PersonalMainBranch)

    Ensure-HappyLocalBranch -Branch $DevBranch -FallbackRef $PersonalMainBranch
    Sync-CurrentBranchFromOrigin -Branch $DevBranch
    Invoke-HappyGit -Arguments @("merge", "--no-edit", $PersonalMainBranch)
    Assert-PersonalPatches
    Invoke-HappyGit -Arguments @("push", "origin", $DevBranch)

    $afterFinal = (& git -C $HappyRepo rev-parse HEAD).Trim()
    $script:LastPatchStackCommit = $afterFinal
    $script:LastPatchStackChanged = (-not $beforeFinal) -or ($beforeFinal -ne $afterFinal)
}

function Get-HappyCurrentBranch {
    $branch = (& git -C $HappyRepo branch --show-current 2>$null)
    if ($LASTEXITCODE -ne 0) {
        return ""
    }
    return ($branch | Out-String).Trim()
}

function Sync-OfficialBaselineSource {
    Assert-HappyRepoClean
    Invoke-HappyGit -Arguments @("fetch", "--prune", "upstream")
    if (-not (Test-GitRef $OfficialBaseRef)) {
        throw "Official Happy base ref not found after fetch: $OfficialBaseRef"
    }

    Ensure-HappyLocalBranch -Branch $PersonalMainBranch -FallbackRef $OfficialBaseRef
    Sync-CurrentBranchFromOrigin -Branch $PersonalMainBranch
    Invoke-HappyGit -Arguments @("merge", "--no-edit", $OfficialBaseRef)
    Assert-OfficialProductEquivalence
}

function Assert-OfficialBaselineSource {
    Assert-HappyRepoClean
    $branch = Get-HappyCurrentBranch
    if ($branch -ne $PersonalMainBranch) {
        throw "Official baseline must be built from $PersonalMainBranch, current branch is $branch. Run refresh-official-baseline."
    }
    if (-not (Test-GitRef $OfficialBaseRef)) {
        throw "Official Happy base ref not found: $OfficialBaseRef"
    }

    Assert-OfficialProductEquivalence
}

function Refresh-HappyIndexIfContentUnchanged {
    & git -C $HappyRepo diff --quiet --
    $workingTreeDiff = $LASTEXITCODE
    & git -C $HappyRepo diff --cached --quiet --
    $stagedDiff = $LASTEXITCODE
    if ($workingTreeDiff -eq 0 -and $stagedDiff -eq 0) {
        & git -C $HappyRepo add -u --refresh | Out-Null
    }
}

function Restore-OfficialBaselineBuildSideEffects {
    $lockfile = "pnpm-lock.yaml"
    & git -C $HappyRepo diff --quiet -- $lockfile
    if ($LASTEXITCODE -ne 0) {
        Write-Log "Restoring build-generated official lockfile change: $lockfile"
        Invoke-HappyGit -Arguments @("restore", "--source=HEAD", "--worktree", "--", $lockfile)
    }

    $cargoManifest = "packages/happy-app/src-tauri/Cargo.toml"
    $cargoWorktreeHash = (& git -C $HappyRepo hash-object $cargoManifest).Trim()
    $cargoHeadHash = (& git -C $HappyRepo rev-parse "HEAD:$cargoManifest").Trim()
    if ($cargoWorktreeHash -eq $cargoHeadHash) {
        & git -C $HappyRepo add -- $cargoManifest
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to refresh unchanged Cargo manifest index state: $cargoManifest"
        }
    }

    & git -C $HappyRepo diff --cached --quiet --
    if ($LASTEXITCODE -ne 0) {
        throw "Official baseline cleanup produced unexpected staged changes."
    }
    Assert-HappyRepoClean
}

function Get-HappyUpstreamRef {
    $upstream = (& git -C $HappyRepo rev-parse --abbrev-ref --symbolic-full-name "@{u}" 2>$null)
    if ($LASTEXITCODE -eq 0 -and $upstream) {
        return $upstream.Trim()
    }

    $originMain = (& git -C $HappyRepo rev-parse --verify --quiet "origin/main" 2>$null)
    if ($LASTEXITCODE -eq 0 -and $originMain) {
        return "origin/main"
    }

    return ""
}

function Get-HappyUpstreamState {
    param([switch]$Fetch)

    if (-not (Test-HappyRepo)) {
        throw "Happy repo not found: $HappyRepo"
    }

    Assert-HappyRepoClean

    if ($Fetch) {
        Write-Log "+ git -C $HappyRepo fetch --prune" | Out-Null
        & git -C $HappyRepo fetch --prune
        if ($LASTEXITCODE -ne 0) {
            throw "git fetch failed with exit code $LASTEXITCODE"
        }
    }

    $upstream = Get-HappyUpstreamRef
    if (-not $upstream) {
        throw "Could not determine Happy repo upstream. Configure branch upstream or origin/main."
    }

    $local = (& git -C $HappyRepo rev-parse HEAD).Trim()
    $remote = (& git -C $HappyRepo rev-parse $upstream).Trim()
    $counts = ((& git -C $HappyRepo rev-list --left-right --count "HEAD...$upstream") -join " ").Trim() -split "\s+"
    $ahead = [int]$counts[0]
    $behind = [int]$counts[1]

    return [pscustomobject]@{
        Upstream = $upstream
        Local = $local
        Remote = $remote
        Ahead = $ahead
        Behind = $behind
        HasUpdate = $behind -gt 0
        IsDiverged = ($ahead -gt 0 -and $behind -gt 0)
    }
}

function Show-HappyUpstreamState {
    param([Parameter(Mandatory = $true)]$State)

    Write-Section "Happy upstream"
    Write-Host "Repo:      $HappyRepo"
    Write-Host "Upstream:  $($State.Upstream)"
    Write-Host "Local:     $($State.Local)"
    Write-Host "Remote:    $($State.Remote)"
    Write-Host "Ahead:     $($State.Ahead)"
    Write-Host "Behind:    $($State.Behind)"
    if ($State.IsDiverged) {
        Write-Host "Status:    diverged"
    } elseif ($State.HasUpdate) {
        Write-Host "Status:    update available"
    } else {
        Write-Host "Status:    up to date"
    }
}

function Get-NpmGlobalHappy {
    if (-not (Test-CommandExists "npm")) {
        return "npm not found"
    }
    return ((& npm list -g --depth=0 happy 2>&1) -join "`n").Trim()
}

function Get-NpmGlobalRoot {
    if (-not (Test-CommandExists "npm")) {
        throw "npm is required to locate the global Happy package."
    }

    $root = ((& npm root -g 2>&1) -join "`n").Trim()
    if ($LASTEXITCODE -ne 0 -or -not $root) {
        throw "npm root -g failed: $root"
    }
    return $root
}

function Get-HappyNpmPackageRoot {
    $happyPaths = @(Get-CommandPaths "happy")
    $npmHappy = Get-NpmGlobalHappy
    if ($happyPaths.Count -eq 0 -or $npmHappy -notmatch "happy@") {
        throw "Happy CLI source is not confirmed as npm global package. where happy=[$($happyPaths -join '; ')] npm list=[$npmHappy]"
    }

    $packageRoot = Join-Path (Get-NpmGlobalRoot) "happy"
    $packageJson = Join-Path $packageRoot "package.json"
    if (-not (Test-Path -LiteralPath $packageJson)) {
        throw "Happy npm package.json not found: $packageJson"
    }
    return $packageRoot
}

function Get-HappyCliPackageInfo {
    $packageRoot = Get-HappyNpmPackageRoot
    $packageJson = Join-Path $packageRoot "package.json"
    $metadata = Get-Content -LiteralPath $packageJson -Raw | ConvertFrom-Json
    return [pscustomobject]@{
        Root = $packageRoot
        Version = $metadata.version
    }
}

function Get-HappyCodexModelPatchTargets {
    $packageRoot = Get-HappyNpmPackageRoot
    $distRoot = Join-Path $packageRoot "dist"
    if (-not (Test-Path -LiteralPath $distRoot)) {
        throw "Happy dist directory not found: $distRoot"
    }

    $pattern = 'const DEFAULT_CODEX_MODEL = "([^"]+)";'
    $files = @(Get-ChildItem -LiteralPath $distRoot -Recurse -File -ErrorAction Stop | Where-Object {
            $_.Extension -in @(".mjs", ".cjs", ".js")
        })

    $targets = @()
    foreach ($file in $files) {
        $content = Get-Content -LiteralPath $file.FullName -Raw
        $match = [regex]::Match($content, $pattern)
        if ($match.Success) {
            $targets += [pscustomobject]@{
                Path = $file.FullName
                CurrentModel = $match.Groups[1].Value
            }
        }
    }

    return $targets
}

function Test-HappyDaemonPid {
    param([Parameter(Mandatory = $true)][int]$ProcessId)
    return $null -ne (Get-Process -Id $ProcessId -ErrorAction SilentlyContinue)
}

function Get-HappyDaemonState {
    $statePath = Join-Path $env:USERPROFILE ".happy\daemon.state.json"
    if (-not (Test-Path -LiteralPath $statePath)) {
        return $null
    }
    return Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
}

function Restart-HappyDaemon {
    $happyCommand = Get-ExecutableCommandPath "happy"
    if (-not $happyCommand) {
        throw "happy command not found; cannot restart daemon."
    }

    Write-Log "Restarting Happy daemon after CLI Codex model patch."
    Write-Log "+ happy daemon stop"
    & $happyCommand daemon stop
    if ($LASTEXITCODE -ne 0) {
        Write-Log "happy daemon stop exited with $LASTEXITCODE; continuing to start daemon."
    }

    Write-Log "+ happy daemon start"
    $startOutput = @(& $happyCommand daemon start 2>&1)
    $startExitCode = $LASTEXITCODE
    if ($startOutput.Count -gt 0) {
        $startOutput | ForEach-Object { Write-Log "daemon start: $_" }
    }

    $deadline = (Get-Date).AddSeconds(20)
    do {
        $state = Get-HappyDaemonState
        if ($state -and $state.pid -and (Test-HappyDaemonPid -ProcessId ([int]$state.pid))) {
            Write-Host "Happy daemon running: pid=$($state.pid) port=$($state.port)"
            return
        }
        Start-Sleep -Seconds 1
    } while ((Get-Date) -lt $deadline)

    if ($startExitCode -ne 0) {
        throw "happy daemon start exited with $startExitCode and no running daemon was confirmed."
    }

    throw "Happy daemon start returned success but no running daemon was confirmed."
}

function Invoke-PatchHappyCliCodexModel {
    $packageInfo = Get-HappyCliPackageInfo
    $targets = @(Get-HappyCodexModelPatchTargets)
    if ($targets.Count -eq 0) {
        throw "No DEFAULT_CODEX_MODEL constant found under $($packageInfo.Root)\dist. Happy may have changed its build output."
    }

    Write-Section "Happy CLI Codex model"
    Write-Host "Package: $($packageInfo.Root)"
    Write-Host "Version: $($packageInfo.Version)"
    Write-Host "Model:   $CodexModel"

    $pattern = 'const DEFAULT_CODEX_MODEL = "([^"]+)";'
    $replacement = 'const DEFAULT_CODEX_MODEL = "' + $CodexModel + '";'
    foreach ($target in $targets) {
        $content = Get-Content -LiteralPath $target.Path -Raw
        $updated = [regex]::Replace($content, $pattern, $replacement, 1)
        if ($updated -ne $content) {
            Set-Content -LiteralPath $target.Path -Value $updated -Encoding UTF8 -NoNewline
            Write-Log "Patched Happy CLI Codex model: $($target.Path) $($target.CurrentModel) -> $CodexModel" | Out-Null
            Write-Host "patched $($target.Path): $($target.CurrentModel) -> $CodexModel"
        } else {
            Write-Host "ok      $($target.Path): already $CodexModel"
        }
    }

    $verifiedTargets = @(Get-HappyCodexModelPatchTargets)
    $wrongTargets = @($verifiedTargets | Where-Object { $_.CurrentModel -ne $CodexModel })
    if ($wrongTargets.Count -gt 0) {
        throw "Happy CLI Codex model patch verification failed: $($wrongTargets.Path -join '; ')"
    }

    Write-Host "Verified DEFAULT_CODEX_MODEL=$CodexModel in $($verifiedTargets.Count) file(s)."
    if ($RestartDaemon) {
        Restart-HappyDaemon
    }
}

function Get-MsvcInfo {
    $vswhere = Join-Path ${env:ProgramFiles(x86)} "Microsoft Visual Studio\Installer\vswhere.exe"
    if (-not (Test-Path -LiteralPath $vswhere)) {
        return [pscustomobject]@{
            Found = $false
            Detail = "vswhere.exe not found"
        }
    }

    $installPath = (& $vswhere -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath 2>$null).Trim()
    if (-not $installPath) {
        return [pscustomobject]@{
            Found = $false
            Detail = "Visual Studio C++ Build Tools / MSVC component not found"
        }
    }

    $vcvars = Join-Path $installPath "VC\Auxiliary\Build\vcvars64.bat"
    return [pscustomobject]@{
        Found = $true
        Detail = $installPath
        VcVars64 = $vcvars
        VcVars64Exists = (Test-Path -LiteralPath $vcvars)
    }
}

function Get-WebView2Info {
    $paths = @(
        "HKLM:\SOFTWARE\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}",
        "HKLM:\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}"
    )
    foreach ($path in $paths) {
        $item = Get-ItemProperty $path -ErrorAction SilentlyContinue
        if ($item -and $item.pv) {
            return [pscustomobject]@{
                Found = $true
                Version = $item.pv
                Source = $path
            }
        }
    }
    return [pscustomobject]@{
        Found = $false
        Version = ""
        Source = "registry entry not found"
    }
}

function Get-RustInfo {
    if (-not (Test-CommandExists "rustup")) {
        return "rustup not found"
    }
    return ((& rustup show 2>&1) -join "`n").Trim()
}

function Get-BuildArtifacts {
    $releaseRoot = Join-Path $TauriRoot "target\release"
    $bundleRoot = Join-Path $releaseRoot "bundle"
    $items = @()

    if (Test-Path -LiteralPath $releaseRoot) {
        $items += Get-ChildItem -LiteralPath $releaseRoot -Filter "*.exe" -File -ErrorAction SilentlyContinue
    }

    if (Test-Path -LiteralPath $bundleRoot) {
        foreach ($pattern in @("*.exe", "*.msi", "*.msix", "*.appx", "*.zip")) {
            $items += Get-ChildItem -LiteralPath $bundleRoot -Filter $pattern -Recurse -File -ErrorAction SilentlyContinue
        }
    }

    return $items | Sort-Object LastWriteTime -Descending -Unique
}

function Get-LatestNsisInstaller {
    $artifacts = @(Get-BuildArtifacts)
    $installers = @($artifacts | Where-Object {
            $_.FullName -match "\\bundle\\nsis\\" -and
            $_.Name -like "$WindowsAppName*-setup.exe"
        } | Sort-Object LastWriteTime -Descending)

    if ($installers.Count -eq 0) {
        return $null
    }

    return $installers[0]
}

function Get-InstalledDesktopInfo {
    $uninstall = Get-ItemProperty -LiteralPath $WindowsUninstallKey -ErrorAction SilentlyContinue
    return [pscustomobject]@{
        InstallDir = $WindowsInstallDir
        Exe = $WindowsInstalledExe
        InstallDirExists = Test-Path -LiteralPath $WindowsInstallDir
        ExeExists = Test-Path -LiteralPath $WindowsInstalledExe
        UninstallEntryExists = $null -ne $uninstall
        DisplayName = if ($uninstall) { $uninstall.DisplayName } else { "" }
        DisplayVersion = if ($uninstall) { $uninstall.DisplayVersion } else { "" }
        InstallLocation = if ($uninstall) { $uninstall.InstallLocation } else { "" }
        UninstallString = if ($uninstall) { $uninstall.UninstallString } else { "" }
    }
}

function Get-UninstallRegistrySnapshot {
    $uninstall = Get-ItemProperty -LiteralPath $WindowsUninstallKey -ErrorAction SilentlyContinue
    if (-not $uninstall) {
        return $null
    }

    $snapshot = [ordered]@{}
    foreach ($property in $uninstall.PSObject.Properties) {
        if ($property.Name -like "PS*") {
            continue
        }
        $snapshot[$property.Name] = $property.Value
    }
    return $snapshot
}

function Save-UninstallRegistryBackup {
    param(
        [Parameter(Mandatory = $true)][string]$BackupPath,
        [System.Collections.IDictionary]$Snapshot
    )

    if (-not $BackupPath -or -not $Snapshot) {
        return ""
    }

    $path = Join-Path $BackupPath "uninstall-registry.json"
    $Snapshot | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $path -Encoding UTF8
    Write-Log "Backed up Windows uninstall registry entry to $path" | Out-Null
    return $path
}

function Restore-UninstallRegistrySnapshot {
    param([System.Collections.IDictionary]$Snapshot)

    if (-not $Snapshot) {
        Write-Log "No Windows uninstall registry snapshot available for rollback." | Out-Null
        return $false
    }

    Write-Log "Restoring Windows uninstall registry entry: $WindowsUninstallKey" | Out-Null
    if (-not (Test-Path -LiteralPath $WindowsUninstallKey)) {
        New-Item -Path $WindowsUninstallKey -Force | Out-Null
    }

    $current = Get-ItemProperty -LiteralPath $WindowsUninstallKey -ErrorAction SilentlyContinue
    if ($current) {
        foreach ($property in $current.PSObject.Properties) {
            if ($property.Name -like "PS*") {
                continue
            }
            if (-not $Snapshot.Contains($property.Name)) {
                Remove-ItemProperty -LiteralPath $WindowsUninstallKey -Name $property.Name -ErrorAction SilentlyContinue
            }
        }
    }

    foreach ($key in $Snapshot.Keys) {
        New-ItemProperty -LiteralPath $WindowsUninstallKey -Name $key -Value $Snapshot[$key] -Force | Out-Null
    }
    return $true
}

function Assert-DesktopInstallValid {
    $info = Get-InstalledDesktopInfo
    if (-not $info.InstallDirExists) {
        throw "Installed Happy Desktop directory not found: $($info.InstallDir)"
    }
    if (-not $info.ExeExists) {
        throw "Installed Happy Desktop executable not found: $($info.Exe)"
    }
    if (-not $info.UninstallEntryExists) {
        throw "Installed Happy Desktop uninstall entry not found: $WindowsUninstallKey"
    }
    if ($info.DisplayName -and $info.DisplayName -ne $WindowsAppName) {
        throw "Unexpected uninstall DisplayName: $($info.DisplayName)"
    }

    return $info
}

function Get-InstalledDesktopProcesses {
    if (-not (Test-Path -LiteralPath $WindowsInstalledExe)) {
        return @()
    }

    $expectedPath = [System.IO.Path]::GetFullPath($WindowsInstalledExe)
    return @(Get-CimInstance Win32_Process -Filter "Name = 'app.exe'" -ErrorAction SilentlyContinue | Where-Object {
            $_.ExecutablePath -and ([System.IO.Path]::GetFullPath($_.ExecutablePath) -ieq $expectedPath)
        })
}

function Stop-InstalledDesktopProcesses {
    $processes = @(Get-InstalledDesktopProcesses)

    foreach ($process in $processes) {
        Write-Log "Stopping running Happy Desktop process pid=$($process.ProcessId) path=$($process.ExecutablePath)"
        Stop-Process -Id $process.ProcessId -Force -ErrorAction Stop
    }
}

function New-DesktopBackup {
    if (-not (Test-Path -LiteralPath $WindowsInstallDir)) {
        Write-Log "No existing Windows Happy Desktop install directory to back up." | Out-Null
        return $null
    }

    New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
    $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $backupPath = Join-Path $BackupDir "$WindowsAppName-windows-$stamp"
    Write-Log "Backing up $WindowsInstallDir to $backupPath" | Out-Null
    Copy-Item -LiteralPath $WindowsInstallDir -Destination $backupPath -Recurse -Force
    return $backupPath
}

function Restore-DesktopBackup {
    param([string]$BackupPath)

    if (-not $BackupPath -or -not (Test-Path -LiteralPath $BackupPath)) {
        Write-Log "No backup available for rollback."
        return
    }

    Write-Log "Rolling back Windows Happy Desktop from $BackupPath"
    if (Test-Path -LiteralPath $WindowsInstallDir) {
        Remove-Item -LiteralPath $WindowsInstallDir -Recurse -Force
    }
    Copy-Item -LiteralPath $BackupPath -Destination $WindowsInstallDir -Recurse -Force
}

function Remove-ExistingDesktopInstallForReplace {
    if (-not (Test-Path -LiteralPath $WindowsInstallDir)) {
        return
    }

    $expectedInstallDir = [System.IO.Path]::GetFullPath((Join-Path $env:LOCALAPPDATA $WindowsAppName))
    $actualInstallDir = [System.IO.Path]::GetFullPath($WindowsInstallDir)
    if ($actualInstallDir -ine $expectedInstallDir) {
        throw "Refusing to remove unexpected Windows Happy Desktop install dir: $actualInstallDir"
    }

    Write-Log "Removing existing Windows Happy Desktop install directory before NSIS install: $actualInstallDir"
    Remove-Item -LiteralPath $WindowsInstallDir -Recurse -Force
}

function Assert-InstalledDesktopMatchesBuildArtifact {
    $builtExe = Join-Path $TauriRoot "target\release\app.exe"
    if (-not (Test-Path -LiteralPath $builtExe)) {
        Write-Log "Skipping installed exe hash check because build artifact is missing: $builtExe"
        return
    }

    $builtHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $builtExe).Hash
    $installedHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $WindowsInstalledExe).Hash
    if ($builtHash -ne $installedHash) {
        throw "Installed Happy Desktop exe hash does not match build artifact. built=$builtHash installed=$installedHash"
    }

    Write-Log "Installed Happy Desktop exe matches build artifact: $installedHash"
}

function Remove-OldDesktopBackups {
    param([Parameter(Mandatory = $true)][int]$Keep)

    if (-not (Test-Path -LiteralPath $BackupDir)) {
        return
    }

    $backupRoot = [System.IO.Path]::GetFullPath($BackupDir)
    $backups = @(Get-ChildItem -LiteralPath $BackupDir -Directory -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -like "$WindowsAppName-windows-*" } |
        Sort-Object LastWriteTime -Descending)

    if ($backups.Count -le $Keep) {
        Write-Log "Backup retention: $($backups.Count) Windows desktop backup(s), keep=$Keep."
        return
    }

    $toRemove = @($backups | Select-Object -Skip $Keep)
    foreach ($backup in $toRemove) {
        $backupPath = [System.IO.Path]::GetFullPath($backup.FullName)
        if (-not $backupPath.StartsWith($backupRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
            throw "Refusing to remove backup outside backup root: $backupPath"
        }
        Write-Log "Removing old Windows desktop backup: $backupPath"
        Remove-Item -LiteralPath $backupPath -Recurse -Force
    }
}

function Invoke-NsisInstall {
    param([Parameter(Mandatory = $true)][System.IO.FileInfo]$Installer)

    Write-Log "+ $($Installer.FullName) /S"
    $process = Start-Process -FilePath $Installer.FullName -ArgumentList "/S" -Wait -PassThru
    if ($process.ExitCode -ne 0) {
        throw "NSIS installer failed with exit code $($process.ExitCode): $($Installer.FullName)"
    }
}

function Show-UpdateDesktopDryRun {
    param([Parameter(Mandatory = $true)][System.IO.FileInfo]$Installer)

    Write-Section "Windows desktop update dry run"
    Write-Host "Installer:     $($Installer.FullName)"
    Write-Host "Install dir:   $WindowsInstallDir"
    Write-Host "Installed exe: $WindowsInstalledExe"
    Write-Host "Backup dir:    $BackupDir"
    Write-Host "Keep backups:  $KeepBackups"

    $desktop = Get-InstalledDesktopInfo
    Write-Host "Currently installed: dir=$($desktop.InstallDirExists) exe=$($desktop.ExeExists) uninstall=$($desktop.UninstallEntryExists) version=$($desktop.DisplayVersion)"
    Write-Host "Uninstall key: $WindowsUninstallKey"
    if ($desktop.UninstallEntryExists) {
        Write-Host "Uninstall entry: display=$($desktop.DisplayName) location=$($desktop.InstallLocation)"
        Write-Host "Registry rollback: uninstall entry would be snapshotted before install."
    } else {
        Write-Host "Registry rollback: no current uninstall entry to snapshot."
    }

    $processes = @(Get-InstalledDesktopProcesses)
    if ($processes.Count -eq 0) {
        Write-Host "Processes:     none to stop"
    } else {
        Write-Host "Processes to stop:"
        $processes | Select-Object ProcessId, ExecutablePath | Format-List
    }

    $existingBackups = @()
    if (Test-Path -LiteralPath $BackupDir) {
        $existingBackups = @(Get-ChildItem -LiteralPath $BackupDir -Directory -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -like "$WindowsAppName-windows-*" } |
            Sort-Object LastWriteTime -Descending)
    }
    Write-Host "Existing Windows desktop backups: $($existingBackups.Count)"
    if ($existingBackups.Count -gt $KeepBackups) {
        Write-Host "Backups that would be removed after success:"
        $existingBackups | Select-Object -Skip $KeepBackups | Select-Object Name, FullName, LastWriteTime | Format-List
    } else {
        Write-Host "Backups to remove after success: none"
    }

    Write-Host "No changes made."
}

function Wait-InstalledDesktopProcess {
    param(
        [Parameter(Mandatory = $true)][int]$ProcessId,
        [int]$TimeoutSeconds = 15
    )

    $expectedPath = [System.IO.Path]::GetFullPath($WindowsInstalledExe)
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        $process = Get-CimInstance Win32_Process -Filter "ProcessId = $ProcessId" -ErrorAction SilentlyContinue
        if ($process -and $process.ExecutablePath -and ([System.IO.Path]::GetFullPath($process.ExecutablePath) -ieq $expectedPath)) {
            return $process
        }
        Start-Sleep -Milliseconds 500
    }

    return $null
}

function Invoke-VerifyDesktop {
    Write-Section "Windows desktop install"
    $info = Assert-DesktopInstallValid
    Write-Host "ok   install dir: $($info.InstallDir)"
    Write-Host "ok   installed exe: $($info.Exe)"
    Write-Host "ok   uninstall key: $WindowsUninstallKey"
    Write-Host "ok   version: $($info.DisplayVersion)"

    Write-Section "Launch check"
    Write-Host "Starting installed Happy Desktop for verification..."
    $existingProcessIds = @(Get-InstalledDesktopProcesses | ForEach-Object { $_.ProcessId })
    $process = Start-Process -FilePath $WindowsInstalledExe -PassThru
    $startedProcess = $null
    try {
        $startedProcess = Wait-InstalledDesktopProcess -ProcessId $process.Id
        if (-not $startedProcess) {
            throw "Started process was not found at expected path within timeout. pid=$($process.Id) expected=$WindowsInstalledExe"
        }

        Write-Host "ok   launched pid=$($startedProcess.ProcessId)"
        Write-Host "ok   path=$($startedProcess.ExecutablePath)"
    } finally {
        if ($startedProcess) {
            Write-Host "Stopping verification process pid=$($startedProcess.ProcessId)"
            Stop-Process -Id $startedProcess.ProcessId -Force -ErrorAction SilentlyContinue
        } elseif ($process -and -not $process.HasExited) {
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        }

        Start-Sleep -Seconds 1
        $newProcesses = @(Get-InstalledDesktopProcesses | Where-Object { $existingProcessIds -notcontains $_.ProcessId })
        foreach ($newProcess in $newProcesses) {
            Write-Host "Stopping verification child process pid=$($newProcess.ProcessId)"
            Stop-Process -Id $newProcess.ProcessId -Force -ErrorAction SilentlyContinue
        }
    }

    Write-Section "Summary"
    Write-Host "Windows Happy Desktop verification passed."
}

function Show-Usage {
    @"
Usage:
  .\devtools\scripts\install-windows-build-node.ps1
  .\devtools\happyctl.ps1 status
  .\devtools\happyctl.ps1 doctor
  .\devtools\happyctl.ps1 artifacts
  .\devtools\happyctl.ps1 build-desktop
  .\devtools\happyctl.ps1 build-official-baseline
  .\devtools\happyctl.ps1 update-cli
  .\devtools\happyctl.ps1 patch-cli-codex-model [-CodexModel gpt-5.6-sol] [-RestartDaemon]
  .\devtools\happyctl.ps1 update-desktop
  .\devtools\happyctl.ps1 update-desktop -DryRun
  .\devtools\happyctl.ps1 update-desktop -KeepBackups 3
  .\devtools\happyctl.ps1 update-official-baseline [-DryRun]
  .\devtools\happyctl.ps1 update-all
  .\devtools\happyctl.ps1 verify-desktop
  .\devtools\happyctl.ps1 verify-official-baseline
  .\devtools\happyctl.ps1 check-upstream
  .\devtools\happyctl.ps1 refresh-desktop
  .\devtools\happyctl.ps1 refresh-desktop -Force
  .\devtools\happyctl.ps1 refresh-official-baseline [-DryRun]
  .\devtools\happyctl.ps1 install-refresh-task
  .\devtools\happyctl.ps1 install-refresh-task -TaskTime 09:00
  .\devtools\happyctl.ps1 refresh-task-status
  .\devtools\happyctl.ps1 uninstall-refresh-task

Windows defaults:
  Happy repo:    $HappyRepo
  Devtools root:  $DevtoolsRoot
  Build Node:    $WindowsBuildNodeRoot
  Backup dir:   $BackupDir
  Log dir:      $LogDir
  Report dir:   $ReportDir
  Tauri config: $TauriConfig
  Install dir:  $WindowsInstallDir
  Keep backups: $KeepBackups
  Task name:    $WindowsRefreshTaskName
  Task time:    $TaskTime

Notes:
  refresh-desktop syncs official main into personal dev and skips build/update when dev is unchanged.
  -Force rebuilds and reinstalls from personal dev.
  refresh-official-baseline builds product-equivalent personal main as a separately installed comparison client.
  Official baseline identity: Happy (official baseline) / com.slopus.happy.official-baseline.
  update-desktop installs the latest verified NSIS artifact with /S.
  update-cli reapplies the Happy CLI Codex default model patch after npm upgrade.
  patch-cli-codex-model updates Happy's built-in DEFAULT_CODEX_MODEL in the global npm package.
  -DryRun previews installer, processes, backup, and retention without changing the system.
  MSI artifacts are intentionally ignored by update-desktop.
  Copy config.example.windows.ps1 to `$env:LOCALAPPDATA\Happy Devtools\config.windows.ps1` for local overrides.
"@ | Write-Host
}

function Show-Status {
    Write-Section "Paths"
    Write-Host "Devtools root: $DevtoolsRoot"
    Write-Host "Happy repo:   $HappyRepo"
    Write-Host "Backup dir:   $BackupDir"
    Write-Host "Log dir:      $LogDir"
    Write-Host "Report dir:   $ReportDir"
    Write-Host "Tauri config: $TauriConfigPath"
    Write-Host "Build Node:   $WindowsBuildNodeRoot"

    Write-Section "Happy repo"
    Write-Host "Exists:        $(Test-HappyRepo)"
    Write-Host "Commit:        $(Get-HappyCommit)"
    Write-Host "Status:"
    Get-HappyRepoStatus | ForEach-Object { Write-Host "  $_" }

    Write-Section "Happy CLI"
    $happyPaths = @(Get-CommandPaths "happy")
    if ($happyPaths.Count -eq 0) {
        Write-Host "Path:          not found"
    } else {
        Write-Host "Path:          $($happyPaths -join '; ')"
        Write-Host "Version:"
        (Invoke-Version "happy") -split "`n" | ForEach-Object { Write-Host "  $_" }
    }
    Write-Host "npm global:"
    (Get-NpmGlobalHappy) -split "`n" | ForEach-Object { Write-Host "  $_" }
    try {
        $modelTargets = @(Get-HappyCodexModelPatchTargets)
        if ($modelTargets.Count -gt 0) {
            Write-Host "Codex model defaults:"
            $modelTargets | ForEach-Object { Write-Host "  $($_.CurrentModel)  $($_.Path)" }
        }
    } catch {
        Write-Host "Codex model defaults: $($_.Exception.Message)"
    }

    Write-Section "Toolchain"
    foreach ($tool in @("node", "npm", "pnpm", "git", "cargo", "rustup")) {
        Write-CommandStatus $tool | Out-Null
    }

    Write-Section "Windows native build dependencies"
    $msvc = Get-MsvcInfo
    Write-Host "MSVC found:    $($msvc.Found)"
    Write-Host "MSVC detail:   $($msvc.Detail)"
    if ($msvc.Found) {
        Write-Host "vcvars64.bat:  $($msvc.VcVars64) exists=$($msvc.VcVars64Exists)"
    }
    $webview = Get-WebView2Info
    Write-Host "WebView2:      found=$($webview.Found) version=$($webview.Version) source=$($webview.Source)"

    Write-Section "Build artifacts"
    Show-Artifacts

    Write-Section "Windows desktop install"
    $desktop = Get-InstalledDesktopInfo
    Write-Host "Install dir:   $($desktop.InstallDir)"
    Write-Host "Dir exists:    $($desktop.InstallDirExists)"
    Write-Host "Exe exists:    $($desktop.ExeExists)"
    Write-Host "Uninstall key: $($desktop.UninstallEntryExists)"
    if ($desktop.UninstallEntryExists) {
        Write-Host "Version:       $($desktop.DisplayVersion)"
        Write-Host "Location:      $($desktop.InstallLocation)"
    }
}

function Show-Artifacts {
    $artifacts = @(Get-BuildArtifacts)
    if ($artifacts.Count -eq 0) {
        Write-Host "No Windows desktop artifacts found yet under $TauriRoot\target\release."
        return
    }

    $artifacts | Select-Object LastWriteTime, Length, FullName | Format-List
}

function Invoke-Doctor {
    $failed = $false

    Write-Section "Required commands"
    foreach ($tool in @("git", "node", "npm", "pnpm", "cargo", "rustup")) {
        if (-not (Write-CommandStatus $tool)) {
            $failed = $true
        }
    }

    Write-Section "Windows Unix tools"
    foreach ($tool in @("sh", "rm")) {
        if (-not (Write-CommandStatus $tool)) {
            $failed = $true
        }
    }

    Write-Section "Happy repo"
    if (Test-HappyRepo) {
        Write-Host "ok   Happy repo $HappyRepo"
    } else {
        Write-Host "miss Happy repo $HappyRepo"
        $failed = $true
    }

    Write-Section "MSVC"
    $msvc = Get-MsvcInfo
    if ($msvc.Found -and $msvc.VcVars64Exists) {
        Write-Host "ok   MSVC $($msvc.Detail)"
    } else {
        Write-Host "miss MSVC $($msvc.Detail)"
        $failed = $true
    }

    Write-Section "Rust toolchain"
    $rust = Get-RustInfo
    Write-Host $rust
    if ($rust -notmatch "stable.*msvc|host: .*msvc|installed toolchains") {
        $failed = $true
    }

    Write-Section "WebView2 Runtime"
    $webview = Get-WebView2Info
    if ($webview.Found) {
        Write-Host "ok   WebView2 Runtime $($webview.Version)"
    } else {
        Write-Host "miss WebView2 Runtime"
        $failed = $true
    }

    Write-Section "Summary"
    if ($failed) {
        Write-Host "Doctor found missing Windows Tauri build prerequisites."
        exit 1
    }
    Write-Host "Doctor passed."
}

function Invoke-BuildDesktop {
    foreach ($tool in @("git", "node", "npm", "pnpm", "cargo")) {
        if (-not (Test-CommandExists $tool)) {
            throw "Missing required command for build-desktop: $tool"
        }
    }
    if (-not (Test-HappyRepo)) {
        throw "Happy repo not found: $HappyRepo"
    }
    Assert-WindowsBuildNode
    if (-not (Test-Path -LiteralPath $TauriConfigPath)) {
        throw "Tauri config not found: $TauriConfigPath"
    }

    Write-Log "Starting Windows Happy Desktop build"
    Push-Location $HappyRepo
    try {
        Write-Log "+ git status --short"
        & git status --short

        if ($DesktopProfile -eq "official-baseline") {
            $installArgs = @("install", "--frozen-lockfile")
            Write-Log "+ pnpm $($installArgs -join ' ')"
            & pnpm @installArgs
            if ($LASTEXITCODE -eq 0) {
                $script:OfficialBaselineDependencyMode = "frozen-lockfile"
            } else {
                Write-Log "Official lockfile is stale; retrying dependency install without frozen lockfile. The generated lockfile change will be restored after build."
                $installArgs = @("install", "--no-frozen-lockfile")
                Write-Log "+ pnpm $($installArgs -join ' ')"
                & pnpm @installArgs
                if ($LASTEXITCODE -ne 0) {
                    throw "pnpm $($installArgs -join ' ') failed with exit code $LASTEXITCODE"
                }
                $script:OfficialBaselineDependencyMode = "resolved-stale-upstream-lockfile"
            }
        } else {
            $installArgs = @("install")
            Write-Log "+ pnpm $($installArgs -join ' ')"
            & pnpm @installArgs
            if ($LASTEXITCODE -ne 0) {
                throw "pnpm install failed with exit code $LASTEXITCODE"
            }
        }

        # Export the frontend before starting Tauri. With Expo SDK 55, running the
        # configured beforeBuildCommand from Tauri can overlap Rust compilation.
        # generate_context! then observes a partially populated dist directory and
        # produces an executable without index.html.
        $frontendIndex = Join-Path $HappyAppPackage "dist\index.html"
        Write-Log "+ pnpm --filter happy-app exec expo export --platform web --output-dir dist --clear"
        # The pnpm Windows shim can exit while Expo descendants are still draining
        # Metro work. Start-Process -Wait waits for the process tree, preventing
        # Tauri's generate_context! macro from racing a still-changing dist folder.
        $pnpmCommand = (Get-Command "pnpm.cmd" -ErrorAction Stop).Source
        $expoExport = Start-Process `
            -FilePath $pnpmCommand `
            -ArgumentList @("--filter", "happy-app", "exec", "expo", "export", "--platform", "web", "--output-dir", "dist", "--clear") `
            -NoNewWindow `
            -Wait `
            -PassThru
        if ($expoExport.ExitCode -ne 0) {
            throw "Expo web export failed with exit code $($expoExport.ExitCode)"
        }
        if (-not (Test-Path -LiteralPath $frontendIndex -PathType Leaf)) {
            throw "Expo web export finished but index.html is missing: $frontendIndex"
        }
        $frontendHtml = Get-Content -LiteralPath $frontendIndex -Raw
        $mainBundleMatch = [regex]::Match(
            $frontendHtml,
            'src="/(?<path>_expo/static/js/web/index-[^"]+\.js)"'
        )
        if (-not $mainBundleMatch.Success) {
            throw "Expo web export finished but index.html does not reference a main web bundle."
        }
        $mainBundleRelativePath = $mainBundleMatch.Groups["path"].Value -replace "/", "\"
        $mainBundlePath = Join-Path (Join-Path $HappyAppPackage "dist") $mainBundleRelativePath
        if (-not (Test-Path -LiteralPath $mainBundlePath -PathType Leaf)) {
            throw "Expo web export main bundle is missing: $mainBundlePath"
        }
        if ($DesktopProfile -eq "personal") {
            $githubIssuesClientId = $env:EXPO_PUBLIC_HAPPY_GITHUB_ISSUES_CLIENT_ID
            $githubIssuesAppSlug = $env:EXPO_PUBLIC_HAPPY_GITHUB_ISSUES_APP_SLUG
            if ([string]::IsNullOrWhiteSpace($githubIssuesClientId) -or
                [string]::IsNullOrWhiteSpace($githubIssuesAppSlug)) {
                throw "GitHub Issues App build configuration is missing."
            }

            $mainBundleContent = Get-Content -LiteralPath $mainBundlePath -Raw
            if (-not $mainBundleContent.Contains($githubIssuesClientId) -or
                -not $mainBundleContent.Contains($githubIssuesAppSlug)) {
                throw "Expo web export did not embed the GitHub Issues App configuration."
            }
        }

        $configArg = ($TauriConfigPath -replace "\\", "/")
        $prebuiltFrontendConfig = '{"build":{"beforeBuildCommand":""}}'
        Write-Log "+ pnpm --filter happy-app exec tauri build --config $configArg --config <prebuilt-frontend>"
        & pnpm --filter happy-app exec tauri build --config $configArg --config $prebuiltFrontendConfig

        if ($LASTEXITCODE -ne 0) {
            throw "tauri build failed with exit code $LASTEXITCODE"
        }

        $appDependencyFile = Get-ChildItem -LiteralPath (Join-Path $TauriRoot "target\release\deps") `
            -Filter "app_lib.d" -File -ErrorAction SilentlyContinue |
            Sort-Object LastWriteTime -Descending |
            Select-Object -First 1
        if (-not $appDependencyFile) {
            throw "Tauri build finished but app_lib.d was not found for frontend embedding verification."
        }
        $appDependencies = Get-Content -LiteralPath $appDependencyFile.FullName -Raw
        $mainBundleName = Split-Path -Leaf $mainBundlePath
        if ($appDependencies -notmatch '(?i)dist[\\/]index\.html' -or
            -not $appDependencies.Contains($mainBundleName)) {
            throw "Tauri build finished without embedding index.html and its main web bundle."
        }
    } finally {
        Pop-Location
    }

    $artifacts = @(Get-BuildArtifacts)
    if ($artifacts.Count -eq 0) {
        throw "Build finished but no Windows desktop artifact was found under $TauriRoot\target\release"
    }

    Write-Log "Build artifacts:"
    foreach ($artifact in $artifacts) {
        Write-Log "  $($artifact.FullName)"
    }
}

function Invoke-BuildOfficialBaseline {
    Set-DesktopProfile -Profile "official-baseline"
    Assert-OfficialBaselineSource
    Invoke-BuildDesktop
}

function Invoke-UpdateCli {
    if (-not (Test-CommandExists "npm")) {
        throw "npm is required for update-cli"
    }

    $happyPaths = @(Get-CommandPaths "happy")
    $npmHappy = Get-NpmGlobalHappy
    if ($happyPaths.Count -eq 0 -or $npmHappy -notmatch "happy@") {
        throw "Refusing update-cli: Happy CLI source is not confirmed as npm global package. where happy=[$($happyPaths -join '; ')] npm list=[$npmHappy]"
    }

    Write-Log "Updating Happy CLI via npm global package"
    Write-Log "Before: $(Invoke-Version 'happy')"
    & npm install -g happy@latest
    if ($LASTEXITCODE -ne 0) {
        throw "npm install -g happy@latest failed with exit code $LASTEXITCODE"
    }
    Write-Log "After: $(Invoke-Version 'happy')"
    Invoke-PatchHappyCliCodexModel
}

function Invoke-UpdateDesktop {
    $script:LastDesktopUpdateResult = [pscustomobject]@{
        BackupPath = ""
        RegistryBackupPath = ""
        RegistrySnapshotTaken = $false
        RegistryRestored = $false
    }

    $installer = Get-LatestNsisInstaller
    if (-not $installer) {
        throw "No NSIS setup artifact found. Run .\devtools\happyctl.ps1 build-desktop first."
    }

    if ($DryRun) {
        Show-UpdateDesktopDryRun $installer
        return
    }

    Write-Log "Starting Windows Happy Desktop update"
    Write-Log "Installer: $($installer.FullName)"
    Write-Log "Install dir: $WindowsInstallDir"
    Write-Log "Backup retention keep=$KeepBackups"

    $backupPath = $null
    $registrySnapshot = Get-UninstallRegistrySnapshot
    if ($registrySnapshot) {
        $script:LastDesktopUpdateResult.RegistrySnapshotTaken = $true
        Write-Log "Captured Windows uninstall registry snapshot: $WindowsUninstallKey"
    } else {
        Write-Log "No existing Windows uninstall registry entry to snapshot."
    }

    try {
        Stop-InstalledDesktopProcesses
        $backupPath = New-DesktopBackup
        $script:LastDesktopUpdateResult.BackupPath = $backupPath
        if ($backupPath) {
            $script:LastDesktopUpdateResult.RegistryBackupPath = Save-UninstallRegistryBackup $backupPath $registrySnapshot
        }
        Remove-ExistingDesktopInstallForReplace
        Invoke-NsisInstall $installer
        $info = Assert-DesktopInstallValid
        Assert-InstalledDesktopMatchesBuildArtifact
        Write-Log "Windows Happy Desktop update verified."
        Write-Log "Installed exe: $($info.Exe)"
        Write-Log "Installed version: $($info.DisplayVersion)"
        Remove-OldDesktopBackups $KeepBackups
    } catch {
        $message = $_.Exception.Message
        Write-Log "Windows Happy Desktop update failed: $message"
        Restore-DesktopBackup $backupPath
        $script:LastDesktopUpdateResult.RegistryRestored = Restore-UninstallRegistrySnapshot $registrySnapshot
        throw
    }
}

function Invoke-UpdateOfficialBaseline {
    Set-DesktopProfile -Profile "official-baseline"
    Invoke-UpdateDesktop
}

function Invoke-VerifyOfficialBaseline {
    Set-DesktopProfile -Profile "official-baseline"
    Invoke-VerifyDesktop
}

function Invoke-UpdateAll {
    if ($DryRun) {
        Write-Section "Windows update-all dry run"
        Write-Host "update-cli would run npm global happy update after source confirmation."
        Invoke-UpdateDesktop
        return
    }

    Invoke-UpdateCli
    Invoke-UpdateDesktop
}

function Invoke-CheckUpstream {
    $state = Get-HappyUpstreamState -Fetch
    Show-HappyUpstreamState $state
    if ($state.IsDiverged) {
        exit 2
    }
}

function Invoke-RefreshDesktop {
    if ($DryRun) {
        Write-Section "Windows desktop refresh dry run"
        Show-PersonalPatchStackPlan
        if ($Force) {
            Write-Host "Would run forced refresh: doctor, sync main into dev, build dev, update-desktop dry-run, update-desktop, verify-desktop."
        } else {
            Write-Host "Would run: doctor, sync main into dev, skip if dev is unchanged, build-desktop, update-desktop dry-run, update-desktop, verify-desktop."
        }
        Write-Host "No branch, push, build, install, package, or report changes made."
        return
    }

    $startedAt = Get-Date
    $status = "failed"
    $errorMessage = ""
    $patchStack = "$OfficialBaseRef -> $PersonalMainBranch -> $DevBranch"
    $finalPatchCommit = "n/a"
    $hasUpdate = "n/a"
    $pulled = $false
    $built = $false
    $installed = $false
    $verified = $false
    $installerPath = ""
    $registrySnapshotTaken = "n/a"
    $registryBackupPath = ""
    $registryRestored = "n/a"
    $beforeCommit = Get-HappyCommit
    $beforeCli = Invoke-Version "happy"
    $beforeDesktop = (Get-InstalledDesktopInfo).DisplayVersion

    try {
        Write-Log "Starting Windows Happy Desktop refresh"
        Invoke-Doctor

        $script:LastPatchStackChanged = $false
        $script:LastPatchStackCommit = ""
        Sync-PersonalPatchStack
        $pulled = $true
        $finalPatchCommit = if ($script:LastPatchStackCommit) { $script:LastPatchStackCommit.Substring(0, 8) } else { Get-HappyCommit }
        $hasUpdate = [bool]$script:LastPatchStackChanged

        if ((-not $Force) -and (-not $script:LastPatchStackChanged)) {
            $status = "skipped-no-final-branch-change"
            Write-Log "Happy dev is unchanged; skipping desktop build/update. Use -Force to rebuild anyway."
            Write-Host "No dev branch change found. Skipping Windows desktop refresh. Use -Force to rebuild anyway."
            return
        }

        if ($Force) {
            $status = "forced"
            $hasUpdate = "force"
            Write-Log "Force enabled: rebuilding dev."
        }

        Invoke-BuildDesktop
        $built = $true

        $installer = Get-LatestNsisInstaller
        if (-not $installer) {
            throw "No NSIS setup artifact found after build-desktop."
        }
        $installerPath = $installer.FullName

        Show-UpdateDesktopDryRun $installer
        Invoke-UpdateDesktop
        if ($script:LastDesktopUpdateResult) {
            $registrySnapshotTaken = $script:LastDesktopUpdateResult.RegistrySnapshotTaken
            $registryBackupPath = $script:LastDesktopUpdateResult.RegistryBackupPath
            $registryRestored = $script:LastDesktopUpdateResult.RegistryRestored
        }
        $installed = $true
        Invoke-VerifyDesktop
        $verified = $true
        $status = "success"
        Write-Log "Windows Happy Desktop refresh completed"
    } catch {
        $status = "failed"
        $errorMessage = $_.Exception.Message
        throw
    } finally {
        if ($script:LastDesktopUpdateResult) {
            $registrySnapshotTaken = $script:LastDesktopUpdateResult.RegistrySnapshotTaken
            $registryBackupPath = $script:LastDesktopUpdateResult.RegistryBackupPath
            $registryRestored = $script:LastDesktopUpdateResult.RegistryRestored
        }
        $afterDesktopInfo = Get-InstalledDesktopInfo
        $duration = [int]((Get-Date) - $startedAt).TotalSeconds
        $fields = [ordered]@{
            Status = $status
            Error = $errorMessage
            Force = [bool]$Force
            "Integration chain" = $patchStack
            "Final build branch" = $DevBranch
            "Dev commit" = $finalPatchCommit
            "Dev changed" = $script:LastPatchStackChanged
            "Update available" = $hasUpdate
            "Synced dev integration" = $pulled
            "Built desktop" = $built
            "Installed desktop" = $installed
            "Verified desktop" = $verified
            "Happy commit before" = $beforeCommit
            "Happy commit after" = Get-HappyCommit
            "CLI version before" = $beforeCli
            "CLI version after" = Invoke-Version "happy"
            "Desktop version before" = $beforeDesktop
            "Desktop version after" = $afterDesktopInfo.DisplayVersion
            "Installer" = $installerPath
            "Install dir" = $WindowsInstallDir
            "Registry snapshot taken" = $registrySnapshotTaken
            "Registry backup path" = $registryBackupPath
            "Registry restored" = $registryRestored
            "Duration seconds" = $duration
        }
        Write-UpdateReport "refresh-desktop" $fields | Out-Null
    }
}

function Invoke-RefreshOfficialBaseline {
    Set-DesktopProfile -Profile "official-baseline"
    $script:OfficialBaselineDependencyMode = "n/a"

    if ($DryRun) {
        Assert-HappyRepoClean
        Write-Section "Windows official baseline refresh dry run"
        Write-Host "Source:        $OfficialBaseRef"
        Write-Host "Local branch:  $PersonalMainBranch"
        Write-Host "App name:      $WindowsAppName"
        Write-Host "Tauri config:  $TauriConfigPath"
        Write-Host "Install dir:   $WindowsInstallDir"
        Write-Host "Would fetch upstream, merge it into personal main, validate product-source equivalence, build the isolated baseline, install it, and verify launch."
        Write-Host "The personal Happy (dev) installation and dev branch would not be replaced."
        Write-Host "No branch, build, install, package, or report changes made."
        return
    }

    $startedAt = Get-Date
    $status = "failed"
    $errorMessage = ""
    $originalBranch = Get-HappyCurrentBranch
    if (-not $originalBranch) {
        throw "Official baseline refresh requires Happy to be on a named branch."
    }

    $officialCommit = "n/a"
    $personalMainCommit = "n/a"
    $built = $false
    $installed = $false
    $verified = $false
    $installerPath = ""
    $registrySnapshotTaken = "n/a"
    $registryBackupPath = ""
    $registryRestored = "n/a"
    $beforeDesktop = (Get-InstalledDesktopInfo).DisplayVersion

    try {
        Write-Log "Starting Windows Happy official baseline refresh"
        Invoke-Doctor
        Sync-OfficialBaselineSource
        Assert-OfficialBaselineSource
        $officialCommit = (& git -C $HappyRepo rev-parse $OfficialBaseRef).Trim()
        $personalMainCommit = (& git -C $HappyRepo rev-parse HEAD).Trim()

        Invoke-BuildDesktop
        $built = $true

        $installer = Get-LatestNsisInstaller
        if (-not $installer) {
            throw "No official baseline NSIS setup artifact found after build."
        }
        $installerPath = $installer.FullName

        Show-UpdateDesktopDryRun $installer
        Invoke-UpdateDesktop
        if ($script:LastDesktopUpdateResult) {
            $registrySnapshotTaken = $script:LastDesktopUpdateResult.RegistrySnapshotTaken
            $registryBackupPath = $script:LastDesktopUpdateResult.RegistryBackupPath
            $registryRestored = $script:LastDesktopUpdateResult.RegistryRestored
        }
        $installed = $true

        Invoke-VerifyDesktop
        $verified = $true
        $status = "success"
        Write-Log "Windows Happy official baseline refresh completed"
    } catch {
        $status = "failed"
        $errorMessage = $_.Exception.Message
        throw
    } finally {
        if ($script:LastDesktopUpdateResult) {
            $registrySnapshotTaken = $script:LastDesktopUpdateResult.RegistrySnapshotTaken
            $registryBackupPath = $script:LastDesktopUpdateResult.RegistryBackupPath
            $registryRestored = $script:LastDesktopUpdateResult.RegistryRestored
        }

        $currentBranch = Get-HappyCurrentBranch
        if ($currentBranch -eq $PersonalMainBranch) {
            Restore-OfficialBaselineBuildSideEffects
        } else {
            Refresh-HappyIndexIfContentUnchanged
        }
        $currentBranch = Get-HappyCurrentBranch
        if ($currentBranch -and $currentBranch -ne $originalBranch) {
            Assert-HappyRepoClean
            Invoke-HappyGit -Arguments @("switch", $originalBranch)
        }

        $afterDesktop = Get-InstalledDesktopInfo
        $duration = [int]((Get-Date) - $startedAt).TotalSeconds
        $fields = [ordered]@{
            Status = $status
            Error = $errorMessage
            "Source ref" = $OfficialBaseRef
            "Official commit" = $officialCommit
            "Personal main commit" = $personalMainCommit
            "Product source equivalence" = if ($personalMainCommit -ne "n/a") { "verified" } else { "not verified" }
            "Dependency mode" = $script:OfficialBaselineDependencyMode
            "Original branch restored" = $originalBranch
            "Built baseline" = $built
            "Installed baseline" = $installed
            "Verified baseline" = $verified
            "Baseline version before" = $beforeDesktop
            "Baseline version after" = $afterDesktop.DisplayVersion
            "Installer" = $installerPath
            "Install dir" = $WindowsInstallDir
            "Registry snapshot taken" = $registrySnapshotTaken
            "Registry backup path" = $registryBackupPath
            "Registry restored" = $registryRestored
            "Duration seconds" = $duration
        }
        Write-UpdateReport "refresh-official-baseline" $fields | Out-Null
    }
}

function Get-RefreshTask {
    return Get-ScheduledTask -TaskName $WindowsRefreshTaskName -ErrorAction SilentlyContinue
}

function Show-RefreshTaskStatus {
    Write-Section "Windows refresh task"
    $task = Get-RefreshTask
    if (-not $task) {
        Write-Host "Status:    not installed"
        Write-Host "Task name: $WindowsRefreshTaskName"
        return
    }

    $info = Get-ScheduledTaskInfo -TaskName $WindowsRefreshTaskName
    Write-Host "Status:       installed"
    Write-Host "Task name:    $WindowsRefreshTaskName"
    Write-Host "State:        $($task.State)"
    Write-Host "Last run:     $($info.LastRunTime)"
    Write-Host "Last result:  $($info.LastTaskResult)"
    Write-Host "Next run:     $($info.NextRunTime)"
    Write-Host "Action:       $($task.Actions.Execute) $($task.Actions.Arguments)"
}

function Invoke-InstallRefreshTask {
    $timeParts = $TaskTime.Split(":")
    $hour = [int]$timeParts[0]
    $minute = [int]$timeParts[1]
    if ($hour -lt 0 -or $hour -gt 23 -or $minute -lt 0 -or $minute -gt 59) {
        throw "TaskTime must be a valid HH:mm time, got: $TaskTime"
    }

    $scriptFullPath = [System.IO.Path]::GetFullPath($ScriptPath)
    $argument = "-NoProfile -ExecutionPolicy Bypass -File `"$scriptFullPath`" refresh-desktop"
    $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $argument -WorkingDirectory $HappyRepo
    $trigger = New-ScheduledTaskTrigger -Daily -At ([datetime]::Today.AddHours($hour).AddMinutes($minute))
    $principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Limited
    $settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -MultipleInstances IgnoreNew
    $description = "Daily Happy Desktop refresh. Checks official upstream first and only builds/installs when an update exists."

    Register-ScheduledTask -TaskName $WindowsRefreshTaskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description $description -Force | Out-Null
    Show-RefreshTaskStatus
}

function Invoke-UninstallRefreshTask {
    $task = Get-RefreshTask
    if (-not $task) {
        Write-Host "Refresh task is not installed: $WindowsRefreshTaskName"
        return
    }

    Unregister-ScheduledTask -TaskName $WindowsRefreshTaskName -Confirm:$false
    Write-Host "Removed refresh task: $WindowsRefreshTaskName"
}

switch ($Command) {
    "status" { Show-Status }
    "doctor" { Invoke-Doctor }
    "artifacts" { Show-Artifacts }
    "build-desktop" { Invoke-BuildDesktop }
    "build-official-baseline" { Invoke-BuildOfficialBaseline }
    "update-cli" { Invoke-UpdateCli }
    "patch-cli-codex-model" { Invoke-PatchHappyCliCodexModel }
    "update-desktop" { Invoke-UpdateDesktop }
    "update-official-baseline" { Invoke-UpdateOfficialBaseline }
    "update-all" { Invoke-UpdateAll }
    "verify-desktop" { Invoke-VerifyDesktop }
    "verify-official-baseline" { Invoke-VerifyOfficialBaseline }
    "check-upstream" { Invoke-CheckUpstream }
    "refresh-desktop" { Invoke-RefreshDesktop }
    "refresh-official-baseline" { Invoke-RefreshOfficialBaseline }
    "install-refresh-task" { Invoke-InstallRefreshTask }
    "uninstall-refresh-task" { Invoke-UninstallRefreshTask }
    "refresh-task-status" { Show-RefreshTaskStatus }
    "help" { Show-Usage }
}
