# 05 — Frontend Production Build & Static Asset Pipeline
**Project:** Advocate Nijam Uddin (Haq) — Premium Legal Authority & Judicial Platform  
**Phase:** 20 — Production Readiness & Deployment  
**Date:** 2026-10-09  

---

## 1. Build Verification & Pipeline

The React 18 / TypeScript / Vite frontend compiles to a self-contained static single-page application (SPA) output under `frontend/dist/`.

### 1.1 Production Build Execution
```bash
cd frontend
npm ci --prefer-offline --no-audit
npm run build
```

### 1.2 Build Metrics Verified in Phase 19/20
- **Build Duration:** 2.79 seconds
- **Modules Transformed:** 2,544 modules
- **TypeScript Static Check:** 0 errors (`tsc --noEmit`)
- **Asset Fingerprinting:** All CSS and JS chunks use content-hashed filenames (e.g. `index-BJz5j177.js`, `index-BE1jAZQ7.css`), enabling permanent client caching (`max-age=31536000, immutable`).

---

## 2. Production Environment Inlining
Vite inlines all `VITE_*` environment variables at compile-time:
```bash
# Production environment overrides
VITE_API_BASE_URL=/api/v1
VITE_APP_NAME="Advocate Nijam Uddin Platform"
```
Because `VITE_API_BASE_URL=/api/v1` is relative, the SPA seamlessly queries the backend without hardcoding domains or ports, avoiding CORS overhead for first-party same-origin deployments.

---

## 3. Web Server SPA Routing Fallback
Because React uses client-side routing via `react-router-dom`, the web server must rewrite all non-file requests to `index.html`:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```
This ensures direct navigation or browser refresh on `/practice-areas/constitutional-law` or `/courtroom/supreme-court` resolves the React application cleanly rather than returning an Nginx 404.
