# Changelog

All notable changes to this project are documented here.

## [Unreleased]

### Added

- Mobile navigation drawer - previously the sidebar simply disappeared
  below the `lg` breakpoint with no replacement, leaving mobile users
  with no way to navigate between pages.
- `prefers-reduced-motion` support for all animations.
- Vitest test suite for the risk estimator (8 tests).
- GitHub Actions CI (lint + test + build on every push/PR).
- Issue templates, PR template, CONTRIBUTING.md, .editorconfig, Prettier.

### Fixed

- A test-writing bug of my own: an early draft test assumed the model's
  output "at dataset-average inputs" would equal `sigmoid(intercept)`.
  This is wrong because `isMiningZone` is a boolean (0/1) feature and is
  never actually at its fractional dataset mean (13.8%). Corrected to
  hand-compute the real expected logit instead.
- Removed 5 orphaned duplicate files left over from earlier drafts
  (`algorithms/modelResults.ts`, `algorithms/types.ts`,
  `services/dataset.ts`, `config/modelMetrics.ts`,
  `services/waterDataService.ts`) that were never actually imported
  anywhere.

## [0.1.0] - Initial rebuild

- Next.js 16 + TypeScript + Tailwind v4 scaffold.
- Real dataset (500 Ghana communities) parsed server-side.
- Logistic regression risk estimator, fitted offline on the real data
  (80.2% training accuracy), running client-side.
- Model comparison page with real metrics from the original notebook's
  saved execution output (SVM, QSVC, QNN).
- Dashboard: Overview, Regions, Model, Methodology, About pages.
- Dark mode, deliberate design token system.
