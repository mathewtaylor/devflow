#!/bin/bash

# DevFlow Installation Script
# Downloads and installs DevFlow from GitHub
# Repository: https://github.com/mathewtaylor/devflow

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
GITHUB_REPO="https://raw.githubusercontent.com/mathewtaylor/devflow/main"
TARGET_DIR="${1:-.}"
MAX_RETRIES=3

# File list to download
declare -a FILES=(
    ".claude/agents/architect.md"
    ".claude/agents/planner.md"
    ".claude/agents/reviewer.md"
    ".claude/agents/state-manager.md"
    ".claude/agents/tester.md"
    ".claude/commands/devflow/init.md"
    ".claude/commands/devflow/spec.md"
    ".claude/commands/devflow/plan.md"
    ".claude/commands/devflow/tasks.md"
    ".claude/commands/devflow/execute.md"
    ".claude/commands/devflow/status.md"
    ".claude/commands/devflow/think.md"
    ".claude/commands/devflow/consolidate-docs.md"
    ".devflow/lib/state-io.js"
    ".devflow/state.json.schema"
    ".devflow/constitution.md.template"
    ".devflow/architecture.md.template"
    ".devflow/.devflowignore.template"
    ".devflow/CLAUDE.md.template"
    ".devflow/domains/_index.md.template"
    ".devflow/domains/concern.md.template"
)

# Help message
show_help() {
    cat << EOF
DevFlow Installation Script

Usage: $0 [TARGET_DIRECTORY]

Arguments:
  TARGET_DIRECTORY    Directory to install DevFlow (default: current directory)

Options:
  --help             Show this help message

Example:
  $0                 # Install in current directory
  $0 /path/to/project  # Install in specific directory

What gets installed:
  • 5 agents in .claude/agents/
  • 8 commands in .claude/commands/devflow/
  • 8 templates and utilities in .devflow/

After installation, run: /init
EOF
    exit 0
}

# Parse arguments
if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
    show_help
fi

# Print colored message
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Detect download tool (curl or wget)
detect_download_tool() {
    if command_exists curl; then
        echo "curl"
    elif command_exists wget; then
        echo "wget"
    else
        print_error "Neither curl nor wget found. Please install one of them."
        exit 1
    fi
}

# Check for bash availability (especially important on Windows)
check_bash_availability() {
    # We're already running in bash, but check version
    if [ -z "$BASH_VERSION" ]; then
        print_error "This script requires bash to run."
        echo ""
        echo "Installation:"
        echo "  • Linux/Mac: Bash is already installed"
        echo "  • Windows: Install Git for Windows (includes Git Bash)"
        echo "    Download: https://git-scm.com/download/win"
        echo ""
        exit 1
    fi

    # Extract major.minor version
    bash_major=$(echo $BASH_VERSION | cut -d. -f1)
    bash_minor=$(echo $BASH_VERSION | cut -d. -f2)

    # Check for minimum bash 3.2
    if [ "$bash_major" -lt 3 ] || ([ "$bash_major" -eq 3 ] && [ "$bash_minor" -lt 2 ]); then
        print_warning "Bash version $BASH_VERSION detected. Bash 3.2+ recommended."
    else
        print_info "Bash version $BASH_VERSION detected ✓"
    fi
}

# Download file with retries
download_file() {
    local url="$1"
    local output="$2"
    local retries=0
    local tool=$(detect_download_tool)

    while [ $retries -lt $MAX_RETRIES ]; do
        if [ "$tool" = "curl" ]; then
            # Show errors to help debug issues
            if curl -fsSL -o "$output" "$url" 2>&1; then
                return 0
            fi
        else
            # Show errors to help debug issues
            if wget -O "$output" "$url" 2>&1; then
                return 0
            fi
        fi

        retries=$((retries + 1))
        if [ $retries -lt $MAX_RETRIES ]; then
            print_warning "Download failed, retrying ($retries/$MAX_RETRIES)..."
            sleep 1
        fi
    done

    return 1
}

# Create directory structure
create_directories() {
    print_info "Creating directory structure..."

    # Create all necessary parent directories from FILES array
    for file in "${FILES[@]}"; do
        local dir=$(dirname "$TARGET_DIR/$file")
        mkdir -p "$dir"
    done

    print_success "Directories created"
}

