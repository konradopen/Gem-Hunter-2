$ErrorActionPreference = "Stop"

# Script location = launcher/
$LauncherDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path (Join-Path $LauncherDir "..")
$DistDir = Join-Path $LauncherDir "dist"
$BuildDir = Join-Path $LauncherDir "build"
$ExeName = "GemHunter.exe"
$ExeFrom = Join-Path $DistDir $ExeName
$ExeTo = Join-Path $ProjectRoot $ExeName

Write-Host "Launcher dir: $LauncherDir"
Write-Host "Project root: $ProjectRoot"

Push-Location $LauncherDir
try {
    if (Test-Path $DistDir) { Remove-Item $DistDir -Recurse -Force }
    if (Test-Path $BuildDir) { Remove-Item $BuildDir -Recurse -Force }

    pyinstaller --noconfirm --onefile --windowed --name GemHunter GemHunter.py

    if (-not (Test-Path $ExeFrom)) {
        throw "Build failed: $ExeFrom not found."
    }

    Copy-Item $ExeFrom $ExeTo -Force
    Write-Host "Copied: $ExeFrom -> $ExeTo"
}
finally {
    Pop-Location
}

Write-Host "Done."
