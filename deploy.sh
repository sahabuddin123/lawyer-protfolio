#!/usr/bin/env bash
# ==============================================================================
# ADVOCATE NIJAM UDDIN (HAQ) — UNIFIED PRODUCTION DEPLOYMENT SCRIPT
# Target: aaPanel / Ubuntu 24.04 LTS / Hostinger VPS / Nginx / MySQL / Redis
# Repository: https://github.com/sahabuddin123/lawyer-protfolio
# Web Root: /www/wwwroot/nijamuddin.com
# Document Root: /www/wwwroot/nijamuddin.com/public
# ==============================================================================
# Usage:
#   ./deploy.sh            - Full update: git pull, build, migrate, seed, cache & reload
#   ./deploy.sh check      - Validate server environment, PHP, tools & Redis
#   ./deploy.sh build      - Compile frontend assets & install composer dependencies
#   ./deploy.sh deploy     - Activate deployment: migrations, idempotent seeds & cache
#   ./deploy.sh seed       - Safely seed initial data (Admin, Sections, Services)
#   ./deploy.sh rollback   - Revert to previous backup assets & refresh cache
# ==============================================================================

set -euo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${SCRIPT_DIR}"
BUILD_DIR="${APP_DIR}/public/build"
WWW_ROOT="${WWW_ROOT:-/www/wwwroot/nijamuddin.com}"
BACKUP_DIR="${APP_DIR}/.backup_assets"
LOCK_FILE="/tmp/nijamuddin_deploy.lock"
TIMESTAMP="$(date +"%Y%m%d%H%M%S")"

LOGS_DIR="${APP_DIR}/storage/logs/deployment"
mkdir -p "${LOGS_DIR}" 2>/dev/null || LOGS_DIR="/tmp"
LOG_FILE="${LOGS_DIR}/deploy_${TIMESTAMP}.log"

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log() {
    local msg="[$(date +"%Y-%m-%d %H:%M:%S")] $1"
    echo -e "${BLUE}${msg}${NC}"
    echo "${msg}" >> "${LOG_FILE}" 2>/dev/null || true
}

log_success() {
    local msg="[$(date +"%Y-%m-%d %H:%M:%S")] [SUCCESS] $1"
    echo -e "${GREEN}${msg}${NC}"
    echo "${msg}" >> "${LOG_FILE}" 2>/dev/null || true
}

log_warn() {
    local msg="[$(date +"%Y-%m-%d %H:%M:%S")] [WARNING] $1"
    echo -e "${YELLOW}${msg}${NC}"
    echo "${msg}" >> "${LOG_FILE}" 2>/dev/null || true
}

log_err() {
    local msg="[$(date +"%Y-%m-%d %H:%M:%S")] [ERROR] $1"
    echo -e "${RED}${msg}${NC}" >&2
    echo "${msg}" >> "${LOG_FILE}" 2>/dev/null || true
}

acquire_lock() {
    if [[ -f "${LOCK_FILE}" ]]; then
        local pid
        pid=$(cat "${LOCK_FILE}" 2>/dev/null || echo "")
        if [[ -n "${pid}" && "${pid}" == "$$" ]]; then
            return 0
        fi
        if [[ -n "${pid}" ]] && ! kill -0 "${pid}" 2>/dev/null; then
            echo "$$" > "${LOCK_FILE}"
            return 0
        fi
        log_err "Deployment lock exists at ${LOCK_FILE} (PID: ${pid}). Another deployment is in progress."
        exit 1
    fi
    echo "$$" > "${LOCK_FILE}"
}

release_lock() {
    rm -f "${LOCK_FILE}" 2>/dev/null || true
}

trap release_lock EXIT

# ------------------------------------------------------------------------------
# 1. AUTO-DETECT AAPANEL BINARY PATHS (PHP, COMPOSER, NODE, NPM)
# ------------------------------------------------------------------------------
# In aaPanel, PHP 8.2/8.3 and Node are typically installed in /www/server/...
for php_path in "/www/server/php/82/bin" "/www/server/php/83/bin" "/www/server/php/81/bin" "/www/server/php/84/bin"; do
    if [[ -d "${php_path}" && -x "${php_path}/php" ]]; then
        export PATH="${php_path}:$PATH"
        break
    fi
done

