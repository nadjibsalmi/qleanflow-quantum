# Roadmap

## Done
- [x] Real data pipeline (no randomized/fabricated numbers anywhere)
- [x] Client-side risk estimator (real fitted logistic regression)
- [x] Model comparison with real notebook-derived metrics
- [x] Dashboard shell: sidebar, header, dark mode, 5 pages
- [x] Mobile navigation
- [x] CI (lint + test + build), Prettier, community health files
- [x] Unit tests for the risk estimator

## Planned
- [ ] Component tests for the dashboard UI (React Testing Library) -
      currently only the pure risk-estimator logic is tested
- [ ] Accessibility audit (axe-core or Lighthouse CI) - not yet formally
      checked beyond manual `aria-label`/`prefers-reduced-motion` additions
- [ ] Performance audit (bundle size analysis, Lighthouse score) - not
      yet measured
- [ ] Interactive map of communities (currently latitude/longitude are
      parsed but not visualized geographically)
- [ ] Deploy to Vercel with a live public demo link in the README
- [ ] Re-run the QNN training to completion and replace the "not
      captured" honesty note on the Model page with a real final
      accuracy figure
