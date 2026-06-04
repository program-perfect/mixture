# dump-project.ps1
# Run from project root:
# powershell -ExecutionPolicy Bypass -File .\dump-project.ps1

$ErrorActionPreference = "Stop"

$Root = (Get-Location).Path
$OutputFile = Join-Path $Root "_project_dump.txt"

if (Test-Path -LiteralPath $OutputFile) {
    Remove-Item -LiteralPath $OutputFile -Force
}

$ExcludeDirs = @(
    ".git",
    "node_modules",
    ".next",
    "dist",
    "build",
    ".vercel",
    "coverage"
)

$BinaryExtensions = @(
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico",
    ".mp4", ".mov", ".avi", ".mkv",
    ".mp3", ".wav",
    ".pdf", ".zip", ".rar", ".7z",
    ".exe", ".dll", ".bin",
    ".woff", ".woff2", ".ttf", ".otf"
)

$header = @"
PROJECT DUMP
ROOT: $Root
DATE: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
============================================================

"@

[System.IO.File]::WriteAllText($OutputFile, $header, [System.Text.Encoding]::UTF8)

$Files = Get-ChildItem -LiteralPath $Root -Recurse -File -Force | Where-Object {
    $fullPath = $_.FullName

    if ($fullPath -eq $OutputFile) {
        return $false
    }

    if (-not $fullPath.StartsWith($Root, [System.StringComparison]::OrdinalIgnoreCase)) {
        return $false
    }

    foreach ($dir in $ExcludeDirs) {
        if ($fullPath -like "*\$dir\*") {
            return $false
        }
    }

    return $true
}

foreach ($File in $Files) {
    $relativePath = $File.FullName.Substring($Root.Length).TrimStart("\", "/")
    $extension = $File.Extension.ToLowerInvariant()

    $fileHeader = @"

============================================================
FILE PATH:
$relativePath
FULL PATH:
$($File.FullName)
SIZE:
$($File.Length) bytes
============================================================

"@

    [System.IO.File]::AppendAllText($OutputFile, $fileHeader, [System.Text.Encoding]::UTF8)

    if ($BinaryExtensions -contains $extension) {
        [System.IO.File]::AppendAllText(
            $OutputFile,
            "[BINARY FILE SKIPPED]" + [Environment]::NewLine,
            [System.Text.Encoding]::UTF8
        )
        continue
    }

    try {
        $content = [System.IO.File]::ReadAllText($File.FullName, [System.Text.Encoding]::UTF8)
        [System.IO.File]::AppendAllText(
            $OutputFile,
            $content + [Environment]::NewLine,
            [System.Text.Encoding]::UTF8
        )
    }
    catch {
        [System.IO.File]::AppendAllText(
            $OutputFile,
            "[READ ERROR: " + $_.Exception.Message + "]" + [Environment]::NewLine,
            [System.Text.Encoding]::UTF8
        )
    }
}

Write-Host "Done. File created:"
Write-Host $OutputFile