# Fix duplicate curl extension warning in aaPanel php.ini if present
for php_ini in "/www/server/php/82/etc/php.ini" "/www/server/php/83/etc/php.ini"; do
    if [[ -f "${php_ini}" ]]; then
        if grep -E '^[[:space:]]*extension[[:space:]]*=[[:space:]]*curl' "${php_ini}" >/dev/null 2>&1; then
            if [[ ! -f "/www/server/php/82/lib/php/extensions/no-debug-non-zts-20220829/curl.so" && ! -f "/www/server/php/82/lib/php/extensions/no-debug-non-zts-20220829/curl" ]]; then
                sed -i 's/^[[:space:]]*extension[[:space:]]*=[[:space:]]*curl/;extension=curl/g' "${php_ini}" 2>/dev/null || true
            fi
        fi
    fi
done

# Detect aaPanel Composer or global Composer
if ! command -v composer >/dev/null 2>&1; then
    for comp_bin in "/usr/local/bin/composer" "/usr/bin/composer" "/www/server/php/82/bin/composer" "/www/server/php/83/bin/composer"; do
        if [[ -x "${comp_bin}" ]]; then
            export PATH="$(dirname "${comp_bin}"):$PATH"
            break
        fi
    done
fi

# If composer is still not found in PATH, auto-download standalone composer into /usr/local/bin or app dir
if ! command -v composer >/dev/null 2>&1; then
    log "Composer not found in standard PATH. Attempting automatic installation..."
    if curl -sS https://getcomposer.org/installer 2>/dev/null | php -- --install-dir=/usr/local/bin --filename=composer 2>/dev/null; then
        export PATH="/usr/local/bin:$PATH"
        chmod +x /usr/local/bin/composer 2>/dev/null || true
        log_success "Composer installed successfully into /usr/local/bin/composer"
    elif curl -sS https://getcomposer.org/installer 2>/dev/null | php -- --install-dir="${APP_DIR}" --filename=composer 2>/dev/null; then
        export PATH="${APP_DIR}:$PATH"
        chmod +x "${APP_DIR}/composer" 2>/dev/null || true
        log_success "Composer installed locally into ${APP_DIR}/composer"
    fi
fi

# Detect aaPanel Node.js Version Manager or NVM if node is not yet in PATH
if ! command -v node >/dev/null 2>&1; then
    for node_dir in /www/server/nodejs/v*/bin; do
        if [[ -d "${node_dir}" && -x "${node_dir}/node" ]]; then
            export PATH="${node_dir}:$PATH"
            break
        fi
    done
fi

if ! command -v node >/dev/null 2>&1; then
    if [[ -d "${HOME}/.nvm" ]]; then
        export NVM_DIR="${HOME}/.nvm"
        # shellcheck disable=SC1091
        [[ -s "${NVM_DIR}/nvm.sh" ]] && \. "${NVM_DIR}/nvm.sh" 2>/dev/null || true
    fi
fi

# If Node.js is still missing and user is root on Ubuntu/Debian, auto-install Node 20 LTS
if ! command -v node >/dev/null 2>&1; then
    if [[ "$(id -u)" -eq 0 ]] && command -v apt-get >/dev/null 2>&1; then
        log "Node.js not detected. Auto-installing Node.js 20 LTS for frontend build..."
        (
            curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null 2>&1 || true
            apt-get install -y nodejs >/dev/null 2>&1 || true
        )
    fi
fi

# Locate production environment file across supported topologies
locate_env_file() {
    if [[ -f "${APP_DIR}/.env" ]]; then
        echo "${APP_DIR}/.env"
    elif [[ -f "/www/wwwroot/nijamuddin-deploy/shared/.env" ]]; then
        echo "/www/wwwroot/nijamuddin-deploy/shared/.env"
    elif [[ -f "${WWW_ROOT}/.env" ]]; then
        echo "${WWW_ROOT}/.env"
    else
        echo ""
    fi
}

