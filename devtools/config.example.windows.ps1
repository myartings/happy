# Copy to config.windows.ps1 if you need local Windows overrides.
# Do not commit config.windows.ps1.

$HappyRepo = "C:\Users\myartings\workspace\happy"
$DevtoolsStateRoot = "$env:LOCALAPPDATA\Happy Devtools"
$BackupDir = "$DevtoolsStateRoot\backups"
$LogDir = "$DevtoolsStateRoot\logs"
$ReportDir = "$DevtoolsStateRoot\reports"
$TauriConfig = "src-tauri\tauri.dev.conf.json"
$WindowsBuildNodeRoot = "$env:LOCALAPPDATA\Happy Devtools\tools\node-v20.20.2-win-x64"
$env:HAPPY_OFFICIAL_BRANCH = "official"
$env:HAPPY_PERSONAL_MAIN_BRANCH = "main"
