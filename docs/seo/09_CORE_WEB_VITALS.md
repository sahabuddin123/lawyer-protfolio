# Core Web Vitals Strategy — Advocate Nijam Uddin (Haq)

### 1. Overview
Core Web Vitals represent Google's user-centric performance metrics assessing loading performance, visual stability, and interactive responsiveness.

---

### 2. Core Web Vitals Metrics & Optimization Measures

| Metric | Target | Optimization Technique Deployed |
| :--- | :--- | :--- |
| **LCP (Largest Contentful Paint)** | `< 2.5s` (Ideal `< 1.8s`) | 1. Hero image preloading with `fetchpriority="high"`.<br>2. Responsive WebP delivery.<br>3. Fast server response time (TTFB < 200ms via public API cache).<br>4. Minified critical CSS. |
| **CLS (Cumulative Layout Shift)** | `< 0.1` (Ideal `< 0.02`) | 1. Explicit `width`, `height`, and `aspect-ratio` on all image containers and hero cards.<br>2. Font display swap (`font-display: swap`) with matching fallback metrics.<br>3. Skeleton loaders matching layout dimensions for async components. |
| **INP (Interaction to Next Paint)**| `< 200ms` (Ideal `< 100ms`) | 1. Minimal main-thread JavaScript blocking via code splitting.<br>2. Efficient debouncing of search inputs (350ms).<br>3. Lightweight event handlers without heavy calculations. |
| **TTFB (Time to First Byte)** | `< 600ms` (Ideal `< 150ms`) | 1. PHP OPcache in production.<br>2. Database index optimization on `status`, `visibility`, `published_at`, and `slug`.<br>3. Redis/file response caching on public endpoints. |
| **FCP (First Contentful Paint)** | `< 1.8s` (Ideal `< 1.2s`) | 1. Elimination of render-blocking JavaScript.<br>2. Streamlined Google Fonts requests (`Inter`, `Cinzel`).<br>3. Immediate skeleton layout rendering. |

---

### 3. Verification Protocol
1. **Desktop & Mobile Testing**: Validated via browser DevTools Performance profiler and Lighthouse emulation.
2. **Video Loading Safety**: YouTube/Vimeo iframe players are never loaded immediately upon page mount; high-performance static video posters are rendered first, deferring third-party script execution until explicit user play interaction.