# Check for existing installation
check_existing_installation() {
    if [ -f "$TARGET_DIR/.devflow/constitution.md.template" ]; then
        print_warning "DevFlow appears to be already installed in this directory."

        # Check if running in interactive terminal
        if [ -t 0 ]; then
            # Interactive mode - ask user
            echo -n "Backup existing files and update? (y/n): "
            read -r response

            if [[ ! "$response" =~ ^[Yy]$ ]]; then
                print_info "Installation cancelled."
                exit 0
            fi
        else
            # Non-interactive mode (piped execution) - auto-proceed with backup
            print_info "Non-interactive mode: will backup and update existing files"
        fi

        return 0
    fi

    # No existing installation - return success
    return 0
}

# Backup existing file
backup_file() {
    local file="$1"

    if [ -f "$file" ]; then
        local timestamp=$(date +"%Y%m%d-%H%M%S")
        local backup="${file}.bak.${timestamp}"
        cp "$file" "$backup"
        print_info "Backed up: $(basename "$file") → $(basename "$backup")"
    fi
}

# Download all files
download_files() {
    local total=${#FILES[@]}
    local current=0
    local failed=()

    print_info "Downloading DevFlow files from GitHub..."
    echo ""

    for file in "${FILES[@]}"; do
        current=$((current + 1))
        # Strip leading dot for GitHub URL (repo uses claude/ not .claude/)
        local source_path="${file#.}"
        local url="${GITHUB_REPO}/${source_path}"
        local output="${TARGET_DIR}/${file}"

        # Show progress
        printf "[%2d/%2d] Downloading %s... " "$current" "$total" "$(basename "$file")"

        # Ensure parent directory exists
        local output_dir=$(dirname "$output")
        mkdir -p "$output_dir"

        # Backup if exists
        if [ -f "$output" ]; then
            backup_file "$output"
        fi

        # Download with retries
        if download_file "$url" "$output"; then
            # Validate download (file exists and size > 0)
            if [ -f "$output" ] && [ -s "$output" ]; then
                echo -e "${GREEN}✓${NC}"
            else
                echo -e "${RED}✗ (empty file)${NC}"
                failed+=("$file")
            fi
        else
            echo -e "${RED}✗ (download failed)${NC}"
            failed+=("$file")
        fi
    done

    echo ""

    # Check for failures
    if [ ${#failed[@]} -gt 0 ]; then
        print_error "Failed to download ${#failed[@]} file(s):"
        for file in "${failed[@]}"; do
            echo "  - $file"
        done
        print_error "Installation incomplete. Please check your internet connection and try again."
        exit 1
    fi
}

# Validate installation
validate_installation() {
    print_info "Validating installation..."

    local errors=0

    # Check critical files
    local critical_files=(
        ".devflow/lib/state-io.js"
        ".devflow/state.json.schema"
        ".devflow/constitution.md.template"
        ".claude/commands/devflow/init.md"
    )

    for file in "${critical_files[@]}"; do
        if [ ! -f "$TARGET_DIR/$file" ] || [ ! -s "$TARGET_DIR/$file" ]; then
            print_error "Critical file missing or empty: $file"
            errors=$((errors + 1))
        fi
    done

    if [ $errors -gt 0 ]; then
        print_error "Installation validation failed. $errors critical file(s) missing."
        exit 1
    fi

    print_success "Installation validated"
}

# Show success message
show_success() {
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✓ DevFlow installed successfully!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Files installed:"
    echo "  • 5 agents in .claude/agents/"
    echo "  • 8 commands in .claude/commands/devflow/"
    echo "  • 8 templates and utilities in .devflow/"
    echo ""
    echo "Next steps:"
    echo "  1. Run: /init"
    echo "     This will create your constitution, architecture docs,"
    echo "     and integrate with CLAUDE.md"
    echo ""
    echo "  2. Start building: /spec your-feature-name"
    echo ""
    echo "Note: DevFlow commands require bash."
    echo "      Windows users: Use Git Bash terminal"
    echo ""
    echo "Documentation: https://github.com/mathewtaylor/devflow"
    echo ""
}

# Main installation flow
main() {
    echo ""
    echo "DevFlow Installer"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    # Check bash availability
    check_bash_availability
    echo ""

    # Resolve target directory
    TARGET_DIR=$(cd "$TARGET_DIR" 2>/dev/null && pwd || echo "$TARGET_DIR")

    if [ ! -d "$TARGET_DIR" ]; then
        print_error "Target directory does not exist: $TARGET_DIR"
        exit 1
    fi

    print_info "Installing DevFlow to: $TARGET_DIR"
    echo ""

    # Check for existing installation
    # Note: || true prevents set -e from killing script on return 1
    check_existing_installation || true

    # Create directory structure
    create_directories

    # Download all files
    download_files

    # Validate installation
    validate_installation

    # Show success message
    show_success
}

# Run main function
main
