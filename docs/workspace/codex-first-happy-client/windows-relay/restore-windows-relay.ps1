[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$RepoRoot,

    [ValidateNotNullOrEmpty()]
    [string]$WorktreeRoot = "",

    [ValidatePattern("^[A-Za-z0-9._/-]+$")]
    [string]$BranchName = "codex-first-happy-client-windows"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ExpectedBase = "a269068ab42316a6e5749882cd81499aeb31fabb"
$PackageRoot = Split-Path -Parent $PSCommandPath
$PatchPath = Join-Path $PackageRoot "tracked.patch"
$UntrackedArchivePath = Join-Path $PackageRoot "untracked.zip"
$ContentManifestPath = Join-Path $PackageRoot "content-manifest.json"

# The manifest records the exact LF source bytes prepared on macOS. Keep every
# Git operation over the restored tree byte-stable without changing the
# caller's repository or global Git configuration.
$ExactContentGitArgs = @("-c", "core.autocrlf=false")

if (-not $IsWindows) {
    throw "Run this relay from native Windows PowerShell, not macOS, Linux, or WSL."
}

foreach ($tool in @("git")) {
    if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
        throw "Missing required command: $tool"
    }
}

foreach ($artifact in @($PatchPath, $UntrackedArchivePath, $ContentManifestPath)) {
    if (-not (Test-Path -LiteralPath $artifact -PathType Leaf)) {
        throw "Relay artifact is missing: $artifact"
    }
}

$RepoRoot = [System.IO.Path]::GetFullPath($RepoRoot)
$resolvedRepo = (& git -C $RepoRoot rev-parse --show-toplevel 2>$null)
if ($LASTEXITCODE -ne 0 -or -not $resolvedRepo) {
    throw "Not a Git repository: $RepoRoot"
}
$resolvedRepo = [System.IO.Path]::GetFullPath(($resolvedRepo | Select-Object -First 1))
if ($resolvedRepo -ne $RepoRoot) {
    throw "RepoRoot must be the repository root. Resolved: $resolvedRepo"
}

& git -C $RepoRoot cat-file -e "$ExpectedBase`^{commit}" 2>$null
if ($LASTEXITCODE -ne 0) {
    throw "Required base commit is absent: $ExpectedBase. Fetch the normal repository refs, then rerun."
}

if (-not $WorktreeRoot) {
    $WorktreeRoot = Join-Path $RepoRoot ".dev\worktree\codex-first-happy-client-windows"
}
$WorktreeRoot = [System.IO.Path]::GetFullPath($WorktreeRoot)
if (Test-Path -LiteralPath $WorktreeRoot) {
    throw "Refusing existing worktree path: $WorktreeRoot"
}

& git -C $RepoRoot show-ref --verify --quiet "refs/heads/$BranchName"
$branchStatus = $LASTEXITCODE
if ($branchStatus -eq 0) {
    throw "Refusing existing local branch: $BranchName"
}
if ($branchStatus -ne 1) {
    throw "Unable to determine whether branch exists: $BranchName"
}

$manifest = Get-Content -LiteralPath $ContentManifestPath -Raw | ConvertFrom-Json
if ($manifest.baseCommit -ne $ExpectedBase) {
    throw "Content manifest base mismatch: $($manifest.baseCommit)"
}

$worktreeParent = Split-Path -Parent $WorktreeRoot
if (-not (Test-Path -LiteralPath $worktreeParent)) {
    New-Item -ItemType Directory -Path $worktreeParent -Force | Out-Null
}

Write-Host "Creating fresh worktree from $ExpectedBase"
& git @ExactContentGitArgs -C $RepoRoot worktree add -b $BranchName $WorktreeRoot $ExpectedBase
if ($LASTEXITCODE -ne 0) {
    throw "git worktree add failed. The relay did not apply source changes."
}

Write-Host "Checking and applying tracked patch"
& git @ExactContentGitArgs -C $WorktreeRoot apply --check --binary $PatchPath
if ($LASTEXITCODE -ne 0) {
    throw "Tracked patch check failed. The prepared worktree is preserved for diagnosis."
}
& git @ExactContentGitArgs -C $WorktreeRoot apply --binary $PatchPath
if ($LASTEXITCODE -ne 0) {
    throw "Tracked patch apply failed. The prepared worktree is preserved for diagnosis."
}

Write-Host "Extracting untracked workflow and source files"
Expand-Archive -LiteralPath $UntrackedArchivePath -DestinationPath $WorktreeRoot

Write-Host "Verifying transferred content"
$mismatches = [System.Collections.Generic.List[string]]::new()
foreach ($entry in $manifest.files) {
    $relativeWindowsPath = $entry.path.Replace("/", "\")
    $targetPath = Join-Path $WorktreeRoot $relativeWindowsPath
    if (-not (Test-Path -LiteralPath $targetPath -PathType Leaf)) {
        $mismatches.Add("missing: $($entry.path)")
        continue
    }
    $actualHash = (Get-FileHash -LiteralPath $targetPath -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($actualHash -ne $entry.sha256) {
        $mismatches.Add("hash mismatch: $($entry.path)")
    }
}
foreach ($relativePath in $manifest.deletedPaths) {
    $targetPath = Join-Path $WorktreeRoot $relativePath.Replace("/", "\")
    if (Test-Path -LiteralPath $targetPath) {
        $mismatches.Add("expected deletion still exists: $relativePath")
    }
}
if ($mismatches.Count -gt 0) {
    $detail = $mismatches -join [Environment]::NewLine
    throw "Relay content verification failed:`n$detail"
}

& git @ExactContentGitArgs -C $WorktreeRoot diff --check
if ($LASTEXITCODE -ne 0) {
    throw "git diff --check failed in the restored worktree."
}

$restoredHead = (& git @ExactContentGitArgs -C $WorktreeRoot rev-parse HEAD).Trim()
if ($restoredHead -ne $ExpectedBase) {
    throw "Restored worktree HEAD mismatch: $restoredHead"
}

Write-Host ""
Write-Host "WINDOWS_RELAY_READY"
Write-Host "Worktree: $WorktreeRoot"
Write-Host "Branch:   $BranchName"
Write-Host "Base:     $ExpectedBase"
Write-Host "Resume:   docs\workspace\codex-first-happy-client\sessions\20260830T072814Z-Windows-ownership-transfer-for-final-packaged-runtime-validation-rollback-proof-whole-diff-review-and-workflow-finish.md"
Write-Host ""
& git @ExactContentGitArgs -C $WorktreeRoot status --short --branch
