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

## [Unreleased] - Round 2 audit fixes (mathematical/architectural rigor pass)

### Fixed (Critical - logical inconsistency)
- `predictedLabel` and `riskLevel` were derived from two different values
  (raw SVM decision function sign vs. Platt-calibrated probability),
  which disagreed for a real, reachable input range (contaminationLevel
  ~8.9-9.7) - the UI could show "predicted good quality" next to a "HIGH
  RISK" badge simultaneously. Both fields are now derived from the same
  single `classify()` function, from the same probability value, making
  this disagreement structurally impossible. Added a regression test
  sweeping the full 0-10 contamination range to prove it.

### Fixed (High - real type safety, not cosmetic)
- The `FEATURE_INDEX`/`userProvided` object was stringly-typed with no
  compile-time link to the real feature list - a typo would silently
  freeze a feature at its dataset mean forever with zero error anywhere.
  First fix attempt (blanket `as const` on the whole params object)
  broke numeric arithmetic elsewhere by over-narrowing every number to
  its own literal type - reverted. Second fix attempt (`as const` +
  plain `: QsvcParams` type annotation) silently failed too - the
  annotation re-widened `featureNames` back to the interface's declared
  `readonly string[]`, discarding the literal tuple. Final, verified fix:
  `as const` on `featureNames` only, combined with `satisfies QsvcParams`
  instead of a type annotation. Verified for real (not assumed): a
  deliberately injected typo now fails `tsc --noEmit` with a genuine
  TS2353 error naming the exact invalid key.

### Fixed then corrected (defensive programming vs. mathematical fidelity)
- Added, then had to partially revert, a clamp on quantum feature-map
  angles to [0, pi]. The initial unconditional clamp was caught by the
  existing pipeline cross-verification test: it silently altered a
  legitimate, real held-out test point (whose 3rd PCA component
  normalizes to -0.00227, ordinary floating-point boundary noise, not
  wild extrapolation), shifting decisionValue by ~4e-4 and breaking exact
  fidelity with the real trained Python model (which does not clip its
  MinMaxScaler either). Final fix: no more silent alteration of the
  value - RY(theta) is mathematically valid for any real theta, so
  ordinary boundary noise is now preserved exactly (verified: all
  existing tests, including the strict 6-decimal-place pipeline
  cross-check, pass again). A `console.warn` fires only for genuinely
  extreme extrapolation (more than 50% of the trained range beyond either
  edge), which is observable without ever corrupting a legitimate result.

### Fixed (Medium - code duplication / single source of truth)
- The fidelity/kernel formula existed in two independent places
  (`quantumKernel()` in quantumSimulator.ts, and an inlined copy in
  qsvcEstimator.ts's optimized precomputed-state path). Extracted a
  single `fidelityFromStates()` function both paths now call, so there
  is exactly one definition of "quantum fidelity" in the codebase.

### Fixed (Low - UI/hydration correctness)
- The dark-mode icon (Sun/Moon) previously flashed the wrong icon for
  one frame on cold load, because its React state started at `false`
  regardless of the real theme (corrected only after a `useEffect` ran
  post-mount). A first fix attempt (read the real state via a lazy
  `useState` initializer checking `document.documentElement.classList`)
  looked right but was rejected on review: it would have caused a real
  hydration MISMATCH (not just a flash) whenever the real theme is dark,
  since the initializer evaluates differently on the server (no
  `document`) versus during client hydration. Final fix: both icons
  always render; CSS alone (`hidden dark:block` / `block dark:hidden`)
  decides visibility, with zero dependency on JS state or timing.
  Discovered and fixed a prerequisite bug while implementing this:
  Tailwind's `dark:` variant had no `@custom-variant` declaration, so it
  silently defaulted to `prefers-color-scheme` instead of this app's
  actual `.dark`-class toggle mechanism - not yet an active bug (grep
  confirmed `dark:` was never used anywhere before this fix), but a live
  trap for the first future use. Also removed a residual hydration risk
  on the toggle button's `aria-label` (previously theme-dependent, now a
  neutral, state-independent string).

### Fixed (Low - dead code)
- `quantumKernel()` was exported as the module's apparent public API but
  was, in practice, only ever called by its own test - the live app used
  a separate, optimized code path. Resolved by making both paths share
  `fidelityFromStates()` (see above) rather than leaving one of the two
  as effectively dead weight.
