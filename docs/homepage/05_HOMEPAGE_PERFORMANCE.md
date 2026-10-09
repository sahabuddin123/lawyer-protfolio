# Phase 16 — Homepage Performance Optimization

## 1. Metrics & Core Web Vitals Targets

| Metric | Target | Optimization Strategy |
| --- | --- | --- |
| **LCP** (Largest Contentful Paint) | < 1.8s | Priority hero loading, eager portrait asset, pre-cached payload |
| **CLS** (Cumulative Layout Shift) | < 0.05 | Explicit aspect ratios on all cards (`aspect-video`, `16/9`, `4/3`), skeleton dimensions |
| **FID / INP** (Interaction to Next Paint) | < 100ms | Lightweight reactive event handlers, zero heavy third-party tracking scripts |
| **TTFB** (Time to First Byte) | < 200ms | Server-side Redis caching of aggregated homepage payload |

---

## 2. Media Optimization Strategy
1. **Lazy Loading**: All below-the-fold image assets utilize `LazyImage` with responsive variants (`thumbnail`, `small`, `medium`, `large`).
2. **Click-to-Play Video**: YouTube and Vimeo embeds are NEVER loaded as inline iframes on initial render. A lightweight thumbnail card is displayed; the embed iframe is mounted inside `VideoModal` only when the user explicitly triggers playback.
3. **Bundle Size Control**: Production build compiled cleanly to 772 kB uncompressed (135 kB gzip) application logic with dedicated vendor chunks (`vendor-core`, `vendor-react`, `vendor-motion`).
