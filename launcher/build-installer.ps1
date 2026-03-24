$ErrorActionPreference = "Stop"

$LauncherDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$InstallerScript = Join-Path $LauncherDir "installer\GemHunter.iss"
$candidateIscc = @(
    (Join-Path ${env:ProgramFiles(x86)} "Inno Setup 6\ISCC.exe"),
    (Join-Path $env:ProgramFiles "Inno Setup 6\ISCC.exe"),
    (Join-Path $env:LOCALAPPDATA "Programs\Inno Setup 6\ISCC.exe")
)

$Iscc = $candidateIscc | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $Iscc) {
    throw "Inno Setup Compiler not found.`nInstall Inno Setup 6 and retry."
}

if (-not (Test-Path (Join-Path $LauncherDir "dist\GemHunter.exe"))) {
    throw "Missing launcher binary at launcher\dist\GemHunter.exe. Run launcher\build.ps1 first."
}

Push-Location $LauncherDir
try {
    & $Iscc $InstallerScript
}
finally {
    Pop-Location
}

Write-Host "Installer build complete."
