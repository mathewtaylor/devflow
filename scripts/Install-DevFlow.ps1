#Requires -Version 5.1

<#
.SYNOPSIS
    Installs DevFlow from GitHub repository

.DESCRIPTION
    Downloads and installs DevFlow files from the mathewtaylor/devflow GitHub repository.
    Creates necessary directory structure and downloads all required agents, commands, and templates.

.PARAMETER TargetPath
    Target directory for installation. Defaults to current directory.

.PARAMETER Help
    Display help information

.EXAMPLE
    .\Install-DevFlow.ps1
    Installs DevFlow in the current directory

.EXAMPLE
    .\Install-DevFlow.ps1 -TargetPath "C:\MyProject"
    Installs DevFlow in the specified directory

.LINK
    https://github.com/mathewtaylor/devflow
#>

[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$TargetPath = ".",

    [Parameter()]
    [switch]$Help
)

# Configuration
$GitHubRepo = "https://raw.githubusercontent.com/mathewtaylor/devflow/main"
$MaxRetries = 3

# File list to download
$FilesToDownload = @(
    ".claude/agents/architect.md",
    ".claude/agents/planner.md",
    ".claude/agents/reviewer.md",
    ".claude/agents/state-manager.md",
    ".claude/agents/tester.md",
    ".claude/commands/devflow/init.md",
    ".claude/commands/devflow/spec.md",
    ".claude/commands/devflow/plan.md",
    ".claude/commands/devflow/tasks.md",
    ".claude/commands/devflow/execute.md",
    ".claude/commands/devflow/status.md",
    ".claude/commands/devflow/think.md",
    ".claude/commands/devflow/consolidate-docs.md",
    ".devflow/lib/state-io.js",
    ".devflow/state.json.schema",
    ".devflow/constitution.md.template",
    ".devflow/architecture.md.template",
    ".devflow/.devflowignore.template",
    ".devflow/CLAUDE.md.template",
    ".devflow/domains/_index.md.template",
    ".devflow/domains/concern.md.template"
)

# Show help
function Show-Help {
    Write-Host ""
    Write-Host "DevFlow Installation Script" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\Install-DevFlow.ps1 [[-TargetPath] <path>]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Parameters:"
    Write-Host "  -TargetPath    Directory to install DevFlow (default: current directory)"
    Write-Host "  -Help          Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\Install-DevFlow.ps1"
    Write-Host "  .\Install-DevFlow.ps1 -TargetPath C:\MyProject"
    Write-Host ""
    Write-Host "What gets installed:"
    Write-Host "  • 5 agents in .claude/agents/"
    Write-Host "  • 8 commands in .claude/commands/devflow/"
    Write-Host "  • 8 templates and utilities in .devflow/"
    Write-Host ""
    Write-Host "After installation, run: /init"
    Write-Host ""
    exit 0
}

# Print colored messages
function Write-Info {
    param([string]$Message)
    Write-Host "ℹ " -ForegroundColor Blue -NoNewline
    Write-Host $Message
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ " -ForegroundColor Green -NoNewline
    Write-Host $Message
}

function Write-Warning2 {
    param([string]$Message)
    Write-Host "⚠ " -ForegroundColor Yellow -NoNewline
    Write-Host $Message
}

function Write-ErrorMsg {
    param([string]$Message)
    Write-Host "✗ " -ForegroundColor Red -NoNewline
    Write-Host $Message
}