# Reload PHP-FPM dynamically supporting aaPanel and standard Ubuntu services
reload_php_fpm() {
    log "Reloading PHP-FPM service..."
    local reloaded=false

    local init_scripts=(
        "/etc/init.d/php-fpm-82"
        "/etc/init.d/php-fpm-83"
        "/etc/init.d/php-fpm-81"
        "/etc/init.d/php8.2-fpm"
        "/etc/init.d/php8.3-fpm"
        "/etc/init.d/php-fpm"
    )
    for init_script in "${init_scripts[@]}"; do
        if [[ -x "${init_script}" ]]; then
            if sudo "${init_script}" reload 2>/dev/null || "${init_script}" reload 2>/dev/null; then
                log_success "Reloaded PHP-FPM via init script: ${init_script}"
                reloaded=true
                break
            fi
        fi
    done

    if [[ "${reloaded}" == "false" ]] && command -v systemctl >/dev/null 2>&1; then
        local services=("php-fpm-82" "php8.2-fpm" "php-fpm-83" "php8.3-fpm" "php-fpm")
        for svc in "${services[@]}"; do
            if systemctl is-active --quiet "${svc}" 2>/dev/null; then
                if sudo systemctl reload "${svc}" 2>/dev/null || systemctl reload "${svc}" 2>/dev/null; then
                    log_success "Reloaded PHP-FPM service: ${svc}"
                    reloaded=true
                    break
                fi
            fi
        done
    fi

    if [[ "${reloaded}" == "false" ]]; then
        log_warn "Could not automatically reload PHP-FPM via CLI. If needed, restart PHP 8.2 in aaPanel App Store."
    fi
}

# Fix file permissions for aaPanel web server user (www:www)
fix_permissions() {
    log "Configuring storage and cache permissions..."
    mkdir -p "${APP_DIR}/storage/app/public"
    mkdir -p "${APP_DIR}/storage/app/secure_docs"
    mkdir -p "${APP_DIR}/storage/framework/cache/data"
    mkdir -p "${APP_DIR}/storage/framework/sessions"
    mkdir -p "${APP_DIR}/storage/framework/views"
    mkdir -p "${APP_DIR}/storage/logs"
    mkdir -p "${APP_DIR}/bootstrap/cache"

    if id "www" >/dev/null 2>&1; then
        chown -R www:www "${APP_DIR}/storage" "${APP_DIR}/bootstrap/cache" 2>/dev/null || true
    elif id "www-data" >/dev/null 2>&1; then
        chown -R www-data:www-data "${APP_DIR}/storage" "${APP_DIR}/bootstrap/cache" 2>/dev/null || true
    fi

    chmod -R 775 "${APP_DIR}/storage" "${APP_DIR}/bootstrap/cache" 2>/dev/null || true
    log_success "Storage and cache directory permissions configured (775)."
}

