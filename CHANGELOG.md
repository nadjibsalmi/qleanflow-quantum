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

## [Unreleased] - Comprehensive audit fixes

### Fixed (Critical)
- About page falsely claimed no live computation happens ("does not
  retrain the model at request time") - directly contradicted the live
  QSVC estimator. Rewritten to accurately describe it.
- Model page's historical QSVC accuracy (83.33%) was never reconciled
  against the live QSVC's actual measured accuracy (78.0%, different
  dataset version/split) - added an explicit note explaining the
  difference instead of leaving two unexplained numbers.
- Removed dead code: `riskEstimator.ts`, its test file, and
  `scripts/train_risk_model.py` - the classical logistic regression
  estimator was fully superseded by the QSVC but never removed.

### Fixed (High)
- MobileNav drawer is now a real accessible dialog: `role="dialog"`,
  `aria-modal`, keyboard focus trap, body scroll lock while open, and
  focus restoration to the trigger button on close.
- Methodology page stated "23 raw features" - incorrect, since 23 is the
  total CSV column count including the target label. Corrected to the
  real number (18 features after dropping identifier columns).
- ContaminationTypeChart used a hardcoded color array still containing
  the OLD accent color (#6366f1) that was replaced project-wide for WCAG
  contrast reasons - updated to the current value.
- Documented the real, verified moderate-severity PostCSS/Next.js
  dependency advisory (no safe fix currently available upstream).

### Fixed (Medium)
- Real race condition: `getAllRecords()` cached only the resolved value,
  not the in-flight Promise, so concurrent cold-start calls (e.g. the
  Regions page's `Promise.all`) each independently re-parsed the CSV.
  Now caches the Promise itself.
- `quantumKernel` recomputed the quantum state for all 199 support
  vectors from scratch on every single call. Precomputed once and cached.
- Added defensive NaN detection when parsing CSV numeric fields (console
  warning naming the exact field/community instead of silent corruption).
- Fixed two raw `<a href>` tags that should have been Next.js `<Link>`
  (full page reload instead of client-side navigation).
- Fixed a dangling doc reference to a non-existent `docs/MODEL.md`.

### Fixed (Low)
- `Card` used `<h3>` with no `<h2>` anywhere on the page, skipping a
  heading level (WCAG 1.3.1). Changed to `<h2>`.
- Added `aria-current="page"` to active navigation links.
- Added a text alternative (`role="img"` + `aria-label` summary) for the
  CommunityMap scatter chart, which had none.
- Fixed slider inputs using a sibling `<span>` instead of a real
  `<label htmlFor>` association with their `<input>`.
- Replaced array-index React keys with real unique identifiers
  (community name) in CommunityMap.