# Check for bash availability on Windows
function Test-BashAvailability {
    Write-Host ""
    Write-Host "Checking for bash..." -NoNewline

    try {
        $bashPath = Get-Command bash -ErrorAction SilentlyContinue
        if ($bashPath) {
            $bashVersion = bash --version 2>$null | Select-Object -First 1
            Write-Host " ✓" -ForegroundColor Green
            Write-Info "Found: $bashVersion"
            Write-Info "Location: $($bashPath.Source)"
            return $true
        }
    }
    catch {
        # Bash not found
    }

    Write-Host " ✗" -ForegroundColor Red
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
    Write-Host "⚠ Bash Not Detected" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "DevFlow requires bash to run slash commands." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To install Git Bash:" -ForegroundColor Cyan
    Write-Host "  1. Download Git for Windows"
    Write-Host "     https://git-scm.com/download/win"
    Write-Host ""
    Write-Host "  2. Run the installer (accept defaults)"
    Write-Host ""
    Write-Host "  3. Restart your terminal"
    Write-Host ""
    Write-Host "  4. Verify with: bash --version"
    Write-Host ""
    Write-Host "After installing Git Bash, use it instead of PowerShell"
    Write-Host "for running DevFlow commands."
    Write-Host ""

    $continue = Read-Host "Continue installation anyway? (y/n)"
    if ($continue -notmatch '^[Yy]$') {
        Write-Info "Installation cancelled."
        Write-Info "Install Git Bash and run this script again from Git Bash."
        exit 0
    }

    Write-Warning2 "Installation will proceed, but DevFlow commands may not work without bash."
    return $false
}

# Download file with retries
function Download-FileWithRetry {
    param(
        [string]$Url,
        [string]$OutputPath,
        [int]$Retries = $MaxRetries
    )

    $attempt = 0

    while ($attempt -lt $Retries) {
        try {
            $ProgressPreference = 'SilentlyContinue'
            Invoke-WebRequest -Uri $Url -OutFile $OutputPath -ErrorAction Stop -UseBasicParsing
            $ProgressPreference = 'Continue'

            # Validate download
            if ((Test-Path $OutputPath) -and ((Get-Item $OutputPath).Length -gt 0)) {
                return $true
            }
        }
        catch {
            $attempt++
            if ($attempt -lt $Retries) {
                Start-Sleep -Seconds 1
            }
        }
    }

    return $false
}

# Create directory structure
function New-DirectoryStructure {
    param([string]$BasePath)

    Write-Info "Creating directory structure..."

    $directories = @(
        ".claude\agents",
        ".claude\commands\devflow",
        ".devflow\lib",
        ".devflow\domains"
    )

    foreach ($dir in $directories) {
        $fullPath = Join-Path $BasePath $dir
        if (-not (Test-Path $fullPath)) {
            New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        }
    }

    Write-Success "Directories created"
}

# Check for existing installation
function Test-ExistingInstallation {
    param([string]$BasePath)

    $constitutionPath = Join-Path $BasePath ".devflow\constitution.md.template"

    if (Test-Path $constitutionPath) {
        Write-Warning2 "DevFlow appears to be already installed in this directory."
        $response = Read-Host "Update existing DevFlow installation? (y/n)"

        if ($response -notmatch '^[Yy]$') {
            Write-Info "Installation cancelled."
            exit 0
        }

        return $true
    }

    return $false
}

# Backup existing file
function Backup-File {
    param([string]$FilePath)

    if (Test-Path $FilePath) {
        $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
        $backupPath = "$FilePath.bak.$timestamp"
        Copy-Item -Path $FilePath -Destination $backupPath -Force
        Write-Info "Backed up: $(Split-Path $FilePath -Leaf) → $(Split-Path $backupPath -Leaf)"
    }
}