# ------------------------------------------------------------------------------
# COMMAND: check
# ------------------------------------------------------------------------------
cmd_check() {
    log "=================================================================="
    log "Advocate Nijam Uddin Platform — Environment & Readiness Audit"
    log "=================================================================="

    # 1. Check required commands
    local required_cmds=("git" "php" "composer")
    for cmd in "${required_cmds[@]}"; do
        if command -v "${cmd}" >/dev/null 2>&1; then
            local ver=""
            if [[ "${cmd}" == "php" ]]; then
                ver="$(php -r "echo 'PHP ' . PHP_VERSION;" 2>/dev/null || echo "PHP")"
            elif [[ "${cmd}" == "composer" ]]; then
                ver="$(composer --version 2>/dev/null | head -n 1 || echo "Composer")"
            else
                ver="$(${cmd} --version 2>/dev/null | head -n 1 || echo "${cmd}")"
            fi
            log_success "Command '${cmd}' found: $(command -v "${cmd}") (${ver})"
        else
            log_err "Missing required command: '${cmd}'. Please verify PATH or aaPanel installation."
            exit 1
        fi
    done

    # 1.1 Node & NPM check
    if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
        log_success "Node.js runtime found: $(node -v 2>/dev/null) (npm $(npm -v 2>/dev/null))"
    elif [[ -f "${BUILD_DIR}/manifest.json" ]]; then
        log_warn "Node.js/npm not found, but pre-compiled build assets exist at ${BUILD_DIR}. Deployment can proceed."
    else
        log_err "Neither Node.js nor pre-compiled assets (${BUILD_DIR}/manifest.json) found!"
        log_err "In aaPanel: Go to App Store -> Node.js Version Manager -> install Node v20 or run 'apt install -y nodejs npm'."
        exit 1
    fi

    # 2. Check PHP extensions
    local required_exts=("pdo_mysql" "mbstring" "xml" "curl" "gd" "zip" "bcmath" "intl")
    for ext in "${required_exts[@]}"; do
        if php -m 2>/dev/null | grep -qi "^${ext}$"; then
            log_success "PHP extension '${ext}' is loaded."
        else
            log_warn "PHP extension '${ext}' is NOT loaded in CLI PHP. Verify php.ini in aaPanel."
        fi
    done

    # 3. Check public web root & index.php entry point
    if [[ -f "${APP_DIR}/public/index.php" ]]; then
        log_success "Laravel public entry point verified at ${APP_DIR}/public/index.php."
    else
        log_err "Missing Laravel entry point: ${APP_DIR}/public/index.php!"
        exit 1
    fi

    # 4. Check Environment File (.env)
    local env_path
    env_path="$(locate_env_file)"
    if [[ -n "${env_path}" ]]; then
        log_success "Environment configuration found at: ${env_path}"
    else
        log_warn "No .env file found! Checked in ${APP_DIR}/.env."
        if [[ -f "${APP_DIR}/.env.example" ]]; then
            cp "${APP_DIR}/.env.example" "${APP_DIR}/.env"
            log_success "Created ${APP_DIR}/.env from .env.example."
            env_path="${APP_DIR}/.env"
        fi
    fi

    # 5. Check Git repository status
    if git -C "${APP_DIR}" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
        local current_branch current_commit
        current_branch="$(git -C "${APP_DIR}" branch --show-current 2>/dev/null || echo "main")"
        current_commit="$(git -C "${APP_DIR}" rev-parse --short HEAD 2>/dev/null || echo "unknown")"
        log_success "Git repository verified on branch '${current_branch}' at commit ${current_commit}."
    fi

    # 6. Check database connectivity
    if [[ -n "${env_path}" && -f "${env_path}" ]]; then
        log "Testing database connectivity..."
        if (cd "${APP_DIR}" && php artisan migrate:status >/dev/null 2>&1); then
            log_success "Database connectivity verified. Migration status: OK."
        else
            log_warn "Database connectivity check failed. Verify DB credentials in ${env_path}."
        fi

        # 7. Check Redis if CACHE_STORE=redis
        local cache_store
        cache_store=$(grep -E '^CACHE_STORE=' "${env_path}" 2>/dev/null | cut -d '=' -f 2 | tr -d ' "' || echo "")
        if [[ "${cache_store}" == "redis" ]]; then
            log "Verifying Redis configuration (CACHE_STORE=redis)..."
            if php -m 2>/dev/null | grep -qi "^redis$"; then
                log_success "PHP extension 'redis' (phpredis) is loaded."
            else
                log_warn "PHP extension 'redis' is NOT loaded in CLI PHP. Enable redis extension in aaPanel PHP Settings."
            fi
            if command -v redis-cli >/dev/null 2>&1; then
                if redis-cli ping >/dev/null 2>&1; then
                    log_success "Redis server is reachable (PONG)."
                else
                    log_warn "Redis server did not respond to redis-cli ping."
                fi
            fi
        fi
    fi

    log_success "Environment audit completed successfully."
}

# ------------------------------------------------------------------------------
# COMMAND: build
# ------------------------------------------------------------------------------
cmd_build() {
    acquire_lock
    log "=================================================================="
    log "Compiling Production Artifacts"
    log "=================================================================="

    # 1. Install Backend Dependencies via Composer
    log "Installing Laravel production dependencies via Composer..."
    (
        cd "${APP_DIR}"
        COMPOSER_MEMORY_LIMIT=-1 composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction
    )
    log_success "Composer production dependencies installed successfully."

    # 2. Compile React + TypeScript + Tailwind bundle via Vite
    if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
        log "Compiling frontend assets with Node.js & Vite..."
        (
            cd "${APP_DIR}"
            if [[ ! -d "node_modules" ]]; then
                log "Installing Node modules..."
                npm install --prefer-offline --no-audit 2>/dev/null || npm install --legacy-peer-deps --no-audit
            fi
            NODE_OPTIONS="--max-old-space-size=2048" npm run build
        )

        if [[ -f "${BUILD_DIR}/manifest.json" ]]; then
            log_success "Vite production bundle compiled successfully into ${BUILD_DIR}."
        else
            log_err "Vite build failed to produce ${BUILD_DIR}/manifest.json!"
            exit 1
        fi
    elif [[ -f "${BUILD_DIR}/manifest.json" ]]; then
        log_success "Using pre-compiled Vite production assets in ${BUILD_DIR}."
    else
        log_err "No pre-compiled assets found and Node/npm is not available to build."
        exit 1
    fi

    log_success "Build step completed successfully."
}

