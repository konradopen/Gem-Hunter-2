; Gem Hunter installer (MVP)
; Build with Inno Setup Compiler (ISCC.exe)

#define AppName "Gem Hunter"
#define AppVersion "0.1.0"
#define AppPublisher "Gem Hunter OSS"
#define AppExeName "GemHunter.exe"

[Setup]
AppId={{8C95F0E5-EA77-4F9D-8CF7-9AE2B4336E15}
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisher={#AppPublisher}
DefaultDirName={autopf}\Gem Hunter
DefaultGroupName=Gem Hunter
DisableProgramGroupPage=yes
OutputDir=..\dist-installer
OutputBaseFilename=GemHunter-Setup
Compression=lzma
SolidCompression=yes
PrivilegesRequired=lowest
ArchitecturesInstallIn64BitMode=x64compatible
WizardStyle=modern

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "Create a desktop shortcut"; GroupDescription: "Additional shortcuts:"; Flags: unchecked

[Files]
Source: "..\dist\GemHunter.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\docker-compose.yml"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\package.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\package-lock.json"; DestDir: "{app}"; Flags: ignoreversion skipifsourcedoesntexist
Source: "..\..\next.config.ts"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\tsconfig.json"; DestDir: "{app}"; Flags: ignoreversion skipifsourcedoesntexist
Source: "..\..\postcss.config.mjs"; DestDir: "{app}"; Flags: ignoreversion skipifsourcedoesntexist
Source: "..\..\drizzle.config.ts"; DestDir: "{app}"; Flags: ignoreversion skipifsourcedoesntexist
Source: "..\..\.env.example"; DestDir: "{app}"; Flags: ignoreversion skipifsourcedoesntexist
Source: "..\..\database.sqlite"; DestDir: "{app}"; Flags: ignoreversion skipifsourcedoesntexist
Source: "..\..\public\*"; DestDir: "{app}\public"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\src\*"; DestDir: "{app}\src"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\drizzle\*"; DestDir: "{app}\drizzle"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\Gem Hunter Launcher"; Filename: "{app}\{#AppExeName}"
Name: "{autodesktop}\Gem Hunter Launcher"; Filename: "{app}\{#AppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#AppExeName}"; Description: "Launch Gem Hunter"; Flags: nowait postinstall skipifsilent

[Code]
function IsNodeInstalled(): Boolean;
var
  ResultCode: Integer;
begin
  Result := (Exec(ExpandConstant('{cmd}'), '/c where npm', '', SW_HIDE, ewWaitUntilTerminated, ResultCode));
end;

function IsDockerInstalled(): Boolean;
var
  ResultCode: Integer;
begin
  Result := (Exec(ExpandConstant('{cmd}'), '/c where docker', '', SW_HIDE, ewWaitUntilTerminated, ResultCode));
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
  begin
    if not IsDockerInstalled() then
      MsgBox(
        'Docker Desktop was not detected. Gem Hunter will show guided setup on first launch.' + #13#10 +
        'Download: https://www.docker.com/products/docker-desktop/',
        mbInformation, MB_OK
      );

    if not IsNodeInstalled() then
      MsgBox(
        'Node.js/npm was not detected. Gem Hunter will show guided setup on first launch.' + #13#10 +
        'Download: https://nodejs.org/en/download',
        mbInformation, MB_OK
      );
  end;
end;
