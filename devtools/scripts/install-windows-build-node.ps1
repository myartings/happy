[CmdletBinding()]
param(
    [ValidatePattern('^v20\.\d+\.\d+$')]
    [string]$Version = 'v20.20.2'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$archiveName = "node-$Version-win-x64.zip"
$toolsRoot = Join-Path $env:LOCALAPPDATA 'Happy Devtools\tools'
$target = Join-Path $toolsRoot "node-$Version-win-x64"
$nodeExe = Join-Path $target 'node.exe'

if (Test-Path -LiteralPath $nodeExe) {
    Write-Output "Node runtime already installed: $target"
    & $nodeExe --version
    exit 0
}

$tempRoot = Join-Path $env:TEMP ("happy-node20-" + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tempRoot | Out-Null

try {
    $archivePath = Join-Path $tempRoot $archiveName
    $checksumsPath = Join-Path $tempRoot 'SHASUMS256.txt'
    $baseUrl = "https://nodejs.org/dist/$Version"

    Invoke-WebRequest -Uri "$baseUrl/$archiveName" -OutFile $archivePath
    Invoke-WebRequest -Uri "$baseUrl/SHASUMS256.txt" -OutFile $checksumsPath

    $pattern = "^[0-9a-f]{64}  $([regex]::Escape($archiveName))$"
    $entry = (Select-String -LiteralPath $checksumsPath -Pattern $pattern).Line
    if (-not $entry) {
        throw "Checksum entry not found for $archiveName"
    }

    $expectedHash = ($entry -split '\s+')[0].ToUpperInvariant()
    $actualHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $archivePath).Hash
    if ($actualHash -ne $expectedHash) {
        throw "Node archive checksum mismatch. expected=$expectedHash actual=$actualHash"
    }

    New-Item -ItemType Directory -Force -Path $toolsRoot | Out-Null
    Expand-Archive -LiteralPath $archivePath -DestinationPath $toolsRoot

    if (-not (Test-Path -LiteralPath $nodeExe)) {
        throw "Node executable missing after extraction: $nodeExe"
    }

    Write-Output "Installed verified Node runtime: $target"
    Write-Output "SHA256: $actualHash"
    & $nodeExe --version
} finally {
    $resolvedTemp = [System.IO.Path]::GetFullPath($tempRoot)
    $resolvedTempBase = [System.IO.Path]::GetFullPath($env:TEMP)
    if ($resolvedTemp.StartsWith($resolvedTempBase, [System.StringComparison]::OrdinalIgnoreCase)) {
        Remove-Item -LiteralPath $resolvedTemp -Recurse -Force -ErrorAction SilentlyContinue
    }
}