# ------------------------------------------------------------------------------
# COMMAND: seed
# ------------------------------------------------------------------------------
cmd_seed() {
    acquire_lock
    log "=================================================================="
    log "Executing Safe Idempotent Database Seeders"
    log "=================================================================="
    (
        cd "${APP_DIR}"
        php artisan db:seed --class=DatabaseSeeder --force --no-interaction
    )
    log_success "Database seeders completed safely. Initial admin, sections, and services are active."
}

# ------------------------------------------------------------------------------
# COMMAND: deploy
# ------------------------------------------------------------------------------
cmd_deploy() {
    acquire_lock

    log "=================================================================="
    log "Activating Deployment: ${TIMESTAMP}"
    log "=================================================================="

    # 1. Discover or link environment file
    local env_path
    env_path="$(locate_env_file)"

    if [[ -z "${env_path}" ]]; then
        if [[ -f "${APP_DIR}/.env.example" ]]; then
            log_warn "No .env file found. Copying .env.example to ${APP_DIR}/.env..."
            cp "${APP_DIR}/.env.example" "${APP_DIR}/.env"
            env_path="${APP_DIR}/.env"
        else
            log_err "Cannot deploy: No production .env configuration file found!"
            exit 1
        fi
    fi

    if [[ "${env_path}" != "${APP_DIR}/.env" && ! -f "${APP_DIR}/.env" ]]; then
        log "Linking ${env_path} to ${APP_DIR}/.env..."
        ln -nfs "${env_path}" "${APP_DIR}/.env" 2>/dev/null || cp "${env_path}" "${APP_DIR}/.env"
    fi

    # Ensure APP_KEY exists
    local app_key
    app_key=$(grep -E '^APP_KEY=' "${APP_DIR}/.env" 2>/dev/null | cut -d '=' -f 2- | tr -d ' "' || echo "")
    if [[ -z "${app_key}" || "${app_key}" == *"GENERATE_VIA"* ]]; then
        log "Generating application key (APP_KEY)..."
        (cd "${APP_DIR}" && php artisan key:generate --force)
    fi

    # 2. Build assets if manifest.json is missing
    if [[ ! -f "${BUILD_DIR}/manifest.json" ]]; then
        log "Production assets not detected in ${BUILD_DIR}. Running build step..."
        cmd_build
    fi

    # 3. Configure storage directories and permissions
    fix_permissions

    # 4. Storage Link
    (
        cd "${APP_DIR}"
        php artisan storage:link 2>/dev/null || true
    )

    # 5. Run safe production database migrations
    log "Running database migrations..."
    (
        cd "${APP_DIR}"
        php artisan migrate --force --no-interaction
    )
    log_success "Database migrations executed successfully."

    # 6. Run safe idempotent database seeds
    log "Ensuring core system records exist via DatabaseSeeder..."
    (
        cd "${APP_DIR}"
        php artisan db:seed --class=DatabaseSeeder --force --no-interaction
    )
    log_success "Database initial data verified (Admin, Homepage Sections, Practice Areas, Credentials)."

    # 7. Optimize Laravel configuration, routes, and views
    log "Optimizing configuration, routes, and view caches..."
    (
        cd "${APP_DIR}"
        php artisan config:clear
        php artisan route:clear
        php artisan view:clear
        php artisan cache:clear

        php artisan config:cache
        php artisan route:cache
        php artisan view:cache
        php artisan event:cache

        local cache_store
        cache_store=$(grep -E '^CACHE_STORE=' "${APP_DIR}/.env" 2>/dev/null | cut -d '=' -f 2 | tr -d ' "' || echo "")
        if [[ "${cache_store}" == "redis" ]]; then
            log "Verifying Redis cache connectivity..."
            php artisan redis:verify 2>/dev/null || log_warn "Redis check completed with warning; fallback will be used."
        fi
    )
    log_success "Laravel caches compiled successfully."

    # 8. Re-apply permissions after cache generation
    fix_permissions

    # 9. Backup existing assets for rollback
    mkdir -p "${BACKUP_DIR}"
    if [[ -d "${BUILD_DIR}" ]]; then
        rm -rf "${BACKUP_DIR}/build_previous"
        cp -r "${BUILD_DIR}" "${BACKUP_DIR}/build_previous" 2>/dev/null || true
    fi

    # 10. Reload PHP-FPM service
    reload_php_fpm

    log_success "=================================================================="
    log_success "Deployment successfully activated!"
    log_success "Site is live at: https://nijamuddin.com"
    log_success "Admin portal: https://nijamuddin.com/admin/login"
    log_success "=================================================================="
}

