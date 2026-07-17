# QleanFlow Quantum

Quantum-enhanced water contamination risk assessment for communities affected
by illegal mining (_galamsey_) in Ghana.

This project reimplements, as a proper software product, the concept behind
a hackathon submission from the AIMS Ghana Quantathon 2025 (original
repository, private, team project). The hackathon version was a collection
of Jupyter notebooks and disconnected HTML mockups; this version is a real
Next.js application with a data-connected dashboard, an in-browser risk
estimator, and honestly-reported model comparison metrics.

## The Problem

Illegal small-scale mining has contaminated a large share of Ghana's surface
water with mercury, arsenic, cyanide, and lead — frequently without any
visible sign in the water itself. Testing every community directly is slow
and expensive. This project explores whether measurable community and
environmental indicators (distance to river, mining zone status, water
access infrastructure, income, education) can predict contamination risk
well enough to help prioritize where physical testing and remediation
should happen first.

## What's Actually Real Here

Every number in this dashboard traces back to either the real 500-community
dataset or an actual model run — nothing is randomized or invented:

- **Dataset**: `data/ghana_water_quality_data.csv` — 500 Ghanaian
  communities across 16 regions, 23 features per community (water source,
  contamination type/level, income, education, mining-zone status, etc).
- **Live risk estimator**: a logistic regression model, fitted offline on
  the real dataset (`scripts/train_risk_model.py`, scikit-learn), achieving
  80.2% training accuracy. Its exact fitted coefficients are ported into
  `src/algorithms/riskEstimator.ts` and run entirely client-side, so the
  dashboard responds instantly as you adjust inputs — no server round-trip.
- **Model comparison**: SVM, Quantum SVC, and Quantum Neural Network
  results shown on the Model page are copied directly from the saved
  execution output of the original project's training notebook. Where a
  metric wasn't captured in that run (the QNN's final test accuracy), the
  dashboard says so explicitly instead of showing a plausible-looking
  fabricated number.

## Tech Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** with a deliberate design token system (not default
  colors) and full dark mode
- **Recharts** for data visualization
- Zero external API calls for the core dashboard — the dataset is bundled
  and parsed server-side at request time; the risk estimator runs entirely
  in the browser

## Project Structure

```
src/
├── app/(dashboard)/     # Routes: overview, regions, model, methodology, about
├── components/
│   ├── ui/              # Reusable primitives (Card, KpiCard)
│   └── dashboard/       # Sidebar, Header, chart components
├── algorithms/          # riskEstimator.ts - the client-side logistic regression
├── config/              # model.ts - real QNN hyperparameters + comparison metrics
├── services/            # waterQualityData.ts - server-side CSV parsing/aggregation
└── utils/               # cn.ts - Tailwind class merging helper

scripts/
└── train_risk_model.py  # Reproduces the risk estimator's exact coefficients

data/
└── ghana_water_quality_data.csv
```

## Running Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

To reproduce the risk estimator's coefficients from scratch:

```bash
pip install pandas scikit-learn
python scripts/train_risk_model.py
```

## Attribution

The original concept and dataset collection were a team effort during the
AIMS Ghana Quantathon 2025. This repository is an independent rebuild of
that concept as a personal portfolio project — architecture, code, and UI
are original work.

## License

MIT