# Download all files
function Get-DevFlowFiles {
    param([string]$BasePath)

    $total = $FilesToDownload.Count
    $current = 0
    $failed = @()

    Write-Info "Downloading DevFlow files from GitHub..."
    Write-Host ""

    foreach ($file in $FilesToDownload) {
        $current++
        # Strip leading dot for GitHub URL (repo uses claude/ not .claude/)
        $sourcePath = $file.TrimStart('.')
        $url = "$GitHubRepo/$($sourcePath.Replace('\', '/'))"
        $outputPath = Join-Path $BasePath $file

        # Show progress
        $fileName = Split-Path $file -Leaf
        Write-Host "[$current/$total] Downloading $fileName... " -NoNewline

        # Ensure parent directory exists
        $parentDir = Split-Path $outputPath -Parent
        if (-not (Test-Path $parentDir)) {
            New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
        }

        # Download with retries
        if (Download-FileWithRetry -Url $url -OutputPath $outputPath) {
            # Validate download
            if ((Test-Path $outputPath) -and ((Get-Item $outputPath).Length -gt 0)) {
                Write-Host "✓" -ForegroundColor Green
            }
            else {
                Write-Host "✗ (empty file)" -ForegroundColor Red
                $failed += $file
            }
        }
        else {
            Write-Host "✗ (download failed)" -ForegroundColor Red
            $failed += $file
        }
    }

    Write-Host ""

    # Check for failures
    if ($failed.Count -gt 0) {
        Write-ErrorMsg "Failed to download $($failed.Count) file(s):"
        foreach ($file in $failed) {
            Write-Host "  - $file"
        }
        Write-ErrorMsg "Installation incomplete. Please check your internet connection and try again."
        exit 1
    }
}

# Validate installation
function Test-Installation {
    param([string]$BasePath)

    Write-Info "Validating installation..."

    $criticalFiles = @(
        ".devflow\lib\state-io.js",
        ".devflow\state.json.schema",
        ".devflow\constitution.md.template",
        ".claude\commands\devflow\init.md"
    )

    $errors = 0

    foreach ($file in $criticalFiles) {
        $fullPath = Join-Path $BasePath $file
        if (-not (Test-Path $fullPath) -or ((Get-Item $fullPath).Length -eq 0)) {
            Write-ErrorMsg "Critical file missing or empty: $file"
            $errors++
        }
    }

    if ($errors -gt 0) {
        Write-ErrorMsg "Installation validation failed. $errors critical file(s) missing."
        exit 1
    }

    Write-Success "Installation validated"
}

# Show success message
function Show-SuccessMessage {
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    Write-Host "✓ DevFlow installed successfully!" -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    Write-Host ""
    Write-Host "Files installed:"
    Write-Host "  • 5 agents in .claude/agents/"
    Write-Host "  • 8 commands in .claude/commands/devflow/"
    Write-Host "  • 8 templates and utilities in .devflow/"
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "  1. Run: /init"
    Write-Host "     This will create your constitution, architecture docs,"
    Write-Host "     and integrate with CLAUDE.md"
    Write-Host ""
    Write-Host "  2. Start building: /spec your-feature-name"
    Write-Host ""
    Write-Host "Note: DevFlow commands require bash." -ForegroundColor Yellow
    Write-Host "      Windows users: Use Git Bash terminal, not PowerShell" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Documentation: https://github.com/mathewtaylor/devflow"
    Write-Host ""
}

# Main installation flow
function Install-DevFlow {
    Write-Host ""
    Write-Host "DevFlow Installer" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Write-Host ""

    # Resolve target path
    $resolvedPath = Resolve-Path $TargetPath -ErrorAction SilentlyContinue

    if (-not $resolvedPath) {
        Write-ErrorMsg "Target directory does not exist: $TargetPath"
        exit 1
    }

    $targetDir = $resolvedPath.Path
    Write-Info "Installing DevFlow to: $targetDir"
    Write-Host ""

    # Check for bash availability
    Test-BashAvailability

    # Check for existing installation
    Test-ExistingInstallation -BasePath $targetDir

    # Create directory structure
    New-DirectoryStructure -BasePath $targetDir

    # Download all files
    Get-DevFlowFiles -BasePath $targetDir

    # Validate installation
    Test-Installation -BasePath $targetDir

    # Show success message
    Show-SuccessMessage
}

# Entry point
if ($Help) {
    Show-Help
}

try {
    Install-DevFlow
}
catch {
    Write-Host ""
    Write-ErrorMsg "Installation failed: $_"
    Write-Host $_.ScriptStackTrace
    exit 1
}
