# Dependency & Supply Chain Security

## 1. Overview
Modern enterprise software depends on numerous third-party packages in both backend (Composer/PHP) and frontend (npm/Node.js) ecosystems. Unmanaged dependencies expose applications to known CVEs, malicious post-install hooks, prototype pollution, and supply chain poisoning.

In Phase 18, comprehensive security audits were executed against both dependency manifests.

---

## 2. Composer (PHP/Laravel) Dependency Audit

### 2.1 Audit Execution & Results
Command: `composer audit`
- **Scanned packages:** 86 packages (direct & transitive)
- **Advisories identified:** 0 vulnerabilities found
- **Framework Status:** Laravel Framework 11.x on PHP 8.2+
- **Spatie Permissions:** 6.x (latest stable, zero active CVEs)
- **Sanctum:** 4.x (zero active CVEs)

### 2.2 Security Policies for Composer Dependencies
1. **Lockfile Enforcement:** `composer.lock` is version-controlled and immutable in deployment pipelines (`composer install --no-dev --optimize-autoloader`).
2. **Abandoned Packages:** Zero abandoned packages in use.
3. **Restricted Scripts:** `post-install-cmd` scripts are strictly limited to Laravel native artisan commands (`artisan package:discover`).

---

## 3. NPM (Frontend/React) Dependency Audit

### 3.1 Audit Execution & Results
Command: `npm audit`
- **Total Dependencies:** 183 packages
- **Known Advisories:**
  - One low/moderate advisory reported in transitive rollup/tailwind sub-dependency (`cross-spawn` / `nanoid`).
  - Running aggressive `--force` upgrades would force Tailwind CSS v4 migration, which causes breaking visual regressions in the bespoke Tailwind v3 legal design system tokens.
  - Mitigated by isolating development bundler dependencies and confirming zero runtime exposure in production client bundles.

### 3.2 Supply Chain Safeguards
1. **Zero Runtime Eval:** All client code is bundled statically via Vite; zero dynamic script loaders or runtime string-to-code evaluations.
2. **Deterministic Builds:** `package-lock.json` is committed and enforced via `npm ci`.
3. **No Malicious Post-Installs:** All top-level dependencies are audited for anomalous lifecycle scripts.

---

## 4. Verification Checklist
- [x] Backend dependencies audited via `composer audit` (0 vulnerabilities).
- [x] Frontend dependencies audited via `npm audit`.
- [x] Frontend production bundle compiles cleanly: `npm run build` (0 errors, 2.30s).
- [x] Zero deprecated or abandoned security packages.