# ------------------------------------------------------------------------------
# COMMAND: rollback
# ------------------------------------------------------------------------------
cmd_rollback() {
    acquire_lock
    log "=================================================================="
    log "Initiating Emergency Rollback"
    log "=================================================================="

    if [[ ! -d "${BACKUP_DIR}/build_previous" ]]; then
        log_err "No previous build backup found in ${BACKUP_DIR}/build_previous. Cannot perform rollback."
        exit 1
    fi

    log "Restoring previous compiled assets into ${BUILD_DIR}..."
    rm -rf "${BUILD_DIR}"
    cp -r "${BACKUP_DIR}/build_previous" "${BUILD_DIR}"

    log "Re-caching Laravel framework configuration..."
    (
        cd "${APP_DIR}"
        php artisan config:clear
        php artisan config:cache
        php artisan route:clear
        php artisan route:cache
        php artisan view:clear
        php artisan view:cache
    )

    fix_permissions
    reload_php_fpm

    log_success "Rollback completed. Restored previous release assets."
}

# ------------------------------------------------------------------------------
# ONE-COMMAND UPDATE WORKFLOW (Default when run without arguments)
# ------------------------------------------------------------------------------
cmd_update() {
    log "=================================================================="
    log "Advocate Nijam Uddin Platform — Automated Deployment Workflow"
    log "=================================================================="

    # 1. Pull latest code if Git is tracked
    if git -C "${APP_DIR}" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
        log "Checking Git working tree status..."
        local git_status
        git_status="$(git -C "${APP_DIR}" status --porcelain 2>/dev/null || echo "")"

        local dirty_files
        dirty_files="$(echo "${git_status}" | grep -vE '(\.env|storage/|node_modules/|vendor/|public/build/|\.backup)' || echo "")"

        if [[ -n "${dirty_files}" ]]; then
            log_warn "Local modifications detected in tracked repository files."
            log "Discarding local tracked changes to ensure clean synchronization with GitHub..."
            git -C "${APP_DIR}" checkout -- . 2>/dev/null || true
        fi

        log "Pulling latest code from origin main..."
        if git -C "${APP_DIR}" pull origin main 2>/dev/null; then
            log_success "Codebase up to date: $(git -C "${APP_DIR}" rev-parse --short HEAD 2>/dev/null || echo 'current')"
        else
            log_warn "Standard git pull failed. Fetching and synchronizing to origin/main..."
            git -C "${APP_DIR}" fetch origin main 2>/dev/null || true
            git -C "${APP_DIR}" reset --hard origin/main 2>/dev/null || true
            log_success "Repository synchronized with origin/main: $(git -C "${APP_DIR}" rev-parse --short HEAD 2>/dev/null || echo 'current')"
        fi
    fi

    # 2. Audit environment
    cmd_check

    # 3. Build artifacts
    cmd_build

    # 4. Activate deployment
    cmd_deploy
}

# ------------------------------------------------------------------------------
# MAIN ENTRYPOINT
# ------------------------------------------------------------------------------
action="${1:-update}"

case "${action}" in
    update|"")
        cmd_update
        ;;
    check)
        cmd_check
        ;;
    build)
        cmd_build
        ;;
    deploy)
        cmd_deploy
        ;;
    seed)
        cmd_seed
        ;;
    rollback)
        cmd_rollback
        ;;
    *)
        echo "Usage: $0 [update|check|build|deploy|seed|rollback]"
        echo ""
        echo "Commands:"
        echo "  (no args)  Full deployment: git pull, build, migrate, seed, cache & reload"
        echo "  check      Verify server environment, PHP version & tools"
        echo "  build      Install composer dependencies & compile React/Vite assets"
        echo "  deploy     Run migrations, idempotent seeds, cache & reload PHP-FPM"
        echo "  seed       Safely seed initial data (Admin, Sections, Services)"
        echo "  rollback   Revert compiled assets to previous backup"
        exit 1
        ;;
esac
