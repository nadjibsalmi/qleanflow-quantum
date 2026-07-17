# Roadmap

## Done

- [x] Real data pipeline (no randomized/fabricated numbers anywhere)
- [x] Client-side risk estimator (real fitted logistic regression)
- [x] Model comparison with real notebook-derived metrics
- [x] Dashboard shell: sidebar, header, dark mode, 5 pages
- [x] Mobile navigation
- [x] CI (lint + test + build), Prettier, community health files
- [x] Unit tests for the risk estimator
- [x] Manual accessibility pass: found and fixed a real WCAG AA contrast
      failure (4.47:1, needed 4.5:1) and added missing focus-visible
      states project-wide

## Planned

- [ ] Component tests for the dashboard UI (React Testing Library) -
      currently only the pure risk-estimator logic is tested
- [ ] Full axe-core/Lighthouse CI accessibility run (blocked in this
      sandbox by network restrictions on downloading headless Chrome -
      worth running in an unrestricted environment as a second pass)
- [ ] Performance audit (bundle size analysis, Lighthouse score) - not
      yet measured
- [ ] Interactive map of communities (currently latitude/longitude are
      parsed but not visualized geographically)
- [ ] Deploy to Vercel with a live public demo link in the README
- [ ] Re-run the QNN training to completion and replace the "not
      captured" honesty note on the Model page with a real final
      accuracy figure
